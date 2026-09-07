# Workly

<p align="center">
  <b>Automated Recruitment, Resume Screening & Candidate Assessment Platform</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-5.0-092E20?logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7.0+-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Celery-5.4-37814A?logo=celery&logoColor=white" alt="Celery" />
  <img src="https://img.shields.io/badge/Gemini_Flash-2.0%20%2F%201.5-4285F4?logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/scikit--learn-1.4+-F7931E?logo=scikit-learn&logoColor=white" alt="scikit-learn" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 📌 Overview

Workly is a recruitment management and screening platform built with Python (Django 5) and React 18. It automates candidate intake, resume extraction, semantic skill matching against job descriptions, and multi-stage candidate evaluations (multiple-choice assessments, programming tests, and voice-assisted interviews).

The platform provides dedicated workspaces for three distinct user roles:
1. **Recruiters & Companies**: Create hiring sessions, ingest resumes in bulk (files, ZIP, Gmail, Google Drive, Google Sheets), screen candidates with semantic and machine learning match algorithms, configure assessment pipelines, and review candidate scorecards with proctoring flags.
2. **Job Seekers**: Search and apply to open positions, generate job-tailored cover letters, build resumes using a 7-template live editor with ATS scoring and PDF export, and practice assessments in a mock interview environment.
3. **Developers & Integrators**: Manage API keys, consume REST endpoints for resume parsing and skill matching, inspect usage analytics, subscribe to webhook event dispatches, and embed parsing widgets on external sites.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [AI & Machine Learning System](#-ai--machine-learning-system)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Security & Authentication](#-security--authentication)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Celery Worker Setup](#celery-worker-setup)
- [Configuration](#-configuration)
- [Offline Training Scripts](#-offline-training-scripts)
- [License](#-license)

---

## 🏗️ System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │         React 18 SPA (Vite)             │
                               │  (Recruiter, Seeker, Developer Portals) │
                               └────────────────────┬────────────────────┘
                                                    │ HTTP / JSON
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │         Django 5 REST Backend           │
                               │  - JWT & API-Key Auth (passlib/bcrypt)  │
                               │  - Sliding-window Redis Rate Limiting   │
                               │  - Security Headers & Sanitization      │
                               └───────┬─────────────────────────┬───────┘
                                       │                         │
                     ┌─────────────────┴────────┐                │ Async Tasks
                     ▼                          ▼                ▼
        ┌─────────────────────────┐  ┌────────────────┐  ┌───────────────┐
        │  PostgreSQL Database    │  │ Redis 7.0+     │  │ Celery 5.4    │
        │  - 25 Django ORM Models │  │ - Token Black- │  │ Workers       │
        │  - Sessions & Candidates│  │   list Cache   │  │ - Batch Parse │
        │  - Rounds & Submissions │  │ - Rate Limit   │  │ - Gmail/Drive │
        │  - Billing & Webhooks   │  │   Counters     │  │   Sync Tasks  │
        └─────────────────────────┘  │ - Celery Queue │  │ - Async ML    │
                                     └────────────────┘  └───────┬───────┘
                                                                 │
                                ┌────────────────────────────────┴───────┐
                                ▼                                        ▼
┌──────────────────────────────────────────────────┐  ┌─────────────────────────────────┐
│              LLM & Speech Engines                │  │    Local ML & Document Engine   │
│ - RotateLLMClient: Gemini Flash (Primary)        │  │ - sentence-transformers         │
│ - Failover 1: Groq LLaMA 3.3 (70B / 8B)          │  │   (all-MiniLM-L6-v2, 384-dim)   │
│ - Failover 2: OpenAI Direct (gpt-4o-mini)        │  │ - scikit-learn Regressors &     │
│ - Groq Whisper (whisper-large-v3-turbo)          │  │   Classifiers (Salary, Matching)│
│ - Gemini Vision OCR (Scanned PDF fallback)       │  │ - PyMuPDF (fitz) & ReportLab PDF│
└──────────────────────────────────────────────────┘  └─────────────────────────────────┘
```

---

## 💻 Tech Stack

### Backend
| Technology | Version / Specification | Purpose in Codebase |
|---|---|---|
| **Python** | 3.11+ | Backend runtime environment |
| **Django** | 5.0.6 | Core web framework, ORM models, routing, and HTTP views |
| **PostgreSQL** | 14+ | Primary relational database configured via `dj-database-url` |
| **Redis** | 7.0+ | Celery message broker, token blacklisting, and rate limit counters |
| **Celery** | 5.4.0 | Asynchronous background processing (batch resume ingestion, sync jobs) |
| **Gunicorn** | 22.0.0 | Production WSGI application server |
| **PyMuPDF (`fitz`)** | 1.24.3 | PDF text extraction, column-layout analysis, and candidate photo extraction |
| **python-docx** | 1.1.2 | Text extraction from Microsoft Word (`.docx`) resume files |
| **pdfplumber** | 0.11.0 | Secondary fallback text extraction engine |
| **ReportLab** | 4.2.0 | Dynamic ATS-compatible PDF resume generation |
| **Pillow (`PIL`)** | 10.3.0 | Image processing, profile picture validation, and aspect ratio normalization |
| **scikit-learn** | 1.4.2 | Dynamic & offline salary regressors, matching classifiers, and KMeans clustering |
| **sentence-transformers** | 2.7.0 | `all-MiniLM-L6-v2` dense embeddings for semantic matching |
| **numpy & pandas** | Latest | Vector arithmetic, similarity computations, and candidate CSV/Excel export |
| **python-jose & passlib** | 3.3.0 / 1.7.4 | JWT token creation/decoding and bcrypt password/API-key hashing |
| **OpenAI Python SDK** | 1.30.1 | Client used to query Google Gemini, Groq, and OpenAI via compatible endpoints |
| **google-generativeai** | 0.5.4 | Gemini Vision OCR fallback for scanned resume images |
| **google-api-python-client** | 2.129.0 | Ingestion integrations with Gmail API, Google Drive API, and Google Sheets |
| **Razorpay** | 1.4.1 | Subscription order creation and HMAC payment signature verification |
| **django-anymail / Brevo**| 10.2 / REST | Transactional email delivery and Brevo CRM contact synchronization |
| **httpx** | 0.27.0 | Outbound HTTP requests (GitHub OAuth, webhooks, Brevo, 2Factor.in SMS) |

### Frontend
| Technology | Version / Specification | Purpose in Codebase |
|---|---|---|
| **React** | 18.3.1 | Core UI library |
| **Vite** | 5.0+ | Build tool and development server |
| **Tailwind CSS** | 3.4.3 | Utility-first styling framework |
| **react-router-dom** | 7.17.0 | Client-side routing with lazy-loaded route components |
| **Zustand** | 5.0.12 | Global state management across 6 application stores |
| **@tanstack/react-query**| 5.97.0 | Server state management, cache management, and polling |
| **framer-motion** | 12.38.0 | UI transitions and component animations |
| **recharts** | 3.8.1 | Analytical data visualization (charts on dashboards, usage, and trends) |
| **react-dropzone** | 15.0.0 | Drag-and-drop file upload interface for resume files |
| **react-hot-toast** | 2.6.0 | User feedback toast notifications |
| **react-syntax-highlighter** | 16.1.1 | Code snippet display in API documentation and coding tests |
| **html2pdf.js** | 0.14.0 | Client-side PDF export fallback in resume editor |
| **country-state-city** | 3.2.1 | Cascading location selection inputs |
| **lucide-react** | 1.8.0 | Icon library |

---

## ✨ Key Features

### 1. Recruiter & Company Workspace
- **Hiring Sessions Management**: Create vacancy sessions with required skills, minimum experience, salary parameters, and customizable weighting.
- **AI Job Description Generator**: Generate structured markdown job descriptions from minimal role attributes.
- **Skill Inference**: Extract required and preferred skill tags from existing job descriptions.
- **Multi-Source Resume Ingestion**:
  - Direct upload of individual PDF, DOCX, and TXT files.
  - ZIP archive ingestion with automatic extraction.
  - Automated Gmail syncing searching for attachments in job-related email threads.
  - Google Drive folder synchronization.
  - Google Sheets ingestion linked to Google Forms.
  - Standard ATS CSV/Excel record import.
- **Candidate Processing & Screening**:
  - Automated text parsing with profile photo detection.
  - Skill normalization against a canonical 320-skill taxonomy.
  - Semantic similarity calculation combined with machine learning historical match blending.
  - Recruiter candidate chat assistant with context-aware session memory.
  - Candidate grouping and clustering visualization.
  - Pipeline management: Shortlist, Reject, Bulk Reject, and Hire with offer letter attachment.
  - Data export in CSV, Excel (`.xlsx`), and JSON formats.

### 2. Multi-Stage Candidate Assessment Engine (`/test/*`)
- **Assessment Pipeline Builder**: Configure multi-round testing sequences: Multiple Choice (MCQ), Programming (Coding), AI Voice Interview, and Manual rounds.
- **Candidate Access Control**: Secure, time-limited assessment access links and token validation.
- **Multiple Choice Round (MCQ)**:
  - Timed test execution with randomized question delivery.
  - Parser agent supporting bulk question extraction from uploaded exam documents.
- **Programming Challenge Round**:
  - In-browser code editor supporting Python and JavaScript.
  - Server-side execution runner evaluating code against predefined test cases with execution time and memory tracking.
- **AI Voice Interview Round**:
  - Live webcam feed check and audio input verification.
  - Question delivery via Web Speech synthesis.
  - Hands-free audio recording with Voice Activity Detection (VAD).
  - Speech-to-text transcription powered by Groq Whisper (`whisper-large-v3-turbo`).
  - Real-time response evaluation grading accuracy, confidence, and keyword coverage.
- **Candidate Integrity Monitoring**:
  - Browser tab-switch tracking.
  - Periodic webcam capture during assessments.
  - Flagged integrity events displayed on recruiter evaluation sheets.

### 3. Job Seeker Portal
- **Job Search & Filters**: Search active jobs with multi-currency salary filtering, location filters, and employment type toggles.
- **Company Profiles**: Company directories with opening counts and follow/unfollow capability with email alerts on new postings.
- **Application Tracking**: Application status tracking across all recruitment pipeline stages.
- **AI Cover Letter Generator**: Generate custom cover letters based on profile details and target job descriptions.
- **Resume Builder (`/resume-builder`)**:
  - 7 templates: Modern, Classic, Minimal, Executive, Creative, Compact, and ATS-Optimized.
  - Live dual-pane editor for personal info, summary, experience, education, projects, skills, certifications, and languages.
  - ATS score breakdown and actionable improvement feedback.
  - Version history with snapshot creation and restoration.
  - Export to PDF using ReportLab with client-side fallback.
- **Mock Assessment Arena**: Practice MCQ aptitude tests, coding challenges, and voice interviews with automated scoring.

### 4. Developer API Portal
- **API Key Lifecycle**: Create, rotate, and revoke scoped API keys for test and production environments.
- **Usage Telemetry**: Real-time request logging, endpoint breakdown, latency tracking, and 30-day timeline charts.
- **Webhook Subscriptions**: Register webhook endpoints with HMAC-SHA256 signature verification and test ping triggers.
- **Embeddable Resume Widget**: Generate script tags with domain origin authorization to collect resumes from external websites.
- **Interactive Documentation**: Embedded API console enabling live HTTP execution with user keys.

---

## 🤖 AI & Machine Learning System

The intelligence layer combines large language models with specialized local machine learning models:

### AI Agents Implementation

| Agent | Source File | Engine / Model | Operational Purpose |
|---|---|---|---|
| **RotateLLMClient** | `agents/llm.py` | Gemini Flash / Groq / OpenAI | Central LLM client managing multi-key rotation, 60-second cooldowns, and automatic provider failover |
| **Advanced ATS Parser** | `agents/advanced_ats_parsing_agent.py` | PyMuPDF + Gemini Flash | Extracts text from multi-column PDFs using geometric analysis and converts it to structured JSON |
| **ATS Compatibility Agent**| `agents/ats_compatibility_agent.py` | Gemini Flash + Embeddings | Evaluates resumes using a 6-component scoring formula (Keywords 35%, Skills 25%, Experience 15%, Projects 10%, Education 5%, Formatting 10%) |
| **Skill Normalizer** | `agents/normalization_agent.py` | Taxonomy Dictionary + Embeddings | Standardizes raw skill text against a 320-skill canonical taxonomy across 20 domains |
| **Semantic Matcher** | `agents/matching_agent.py` | `all-MiniLM-L6-v2` + RandomForest | Combines cosine similarity on dense embeddings, TF-IDF n-grams, and a trained `RandomForestClassifier` |
| **Interview Conductor** | `agents/interview_agent.py` | Groq LLaMA 3.3 / Gemini Flash | Generates tailored interview questions, evaluates transcribed responses, and compiles final interview scorecards |
| **Resume Enhancer** | `agents/resume_enhancer_agent.py`| Gemini Flash | Rewrites experience bullet points and summaries for higher impact while enforcing anti-hallucination rules |
| **Resume Quality Scorer**| `agents/resume_quality_agent.py` | scikit-learn `LogisticRegression` | Computes local baseline ATS quality scores by fitting a regression model on requirements versus resume text |
| **Cover Letter Agent** | `agents/cover_letter_agent.py` | Gemini Flash | Generates personalized cover letters by synthesizing applicant details with job specifications |
| **Salary Predictor** | `agents/salary_prediction_agent.py`| scikit-learn `GradientBoosting` | Multi-tier salary prediction: dynamically trained `GradientBoostingRegressor`, offline `RandomForestRegressor`, and rule engine |
| **Job Recommender** | `agents/job_recommendation_agent.py`| scikit-learn `NearestNeighbors` | Matches job seekers to active vacancies using KNN cosine distance on TF-IDF vectors |
| **JD Generator** | `agents/jd_generator_agent.py` | Gemini Flash | Creates structured job specifications from minimal input parameters |
| **Recruiter Chatbot** | `agents/chatbot_agent.py` | Gemini Flash | Session-aware assistant that references applicant records to answer recruiter queries |
| **MCQ Paper Parser** | `agents/mcq_paper_parser_agent.py`| PyMuPDF + Gemini Flash | Extracts multiple-choice questions, options, and answer keys from uploaded exam papers |
| **Resume PDF Renderer** | `agents/resume_pdf_renderer.py`| ReportLab Engine | Converts structured resume data into styled, ATS-compliant PDF documents |

### LLM Failover Architecture

```
Incoming Request
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ RotateLLMClient                                            │
│                                                            │
│ 1. Google Gemini (OpenAI-Compatible Endpoint)              │
│    ├── Key 1 ──► [200 OK] ──► Return Response              │
│    ├── Key 2 ──► [429 / Error] ──► 60s Cooldown            │
│    └── Key N ──► [Exhausted]                               │
│                                                            │
│ 2. Failover to Groq API                                    │
│    ├── llama-3.3-70b-versatile                             │
│    └── llama-3.1-8b-instant (Fast / Low Latency)           │
│                                                            │
│ 3. Final Failover to OpenAI Direct                         │
│    └── gpt-4o-mini                                         │
└────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

The database consists of **25 Django ORM models** managed via standard Django migrations:

```mermaid
erDiagram
    COMPANY ||--o{ API_KEY : "issues"
    COMPANY ||--o{ SESSION : "creates"
    COMPANY ||--o{ NOTIFICATION : "receives"
    COMPANY ||--o{ COMPANY_BILLING_SUBSCRIPTION : "holds"

    SESSION ||--o{ CANDIDATE : "contains"
    SESSION ||--o{ SESSION_ROUND : "defines"
    SESSION ||--o{ CHAT_HISTORY : "maintains"
    SESSION ||--o{ JOB_APPLICATION : "receives"
    SESSION ||--o{ SAVED_JOB : "saved_in"

    CANDIDATE ||--o{ APPLICANT_ROUND_ATTEMPT : "takes"
    SESSION_ROUND ||--o{ APPLICANT_ROUND_ATTEMPT : "evaluates"

    JOB_SEEKER_ACCOUNT ||--o{ JOB_APPLICATION : "submits"
    JOB_SEEKER_ACCOUNT ||--o{ RESUME_DRAFT : "edits"
    JOB_SEEKER_ACCOUNT ||--o{ SAVED_JOB : "bookmarks"
    JOB_SEEKER_ACCOUNT ||--o{ SEEKER_MOCK_ATTEMPT : "practices"
    JOB_SEEKER_ACCOUNT ||--o{ NOTIFICATION : "receives"
    JOB_SEEKER_ACCOUNT ||--o{ SEEKER_BILLING_SUBSCRIPTION : "holds"

    RESUME_DRAFT ||--o{ RESUME_VERSION : "versions"

    DEVELOPER_ACCOUNT ||--o{ DEVELOPER_API_KEY : "owns"
    DEVELOPER_ACCOUNT ||--o{ WEBHOOK : "configures"
    DEVELOPER_ACCOUNT ||--o{ API_USAGE_LOG : "generates"
    DEVELOPER_ACCOUNT ||--o{ MONTHLY_USAGE_SUMMARY : "aggregates"
    DEVELOPER_ACCOUNT ||--o{ EMBED_TOKEN : "provisions"
    DEVELOPER_ACCOUNT ||--o{ BILLING_SUBSCRIPTION : "subscribes"

    WEBHOOK ||--o{ WEBHOOK_DELIVERY_LOG : "records"
```

### Models Summary

| Category | Model Name | Description |
|---|---|---|
| **Recruiter** | `Company` | Registered employer accounts, tiers, branding, and verification status |
| | `APIKey` | Recruiter-specific secret and public key credentials |
| | `Session` | Vacancy hiring sessions, criteria settings, and third-party sync tokens |
| | `Candidate` | Candidate records, parsed resume JSON, normalized skills, and scores |
| | `ChatHistory` | Contextual conversation records for the session recruiter assistant |
| | `IngestJob` | Asynchronous file and background ingestion progress tracker |
| | `CompanyBillingSubscription`| Recruiter tier subscription status and Razorpay payment details |
| **Assessments** | `SessionRound` | Assessment stages (`mcq`, `coding`, `interview`, `manual`) and time limits |
| | `MCQQuestion` | Question banks with options, correct answers, and difficulty levels |
| | `CodingProblem` | Programming problems with starter code and test cases |
| | `ApplicantRoundAttempt` | Candidate assessment submissions, test scores, transcripts, and flags |
| **Job Seeker** | `JobSeekerAccount` | Candidate profile data, verified contacts, and global resume data |
| | `JobApplication` | Application records tracking pipeline stages and offer letters |
| | `ResumeDraft` | Editable resume builder documents linked to templates |
| | `ResumeVersion` | Timestamped snapshot backups of resume drafts |
| | `SavedJob` | Bookmarked hiring sessions |
| | `SeekerMockAttempt` | Independent practice round attempts and feedback |
| | `SeekerBillingSubscription` | Seeker premium tier records |
| **Developer** | `DeveloperAccount` | Developer portal accounts and subscription tiers |
| | `DeveloperAPIKey` | Developer API key credentials with environment tags |
| | `APIUsageLog` | Detailed per-call request log records (latency, status, endpoint) |
| | `MonthlyUsageSummary` | Aggregated monthly quota counter per action type |
| | `Webhook` | Webhook target URLs, HMAC secret keys, and event triggers |
| | `WebhookDeliveryLog` | HTTP delivery execution logs and response statuses |
| | `EmbedToken` | Domain-whitelisted tokens for embeddable parsing widgets |
| | `BillingSubscription` | Developer billing subscription records |
| **Shared** | `Notification` | System and user notification records |
| | `SkillTaxonomy` | Canonical skill reference table |
| | `Review` | Multi-role user platform reviews and ratings |

---

## 📡 API Endpoints

All backend routes are defined in [`backend/api/urls.py`](backend/api/urls.py):

### Authentication & Profiles
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new employer/recruiter account |
| `POST` | `/api/v1/auth/login` | Recruiter login (returns JWT) |
| `POST` | `/api/v1/auth/login-google` | Recruiter Google OAuth sign-in |
| `POST` | `/api/v1/auth/login-github` | Recruiter GitHub OAuth sign-in |
| `GET` | `/api/v1/auth/me` | Fetch authenticated recruiter profile |
| `POST` | `/api/v1/auth/logout` | Invalidate token via Redis blacklist |
| `POST` | `/api/v1/auth/forgot-password` | Initiate recruiter password reset |
| `POST` | `/api/v1/auth/verification/send-email-otp` | Send email verification code |
| `POST` | `/api/v1/auth/verification/verify-email-otp`| Verify email code |
| `POST` | `/api/v1/auth/verification/send-phone-otp` | Send 2Factor SMS code |
| `POST` | `/api/v1/auth/verification/verify-phone-otp`| Verify phone code |

### Sessions & Candidate Screening
| Method | Endpoint | Description |
|---|---|---|
| `GET`, `POST` | `/api/v1/sessions` | List sessions or create a new hiring session |
| `GET`, `PATCH`, `DELETE`| `/api/v1/sessions/<id>` | Retrieve, modify, or archive a session |
| `POST` | `/api/v1/sessions/generate-jd` | AI generation of job descriptions |
| `POST` | `/api/v1/sessions/<id>/infer-skills` | Extract required skills from session JD |
| `POST` | `/api/v1/sessions/<id>/match-all` | Trigger re-matching for all session candidates |
| `GET` | `/api/v1/sessions/<id>/candidates` | List candidates in a session with filters |
| `GET`, `DELETE`| `/api/v1/sessions/<id>/candidates/<cid>` | Fetch candidate detail or soft-delete record |
| `POST` | `/api/v1/sessions/<id>/candidates/<cid>/action`| Update status (shortlist, reject, hire) |
| `DELETE` | `/api/v1/sessions/<id>/candidates/bulk-reject`| Bulk reject candidate subset |
| `GET` | `/api/v1/sessions/<id>/candidate-clusters` | Compute KMeans candidate clusters |
| `POST` | `/api/v1/sessions/<id>/chat` | Query candidate pool via session chatbot |
| `GET` | `/api/v1/sessions/<id>/export/candidates` | Export candidates in CSV, XLSX, or JSON |

### Resume Ingestion
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/ingest/upload` | Upload resume files (PDF, DOCX, TXT) |
| `POST` | `/api/v1/ingest/zip` | Upload ZIP archive of resumes |
| `POST` | `/api/v1/ingest/gmail/sync` | Trigger asynchronous Gmail attachment sync |
| `POST` | `/api/v1/ingest/gdrive/sync` | Trigger Google Drive folder sync |
| `POST` | `/api/v1/ingest/google-form` | Ingest candidate rows from Google Sheets |
| `POST` | `/api/v1/ingest/ats-import` | Import candidates from external CSV/Excel |
| `GET` | `/api/v1/ingest/status/<job_id>` | Poll ingestion job progress |

### Assessment Pipeline (`/test/*`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/sessions/<id>/rounds` | Configure session assessment rounds |
| `POST` | `/api/v1/sessions/<id>/generate-test-links` | Generate candidate access tokens |
| `GET` | `/api/v1/sessions/<id>/applicant-results` | View candidate assessment results and logs |
| `POST` | `/api/v1/sessions/upload-question-paper` | Parse exam document into MCQ questions |
| `GET` | `/api/v1/test/validate-token` | Validate candidate assessment token |
| `GET` | `/api/v1/test/mcq-questions` | Fetch questions for MCQ test |
| `POST` | `/api/v1/test/submit-mcq` | Submit answers and score MCQ test |
| `GET` | `/api/v1/test/coding-problems` | Fetch problems for coding test |
| `POST` | `/api/v1/test/run-code` | Execute code against test cases |
| `POST` | `/api/v1/test/submit-coding` | Submit final code solution |
| `GET` | `/api/v1/test/interview-questions` | Generate tailored interview questions |
| `POST` | `/api/v1/test/transcribe-audio` | Transcribe speech via Groq Whisper |
| `POST` | `/api/v1/test/submit-interview-answer`| Evaluate single interview answer |
| `POST` | `/api/v1/test/finalize-interview` | Generate complete interview summary |
| `POST` | `/api/v1/test/proctoring-flag` | Record tab-switch or camera violation |

### Job Seeker Services
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/seeker/auth/register` | Register a new job seeker |
| `POST` | `/api/v1/seeker/auth/login` | Job seeker login |
| `GET` | `/api/v1/seeker/jobs` | Browse active job openings |
| `POST` | `/api/v1/seeker/jobs/<id>/apply` | Apply for a position |
| `POST` | `/api/v1/seeker/jobs/generate-cover-letter` | Generate AI cover letter |
| `GET`, `POST` | `/api/v1/seeker/resume/drafts` | List or create resume builder drafts |
| `POST` | `/api/v1/seeker/resume/drafts/<id>/export-pdf`| Export resume draft as styled PDF |
| `POST` | `/api/v1/seeker/resume/drafts/optimize` | AI optimize resume draft against JD |
| `POST` | `/api/agents/ats-check` | Run 6-component ATS score evaluation |
| `POST` | `/api/v1/seeker/predict-salary` | Predict salary using scikit-learn regressor |
| `GET` | `/api/v1/seeker/recommendations` | Get job recommendations via KNN |

### Developer Portal (`/api/developer/*`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/developer/auth/register` | Register developer account |
| `GET`, `POST` | `/api/developer/keys` | List or generate developer API keys |
| `POST` | `/api/developer/keys/<id>/rotate` | Rotate an existing API key secret |
| `GET` | `/api/developer/usage/summary` | Fetch quota usage summary |
| `GET` | `/api/developer/usage/timeline` | Fetch daily request timeline data |
| `GET`, `POST` | `/api/developer/webhooks` | List or register webhook endpoints |
| `POST` | `/api/developer/webhooks/<id>/test`| Dispatch a test ping with HMAC signature |
| `POST` | `/api/developer/embed/parse` | Parse resume via embed token |

---

## 🔒 Security & Authentication

- **Password & API Key Hashing**: Cryptographic hashing using `bcrypt` via `passlib`.
- **JWT Authorization**: Stateless `HS256` tokens with configurable expiration.
- **Token Blacklisting**: Logout operations add tokens to a Redis blacklist checked on authenticated requests.
- **Sliding-Window IP Rate Limiting**: Redis-backed sliding-window counters protect authentication and public endpoints from abuse.
- **Tier-Based Quotas**: Recruiter and Developer accounts are rate-limited based on their active plan (`free`, `starter`, `business`, `enterprise`).
- **HTTP Security Headers**: Enforced via middleware:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - Strict `Content-Security-Policy` directives
- **Exception Sanitization**: Production server errors return a unique `correlation_id` rather than raw tracebacks.
- **HMAC Signatures**: Developer webhook dispatches include an `X-Workly-Signature` header calculated using `HMAC-SHA256`.

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher (LTS recommended)
- **PostgreSQL**: 14 or higher
- **Redis**: 7.0 or higher
- **Git**

---

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mayur-Purohit/Workly.git
   cd Workly/backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the environment file:**
   ```bash
   # Windows
   copy .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```
   *Edit `.env` and fill in your database, Redis, and API keys.*

5. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the development server:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Windows
   copy .env.local.example .env.local

   # Linux / macOS
   cp .env.local.example .env.local
   ```
   *Ensure `VITE_API_URL` points to `http://localhost:8000/api/v1`.*

4. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

---

### Celery Worker Setup

For asynchronous batch resume processing and background synchronization:

```bash
cd backend

# Windows (thread pool recommended for Windows environments)
celery -A workers.celery_worker worker --loglevel=info --pool=threads --concurrency=4

# Linux / macOS
celery -A workers.celery_worker worker --loglevel=info --concurrency=4
```

> **Note:** If Redis or Celery is unavailable during local testing, the backend's `safe_dispatch_task` utility falls back to synchronous in-process execution.

---

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)

```env
# ─── Database & Cache ──────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/workly
REDIS_URL=redis://localhost:6379/1

# ─── Security ──────────────────────────────────────────────────
SECRET_KEY=your-django-secret-key
JWT_SECRET=your-jwt-signing-secret
DEBUG=True

# ─── Primary LLM (Google Gemini) ──────────────────────────────
# Single key or comma-separated list for automatic rotation
GEMINI_API_KEY=your-primary-gemini-key
GEMINI_API_KEYS=key1,key2,key3
GEMINI_MODEL=gemini-1.5-flash

# ─── Fallback LLM & Audio (Groq) ──────────────────────────────
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_INTERVIEW_MODEL=llama-3.3-70b-versatile

# ─── Fallback LLM (OpenAI) ────────────────────────────────────
OPENAI_API_KEY=your-openai-key

# ─── Embeddings ────────────────────────────────────────────────
# Set to 'true' to use local sentence-transformers (downloads ~90MB weights)
ENABLE_LOCAL_EMBEDDINGS=true
# Optional remote Hugging Face Space endpoint
HF_EMBEDDING_URL=

# ─── OAuth Integrations ────────────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# ─── Email & Communications ────────────────────────────────────
BREVO_API_KEY=your-brevo-api-key
MAIL_FROM=noreply@yourdomain.com

# ─── SMS Verification (2Factor.in) ─────────────────────────────
TWOFACTOR_API_KEY=your-2factor-api-key

# ─── Payments (Razorpay) ───────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your-key-secret
```

### Frontend Environment Variables (`frontend/.env.local`)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

---

## 🔬 Offline Training Scripts

The `backend/scripts/` directory contains offline model training utilities:

| Script | Model / Algorithm | Training Dataset | Generated Output |
|---|---|---|---|
| `train_salary_model.py` | `RandomForestRegressor` (scikit-learn) | Stack Overflow Developer Survey | `backend/models/salary_model.pkl` (Used as offline fallback by `SalaryPredictionAgent`) |
| `train_matching_model.py`| `RandomForestClassifier` (scikit-learn) | Resume-JD relevance dataset | `backend/models/matching_model.pkl` (Used as fallback classifier by `SemanticMatchingAgent`) |
| `train_ner.py` | spaCy Named Entity Recognition | `datasets/Entity Recognition in Resumes.json` | `models/ner_resume_parser` (Offline exploration script) |
| `train_fraud_model.py` | Random Forest Classifier | Keystroke dynamics dataset | `models/fraud_model.pkl` (Experimental research script) |
| `upload_to_hf.py` | Hugging Face Hub CLI integration | Pre-trained weights | Uploads trained model artifacts to Hugging Face Model Hub |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed as a **Semester 4 Project** demonstrating full-stack engineering, asynchronous task queues, applied machine learning, and multi-agent LLM orchestration.
