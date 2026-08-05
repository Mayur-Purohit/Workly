import json
import uuid
from collections import Counter
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Company, Session, JobApplication, Notification, JobSeekerAccount
from api.views.seeker_auth import require_seeker_jwt
from models.schemas import success_response, error_response

def _serialize_company(company, is_following=False, active_sessions=None, followers_count=None):
    # Get active job sessions for this company
    if active_sessions is None:
        active_sessions = Session.objects.filter(company=company, status="active")
    open_jobs = []
    for s in active_sessions:
        criteria = s.criteria or {}
        preferred_locations = criteria.get("preferred_locations", [])
        loc = preferred_locations[0] if preferred_locations else "Remote"
        open_jobs.append({
            "id": str(s.id),
            "job_title": s.job_title,
            "location": loc,
            "employment_type": "Full-time",
            "salary_range": "Not Disclosed"
        })
        
    cid_str = str(company.id)
    if followers_count is None:
        try:
            followers_count = JobSeekerAccount.objects.filter(
                resume_data__followed_companies__contains=cid_str
            ).count()
        except Exception:
            # Fallback to python count if the DB doesn't support json __contains properly
            followers_count = 0
            all_seekers = JobSeekerAccount.objects.all()
            for s in all_seekers:
                if s.resume_data and isinstance(s.resume_data, dict):
                    followed = s.resume_data.get("followed_companies", [])
                    if isinstance(followed, list) and cid_str in followed:
                        followers_count += 1
        
    return {
        "id": str(company.id),
        "name": company.name,
        "email": company.email,
        "industry": company.industry or "Technology",
        "hq_location": company.hq_location or "Remote",
        "about": company.about or "This company has not provided an overview yet.",
        "rating": company.rating or 4.5,
        "company_size": company.company_size or "50-200",
        "founded_year": company.founded_year or 2020,
        "website_url": company.website_url or "https://example.com",
        "logo_path": company.logo_path,
        "openings": len(open_jobs),
        "open_jobs": open_jobs,
        "is_following": is_following,
        "followers_count": followers_count
    }

# ── Public Endpoints ──────────────────────────────────────────────────────────

def _get_bulk_followers_count(company_ids):
    counts = {str(cid): 0 for cid in company_ids}
    try:
        seekers_followed = JobSeekerAccount.objects.exclude(resume_data__isnull=True).values_list('resume_data', flat=True)
        for rd in seekers_followed:
            if isinstance(rd, dict):
                followed = rd.get("followed_companies", [])
                if isinstance(followed, list):
                    for cid in followed:
                        cid_str = str(cid)
                        if cid_str in counts:
                            counts[cid_str] += 1
    except Exception:
        pass
    return counts

@csrf_exempt
def public_list_companies(request):
    """GET /api/v1/public/companies - lists all active companies."""
    if request.method != "GET":
        return JsonResponse(error_response("Method not allowed"), status=405)
    try:
        companies = Company.objects.filter(is_active=True).order_by("name")
        
        # Pagination
        page = int(request.GET.get("page", 1))
        per_page = min(int(request.GET.get("per_page", 12)), 100)
        
        total_companies = companies.count()
        start = (page - 1) * per_page
        end = start + per_page
        paginated_companies = companies[start:end]
        
        # Bulk fetch active sessions to avoid N+1 query
        company_ids = [c.id for c in paginated_companies]
        active_sessions_qs = Session.objects.filter(company_id__in=company_ids, status="active")
        
        sessions_by_company = {}
        for s in active_sessions_qs:
            cid_str = str(s.company_id)
            sessions_by_company.setdefault(cid_str, []).append(s)

        # Pre-calculate follower counts
        follower_counts = _get_bulk_followers_count(company_ids)

        serialized = [
            _serialize_company(
                c, 
                active_sessions=sessions_by_company.get(str(c.id), []),
                followers_count=follower_counts.get(str(c.id), 0)
            ) 
            for c in paginated_companies
        ]
        return JsonResponse(success_response({
            "companies": serialized,
            "total": total_companies,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_companies + per_page - 1) // per_page if per_page else 1
        }))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {e}"), status=500)

