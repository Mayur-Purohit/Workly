import logging
from api.models import Notification, JobSeekerAccount
from api.services.email_service import send_new_job_notification_to_follower

logger = logging.getLogger(__name__)

def notify_followers_of_new_job(session):
    """
    Finds all job seekers who follow the company that posted the job (session),
    creates an in-app notification for them, and sends them an email.
    """
    try:
        company = session.company
        if not company:
            return
            
        job_title = session.job_title
        session_id = str(session.id)
        cid_str = str(company.id)
        
        # Avoid duplicate notifications if already notified for this session
        crit = dict(session.criteria or {})
        if crit.get("followers_notified"):
            return
            
        # 1. Find all seekers following this company
        seekers_list = []
        try:
            seekers = JobSeekerAccount.objects.filter(
                resume_data__followed_companies__contains=cid_str
            )
            seekers_list = list(seekers)
        except Exception:
            seekers_list = []

        if not seekers_list:
            for s in JobSeekerAccount.objects.all():
                if s.resume_data and isinstance(s.resume_data, dict):
                    followed = s.resume_data.get("followed_companies", [])
                    if isinstance(followed, list) and (cid_str in followed or str(company.id) in followed):
                        seekers_list.append(s)
                        
        if not seekers_list:
            logger.info("No followers to notify for company %s", company.name)
            return
            
        logger.info("Notifying %d followers of new job: %s at %s", len(seekers_list), job_title, company.name)
        
        for seeker in seekers_list:
            # 2. Create in-app notification
            try:
                Notification.objects.create(
                    seeker=seeker,
                    type="new_match",
                    title=f"New job at {company.name}",
                    message=f"{company.name} just posted a new role: {job_title}. Apply now!",
                    link=f"/jobs/{session_id}"
                )
            except Exception as ne:
                logger.error("Failed to create in-app notification for seeker %s: %s", seeker.email, ne)
                
            # 3. Send email notification
            try:
                if send_new_job_notification_to_follower:
                    send_new_job_notification_to_follower(
                        seeker_email=seeker.email,
                        seeker_name=seeker.full_name,
                        company_name=company.name,
                        job_title=job_title,
                        session_id=session_id
                    )
            except Exception as ee:
                logger.error("Failed to send email notification to seeker %s: %s", seeker.email, ee)
                
        # Mark as notified to avoid duplicate notifications on session re-saves
        crit["followers_notified"] = True
        session.criteria = crit
        session.save(update_fields=["criteria"])

    except Exception as e:
        logger.error("Error in notify_followers_of_new_job: %s", e)
