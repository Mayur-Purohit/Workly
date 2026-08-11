import os
import sys
import django
import random

# ──────────────────────────────────────────────────────────────
# Setup Django – run this script from inside the backend/ folder:
#   cd backend
#   python create_recruiter_demo.py
# ──────────────────────────────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vishleshan_backend.settings')
django.setup()

# ──────────────────────────────────────────────────────────────
# Imports must come AFTER django.setup()
# ──────────────────────────────────────────────────────────────
import uuid
from passlib.context import CryptContext
from api.models import Company, APIKey, Session, Candidate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_EMAIL    = "demo@recruiter.com"
DEMO_PASSWORD = "demo123456"
COMPANY_NAME  = "Acme Global Technologies"

# ── Candidate pool with realistic fraud-analysis data ────────────────────────
DEMO_CANDIDATES = [
    {
        "name": "Sarah Mitchell",
        "email": "sarah.mitchell@example.com",
        "phone": "+1 (555) 234-5678",
        "location": "San Francisco, CA",
        "match_score": 96.4,
        "total_experience_years": 6.5,
        "recommendation": "Strong Hire",
        "status": "shortlisted",
        "normalized_skills": ["React", "Node.js", "TypeScript", "Python", "PostgreSQL", "AWS"],
        "raw_resume_data": {
            "skills": ["React", "Node.js", "TypeScript", "Python", "PostgreSQL", "AWS"],
            "fraud_analysis": {
                "originality_score": 97.2,
                "ai_probability": 8.5,
                "plagiarism_score": 3.1,
                "verdict": "Authentic",
                "processed_in_seconds": 1.1,
            }
        },
        "match_details": {
            "skill_score": 9.4,
            "experience_score": 9.1,
            "fraud_analysis": {
                "originality_score": 97.2,
                "ai_probability": 8.5,
                "plagiarism_score": 3.1,
            }
        },
    },
    {
        "name": "Marcus Vance",
        "email": "m.vance@example.com",
        "phone": "+1 (555) 987-6543",
        "location": "New York, NY",
        "match_score": 91.2,
        "total_experience_years": 5.0,
        "recommendation": "Strong Hire",
        "status": "shortlisted",
        "normalized_skills": ["React", "Python", "Django", "PostgreSQL", "Docker"],
        "raw_resume_data": {
            "skills": ["React", "Python", "Django", "PostgreSQL", "Docker"],
            "fraud_analysis": {
                "originality_score": 93.5,
                "ai_probability": 14.2,
                "plagiarism_score": 6.3,
                "verdict": "Authentic",
                "processed_in_seconds": 1.3,
            }
        },
        "match_details": {
            "skill_score": 8.7,
            "experience_score": 8.0,
            "fraud_analysis": {
                "originality_score": 93.5,
                "ai_probability": 14.2,
                "plagiarism_score": 6.3,
            }
        },
    },
    {
        "name": "Elena Rostova",
        "email": "elena.r@example.com",
        "phone": "+1 (555) 456-7890",
        "location": "Austin, TX",
        "match_score": 84.8,
        "total_experience_years": 4.2,
        "recommendation": "Consider",
        "status": "reviewing",
        "normalized_skills": ["Node.js", "Express", "MongoDB", "React"],
        "raw_resume_data": {
            "skills": ["Node.js", "Express", "MongoDB", "React"],
            "fraud_analysis": {
                "originality_score": 88.0,
                "ai_probability": 22.7,
                "plagiarism_score": 11.4,
                "verdict": "Authentic",
                "processed_in_seconds": 0.9,
            }
        },
        "match_details": {
            "skill_score": 7.8,
            "experience_score": 7.2,
            "fraud_analysis": {
                "originality_score": 88.0,
                "ai_probability": 22.7,
                "plagiarism_score": 11.4,
            }
        },
    },
    {
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "phone": "+91 98765 43210",
        "location": "Bangalore, India",
        "match_score": 78.5,
        "total_experience_years": 3.8,
        "recommendation": "Consider",
        "status": "reviewing",
        "normalized_skills": ["Python", "FastAPI", "PostgreSQL", "AWS Lambda"],
        "raw_resume_data": {
            "skills": ["Python", "FastAPI", "PostgreSQL", "AWS Lambda"],
            "fraud_analysis": {
                "originality_score": 91.3,
                "ai_probability": 18.6,
                "plagiarism_score": 8.7,
                "verdict": "Authentic",
                "processed_in_seconds": 1.0,
            }
        },
        "match_details": {
            "skill_score": 7.2,
            "experience_score": 6.5,
            "fraud_analysis": {
                "originality_score": 91.3,
                "ai_probability": 18.6,
                "plagiarism_score": 8.7,
            }
        },
    },
    {
        "name": "James O'Connor",
        "email": "james.oconnor@example.com",
        "phone": "+44 7700 900123",
        "location": "London, UK",
        "match_score": 62.1,
        "total_experience_years": 2.5,
        "recommendation": "Reject",
        "status": "rejected",
        "normalized_skills": ["JavaScript", "HTML", "CSS"],
        "raw_resume_data": {
            "skills": ["JavaScript", "HTML", "CSS"],
            "fraud_analysis": {
                "originality_score": 41.2,
                "ai_probability": 81.4,
                "plagiarism_score": 67.3,
                "verdict": "Flagged",
                "processed_in_seconds": 1.4,
            }
        },
        "match_details": {
            "skill_score": 3.1,
            "experience_score": 4.0,
            "fraud_analysis": {
                "originality_score": 41.2,
                "ai_probability": 81.4,
                "plagiarism_score": 67.3,
            }
        },
    },
]


