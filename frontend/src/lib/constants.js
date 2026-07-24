/**
 * Workly Platform — Shared Constants
 * ───────────────────────────────────
 * Single source of truth for branding, fallback strings, and app-wide config.
 * Every frontend module must import from here instead of hardcoding these values.
 */

export const APP_NAME = "Workly";
export const APP_TAGLINE = "AI-Powered Recruiting & Resume Platform";
export const APP_FULL_TITLE = `${APP_NAME} — ${APP_TAGLINE}`;
export const APP_DOMAIN = "workly.ai";

// Fallback company name when a session has no linked company
export const FALLBACK_COMPANY_NAME = `${APP_NAME} Partner`;

// Assessment portal
export const ASSESSMENT_PORTAL_TITLE = `${APP_NAME} Assessment Portal`;