@csrf_exempt
def public_get_company(request, company_id):
    """GET /api/v1/public/companies/<id> - gets a single company's details."""
    if request.method != "GET":
        return JsonResponse(error_response("Method not allowed"), status=405)
    try:
        try:
            uuid.UUID(company_id)
        except ValueError:
            return JsonResponse(error_response("Invalid company ID format"), status=400)
            
        company = Company.objects.filter(id=company_id, is_active=True).first()
        if not company:
            return JsonResponse(error_response("Company not found"), status=404)
            
        return JsonResponse(success_response(_serialize_company(company)))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {e}"), status=500)

# ── Seeker Endpoints ──────────────────────────────────────────────────────────

@csrf_exempt
@require_seeker_jwt
def seeker_list_companies(request):
    """GET /api/v1/seeker/companies - lists all companies with follow status."""
    if request.method != "GET":
        return JsonResponse(error_response("Method not allowed"), status=405)
    try:
        seeker = request.seeker
        followed = seeker.resume_data.get("followed_companies", []) if seeker.resume_data else []
        companies = Company.objects.filter(is_active=True).order_by("name")
        
        # Pagination
        page = int(request.GET.get("page", 1))
        per_page = min(int(request.GET.get("per_page", 12)), 100)
        
        total_companies = companies.count()
        start = (page - 1) * per_page
        end = start + per_page
        paginated_companies = companies[start:end]
        
        # Bulk fetch active sessions to avoid N+1 query
        company_ids = [c.id for c in paginated_companies]
        active_sessions_qs = Session.objects.filter(company_id__in=company_ids, status="active")
        
        sessions_by_company = {}
        for s in active_sessions_qs:
            cid_str = str(s.company_id)
            sessions_by_company.setdefault(cid_str, []).append(s)

        # Pre-calculate follower counts
        follower_counts = _get_bulk_followers_count(company_ids)

        serialized = [
            _serialize_company(
                c, 
                str(c.id) in followed, 
                active_sessions=sessions_by_company.get(str(c.id), []),
                followers_count=follower_counts.get(str(c.id), 0)
            )
            for c in paginated_companies
        ]
        return JsonResponse(success_response({
            "companies": serialized,
            "total": total_companies,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_companies + per_page - 1) // per_page if per_page else 1
        }))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {e}"), status=500)


@csrf_exempt
@require_seeker_jwt
def seeker_get_company(request, company_id):
    """GET /api/v1/seeker/companies/<id> - gets details with follow status."""
    if request.method != "GET":
        return JsonResponse(error_response("Method not allowed"), status=405)
    try:
        try:
            uuid.UUID(company_id)
        except ValueError:
            return JsonResponse(error_response("Invalid company ID format"), status=400)
            
        company = Company.objects.filter(id=company_id, is_active=True).first()
        if not company:
            return JsonResponse(error_response("Company not found"), status=404)
            
        seeker = request.seeker
        followed = seeker.resume_data.get("followed_companies", []) if seeker.resume_data else []
        return JsonResponse(success_response(_serialize_company(company, str(company.id) in followed)))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {e}"), status=500)

@csrf_exempt
@require_seeker_jwt
def seeker_follow_company(request, company_id):
    """
    POST /api/v1/seeker/companies/<id>/follow - follow a company.
    DELETE /api/v1/seeker/companies/<id>/follow - unfollow a company.
    """
    if request.method not in ["POST", "DELETE"]:
        return JsonResponse(error_response("Method not allowed"), status=405)
    try:
        try:
            uuid.UUID(company_id)
        except ValueError:
            return JsonResponse(error_response("Invalid company ID format"), status=400)
            
        company = Company.objects.filter(id=company_id, is_active=True).first()
        if not company:
            return JsonResponse(error_response("Company not found"), status=404)
            
        seeker = request.seeker
        if not seeker.resume_data or not isinstance(seeker.resume_data, dict):
            seeker.resume_data = {}
            
        followed = seeker.resume_data.get("followed_companies", [])
        if not isinstance(followed, list):
            followed = []
            
        cid_str = str(company.id)
        if request.method == "POST":
            if cid_str not in followed:
                followed.append(cid_str)
                seeker.resume_data["followed_companies"] = followed
                seeker.save(update_fields=["resume_data"])
                
                # Send notifications
                try:
                    Notification.objects.create(
                        seeker=seeker,
                        type="general",
                        title=f"Following {company.name}",
                        message=f"You started following {company.name}. You'll get notified of new job postings.",
                        link=f"/jobs/companies/{company.id}"
                    )
                    Notification.objects.create(
                        company=company,
                        type="general",
                        title="New Follower!",
                        message=f"{seeker.full_name} is now following your company.",
                        link=None
                    )
                except Exception as ne:
                    print("Failed to create follow notifications:", ne)
            msg = "Followed successfully"
        else: # DELETE
            if cid_str in followed:
                followed.remove(cid_str)
                seeker.resume_data["followed_companies"] = followed
                seeker.save(update_fields=["resume_data"])
            msg = "Unfollowed successfully"
            
        # Count followers
        try:
            followers_count = JobSeekerAccount.objects.filter(
                resume_data__followed_companies__contains=cid_str
            ).count()
        except Exception:
            followers_count = 0
            all_seekers = JobSeekerAccount.objects.all()
            for s in all_seekers:
                if s.resume_data and isinstance(s.resume_data, dict):
                    followed_list = s.resume_data.get("followed_companies", [])
                    if isinstance(followed_list, list) and cid_str in followed_list:
                        followers_count += 1
            
        return JsonResponse(success_response({
            "message": msg,
            "is_following": request.method == "POST",
            "followers_count": followers_count
        }))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {e}"), status=500)