def create_demo_recruiter():
    hashed_pwd = pwd_context.hash(DEMO_PASSWORD)

    # 1. Create or update Company
    company, created = Company.objects.get_or_create(
        email=DEMO_EMAIL,
        defaults={
            "name": COMPANY_NAME,
            "password_hash": hashed_pwd,
            "tier": "enterprise",
            "is_active": True,
            "email_verified": True,
            "phone_verified": True,
            "industry": "Artificial Intelligence & Software",
            "hq_location": "San Francisco, CA",
            "company_size": "250-500",
            "founded_year": 2021,
            "website_url": "https://between.ai",
            "about": "Leading enterprise provider of next-generation AI recruitment intelligence.",
        }
    )

    if not created:
        company.password_hash = hashed_pwd
        company.is_active = True
        company.name = COMPANY_NAME
        company.email_verified = True
        company.phone_verified = True
        company.save()
        print(f"[~] Updated existing demo account: {DEMO_EMAIL}")
    else:
        print(f"[+] Created new demo account: {DEMO_EMAIL}")

    # 2. Ensure at least one active API Key exists
    APIKey.objects.get_or_create(
        company=company,
        is_active=True,
        defaults={
            "key_name": "Demo Production Key",
            "secret_key": f"vish_live_demo_{uuid.uuid4().hex[:16]}",
            "public_key": f"vish_pub_demo_{uuid.uuid4().hex[:16]}",
            "environment": "production",
        }
    )
    print("[+] API key OK")

    # 3. Create or update Session
    session, session_created = Session.objects.get_or_create(
        company=company,
        name="Senior Full-Stack Engineer Search",
        defaults={
            "job_title": "Senior Full-Stack Engineer",
            "job_description": (
                "We are seeking an experienced Senior Full-Stack Engineer skilled in "
                "React, Node.js, Python, PostgreSQL, and Cloud Architectures."
            ),
            "rounds": [
                {"name": "Screening Round",      "interviewer": "AI Automated", "order": 1},
                {"name": "Technical Assessment", "interviewer": "Lead Architect", "order": 2},
                {"name": "System Design & HR",   "interviewer": "VP Engineering", "order": 3},
            ],
            "status": "active",
            "criteria": {
                "required_skills": ["React", "Node.js", "Python", "PostgreSQL"],
                "nice_to_have": ["Docker", "AWS", "GraphQL"],
                "min_experience": 4,
                "weights": {"skills": 0.5, "experience": 0.3, "location": 0.2},
            },
        }
    )

    if session_created:
        print(f"[+] Created session: {session.name}")
    else:
        # Update fraud data for existing candidates
        print(f"[~] Session already exists: {session.name}")

    # 4. Upsert candidates (update if email exists in session, else create)
    created_count = 0
    updated_count = 0
    for cand_data in DEMO_CANDIDATES:
        existing = Candidate.objects.filter(
            session=session,
            email=cand_data["email"]
        ).first()

        if existing:
            # Update fraud and score data on existing candidates
            existing.match_score = cand_data["match_score"]
            existing.total_experience_years = cand_data["total_experience_years"]
            existing.recommendation = cand_data["recommendation"]
            existing.status = cand_data["status"]
            existing.raw_resume_data = cand_data["raw_resume_data"]
            existing.match_details = cand_data["match_details"]
            existing.normalized_skills = cand_data["normalized_skills"]
            existing.save()
            updated_count += 1
        else:
            Candidate.objects.create(
                session=session,
                name=cand_data["name"],
                email=cand_data["email"],
                phone=cand_data["phone"],
                location=cand_data["location"],
                match_score=cand_data["match_score"],
                total_experience_years=cand_data["total_experience_years"],
                recommendation=cand_data["recommendation"],
                status=cand_data["status"],
                normalized_skills=cand_data["normalized_skills"],
                raw_resume_data=cand_data["raw_resume_data"],
                match_details=cand_data["match_details"],
            )
            created_count += 1

    if created_count:
        print(f"[+] Created {created_count} candidates with fraud data")
    if updated_count:
        print(f"[~] Updated {updated_count} existing candidates with fraud data")

    print("\n" + "=" * 60)
    print("  DEMO RECRUITER ACCOUNT READY!")
    print("=" * 60)
    print(f"  Role      : Recruiter")
    print(f"  Email     : {DEMO_EMAIL}")
    print(f"  Password  : {DEMO_PASSWORD}")
    print(f"  URL       : http://localhost:5173/login")
    print(f"  Candidates: {len(DEMO_CANDIDATES)} (with fraud analysis data)")
    print("=" * 60 + "\n")
    print("Landing page dynamic data is now seeded:")
    print("  ✔ Live Session card  → shows real DB candidates with scores")
    print("  ✔ Fraud Analysis     → averages from real candidate fraud_analysis fields")
    print("  ✔ Stats Strip        → real counts from DB")
    print("  ✔ Pricing            → fetched from /api/v1/billing/plans\n")


if __name__ == "__main__":
    create_demo_recruiter()
