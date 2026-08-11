from django.contrib import admin
from api.models import (
    Company,
    APIKey,
    Session,
    Candidate,
    SkillTaxonomy,
    ChatHistory,
    IngestJob,
    DeveloperAccount,
    DeveloperAPIKey,
    APIUsageLog,
    MonthlyUsageSummary,
    Webhook,
    WebhookDeliveryLog,
    BillingSubscription,
    EmbedToken,
    JobSeekerAccount,
    JobApplication,
    Notification,
    ResumeDraft,
    ResumeVersion,
    SavedJob,
    CompanyBillingSubscription,
    SeekerBillingSubscription,
    SessionRound,
    MCQQuestion,
    CodingProblem,
    ApplicantRoundAttempt,
    SeekerMockAttempt,
    Review,
)

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "tier", "is_active", "created_at")
    search_fields = ("name", "email")
    list_filter = ("tier", "is_active")

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ("key_name", "company", "environment", "is_active", "created_at")
    search_fields = ("key_name", "secret_key", "public_key")

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("job_title", "company", "status", "created_at")
    search_fields = ("job_title", "name")
    list_filter = ("status",)

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "match_score", "status", "created_at")
    search_fields = ("name", "email")
    list_filter = ("status", "recommendation")

@admin.register(SkillTaxonomy)
class SkillTaxonomyAdmin(admin.ModelAdmin):
    list_display = ("skill_name", "canonical_name", "category")
    search_fields = ("skill_name", "canonical_name")

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ("session", "role", "created_at")

@admin.register(IngestJob)
class IngestJobAdmin(admin.ModelAdmin):
    list_display = ("session", "type", "status", "processed_files", "total_files")

@admin.register(DeveloperAccount)
class DeveloperAccountAdmin(admin.ModelAdmin):
    list_display = ("company_name", "email", "tier", "is_verified", "created_at")

@admin.register(DeveloperAPIKey)
class DeveloperAPIKeyAdmin(admin.ModelAdmin):
    list_display = ("key_name", "developer", "environment", "is_active")

@admin.register(APIUsageLog)
class APIUsageLogAdmin(admin.ModelAdmin):
    list_display = ("developer", "endpoint", "status_code", "latency_ms", "timestamp")

@admin.register(MonthlyUsageSummary)
class MonthlyUsageSummaryAdmin(admin.ModelAdmin):
    list_display = ("developer", "year_month", "total_api_calls")

@admin.register(Webhook)
class WebhookAdmin(admin.ModelAdmin):
    list_display = ("developer", "url", "is_active", "failure_count")

@admin.register(WebhookDeliveryLog)
class WebhookDeliveryLogAdmin(admin.ModelAdmin):
    list_display = ("webhook", "event_type", "status_code", "created_at")

@admin.register(BillingSubscription)
class BillingSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("developer", "plan", "status", "created_at")

@admin.register(EmbedToken)
class EmbedTokenAdmin(admin.ModelAdmin):
    list_display = ("developer", "allowed_domain", "is_active", "expires_at")

@admin.register(JobSeekerAccount)
class JobSeekerAccountAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "tier", "is_active", "created_at")
    search_fields = ("full_name", "email")

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("seeker", "session", "status", "applied_at")
    list_filter = ("status",)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "is_read", "created_at")
    list_filter = ("type", "is_read")

@admin.register(ResumeDraft)
class ResumeDraftAdmin(admin.ModelAdmin):
    list_display = ("title", "seeker", "template_id", "ats_score", "updated_at")

@admin.register(ResumeVersion)
class ResumeVersionAdmin(admin.ModelAdmin):
    list_display = ("title", "draft", "ats_score", "created_at")

@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("seeker", "session", "saved_at")

@admin.register(CompanyBillingSubscription)
class CompanyBillingSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("company", "plan", "status", "created_at")

@admin.register(SeekerBillingSubscription)
class SeekerBillingSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("seeker", "plan", "status", "created_at")

@admin.register(SessionRound)
class SessionRoundAdmin(admin.ModelAdmin):
    list_display = ("name", "session", "round_type", "round_number", "is_active")

@admin.register(MCQQuestion)
class MCQQuestionAdmin(admin.ModelAdmin):
    list_display = ("category", "question_text", "difficulty")

@admin.register(CodingProblem)
class CodingProblemAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "difficulty")

@admin.register(ApplicantRoundAttempt)
class ApplicantRoundAttemptAdmin(admin.ModelAdmin):
    list_display = ("candidate", "round", "status", "overall_score")

@admin.register(SeekerMockAttempt)
class SeekerMockAttemptAdmin(admin.ModelAdmin):
    list_display = ("seeker", "attempt_type", "status", "score", "created_at")

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user_type", "rating", "title", "created_at")
    list_filter = ("user_type", "rating")