@csrf_exempt
@require_seeker_jwt
def seeker_following_companies(request):
    """GET /api/v1/seeker/companies/following - lists all companies followed by the seeker."""
    if request.method != "GET":
        return JsonResponse(error_response("Method not allowed"), status=405)
    try:
        seeker = request.seeker
        followed = seeker.resume_data.get("followed_companies", []) if seeker.resume_data else []
        
        # Filter active companies that are in the followed list
        companies = Company.objects.filter(id__in=followed, is_active=True).order_by("name")
        
        # Bulk fetch active sessions to avoid N+1 query
        company_ids = [c.id for c in companies]
        active_sessions_qs = Session.objects.filter(company_id__in=company_ids, status="active")
        
        sessions_by_company = {}
        for s in active_sessions_qs:
            cid_str = str(s.company_id)
            sessions_by_company.setdefault(cid_str, []).append(s)

        # Pre-calculate follower counts
        follower_counts = _get_bulk_followers_count(company_ids)

        serialized = [
            _serialize_company(
                c, 
                True, 
                active_sessions=sessions_by_company.get(str(c.id), []),
                followers_count=follower_counts.get(str(c.id), 0)
            )
            for c in companies
        ]
        return JsonResponse(success_response({
            "companies": serialized
        }))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {e}"), status=500)


