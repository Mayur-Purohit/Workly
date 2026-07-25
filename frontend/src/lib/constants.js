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

// Single Source of Truth for Developer Plans & Pricing
export const DEVELOPER_PLANS = [
  { id: "free", name: "Free Tier", price: 0, popular: false, features: ["100 parses/month", "Community support", "JSON & HTML output", "Sandbox access"] },
  { id: "starter", name: "Starter", price: 2999, popular: true, features: ["1,000 parses/month", "Email support", "All output formats", "99% uptime SLA", "Webhooks"] },
  { id: "pro", name: "Pro", price: 9999, popular: false, features: ["10,000 parses/month", "Priority 24/7 support", "Custom webhook events", "99.9% uptime SLA", "Dedicated IP"] }
];
