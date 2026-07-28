"""
seed_reviews – Creates one realistic review per active, non-banned account.
Wipes existing seeded reviews first. Safely re-runnable.
"""
import random
from django.core.management.base import BaseCommand
from api.models import Review, JobSeekerAccount, DeveloperAccount, Company


# ── Realistic, varied testimonial templates (NOT all 5-star) ────────────────

SEEKER_POOL = [
    {"rating": 5, "title": "Game changer for job hunting",
     "content": "Workly turned weeks of search into days. The match score was uncannily accurate and saved me endless scrolling.",
     "role": "Product Designer, Vela"},
    {"rating": 5, "title": "Transparent application process",
     "content": "Loved the calm pipeline view. I always knew where every application stood without emailing HR twice a week.",
     "role": "Staff Engineer, Northwind"},
    {"rating": 4, "title": "Fair salary insights",
     "content": "Salary transparency made negotiation actually fair. Got 22% above my last role thanks to realistic benchmark data.",
     "role": "PM, Atlas Pay"},
    {"rating": 5, "title": "Super clean resume builder",
     "content": "The AI resume enhancement fixed all my bullet points. Got 4 interview calls within 48 hours of updating my profile.",
     "role": "Senior UX Researcher"},
    {"rating": 4, "title": "Fast and smooth experience",
     "content": "Applying through Workly is seamless. No redundant form fields to fill out every single time.",
     "role": "Frontend Developer"},
    {"rating": 3, "title": "Good but needs more filters",
     "content": "Solid experience overall. Match scores are accurate, though I wish there were more granular remote-only filters.",
     "role": "QA Analyst"},
    {"rating": 5, "title": "Landed my dream startup role",
     "content": "Direct application tracking and real-time round notifications are top notch. Best job platform I've used.",
     "role": "Growth Engineer, Linear"},
    {"rating": 2, "title": "Fewer listings in niche fields",
     "content": "Great UI and fast parsing, but fewer listings in specialised healthcare research fields. Hoping for more soon.",
     "role": "Bioinformatics Researcher"},
]

DEVELOPER_POOL = [
    {"rating": 5, "title": "API integration was painless",
     "content": "Integrated candidate parsing and ranking endpoints into our internal HR portal in less than half a day. Docs are stellar.",
     "role": "Lead Architect, Stripe"},
    {"rating": 5, "title": "Lightning fast latency",
     "content": "Sub-200ms response times on resume parsing REST calls. Webhook delivery callbacks never miss an event.",
     "role": "Backend Engineer, Supabase"},
    {"rating": 4, "title": "Flexible usage tiers",
     "content": "The developer portal usage metrics and billing controls are very clear. No surprise charges whatsoever.",
     "role": "CTO, CloudPulse"},
    {"rating": 3, "title": "Would love GraphQL support",
     "content": "REST endpoints work great and JSON schemas are clean, but GraphQL support would be a welcome addition.",
     "role": "Full Stack Dev, HashiCorp"},
    {"rating": 5, "title": "Robust webhook engine",
     "content": "Webhooks handle high concurrency smoothly. Event retry policies gave our team total confidence.",
     "role": "DevOps Lead"},
]

RECRUITER_POOL = [
    {"rating": 5, "title": "Reduced time-to-hire by 60%",
     "content": "Workly transformed our screening pipeline. Screening 500+ resumes takes minutes instead of days.",
     "role": "Head of Talent"},
    {"rating": 5, "title": "Accurate candidate scoring",
     "content": "The skill match scoring rubric is remarkably accurate. Our engineering leads love the shortlisted candidates.",
     "role": "Recruitment Lead"},
    {"rating": 4, "title": "Streamlined interview rounds",
     "content": "Managing multi-stage technical and behavioural assessment rounds in one unified dashboard is effortless.",
     "role": "Talent Partner"},
    {"rating": 3, "title": "Great tool for scaling teams",
     "content": "Very helpful for bulk screening during high-volume hiring drives. Dashboard could use more analytics.",
     "role": "People Ops"},
    {"rating": 2, "title": "Onboarding took effort",
     "content": "Powerful once configured, but initial setup with existing ATS was more manual than expected.",
     "role": "VP Operations"},
]


class Command(BaseCommand):
    help = "Seeds realistic, verified reviews across Job Seekers, Developers, and Companies."

    def handle(self, *args, **options):
        self.stdout.write("Wiping existing reviews...")
        Review.objects.all().delete()

        created = 0

        # Job Seekers
        seekers = JobSeekerAccount.objects.filter(is_active=True)
        for idx, seeker in enumerate(seekers):
            if getattr(seeker, "is_banned", False):
                continue
            # Mark verified for badge rendering
            if not seeker.email_verified:
                seeker.email_verified = True
                seeker.save(update_fields=["email_verified"])
            tpl = SEEKER_POOL[idx % len(SEEKER_POOL)]
            Review.objects.create(
                user_type="job_seeker", seeker=seeker,
                rating=tpl["rating"], title=tpl["title"],
                content=tpl["content"], role_title=tpl["role"],
            )
            created += 1

        # Developers
        for idx, dev in enumerate(DeveloperAccount.objects.all()):
            if getattr(dev, "is_banned", False):
                continue
            if not getattr(dev, "is_verified", False):
                dev.is_verified = True
                dev.save(update_fields=["is_verified"])
            tpl = DEVELOPER_POOL[idx % len(DEVELOPER_POOL)]
            Review.objects.create(
                user_type="developer", developer=dev,
                rating=tpl["rating"], title=tpl["title"],
                content=tpl["content"], role_title=tpl["role"],
            )
            created += 1

        # Companies / Recruiters
        for idx, comp in enumerate(Company.objects.filter(is_active=True)):
            if getattr(comp, "is_banned", False):
                continue
            if not comp.email_verified:
                comp.email_verified = True
                comp.save(update_fields=["email_verified"])
            tpl = RECRUITER_POOL[idx % len(RECRUITER_POOL)]
            Review.objects.create(
                user_type="recruiter", recruiter=comp,
                rating=tpl["rating"], title=tpl["title"],
                content=tpl["content"],
                role_title=f"{tpl['role']}, {comp.name}",
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done — seeded {created} reviews across all active verified accounts."
        ))