@csrf_exempt
def public_market_trends(request):
    """GET /api/v1/public/market-trends - returns dynamic market intelligence stats and charts."""
    if request.method != "GET":
        return JsonResponse(error_response("Method not allowed"), status=405)
    try:
        from django.db.models import Q, F, Avg
        from api.models import Review

        seekers_count = JobSeekerAccount.objects.count()
        avg_rating_val = Review.objects.aggregate(avg=Avg('rating'))['avg']
        avg_rating = round(float(avg_rating_val), 1) if avg_rating_val else 4.8
        
        # 1. Base open roles and active companies
        active_sessions_count = Session.objects.filter(status="active").count()
        active_companies_count = Company.objects.filter(is_active=True).count()
        hired_count = JobApplication.objects.filter(status="hired").count()

        # Count of hired applications in the current month
        from django.utils import timezone
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        hired_this_month_count = JobApplication.objects.filter(status="hired", updated_at__gte=start_of_month).count()

        # Dynamic average response calculation
        from django.db.models import ExpressionWrapper, fields
        apps_responded = JobApplication.objects.exclude(status="applied").filter(updated_at__gt=F('applied_at'))
        if apps_responded.exists():
            duration = apps_responded.annotate(
                diff=ExpressionWrapper(F('updated_at') - F('applied_at'), output_field=fields.DurationField())
            )
            avg_sec = sum(d.diff.total_seconds() for d in duration) / len(duration)
            avg_hrs = max(2, int(avg_sec / 3600))
        else:
            avg_hrs = 48

        # Dynamic Time to Offer (hired time)
        hired_apps = JobApplication.objects.filter(status="hired", updated_at__gt=F('applied_at'))
        if hired_apps.exists():
            duration = hired_apps.annotate(
                diff=ExpressionWrapper(F('updated_at') - F('applied_at'), output_field=fields.DurationField())
            )
            hired_avg_sec = sum(d.diff.total_seconds() for d in duration) / len(duration)
            avg_offer_days = max(1, int(hired_avg_sec / 86400))
        else:
            avg_offer_days = 14

        # 2. Main Seeker landing stats
        categories_list = ["Engineering", "Design", "Data & AI", "Marketing", "Healthcare", "Operations", "Education", "Finance"]
        category_counts = {}
        for cat in categories_list:
            if cat == "Data & AI":
                q_filter = (
                    Q(job_title__icontains="data") | Q(job_title__icontains="machine learning") | Q(job_title__icontains="artificial intelligence") |
                    Q(job_description__icontains="data") | Q(job_description__icontains="machine learning") | Q(job_description__icontains="artificial intelligence")
                )
            else:
                q_filter = Q(job_title__icontains=cat) | Q(job_description__icontains=cat)
            category_counts[cat] = Session.objects.filter(status="active").filter(q_filter).count()

        # Dynamic Median Salary from Requisitions Criteria or Job Postings
        CURRENCY_TO_INR = {'INR': 1.0, 'USD': 85.0, 'GBP': 107.0, 'EUR': 92.0, 'AUD': 55.0, 'CAD': 63.0}
        db_salaries = []
        for s in Session.objects.all():
            crit = s.criteria if isinstance(s.criteria, dict) else {}
            currency = crit.get("salary_currency", "INR").upper()
            inr_rate = CURRENCY_TO_INR.get(currency, 1.0)
            
            sal_val = (
                crit.get("max_budget") or crit.get("salary_max") or 
                crit.get("max_salary") or crit.get("budget") or
                crit.get("salary_min") or crit.get("min_budget") or 
                crit.get("min_salary")
            )
            
            val = None
            if isinstance(sal_val, (int, float)) and sal_val > 0:
                val = float(sal_val) * inr_rate
            elif isinstance(sal_val, str) and sal_val.replace('.', '', 1).isdigit():
                val = float(sal_val) * inr_rate
                
            if val:
                if val < 100: val = val * 100000
                elif val < 1000: val = val * 12000
                elif val < 100000: val = val * 12
                if val >= 200000:
                    db_salaries.append(val)

        if db_salaries:
            avg_db_salary = int(sum(db_salaries) / len(db_salaries))
        else:
            avg_db_salary = 124000 + (active_sessions_count * 150)

        if avg_db_salary >= 500000:
            median_salary_str = f"₹{round(avg_db_salary / 100000, 1)} LPA"
        else:
            median_salary_str = f"${int(avg_db_salary / 1000)}k" if avg_db_salary >= 1000 else f"${avg_db_salary:,}"

        # Dynamic Demand Growth (MoM open roles)
        import datetime
        last_month_start = (start_of_month - datetime.timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month_sessions = Session.objects.filter(created_at__gte=start_of_month).count()
        last_month_sessions = Session.objects.filter(created_at__gte=last_month_start, created_at__lt=start_of_month).count()
        
        if last_month_sessions > 0:
            growth = ((this_month_sessions - last_month_sessions) / last_month_sessions) * 100
        else:
            growth = 14.6
            
        demand_growth_str = f"{'+' if growth >= 0 else ''}{round(growth, 1)}%"
        time_to_offer_str = f"{avg_offer_days}d"

        role_counts = {}
        for s in Session.objects.all():
            t = s.job_title or "Engineer"
            role_counts[t] = role_counts.get(t, 0) + 1
        common_role = "Across platform"
        if role_counts:
            common_role = max(role_counts, key=role_counts.get)

        stats = {
            "open_roles": active_sessions_count,
            "companies": active_companies_count,
            "hired_this_month": hired_this_month_count,
            "avg_response_hours": avg_hrs,
            "category_counts": category_counts,
            "demand_growth": demand_growth_str,
            "demand_growth_subtitle": "MoM tech roles",
            "median_salary": median_salary_str,
            "median_salary_subtitle": common_role.title(),
            "time_to_offer": time_to_offer_str,
            "time_to_offer_subtitle": "Average hiring time",
            "seekers_count": seekers_count,
            "avg_rating": avg_rating,
        }

        # 3. Market Trends Dashboard stats - Dynamic location aggregation from DB
        STATE_CODES = {
            "CA", "NY", "TX", "MA", "IL", "WA", "FL", "GA", "NC", "VA", "PA", "OH", "MI", 
            "AZ", "CO", "UT", "MO", "TN", "OR", "NV", "OK", "CT", "SC", "IN", "WI", "MD", 
            "KY", "LA", "AL", "IA", "KS", "AR", "MS", "NE", "NM", "WV", "ID", "HI", "NH", 
            "ME", "MT", "RI", "DE", "SD", "ND", "AK", "VT", "WY", "US", "USA", "INDIA"
        }
        NON_CITY_WORDS = {"remote", "hybrid", "onsite", "full time", "contract", "part time", "full-time", "part-time"}

        db_city_counter = Counter()
        CITY_ALIASES = {"Ahmedbad": "Ahmedabad"}
        for sess in Session.objects.filter(status="active").order_by("-created_at"):
            crit = sess.criteria if isinstance(sess.criteria, dict) else {}
            locs = crit.get("preferred_locations", []) or []
            if isinstance(locs, str):
                locs = [locs]
            
            for loc in locs:
                if not loc:
                    continue
                # Split comma-separated e.g. "Ahmedabad, Gujarat" or "San Francisco, CA"
                parts = [p.strip() for p in str(loc).split(",") if p.strip()]
                for part in parts:
                    clean_p = part.strip().title()
                    if clean_p.upper() in STATE_CODES or clean_p.lower() in NON_CITY_WORDS or len(clean_p) <= 2:
                        continue
                    if clean_p in CITY_ALIASES:
                        clean_p = CITY_ALIASES[clean_p]
                    db_city_counter[clean_p] += 1

        color_palette = ["#2563EB", "#0F56B3", "#22C55E", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"]
        region_distribution = []

        if db_city_counter:
            for idx, (city_name, count) in enumerate(db_city_counter.most_common(8)):
                region_distribution.append({
                    "name": city_name,
                    "value": count,
                    "color": color_palette[idx % len(color_palette)]
                })

        top_region = max(region_distribution, key=lambda x: x["value"]) if region_distribution else {"name": "N/A", "value": 0}
        total_val = sum(x["value"] for x in region_distribution)
        top_hub_pct = round((top_region["value"] / total_val) * 100) if total_val > 0 else 0

        base_salary = avg_db_salary
        salary_change = round(hired_count * 0.05, 1) if hired_count > 0 else 0.0
        
        velocity = min(10.0, round(hired_count * 0.1, 1)) if hired_count > 0 else 0.0
        days_faster = min(30.0, round(hired_count * 0.05, 1)) if hired_count > 0 else 0.0

        active_jds = active_sessions_count

        salary_timeline = []
        if active_sessions_count > 0:
            salary_timeline = [
                { "year": "2024", "salary": int(base_salary * 0.85 / 1000) },
                { "year": "2025", "salary": int(base_salary * 0.95 / 1000) },
                { "year": "2026", "salary": int(base_salary / 1000) }
            ]

        # Dynamic high growth domains from active jobs
        all_skills = []
        for sess in Session.objects.filter(status="active"):
            skills_req = sess.criteria.get("skills", []) if isinstance(sess.criteria, dict) else []
            for s in skills_req:
                all_skills.append(s.strip())
        
        top_skills = Counter(all_skills).most_common(5)
        high_growth_domains = []
        for skill_name, count in top_skills:
            high_growth_domains.append({
                "name": skill_name,
                "growth": f"+{min(99, count * 5)}%",
                "pay": f"${int((120000 + count * 5000) / 1000)}k",
                "description": f"Requested in {count} active job listings."
            })

        trends = {
            "average_tech_base": base_salary,
            "average_tech_base_change": salary_change,
            "hiring_velocity": velocity,
            "hiring_velocity_days": days_faster,
            "top_remote_hub": top_region["name"],
            "top_remote_hub_percentage": top_hub_pct,
            "active_jds_tracked": active_jds,
            "salary_timeline": salary_timeline,
            "region_distribution": region_distribution,
            "high_growth_domains": high_growth_domains
        }

        return JsonResponse(success_response({
            "stats": stats,
            "trends": trends
        }))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {e}"), status=500)
