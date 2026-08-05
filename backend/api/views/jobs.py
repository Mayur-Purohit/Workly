import os
import uuid
import json
import traceback
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from api.models import Session, Candidate, Company
from workers.celery_worker import _parse_resume_sync, _normalize_skills_sync
from models.schemas import success_response, error_response
from api.views.seeker_jobs import _parse_job_description_meta, _get_salary_range
from api.constants import FALLBACK_COMPANY_NAME

def _calculate_match_score(candidate, session):
    """Calculates and updates candidate match score synchronously against session criteria."""
    criteria = session.criteria or {}
    required_skills = criteria.get("required_skills", [])
    req_lower = [r.lower() for r in required_skills]
    
    norm_skills = candidate.normalized_skills or []
    cand_skill_names = {
        (s.get("canonical_skill") or s.get("skill") or s.get("raw_skill") or str(s)).lower()
        if isinstance(s, dict) else str(s).lower()
        for s in norm_skills if s
    }
    matched_list = [r for r in required_skills if any(r.lower() in s for s in cand_skill_names)]
    missing_list = [r for r in required_skills if r.lower() not in [m.lower() for m in matched_list]]
    matched = len(matched_list)
    skill_score = round((matched / len(req_lower)) * 100) if req_lower else 0

    # Experience score
    min_exp = criteria.get("min_experience", 0)
    exp_years = float(candidate.total_experience_years or 0)
    experience_score = min(100, round((exp_years / max(min_exp, 1)) * 100)) if min_exp > 0 else 50

    # Location score
    preferred_locs = criteria.get("preferred_locations", [])
    cand_location = (candidate.location or "").lower()
    location_score = 100 if not preferred_locs else (100 if any(l.lower() in cand_location for l in preferred_locs) else 30)

    # Weighted overall score
    weights = criteria.get("weights", {"skills": 0.5, "experience": 0.3, "location": 0.2})
    score = round(
        skill_score * weights.get("skills", 0.5) + 
        experience_score * weights.get("experience", 0.3) + 
        location_score * weights.get("location", 0.2)
    )
    score = min(100, score)
    candidate.match_score = score
    candidate.recommendation = "Strong" if score >= 70 else ("Moderate" if score >= 40 else "Weak")
    candidate.match_details = {
        "match_score": score,
        "skill_score": skill_score,
        "experience_score": experience_score,
        "location_score": location_score,
        "matched_skills": matched_list,
        "missing_skills": missing_list,
        "matched_count": matched,
        "total_required": len(req_lower)
    }
    
    min_match_score = criteria.get("min_match_score", 0)
    if min_match_score > 0 and score < min_match_score:
        candidate.status = "rejected"
    elif min_match_score > 0 and score >= min_match_score and candidate.status == "rejected":
        # Restore candidates that were auto-rejected by score threshold
        # but now pass after criteria change. Only restore score-based rejections
        # (not round-based rejections from failed test attempts).
        from api.models import ApplicantRoundAttempt
        has_failed_round = ApplicantRoundAttempt.objects.filter(
            candidate=candidate, status="failed"
        ).exists()
        if not has_failed_round:
            candidate.status = "new"
        
    candidate.save()
    return candidate.match_details

