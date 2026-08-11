"""
Workly Platform — Shared Constants
───────────────────────────────────
Single source of truth for branding, fallback strings, and app-wide config.
Every backend module must import from here instead of hardcoding these values.
"""

# ── Branding ──────────────────────────────────────────────────────────────────
APP_NAME = "Workly"
APP_TAGLINE = "AI-Powered Recruiting & Resume Platform"
APP_FULL_TITLE = f"{APP_NAME} — {APP_TAGLINE}"
APP_DOMAIN = "workly.ai"
APP_EMAIL_DOMAIN = f"noreply@{APP_DOMAIN}"

# Fallback company name when a session has no linked company
FALLBACK_COMPANY_NAME = f"{APP_NAME} Partner"

# Email sign-off
EMAIL_SIGN_OFF = f"— {APP_NAME} Platform"
