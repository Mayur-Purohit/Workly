import os
import sys
import django

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vishleshan_backend.settings')
django.setup()

import uuid
from passlib.context import CryptContext
from api.models import Company, APIKey, Session, Candidate, JobSeekerAccount, DeveloperAccount, DeveloperAPIKey

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_all_demo_accounts():
    print("=" * 60)
    print("      CREATING WORKLY DEMO ACCOUNTS      ")
    print("=" * 60)

    # 1. Recruiter Account
    recruiter_email = "recruiter.demo@workly.ai"
    recruiter_pass = "Password123!"
    company_name = "TechCorp Solutions"

    company, created = Company.objects.get_or_create(
        email=recruiter_email,
        defaults={
            "name": company_name,
            "password_hash": pwd_context.hash(recruiter_pass),
            "tier": "business",
            "is_active": True,
            "email_verified": True,
            "phone_verified": True,
            "industry": "Software & Technology",
            "hq_location": "San Francisco, CA",
            "about": "Leading AI and Cloud Solutions Provider",
            "rating": 4.9,
            "company_size": "50-200",
            "founded_year": 2020,
            "website_url": "https://techcorp.example.com"
        }
    )
    if not created:
        company.password_hash = pwd_context.hash(recruiter_pass)
        company.tier = "business"
        company.is_active = True
        company.email_verified = True
        company.save()
        print(f"[+] Updated Recruiter Demo Account: {recruiter_email}")
    else:
        print(f"[+] Created Recruiter Demo Account: {recruiter_email}")

    # API Key for Recruiter
    api_key, _ = APIKey.objects.get_or_create(
        company=company,
        defaults={
            "key_name": "Default Production Key",
            "secret_key": f"workly_sec_{uuid.uuid4().hex[:16]}",
            "public_key": f"workly_pub_{uuid.uuid4().hex[:16]}"
        }
    )

    # 2. Job Seeker Account
    seeker_email = "seeker.demo@workly.ai"
    seeker_pass = "Password123!"

    seeker, created = JobSeekerAccount.objects.get_or_create(
        email=seeker_email,
        defaults={
            "full_name": "Alex Johnson",
            "password_hash": pwd_context.hash(seeker_pass),
            "phone": "+1 (555) 019-2834",
            "location": "New York, NY",
            "headline": "Senior Full-Stack Engineer (React / Node / Python)",
            "tier": "premium",
            "is_active": True,
            "email_verified": True,
            "phone_verified": True,
            "skills": ["React", "Node.js", "Python", "TypeScript", "Django", "PostgreSQL", "Docker", "AWS"],
            "open_to": {
                "workTypes": ["remote", "hybrid"],
                "roles": ["Senior Frontend Engineer", "Full Stack Developer"],
                "locations": ["New York, NY", "Remote"]
            },
            "resume_data": {
                "name": "Alex Johnson",
                "email": seeker_email,
                "phone": "+1 (555) 019-2834",
                "location": "New York, NY",
                "total_experience_years": 5.5,
                "skills": ["React", "Node.js", "Python", "TypeScript", "Django", "PostgreSQL"],
                "experience": [
                    {
                        "title": "Senior Frontend Developer",
                        "company": "Veloce Web Systems",
                        "duration": "2022 - Present",
                        "description": "Architected high-scale React web applications serving 500k+ MAU."
                    },
                    {
                        "title": "Software Engineer",
                        "company": "DataPulse Labs",
                        "duration": "2019 - 2022",
                        "description": "Built Python REST microservices and analytics dashboards."
                    }
                ]
            }
        }
    )
    if not created:
        seeker.password_hash = pwd_context.hash(seeker_pass)
        seeker.tier = "premium"
        seeker.is_active = True
        seeker.email_verified = True
        seeker.save()
        print(f"[+] Updated Job Seeker Demo Account: {seeker_email}")
    else:
        print(f"[+] Created Job Seeker Demo Account: {seeker_email}")

    # 3. Developer Account
    dev_email = "developer.demo@workly.ai"
    dev_pass = "Password123!"

    dev, created = DeveloperAccount.objects.get_or_create(
        email=dev_email,
        defaults={
            "company_name": "Workly Enterprise Integration",
            "password_hash": pwd_context.hash(dev_pass),
            "tier": "enterprise",
            "is_verified": True,
            "phone_verified": True,
            "website_url": "https://dev-partner.example.com",
            "allowed_domains": ["localhost", "127.0.0.1", "workly.ai"]
        }
    )
    if not created:
        dev.password_hash = pwd_context.hash(dev_pass)
        dev.tier = "enterprise"
        dev.is_verified = True
        dev.save()
        print(f"[+] Updated Developer Demo Account: {dev_email}")
    else:
        print(f"[+] Created Developer Demo Account: {dev_email}")

    dev_key, _ = DeveloperAPIKey.objects.get_or_create(
        developer=dev,
        defaults={
            "secret_key": f"workly_live_demo_{uuid.uuid4().hex[:16]}",
            "public_key": f"workly_pub_demo_{uuid.uuid4().hex[:16]}",
            "key_name": "Production Enterprise Key"
        }
    )

    print("\n" + "=" * 60)
    print("              DEMO ACCOUNTS READY               ")
    print("=" * 60)
    print(f"1. RECRUITER PORTAL  : {recruiter_email} / {recruiter_pass}")
    print(f"   Company Name      : {company_name}")
    print(f"   API Key           : {api_key.public_key}")
    print(f"2. JOB SEEKER PORTAL : {seeker_email} / {seeker_pass}")
    print(f"   Full Name         : {seeker.full_name}")
    print(f"3. DEVELOPER PORTAL  : {dev_email} / {dev_pass}")
    print(f"   Public Key        : {dev_key.public_key}")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    create_all_demo_accounts()