@csrf_exempt
def list_public_jobs(request):
    """
    GET /api/v1/public/jobs
    Lists all active sessions as public job postings.
    Supports query params:
      - query: search in job title / description
      - location: search in preferred locations
    """
    if request.method != "GET":
        return JsonResponse(error_response("Method not allowed"), status=405)
        
    try:
        query = request.GET.get("query", request.GET.get("q", "")).strip()
        location_filter = request.GET.get("location", "").strip()
        try:
            page = int(request.GET.get("page", 1))
            per_page = int(request.GET.get("per_page", 10))
        except ValueError:
            page = 1
            per_page = 10
        
        categories_list = ["Engineering", "Design", "Data & AI", "Marketing", "Healthcare", "Operations", "Education", "Finance"]
        
        # Only active, non-archived sessions
        qs = Session.objects.filter(status="active").exclude(job_title__iexact="draft").exclude(job_title="").select_related("company").order_by("-created_at")
        
        from django.db.models import Q
        if query:
            # Map query to case-insensitive check for categories
            is_category = any(cat.lower() == query.lower() for cat in categories_list)
            
            if query.lower() == "data & ai":
                q_filter = (
                    Q(job_title__icontains="data") | Q(job_title__icontains="machine learning") | Q(job_title__icontains="artificial intelligence") |
                    Q(job_description__icontains="data") | Q(job_description__icontains="machine learning") | Q(job_description__icontains="artificial intelligence")
                )
                qs = qs.filter(q_filter)
            elif is_category:
                qs = qs.filter(Q(job_title__icontains=query) | Q(job_description__icontains=query))
            else:
                if len(query) < 3:
                    import re
                    qs = qs.filter(Q(job_title__iregex=r'\b' + re.escape(query)) | Q(inferred_skills__iregex=r'\b' + re.escape(query)))
                else:
                    qs = qs.filter(Q(job_title__icontains=query) | Q(inferred_skills__icontains=query))
            
        # 1. Evaluate total jobs before pagination
        total_jobs = qs.count()
        start = (page - 1) * per_page
        end = start + per_page
        
        # 2. Paginate FIRST to avoid parsing 100s of descriptions
        paginated_qs = qs[start:end]
            
        jobs = []
        for s in paginated_qs:
            criteria = s.criteria or {}
            preferred_locations = criteria.get("preferred_locations", [])
            
            # Simple check for location filter
            if location_filter:
                loc_match = False
                # Check criteria location list
                for loc in preferred_locations:
                    if location_filter.lower() in loc.lower():
                        loc_match = True
                        break
                # Check description text as fallback
                if not loc_match and location_filter.lower() in s.job_description.lower():
                    loc_match = True
                if not loc_match:
                    continue
            
            company_name = s.company.name if s.company else FALLBACK_COMPANY_NAME
            meta = _parse_job_description_meta(s.job_description)
            
            jobs.append({
                "id": str(s.id),
                "company_id": str(s.company_id) if s.company_id else None,
                "job_title": s.job_title,
                "job_description": s.job_description,
                "company_name": company_name,
                "company_logo_path": s.company.logo_path if s.company else None,
                "required_skills": criteria.get("required_skills", []),
                "nice_to_have": criteria.get("nice_to_have", []),
                "preferred_locations": preferred_locations,
                "min_experience": criteria.get("min_experience", 0),
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "salary_range": _get_salary_range(s),
                "location": meta["location"],
                "employment_type": meta["employment_type"]
            })
        
        paginated_jobs = jobs
        
        return JsonResponse(success_response({
            "jobs": paginated_jobs,
            "total": total_jobs,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_jobs + per_page - 1) // per_page if per_page else 1
        }))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {str(e)}"), status=500)

@csrf_exempt
def get_public_job(request, session_id):
    """
    GET /api/v1/public/jobs/<session_id>
    Gets full description and criteria for a specific job session.
    """
    if request.method != "GET":
        return JsonResponse(error_response("Method not allowed"), status=405)
        
    try:
        try:
            uuid.UUID(session_id)
        except ValueError:
            return JsonResponse(error_response("Invalid job ID format"), status=400)
            
        s = Session.objects.filter(id=session_id, status="active").first()
        if not s:
            return JsonResponse(error_response("Job posting not found"), status=404)
            
        criteria = s.criteria or {}
        company_name = s.company.name if s.company else FALLBACK_COMPANY_NAME
        meta = _parse_job_description_meta(s.job_description)
        
        return JsonResponse(success_response({
            "id": str(s.id),
            "company_id": str(s.company_id) if s.company_id else None,
            "company_name": company_name,
            "company_logo_path": s.company.logo_path if s.company else None,
            "job_title": s.job_title,
            "job_description": s.job_description,
            "required_skills": criteria.get("required_skills", []),
            "nice_to_have": criteria.get("nice_to_have", []),
            "preferred_locations": criteria.get("preferred_locations", []),
            "min_experience": criteria.get("min_experience", 0),
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "salary_range": _get_salary_range(s),
            "location": meta["location"],
            "employment_type": meta["employment_type"]
        }))
    except Exception as e:
        return JsonResponse(error_response(f"Server error: {str(e)}"), status=500)

