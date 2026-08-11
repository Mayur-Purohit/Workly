"""
Reviews API Views
─────────────────
Unified review CRUD endpoints with role-based auth, verification checks,
ban-safety, and computed is_verified badge on every read.
"""
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from jose import jwt, JWTError

from api.models import Review, JobSeekerAccount, DeveloperAccount, Company
from api.decorators import JWT_SECRET, JWT_ALGORITHM, redis_client
from models.schemas import success_response, error_response

logger = logging.getLogger(__name__)


# ─── Auth helper ────────────────────────────────────────────────────────────

def _get_current_user(request):
    """
    Resolve the authenticated user from the Authorization header.
    Returns (user_obj, user_type_str) or (None, None).
    """
    auth_header = (request.headers.get("Authorization", "")
                   or request.META.get("HTTP_AUTHORIZATION", ""))
    token = ""
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        token = request.GET.get("token", "") or request.GET.get("jwt", "")

    if not token or token in ("undefined", "null"):
        return None, None

    # Blacklist check (reuse existing redis blacklist logic)
    try:
        if redis_client.exists(f"blacklist:{token}"):
            return None, None
    except Exception:
        pass

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None, None

    # Job Seeker
    seeker_id = payload.get("seeker_id")
    if seeker_id:
        seeker = JobSeekerAccount.objects.filter(id=seeker_id).first()
        if seeker and getattr(seeker, "is_active", True):
            return seeker, "job_seeker"

    # Developer
    developer_id = payload.get("developer_id")
    if developer_id:
        dev = DeveloperAccount.objects.filter(id=developer_id).first()
        if dev:
            return dev, "developer"

    # Company / Recruiter
    company_id = payload.get("company_id")
    if company_id:
        company = Company.objects.filter(id=company_id).first()
        if company and getattr(company, "is_active", True):
            return company, "recruiter"

    return None, None


# ─── Verification helpers ───────────────────────────────────────────────────

def _is_account_verified(user, user_type):
    """Compute verification status based on role-specific fields."""
    if user_type == "job_seeker":
        return bool(getattr(user, "email_verified", False))
    elif user_type == "developer":
        return bool(getattr(user, "is_verified", False) or getattr(user, "email_verified", False))
    elif user_type == "recruiter":
        return bool(getattr(user, "email_verified", False))
    return False


def _check_write_permission(user, user_type):
    """
    Returns (allowed: bool, error_msg: str).
    Ensures account is active and not banned. Verification status is checked
    separately during serialization to render the VerifiedBadge.
    """
    if not user:
        return False, "Authentication required"

    # Ban check — reuses existing is_banned / is_active fields
    if getattr(user, "is_banned", False) or not getattr(user, "is_active", True):
        return False, "Banned or inactive accounts cannot submit reviews"

    return True, ""


# ─── Serialiser ─────────────────────────────────────────────────────────────

