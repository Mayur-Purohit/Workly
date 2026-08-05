import os
import json
import logging
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email, ValidationError
from django.conf import settings

from models.schemas import success_response, error_response
from api.services.email_service import FROM_EMAIL

logger = logging.getLogger(__name__)

@csrf_exempt
def contact_form_view(request):
    """
    POST /api/v1/public/contact
    Handles public contact form submissions:
    1. Sends notification email to the Admin person.
    2. Sends a confirmation copy email directly to the sender's email address.
    """
    if request.method != "POST":
        return JsonResponse(error_response("Method not allowed"), status=405)

    try:
        body = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception:
        return JsonResponse(error_response("Invalid JSON body"), status=400)

    name = str(body.get("name", "")).strip()
    email = str(body.get("email", "")).strip()
    message = str(body.get("message", "")).strip()

    if not name or not email or not message:
        return JsonResponse(error_response("Name, email, and message are all required."), status=400)

    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse(error_response("Please provide a valid email address."), status=400)

    admin_email = os.getenv("ADMIN_EMAIL", getattr(settings, "ADMIN_EMAIL", "new424433@gmail.com"))
    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

    logger.info("=== CONTACT FORM SUBMISSION RECEIVED ===")
    logger.info("Name: %s | Sender Email: %s | Admin Target: %s", name, email, admin_email)
    logger.info("Message: %s", message)
    logger.info("========================================")

    # 1. Send Admin Notification Email
    subject_admin = f"[Workly Contact Form] New Message from {name}"
    text_admin = f"""
New Contact Form Submission on Workly

Details:
• Name: {name}
• Sender Email: {email}
• Time: {timestamp_str}

Message:
--------------------------------------------------
{message}
--------------------------------------------------

You can reply directly to this email to contact {name} at {email}.
"""

    html_admin = f"""
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center;">
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">New Contact Form Message</h2>
            <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Received via Workly Contact Us page</p>
        </div>
        <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 120px;">Sender Name:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">{name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Sender Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:{email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">{email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Submission Time:</td>
                    <td style="padding: 8px 0; color: #475569;">{timestamp_str}</td>
                </tr>
            </table>

            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Message Content:</p>
                <p style="color: #1e293b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">{message}</p>
            </div>

            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                Reply directly to this email to respond to <strong>{name}</strong>.
            </p>
        </div>
    </div>
    """

    email_sent = False
    try:
        email_msg = EmailMultiAlternatives(
            subject=subject_admin,
            body=text_admin.strip(),
            from_email=FROM_EMAIL,
            to=[admin_email],
            reply_to=[email],
        )
        email_msg.attach_alternative(html_admin, "text/html")
        email_msg.send(fail_silently=False)
        email_sent = True
        logger.info("Contact form email successfully sent to admin (%s) for sender %s", admin_email, email)
    except Exception as exc:
        logger.warning("Failed to send contact form email to admin (%s): %s", admin_email, exc)

    # 2. Also Send Confirmation Email to the Sender (if different from admin_email or as receipt)
    try:
        subject_user = f"We received your message — Workly Support"
        text_user = f"""
Hi {name},

Thank you for reaching out to Workly! We have received your message and our team will get back to you within 24 hours.

Your Message Details:
--------------------------------------------------
{message}
--------------------------------------------------

Best regards,
The Workly Team
"""
        html_user = f"""
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px;">
            <h3 style="color: #0f172a; margin-top: 0;">Message Received!</h3>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi <strong>{name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for contacting Workly! We have received your message and our support team will get back to you shortly.</p>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="color: #64748b; font-size: 12px; font-weight: 700; margin: 0 0 6px 0;">YOUR MESSAGE:</p>
                <p style="color: #1e293b; font-size: 14px; margin: 0; white-space: pre-wrap;">{message}</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">— The Workly Team</p>
        </div>
        """
        user_msg = EmailMultiAlternatives(
            subject=subject_user,
            body=text_user.strip(),
            from_email=FROM_EMAIL,
            to=[email],
        )
        user_msg.attach_alternative(html_user, "text/html")
        user_msg.send(fail_silently=False)
        logger.info("Confirmation email sent to user (%s)", email)
    except Exception as exc:
        logger.warning("Failed to send user confirmation email to (%s): %s", email, exc)

    return JsonResponse(
        success_response(
            data={
                "message": "Your message has been sent successfully! We will get back to you within 24 hours.",
                "email_sent": email_sent
            }
        ),
        status=200
    )