@csrf_exempt
def apply_public_job(request, session_id):
    """
    POST /api/v1/public/jobs/<session_id>/apply
    Applies for a job by uploading a resume. Parses it, creates a candidate,
    calculates the matching details, and returns them to the seeker.
    Also handles pure parsing if session_id is "parse-only".
    """
    if request.method != "POST":
        return JsonResponse(error_response("Method not allowed"), status=405)
        
    try:
        is_parse_only = (session_id == "parse-only")
        session = None
        
        if not is_parse_only:
            try:
                uuid.UUID(session_id)
            except ValueError:
                return JsonResponse(error_response("Invalid job ID format"), status=400)
                
            session = Session.objects.filter(id=session_id, status="active").first()
            if not session:
                return JsonResponse(error_response("Job posting not found"), status=404)
                
        resume_file = request.FILES.get("file")
        if not resume_file:
            return JsonResponse(error_response("Resume file is required"), status=400)
            
        # Optional metadata fields from frontend
        seeker_name = request.POST.get("name")
        seeker_email = request.POST.get("email")
        seeker_phone = request.POST.get("phone")
        
        # Save uploaded file to local temp
        temp_dir = os.path.join("uploads", "temp_job_seeker")
        os.makedirs(temp_dir, exist_ok=True)
        file_uuid = uuid.uuid4()
        file_ext = os.path.splitext(resume_file.name)[1]
        temp_file_name = f"{file_uuid}{file_ext}"
        temp_file_path = os.path.join(temp_dir, temp_file_name)
        
        path = default_storage.save(temp_file_path, ContentFile(resume_file.read()))
        abs_temp_path = default_storage.path(path)
        
        # Synchronously parse the resume
        parsed_res = _parse_resume_sync(abs_temp_path, skip_llm=False)
        raw_data = parsed_res.get("parsed", {})
        
        # Normalize skills
        raw_skills = raw_data.get("skills", [])
        normalized_skills = _normalize_skills_sync(raw_skills)
        
        response_data = {
            "parsed_profile": {
                "name": seeker_name or raw_data.get("name") or resume_file.name.split(".")[0],
                "email": seeker_email or raw_data.get("email"),
                "phone": seeker_phone or raw_data.get("phone"),
                "location": raw_data.get("location") or "Unknown",
                "linkedin_url": raw_data.get("linkedin_url"),
                "github_url": raw_data.get("github_url"),
                "total_experience_years": float(raw_data.get("total_experience_years") or 0.0),
                "skills": normalized_skills,
                "experience": raw_data.get("experience", []),
                "education": raw_data.get("education", [])
            }
        }
        
        if not is_parse_only:
            # Create Candidate in database under the Job Session
            rounds = session.rounds or []
            first_round_order = rounds[0]["order"] if rounds else 0
            
            # Save file permanently under the session upload folder
            permanent_dir = os.path.join("uploads", str(session.id))
            os.makedirs(permanent_dir, exist_ok=True)
            permanent_file_name = f"{uuid.uuid4()}_{resume_file.name}"
            permanent_path = os.path.join(permanent_dir, permanent_file_name)
            
            # Copy file
            with open(abs_temp_path, "rb") as f_src:
                file_content = f_src.read()
                path_perm = default_storage.save(permanent_path, ContentFile(file_content))
                abs_permanent_path = default_storage.path(path_perm)
                
            candidate = Candidate.objects.create(
                session=session,
                name=response_data["parsed_profile"]["name"],
                email=response_data["parsed_profile"]["email"],
                phone=response_data["parsed_profile"]["phone"],
                location=response_data["parsed_profile"]["location"],
                total_experience_years=response_data["parsed_profile"]["total_experience_years"],
                normalized_skills=normalized_skills,
                raw_resume_data=parsed_res,
                resume_file_path=abs_permanent_path,
                current_round_index=first_round_order,
                status="new",
                source="public_apply"
            )
            
            # Calculate match details
            match_details = _calculate_match_score(candidate, session)
            response_data["match_details"] = match_details
            response_data["candidate_id"] = str(candidate.id)
            
        # Clean up temp file
        try:
            if os.path.exists(abs_temp_path):
                os.remove(abs_temp_path)
        except Exception:
            pass
            
        return JsonResponse(success_response(response_data))
    except Exception as e:
        traceback.print_exc()
        return JsonResponse(error_response(f"Server error: {str(e)}"), status=500)
