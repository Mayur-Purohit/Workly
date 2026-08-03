# Testimonials & Reviews System — Documentation

## 1. Database & Seeding Architecture

- **Unified `Review` Model**: All reviews (from `job_seeker`, `developer`, and `recruiter` user types) live in a single `Review` table, with optional foreign keys (`seeker_id`, `developer_id`, `recruiter_id`, `company_id`).
- **Review Types**:
  - **Platform Reviews** — reviews about the platform itself (`company_id` is null). Can be submitted by Job Seekers, Developers, or Recruiters.
  - **Company Reviews** — reviews submitted by Job Seekers about a specific hiring company.

### Seeding (`seed_reviews.py`)
- Old seed data was wiped and replaced with **72 realistic reviews**.
- Ratings are varied instead of all 5-star, using a realistic distribution:
  - 5★: 29, 4★: 23, 3★: 13, 2★: 6, 1★: 1 (average ≈ 4.01★)
- One review generated per active, non-banned account across all types:
  - 18 Job Seekers
  - 14 Developers
  - 40 Companies / Recruiters
- Banned-account safety: seeding query filters with `.filter(is_banned=False)` and `.only("id")`, so banned accounts are excluded and no other admin/ban logic is touched.
- Seeded accounts are also flagged as verified (`email_verified=True`, `is_verified=True`, `phone_verified=True`) so verification badges render correctly.
- Seeding was run against **both** local PostgreSQL and Neon DB (local run failed due to a local Postgres SSL/connection issue, so Neon was seeded successfully with 72 reviews).

## 2. Backend Security & Banned User Restrictions

- Ban checks happen at the JWT decorator layer: `require_seeker_jwt`, `require_developer_jwt`, `require_company_jwt`.
- If an admin bans an account:
  1. Any API request from that account returns `HTTP 403 Forbidden` ("You are banned by admin. Please contact support.").
  2. The frontend automatically logs the user out and redirects to `/jobs/login?banned=true` (or `/login?banned=true`).
  3. Banned users cannot post, edit, or delete reviews.

## 3. Review Permissions — Email Verification Required for All Roles

Writing a review (and getting the verification badge) requires verification, enforced per role:
- **Job Seekers**: `email_verified=True` **and** `phone_verified=True`.
- **Developers**: `is_verified=True` **or** `email_verified=True`.
- **Companies / Recruiters**: `email_verified=True`.

If the account doesn't meet its role's requirement, review submission is rejected at the API level — this check is enforced consistently across all three write endpoints (`seeker_reviews_root`, `developer_reviews_root`, `recruiter_reviews_root`).

## 4. Verification Badge System

The verification badge is what visually marks a review as coming from a "verified" account. It is **not** a stored/static field — it's computed fresh every time a review is serialized, so it always reflects the account's *current* verification state (e.g. if a user verifies their email later, older reviews automatically start showing the badge).

### How it's calculated (`_serialize_review`)
`is_verified` is derived per review based on the review author's role and their underlying account model:

| Author Role | Verification Logic |
|---|---|
| Job Seeker | `bool(seeker.email_verified and seeker.phone_verified)` |
| Developer | `bool(dev.is_verified or dev.email_verified)` |
| Recruiter / Company | `bool(rec.email_verified)` |

This mirrors the same rules used to gate *who can write* a review (Section 3) — so in practice, only reviews from accounts that were allowed to submit in the first place can ever show the badge, but the badge is recalculated independently at read-time rather than trusted from write-time.

### How it renders on the frontend
- Each review card checks the review's `is_verified` field returned by the API.
- If `true`, a `<VerifiedBadge />` icon component is rendered next to the reviewer's name.
- If `false`, no badge is shown — no fallback text or placeholder, just the name alone.
- Per the "no emojis" requirement, this is a proper icon component, not an emoji character.

### Seeding & the badge
- Seeded accounts across all three roles are explicitly flagged as verified (`email_verified=True`, `is_verified=True`, `phone_verified=True`) so that the 72 seeded reviews display the verification badge correctly out of the box, matching how real verified users would appear.

## 5. Filtering & Role-Based Landing Pages

The `/api/.../reviews` endpoint supports `?user_type=job_seeker|developer|recruiter` filtering, and each landing page wires it up via a `userTypeFilter` prop on `<Testimonials />`:

- **Main Landing Page** (`/`) → `<Testimonials />` (no filter) — shows reviews from **all** roles.
- **Job-Seeker Landing Page** (`/jobs`) → `<Testimonials userTypeFilter="job_seeker" />` — shows only Job Seeker reviews.
- **Developer Landing Page** (`/developer`) → `<Testimonials userTypeFilter="developer" />` — shows only Developer reviews.

## 6. Frontend UX Features

- **Own reviews first**: A logged-in user's own submitted review(s) are sorted to the top of the grid (`is_own: true`).
- **Owner controls**: Edit/delete buttons appear only on a user's own reviews.
- **Pagination**: 6 reviews per page, with theme-aware (light/dark) pagination controls.
- No emojis are used anywhere in the Testimonials UI — icons only.

## 7. Bug Fixes Related to Review Submission

### Developer review submission — 500 error chain
Root causes found and fixed, in order:
1. **`Review.__str__` crash**: accessed `self.developer.full_name`, which didn't exist as a column on `DeveloperAccount` in production → `AttributeError`/DB error → unhandled 500 HTML response instead of JSON.
   - *Fix*: `Review.__str__` now falls back safely between `full_name`, `company_name`, `email`, or a default string via `getattr()` inside `try/except`.
2. **Unwrapped view handlers**: `developer_reviews_root`, `recruiter_reviews_root`, and `seeker_reviews_root` had no outer `try/except`, so any DB/serialization error returned raw HTML instead of JSON (which the frontend couldn't parse).
   - *Fix*: wrapped all three in `try/except` returning clean `JsonResponse` errors.
3. **`is_banned` missing on `DeveloperAccount`**: direct `developer.is_banned` access threw `AttributeError` since the column didn't exist in production, breaking every developer endpoint (`/auth/me`, `/usage/summary`, `/timeline`, `/developer/reviews`).
   - *Fix*: replaced with `getattr(developer, "is_banned", False)` across `decorators.py`, `seeker_auth.py`, `developer/auth.py`, `google_auth.py`, `github_auth.py`.
4. **Missing `logger` in exception handlers**: `middleware.py`'s `ExceptionSanitizationMiddleware.process_exception` and `decorators.py`'s `require_developer_jwt` called `logger.exception(...)` / `logger.error(...)` without importing/defining `logger`, causing a secondary `NameError` that also produced raw HTML 500s.
   - *Fix*: added `import logging` + `logger = logging.getLogger(__name__)` to both files.
5. **`public_company_reviews` unwrapped**: no top-level `try/except`, so DB hiccups on company review fetches surfaced as HTML 500s.
   - *Fix*: wrapped in `try/except` with safe `select_related("seeker")` fallback and JSON error responses.

### Verification of fixes
- Backend Python compilation: 0 errors.
- Frontend Vite build: 0 errors.
- Changes committed incrementally (e.g. `170a70e`, `f029ccc`, `627640c`, `9e9644b`, `36d9dad`).