def _serialize_review(r, current_user_id=None, current_user_type=None):
    """
    Converts a Review ORM object to a JSON-safe dict.
    Computes is_verified FRESH from the author's current account state.
    """
    is_verified = False
    author_name = "Anonymous User"
    author_headline = r.role_title or "Workly Platform Member"
    author_avatar = None
    initials = "W"

    try:
        if r.user_type == "job_seeker":
            if r.seeker:
                s = r.seeker
                author_name = getattr(s, "full_name", None) or "Job Seeker"
                author_headline = r.role_title or getattr(s, "headline", None) or "Job Seeker"
                author_avatar = getattr(s, "avatar_path", None)
                is_verified = _is_account_verified(s, "job_seeker")
            else:
                author_name = "Job Seeker"
                author_headline = r.role_title or "Job Seeker"
            initials = "".join(w[0].upper() for w in author_name.split()[:2]) if author_name else "JS"

        elif r.user_type == "developer":
            if r.developer:
                d = r.developer
                author_name = getattr(d, "company_name", None) or "Developer"
                author_headline = r.role_title or "API Developer"
                is_verified = _is_account_verified(d, "developer")
            else:
                author_name = "Developer"
                author_headline = r.role_title or "API Developer"
            initials = "".join(w[0].upper() for w in author_name.split()[:2]) if author_name else "DEV"

        elif r.user_type == "recruiter":
            if r.recruiter:
                rec = r.recruiter
                author_name = getattr(rec, "name", None) or "Recruiter"
                author_headline = r.role_title or f"Recruiter @ {author_name}"
                author_avatar = getattr(rec, "logo_path", None)
                is_verified = _is_account_verified(rec, "recruiter")
            else:
                author_name = "Recruiter"
                author_headline = r.role_title or "Recruiter"
            initials = "".join(w[0].upper() for w in author_name.split()[:2]) if author_name else "REC"
    except Exception as e:
        logger.error(f"Error serialising review {r.id}: {e}")

    # Ownership check
    is_own = False
    if current_user_id and current_user_type and current_user_type == r.user_type:
        fk_map = {"job_seeker": "seeker_id", "developer": "developer_id", "recruiter": "recruiter_id"}
        fk_val = getattr(r, fk_map.get(r.user_type, ""), None)
        if fk_val and str(fk_val) == str(current_user_id):
            is_own = True

    return {
        "id": str(r.id),
        "user_type": r.user_type,
        "rating": r.rating,
        "title": r.title or "",
        "content": r.content,
        "role_title": author_headline,
        "author_name": author_name,
        "author_avatar": author_avatar,
        "initials": initials,
        "is_verified": is_verified,
        "is_own": is_own,
        "company_id": str(r.company_id) if r.company_id else None,
        "target_badge": getattr(r.company, "name", "Workly Platform") if r.company else "Workly Platform",
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


# ─── Endpoints ──────────────────────────────────────────────────────────────

@csrf_exempt
def reviews_root(request):
    """
    GET  /api/v1/reviews  – list (supports ?user_type=... and ?company_id=...)
    POST /api/v1/reviews  – create a new review
    """
    user, user_type = _get_current_user(request)
    uid = str(user.id) if user else None

    # ── LIST ──
    if request.method == "GET":
        try:
            qs = Review.objects.select_related("seeker", "developer", "recruiter", "company").all()

            ft = request.GET.get("user_type", "").strip().lower()
            if ft in ("job_seeker", "developer", "recruiter"):
                qs = qs.filter(user_type=ft)

            cid = request.GET.get("company_id", "").strip()
            if cid:
                qs = qs.filter(company_id=cid)

            total_count = qs.count()

            # Average rating (cap at 500 rows for efficiency)
            ratings = list(qs.values_list("rating", flat=True)[:500])
            avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 5.0

            # Annotation to place logged-in user's own reviews at the top across all pages
            if uid and user_type:
                fk_field = {"job_seeker": "seeker_id", "developer": "developer_id", "recruiter": "recruiter_id"}.get(user_type)
                if fk_field:
                    from django.db.models import Case, When, Value, IntegerField
                    qs = qs.annotate(
                        is_own_order=Case(
                            When(**{fk_field: uid, "user_type": user_type}, then=Value(0)),
                            default=Value(1),
                            output_field=IntegerField(),
                        )
                    ).order_by("is_own_order", "-created_at")
            else:
                qs = qs.order_by("-created_at")

            # Pagination
            try:
                page = max(1, int(request.GET.get("page", 1)))
                limit = max(1, min(50, int(request.GET.get("limit", 6))))
            except (ValueError, TypeError):
                page, limit = 1, 6

            start = (page - 1) * limit
            rows = list(qs[start:start + limit])

            serialised = [_serialize_review(r, uid, user_type) for r in rows]

            return JsonResponse(success_response({
                "reviews": serialised,
                "total_count": total_count,
                "average_rating": avg_rating,
                "page": page,
                "limit": limit,
            }))
        except Exception as e:
            logger.exception("Failed to fetch reviews")
            return JsonResponse(error_response(f"Failed to fetch reviews: {e}"), status=500)

    # ── CREATE ──
    if request.method == "POST":
        if not user:
            return JsonResponse(error_response("Authentication required to submit a review"), status=401)

        ok, msg = _check_write_permission(user, user_type)
        if not ok:
            return JsonResponse(error_response(msg), status=403)

        try:
            data = json.loads(request.body)

            rating = int(data.get("rating", 5))
            if not 1 <= rating <= 5:
                return JsonResponse(error_response("Rating must be between 1 and 5"), status=400)

            content = (data.get("content") or "").strip()
            if not content:
                return JsonResponse(error_response("Review content cannot be empty"), status=400)

            kw = {
                "user_type": user_type, # ROOT CAUSE FIX: Always use the actual author's role
                "rating": rating,
                "title": (data.get("title") or "").strip(),
                "content": content,
                "role_title": (data.get("role_title") or "").strip(),
            }

            # Optional target company
            target_cid = data.get("company_id")
            if target_cid:
                kw["company"] = Company.objects.filter(id=target_cid).first()

            # Set the correct author FK
            if user_type == "job_seeker":
                kw["seeker"] = user
            elif user_type == "developer":
                kw["developer"] = user
            elif user_type == "recruiter":
                kw["recruiter"] = user

            review = Review.objects.create(**kw)
            return JsonResponse(success_response(_serialize_review(review, uid, user_type)), status=201)
        except json.JSONDecodeError:
            return JsonResponse(error_response("Invalid JSON body"), status=400)
        except Exception as e:
            logger.exception("Failed to create review")
            return JsonResponse(error_response(f"Failed to create review: {e}"), status=500)

    return JsonResponse(error_response("Method not allowed"), status=405)


@csrf_exempt
def review_detail(request, review_id):
    """
    PUT/PATCH  /api/v1/reviews/<id>  – edit own review
    DELETE     /api/v1/reviews/<id>  – delete own review
    """
    user, user_type = _get_current_user(request)
    if not user:
        return JsonResponse(error_response("Authentication required"), status=401)
    if getattr(user, "is_banned", False) or not getattr(user, "is_active", True):
        return JsonResponse(error_response("Banned or inactive accounts cannot perform this action"), status=403)

    try:
        review = Review.objects.filter(id=review_id).first()
        if not review:
            return JsonResponse(error_response("Review not found"), status=404)

        # Ownership check
        uid = str(user.id)
        fk_map = {"job_seeker": "seeker_id", "developer": "developer_id", "recruiter": "recruiter_id"}
        fk_val = getattr(review, fk_map.get(user_type, ""), None)
        if user_type != review.user_type or not fk_val or str(fk_val) != uid:
            return JsonResponse(error_response("You can only modify your own reviews"), status=403)

        if request.method in ("PUT", "PATCH"):
            data = json.loads(request.body)
            if "rating" in data:
                r = int(data["rating"])
                if 1 <= r <= 5:
                    review.rating = r
            if "content" in data and data["content"].strip():
                review.content = data["content"].strip()
            if "title" in data:
                review.title = (data["title"] or "").strip()
            if "role_title" in data:
                review.role_title = (data["role_title"] or "").strip()
            review.save()
            return JsonResponse(success_response(_serialize_review(review, uid, user_type)))

        if request.method == "DELETE":
            review.delete()
            return JsonResponse(success_response({"message": "Review deleted successfully"}))

        return JsonResponse(error_response("Method not allowed"), status=405)
    except json.JSONDecodeError:
        return JsonResponse(error_response("Invalid JSON body"), status=400)
    except Exception as e:
        logger.exception("Error processing review detail")
        return JsonResponse(error_response(f"Server error: {e}"), status=500)
