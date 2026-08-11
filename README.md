<p align="center">
  <img src="https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django"/>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Celery-5.4-37814A?style=for-the-badge&logo=celery&logoColor=white" alt="Celery"/>
  <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Gemini_AI-2.5-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">🚀 Workly</h1>
<h3 align="center">AI-Powered Recruitment Intelligence Platform</h3>

<p align="center">
  <i>A multi-portal hiring ecosystem that unifies recruiters, job seekers, and developers — powered by multi-agent AI, real-time resume intelligence, and automated assessment pipelines.</i>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#database-schema">Database Schema</a> •
  <a href="#ai-agents">AI Agents</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-endpoints">API Endpoints</a> •
  <a href="#deployment">Deployment</a>
</p>

---

<a id="features"></a>
## ✨ Features

### 🏢 Recruiter Portal
| Feature | Description |
|---------|-------------|
| 🔐 **Multi-Provider Auth** | Email/password, Google OAuth 2.0, and GitHub OAuth registration & login |
| 📋 **Hiring Sessions** | Create and manage full recruitment pipelines with job descriptions, criteria, and multi-round assessments |
| 📄 **AI Resume Parsing** | Upload resumes (PDF/DOCX) — AI extracts structured data including skills, experience, education, and contact info |
| 🤖 **Intelligent Matching** | Multi-agent AI scores candidates against job criteria using semantic similarity and skill normalization |
| 🧠 **AI Chatbot Assistant** | Session-aware conversational AI that helps recruiters query, compare, and shortlist candidates |
| 📊 **Smart Analyzer** | Upload any resume and instantly get AI-parsed data, skill analysis, and compatibility scores |
| 📬 **Multi-Source Ingestion** | Upload resumes via file upload, ZIP archives, Gmail sync, Google Drive sync, Google Forms, and ATS import |
| 📑 **Assessment Rounds** | Configure multi-round hiring: aptitude MCQ, coding challenges, AI-powered interviews, and manual HR rounds |
| 📈 **Applicant Results** | View per-round scores, proctoring flags, interview transcripts, and overall candidate rankings |
| 📤 **Export & Reports** | Export candidate data as CSV/Excel and generate comprehensive hiring reports |
| 🔑 **API Key Management** | Generate and manage API keys for programmatic access to Workly's intelligence engine |
| 💳 **Subscription Billing** | Tiered plans (Free → Starter → Business → Enterprise) with Razorpay payment integration |
| ⚙️ **Account Settings** | Profile management, password changes, email/phone verification with OTP, and account deletion |

### 👨‍💻 Job Seeker Portal
| Feature | Description |
|---------|-------------|
| 🔍 **Job Discovery** | Browse, search, and filter job listings across companies with real-time search |
| 📝 **One-Click Apply** | Apply to jobs with resume upload and cover letter, track application statuses |
| 📄 **AI Resume Builder** | Create, edit, and manage multiple resume drafts with 7 professional templates |
| 🎯 **ATS Score Checker** | AI-powered Applicant Tracking System compatibility analysis with actionable improvement suggestions |
| ✨ **Resume Enhancer** | AI rewrites resume sections for maximum impact and keyword optimization |
| 💼 **Company Explorer** | Discover companies, view profiles, follow organizations, and track job market trends |
| 🎤 **Mock Interviews** | Practice aptitude tests, coding challenges, and AI-simulated interview rounds |
| 💰 **Salary Predictor** | ML-powered salary estimation based on skills, experience, and location |
| 📊 **Market Trends** | Visual analytics on hiring trends, top skills in demand, and industry insights |
| 🔔 **Notifications** | Real-time alerts for application updates, new matches, and status changes |
| ❤️ **Saved Jobs** | Bookmark jobs for quick access and comparison |

### 🛠️ Developer Portal
| Feature | Description |
|---------|-------------|
| 🔗 **REST API Access** | Full programmatic access to resume parsing, matching, and chat endpoints |
| 🔑 **API Key Management** | Generate, rotate, and revoke API keys with per-key usage tracking |
| 📊 **Usage Analytics** | Real-time dashboards showing API calls, latency, and monthly consumption |
| 📜 **Interactive Docs** | Comprehensive API documentation with code examples |
| 🪝 **Webhooks** | Configure webhook endpoints for event-driven integrations (candidate parsed, match completed) |
| 🧩 **Embed Widget** | Embeddable candidate screening widget for third-party HRMS platforms |
| 💳 **Billing & Plans** | Tiered developer plans with usage-based rate limiting |

### 🔧 Technical Highlights
- 🤖 **Multi-Agent AI Architecture** — 15+ specialized AI agents for parsing, matching, scoring, interviews, and recommendations
- 🔄 **LLM Failover System** — Automatic key rotation with cascading fallback: Gemini → Groq → OpenAI
- 📊 **Vector Embeddings** — Sentence-transformer embeddings with ChromaDB for semantic resume-job matching
- 🛡️ **Security Middleware** — Custom Django middleware for security headers, exception sanitization, and API usage logging
- ⚡ **Background Processing** — Celery workers with Redis broker for async resume parsing and bulk operations
- 🔐 **JWT + API Key Auth** — Dual authentication system with Redis-backed token blacklisting and rate limiting
- 🧪 **Automated Testing** — CI/CD pipeline with GitHub Actions for backend tests
- 🚀 **Production Deployment** — Render (backend) + Vercel (frontend) with SSL, CORS, and environment-specific configs

---

<a id="tech-stack"></a>
## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center"><b>Layer</b></td>
    <td align="center"><b>Technology</b></td>
    <td align="center"><b>Purpose</b></td>
  </tr>
  <tr>
    <td>🐍 Backend</td>
    <td>Python 3.11+, Django 5.0, Gunicorn</td>
    <td>REST API server, ORM, business logic</td>
  </tr>
  <tr>
    <td>⚛️ Frontend</td>
    <td>React 18, Vite 8, Tailwind CSS 3</td>
    <td>SPA with lazy-loaded routes and responsive UI</td>
  </tr>
  <tr>
    <td>🗄️ Database</td>
    <td>PostgreSQL 15+ (Neon serverless)</td>
    <td>Relational data storage with migrations</td>
  </tr>
  <tr>
    <td>⚡ Cache & Queue</td>
    <td>Redis 7, Celery 5.4</td>
    <td>Rate limiting, token blacklisting, async task queue</td>
  </tr>
  <tr>
    <td>🤖 AI / LLM</td>
    <td>Google Gemini 2.5, Groq (LLaMA 3.3), OpenAI</td>
    <td>Multi-agent resume parsing, matching, chatbot, interviews</td>
  </tr>
  <tr>
    <td>🧬 ML & NLP</td>
    <td>scikit-learn, spaCy, sentence-transformers</td>
    <td>NER, salary prediction, skill clustering, job recommendations</td>
  </tr>
  <tr>
    <td>🔍 Vector Search</td>
    <td>ChromaDB, Google Embeddings</td>
    <td>Semantic similarity for resume-job matching</td>
  </tr>
  <tr>
    <td>🔑 Auth</td>
    <td>PyJWT, bcrypt, Google OAuth, GitHub OAuth</td>
    <td>JWT sessions, social login, OTP verification</td>
  </tr>
  <tr>
    <td>💳 Payments</td>
    <td>Razorpay API</td>
    <td>Subscription billing for recruiter, seeker, and developer portals</td>
  </tr>
  <tr>
    <td>📧 Email</td>
    <td>Brevo (Sendinblue) API, Django SMTP</td>
    <td>Transactional emails, OTP delivery, marketing automation</td>
  </tr>
  <tr>
    <td>📄 Document Processing</td>
    <td>pdfplumber, PyMuPDF, python-docx, ReportLab</td>
    <td>Resume PDF/DOCX parsing and PDF generation</td>
  </tr>
  <tr>
    <td>🎨 UI Components</td>
    <td>Radix UI, Framer Motion, GSAP, Recharts, Lucide</td>
    <td>Accessible primitives, animations, data visualization</td>
  </tr>
  <tr>
    <td>📦 State Management</td>
    <td>Zustand, TanStack React Query</td>
    <td>Client-side state and server-state caching</td>
  </tr>
</table>

---

<a id="architecture"></a>
## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Recruiter   │  │  Job Seeker  │  │  Developer   │  Embed SDK   │
│  │  Dashboard   │  │   Portal     │  │   Portal     │  (3rd-party) │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │ React/Vite SPA  │                  │                      │
└─────────┼─────────────────┼──────────────────┼──────────────────────┘
          │ HTTPS           │                  │
┌─────────┼─────────────────┼──────────────────┼──────────────────────┐
│         ▼                 ▼                  ▼    API GATEWAY       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Django REST API (Gunicorn/WSGI)                │    │
│  │  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌────────────┐ │    │
│  │  │ Auth     │ │ Sessions  │ │ Candidates │ │ Developer  │ │    │
│  │  │ Module   │ │ Module    │ │ Module     │ │ Module     │ │    │
│  │  └──────────┘ └───────────┘ └────────────┘ └────────────┘ │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │          Middleware Layer                             │  │    │
│  │  │  CORS · Security Headers · Rate Limiting · Logging   │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────┬─────────────────┬──────────────────┬──────────────────────┘
          │                 │                  │
┌─────────┼─────────────────┼──────────────────┼──────────────────────┐
│         ▼                 ▼                  ▼   INTELLIGENCE LAYER │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Multi-Agent AI System (15+ Agents)             │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐ │    │
│  │  │ Resume    │ │ ATS       │ │ Interview │ │ Salary     │ │    │
│  │  │ Parsing   │ │ Scoring   │ │ Agent     │ │ Prediction │ │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └────────────┘ │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐ │    │
│  │  │ Skill     │ │ Matching  │ │ Cover     │ │ Resume     │ │    │
│  │  │ Normalize │ │ Agent     │ │ Letter    │ │ Enhancer   │ │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └────────────┘ │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                          │                                          │
│  ┌──────────┐  ┌─────────┴──┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Gemini   │  │   Groq     │  │ OpenAI   │  │ Sentence-        │ │
│  │ API      │←→│ (Fallback) │←→│(Fallback)│  │ Transformers     │ │
│  └──────────┘  └────────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
          │                 │                  │
┌─────────┼─────────────────┼──────────────────┼──────────────────────┐
│         ▼                 ▼                  ▼     DATA LAYER       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │PostgreSQL│  │    Redis     │  │ ChromaDB │  │ File Storage  │  │
│  │ (Neon)   │  │ Cache/Queue  │  │ Vectors  │  │ uploads/photos│  │
│  └──────────┘  └──────┬───────┘  └──────────┘  └───────────────┘  │
│                       │                                             │
│                ┌──────┴───────┐                                     │
│                │ Celery       │                                     │
│                │ Workers      │                                     │
│                └──────────────┘                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
Workly/
│
├── 📁 backend/                          # Django REST API
│   ├── 📄 manage.py                     # Django management CLI
│   ├── 📄 requirements.txt             # Python dependencies
│   ├── 📄 build.sh                      # Production build script
│   ├── 📄 start_celery.py              # Celery worker launcher
│   ├── 📄 .env.example                  # Environment template
│   │
│   ├── 📁 vishleshan_backend/           # Django project config
│   │   ├── settings.py                  # App settings (DB, CORS, email, Celery)
│   │   ├── urls.py                      # Root URL configuration
│   │   ├── celery.py                    # Celery app definition
│   │   ├── wsgi.py / asgi.py           # WSGI/ASGI entry points
│   │   └── __init__.py
│   │
│   ├── 📁 api/                          # Main Django app
│   │   ├── models.py                    # 25+ ORM models
│   │   ├── urls.py                      # 120+ API route definitions
│   │   ├── decorators.py               # Auth, rate-limit, tier-check decorators
│   │   ├── middleware.py               # Security, logging, exception middleware
│   │   ├── constants.py                # App-wide constants
│   │   │
│   │   ├── 📁 views/                    # API view handlers
│   │   │   ├── recruiter_auth.py        # Recruiter registration, login, profile
│   │   │   ├── seeker_auth.py           # Job seeker authentication
│   │   │   ├── google_auth.py           # Google OAuth for all portals
│   │   │   ├── github_auth.py           # GitHub OAuth for all portals
│   │   │   ├── sessions.py              # Hiring session CRUD
│   │   │   ├── candidates.py            # Candidate management & scoring
│   │   │   ├── round_views.py           # Assessment round management
│   │   │   ├── seeker_jobs.py           # Job search, apply, applications
│   │   │   ├── seeker_resume.py         # Resume upload & enhance
│   │   │   ├── seeker_resume_builder.py # Resume builder with templates
│   │   │   ├── companies.py             # Company profiles & market trends
│   │   │   ├── reviews.py               # Review & rating system
│   │   │   ├── chat.py                  # AI chatbot interface
│   │   │   ├── ingest.py                # Multi-source resume ingestion
│   │   │   ├── export.py                # CSV/Excel export
│   │   │   ├── verification.py          # Email/phone OTP verification
│   │   │   ├── password_reset.py        # Forgot/reset password flows
│   │   │   ├── ml_views.py              # ML model endpoints
│   │   │   └── 📁 developer/            # Developer portal views
│   │   │       ├── auth.py, keys.py, usage.py
│   │   │       ├── billing.py, webhooks.py, embed.py
│   │   │
│   │   └── 📁 services/                 # Business logic services
│   │       ├── email_service.py         # Email templates & sending
│   │       ├── brevo_service.py         # Brevo marketing integration
│   │       ├── notification_service.py  # In-app notifications
│   │       └── twofactor_service.py     # OTP generation & verification
│   │
│   ├── 📁 agents/                       # AI Agent System
│   │   ├── llm.py                       # LLM client with key rotation & failover
│   │   ├── parsing_agent.py             # Resume text extraction
│   │   ├── advanced_ats_parsing_agent.py# Deep ATS-compatible parsing
│   │   ├── ats_compatibility_agent.py   # ATS score calculation
│   │   ├── normalization_agent.py       # Skill taxonomy normalization
│   │   ├── matching_agent.py            # Resume ↔ JD matching engine
│   │   ├── interview_agent.py           # AI interview conductor
│   │   ├── resume_enhancer_agent.py     # AI resume improvement
│   │   ├── resume_quality_agent.py      # Resume quality scoring
│   │   ├── cover_letter_agent.py        # AI cover letter generation
│   │   ├── salary_prediction_agent.py   # ML salary estimation
│   │   ├── job_recommendation_agent.py  # Job matching recommendations
│   │   ├── jd_generator_agent.py        # AI job description generator
│   │   ├── chatbot_agent.py             # Conversational AI assistant
│   │   ├── inference_agent.py           # General LLM inference
│   │   ├── embeddings.py               # Vector embedding generation
│   │   ├── resume_pdf_renderer.py       # PDF resume generation
│   │   └── mcq_paper_parser_agent.py    # Question paper extraction
│   │
│   ├── 📁 workers/                      # Async task workers
│   │   └── celery_worker.py             # Celery tasks (bulk parse, match, ingest)
│   │
│   ├── 📁 models/                       # ML model schemas
│   │   └── schemas.py                   # Pydantic-style serialization schemas
│   │
│   ├── 📁 scripts/                      # Training & utility scripts
│   │   ├── train_salary_model.py        # Salary prediction model training
│   │   ├── train_matching_model.py      # Matching model training
│   │   ├── train_ner.py                 # Named Entity Recognition training
│   │   └── train_fraud_model.py         # Fraud detection model training
│   │
│   └── 📁 datasets/                     # Training datasets & notebooks
│       ├── Entity Recognition in Resumes.json
│       ├── salary-dataset.ipynb
│       ├── keystroke-dynamics.ipynb
│       └── task-resume-matching-with-job-descriptions.ipynb
│
├── 📁 frontend/                         # React SPA
│   ├── 📄 index.html                    # Entry HTML
│   ├── 📄 package.json                  # Node dependencies
│   ├── 📄 vite.config.js               # Vite build config
│   ├── 📄 tailwind.config.js           # Tailwind CSS config
│   ├── 📄 vercel.json                   # Vercel deployment config
│   ├── 📄 .env.local.example           # Frontend env template
│   │
│   └── 📁 src/
│       ├── App.jsx                      # Root component with routing
│       ├── main.jsx                     # React entry point
│       │
│       ├── 📁 pages/                    # Page components
│       │   ├── LandingPage.jsx          # Public marketing landing page
│       │   ├── DashboardLayout.jsx      # Recruiter dashboard shell
│       │   ├── DashboardHome.jsx        # Recruiter home dashboard
│       │   ├── SessionWorkspacePage.jsx # Session candidate workspace
│       │   ├── SmartAnalyzerPage.jsx    # AI resume analyzer
│       │   ├── SettingsPage.jsx         # Account settings
│       │   ├── 📁 user/                 # Job seeker pages
│       │   ├── 📁 developer/           # Developer portal pages
│       │   ├── 📁 seeker/              # Seeker-specific pages
│       │   ├── 📁 test/                # Assessment round pages
│       │   └── 📁 public/              # About, contact, legal pages
│       │
│       ├── 📁 components/              # Reusable UI components
│       │   ├── AuthPage.jsx             # Unified auth form
│       │   ├── CandidateCard.jsx        # Candidate display card
│       │   ├── ChatPanel.jsx            # AI chat interface
│       │   ├── Navbar.jsx               # Navigation bar
│       │   ├── HeroHeader.jsx           # Landing hero section
│       │   ├── OnboardingTour.jsx       # Interactive onboarding
│       │   ├── VerificationModal.jsx    # OTP verification modal
│       │   └── ...40+ components
│       │
│       ├── 📁 stores/                  # Zustand state stores
│       │   ├── authStore.js             # Recruiter auth state
│       │   ├── seekerAuthStore.js       # Job seeker auth state
│       │   ├── portalAuthStore.js       # Developer portal auth state
│       │   ├── candidateStore.js        # Candidate selection state
│       │   ├── chatStore.js             # Chat state
│       │   └── ingestStore.js           # Ingestion status state
│       │
│       └── 📁 assets/                  # Static images & media
│
├── 📄 render.yaml                       # Render deployment config
├── 📄 run.bat                           # Windows one-click start script
├── 📄 .gitignore                        # Git ignore rules
├── 📄 LICENSE                           # MIT License
├── 📄 CONTRIBUTING.md                   # Contribution guidelines
└── 📄 SECURITY.md                       # Security policy
```

---

<a id="database-schema"></a>
## 🗄️ Database Schema

The application uses **PostgreSQL** with **25+ interrelated tables** managed through Django ORM migrations.

### Entity-Relationship Diagram

```mermaid
%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'primaryColor': '#1a1a2e',
    'primaryTextColor': '#e0e0e0',
    'primaryBorderColor': '#3b82f6',
    'lineColor': '#3b82f6',
    'secondaryColor': '#16213e',
    'tertiaryColor': '#0f3460',
    'fontSize': '13px'
  }
}}%%

erDiagram
    %% ═══════════════════════════════════════════
    %% RECRUITER / COMPANY ENTITIES
    %% ═══════════════════════════════════════════

    COMPANY {
        uuid id PK
        string name "Indexed"
        string email UK
        string password_hash
        string tier "free | starter | business | enterprise"
        boolean is_active "Indexed"
        boolean email_verified
        boolean phone_verified
        string industry
        string hq_location
        text about
        float rating "Default 4.5"
        string company_size
        int founded_year
        string website_url
        string logo_path
        datetime created_at
    }

    API_KEY {
        uuid id PK
        uuid company_id FK
        string key_name
        string secret_key UK
        string public_key UK
        string environment "production | test"
        boolean is_active
        datetime last_used_at
        datetime created_at
    }

    SESSION {
        uuid id PK
        uuid company_id FK
        string name
        string job_title
        text job_description
        json rounds
        int current_round_index
        string status "Indexed: active | archived"
        json criteria
        json inferred_skills
        json gmail_tokens
        json gdrive_tokens
        string gdrive_folder_id
        datetime created_at
        datetime updated_at
    }

    CANDIDATE {
        uuid id PK
        uuid session_id FK
        string name
        string email "Indexed"
        string phone
        string location
        string resume_file_path
        json raw_resume_data
        json normalized_skills
        float match_score "Indexed"
        json match_details
        string recommendation
        float total_experience_years
        int current_round_index "Indexed"
        string status "Indexed: new | shortlisted | rejected | hired"
        string source "upload | gmail | gdrive | form | ats"
        datetime created_at
        datetime deleted_at "Soft delete, Indexed"
    }

    %% ═══════════════════════════════════════════
    %% ASSESSMENT SYSTEM
    %% ═══════════════════════════════════════════

    SESSION_ROUND {
        uuid id PK
        uuid session_id FK
        string round_type "mcq | coding | interview | manual"
        int round_number
        string name
        int time_limit_minutes
        int passing_score
        json interview_questions
        json coding_problems
        boolean is_active
        datetime created_at
    }

    APPLICANT_ROUND_ATTEMPT {
        uuid id PK
        uuid candidate_id FK
        uuid round_id FK
        string access_token UK
        datetime token_expires_at
        string status "pending | in_progress | submitted"
        json mcq_answers
        float mcq_score
        json coding_submissions
        float coding_score
        json interview_transcript
        float interview_score
        json proctoring_flags
        float overall_score
    }

    MCQ_QUESTION {
        uuid id PK
        string category
        text question_text
        json options
        string correct_option
        string difficulty
    }

    CODING_PROBLEM {
        uuid id PK
        string slug UK
        string title
        string difficulty
        text description
        json test_cases
        json starter_code
    }

    %% ═══════════════════════════════════════════
    %% JOB SEEKER ENTITIES
    %% ═══════════════════════════════════════════

    JOB_SEEKER_ACCOUNT {
        uuid id PK
        string full_name
        string email UK
        string password_hash
        string headline
        string location
        string avatar_path
        string resume_file_path
        json resume_data
        json enhanced_resume
        json skills
        json open_to
        string tier "free | premium"
        boolean email_verified
        boolean phone_verified
        float last_ats_score
        datetime created_at
    }

    JOB_APPLICATION {
        uuid id PK
        uuid seeker_id FK
        uuid session_id FK
        uuid candidate_id FK
        text cover_note
        string status "applied | shortlisted | rejected | hired"
        string offer_letter_path
        datetime applied_at
    }

    RESUME_DRAFT {
        uuid id PK
        uuid seeker_id FK
        string title
        string template_id "modern | classic | minimal | executive | creative | compact | ats"
        json content
        float ats_score
        json ats_report
        string exported_pdf_path
        boolean is_active
        datetime created_at
    }

    SAVED_JOB {
        uuid id PK
        uuid seeker_id FK
        uuid session_id FK
        datetime saved_at
    }

    SEEKER_MOCK_ATTEMPT {
        uuid id PK
        uuid seeker_id FK
        string attempt_type "aptitude | coding | interview"
        string status "pending | in_progress | submitted"
        float score
        json questions
        json answers
        json feedback
    }

    %% ═══════════════════════════════════════════
    %% DEVELOPER PORTAL ENTITIES
    %% ═══════════════════════════════════════════

    DEVELOPER_ACCOUNT {
        uuid id PK
        string company_name
        string email UK
        string password_hash
        string tier "free | starter | business | enterprise"
        boolean is_verified
        json allowed_domains
        datetime created_at
    }

    DEVELOPER_API_KEY {
        uuid id PK
        uuid developer_id FK
        string key_name
        string secret_key UK
        string public_key UK
        string environment "test | production"
        boolean is_active
        datetime last_used_at
    }

    WEBHOOK {
        uuid id PK
        uuid developer_id FK
        string url
        json events
        string secret
        boolean is_active
        int failure_count
    }

    API_USAGE_LOG {
        uuid id PK
        uuid developer_id FK
        uuid api_key_id FK
        string endpoint
        string action_type
        int status_code
        int latency_ms
        datetime timestamp
    }

    %% ═══════════════════════════════════════════
    %% SHARED ENTITIES
    %% ═══════════════════════════════════════════

    NOTIFICATION {
        uuid id PK
        uuid seeker_id FK "Nullable"
        uuid company_id FK "Nullable"
        string type "application_received | status_updated | new_match | general"
        string title
        text message
        boolean is_read
        datetime created_at
    }

    REVIEW {
        uuid id PK
        string user_type "job_seeker | developer | recruiter"
        int rating "1-5"
        string title
        text content
        datetime created_at
    }

    CHAT_HISTORY {
        uuid id PK
        uuid session_id FK
        string role "user | assistant"
        text content
        json referenced_candidate_ids
        datetime created_at
    }

    %% ═══════════════════════════════════════════
    %% RELATIONSHIPS
    %% ═══════════════════════════════════════════

    COMPANY ||--o{ API_KEY : "has"
    COMPANY ||--o{ SESSION : "creates"
    COMPANY ||--o{ NOTIFICATION : "receives"
    SESSION ||--o{ CANDIDATE : "contains"
    SESSION ||--o{ SESSION_ROUND : "configures"
    SESSION ||--o{ CHAT_HISTORY : "has"
    SESSION ||--o{ JOB_APPLICATION : "receives"
    SESSION ||--o{ SAVED_JOB : "bookmarked by"
    CANDIDATE ||--o{ APPLICANT_ROUND_ATTEMPT : "attempts"
    SESSION_ROUND ||--o{ APPLICANT_ROUND_ATTEMPT : "has"
    JOB_SEEKER_ACCOUNT ||--o{ JOB_APPLICATION : "submits"
    JOB_SEEKER_ACCOUNT ||--o{ RESUME_DRAFT : "creates"
    JOB_SEEKER_ACCOUNT ||--o{ SAVED_JOB : "saves"
    JOB_SEEKER_ACCOUNT ||--o{ SEEKER_MOCK_ATTEMPT : "practices"
    JOB_SEEKER_ACCOUNT ||--o{ NOTIFICATION : "receives"
    DEVELOPER_ACCOUNT ||--o{ DEVELOPER_API_KEY : "manages"
    DEVELOPER_ACCOUNT ||--o{ WEBHOOK : "configures"
    DEVELOPER_ACCOUNT ||--o{ API_USAGE_LOG : "generates"
```

---

<a id="ai-agents"></a>
## 🤖 Multi-Agent AI System

Workly's intelligence layer consists of **15+ specialized AI agents**, each handling a discrete task in the hiring pipeline.

<table>
  <tr>
    <td align="center"><b>Agent</b></td>
    <td align="center"><b>Model</b></td>
    <td align="center"><b>Purpose</b></td>
  </tr>
  <tr>
    <td>📄 <b>Parsing Agent</b></td>
    <td>Gemini 2.5 Flash</td>
    <td>Extracts structured data (name, skills, experience, education) from resume text</td>
  </tr>
  <tr>
    <td>🎯 <b>ATS Compatibility Agent</b></td>
    <td>Gemini 2.5 Flash</td>
    <td>Scores resumes against ATS criteria with section-by-section analysis</td>
  </tr>
  <tr>
    <td>🔗 <b>Matching Agent</b></td>
    <td>Embeddings + Gemini</td>
    <td>Computes semantic similarity between resumes and job descriptions</td>
  </tr>
  <tr>
    <td>🧹 <b>Normalization Agent</b></td>
    <td>Gemini 2.5 Flash</td>
    <td>Maps raw skill strings to a canonical skill taxonomy</td>
  </tr>
  <tr>
    <td>✨ <b>Resume Enhancer</b></td>
    <td>Gemini 2.5 Flash</td>
    <td>Rewrites resume bullet points for stronger impact and keyword density</td>
  </tr>
  <tr>
    <td>📊 <b>Resume Quality Agent</b></td>
    <td>Gemini 2.5 Flash</td>
    <td>Grades resume quality on formatting, content depth, and clarity</td>
  </tr>
  <tr>
    <td>🎤 <b>Interview Agent</b></td>
    <td>Gemini / Groq LLaMA 3.3</td>
    <td>Conducts AI interviews, evaluates responses, generates hiring recommendations</td>
  </tr>
  <tr>
    <td>💌 <b>Cover Letter Agent</b></td>
    <td>Gemini 2.5 Flash</td>
    <td>Generates tailored cover letters from resume + job description</td>
  </tr>
  <tr>
    <td>💰 <b>Salary Prediction Agent</b></td>
    <td>scikit-learn</td>
    <td>Predicts salary ranges using trained regression models</td>
  </tr>
  <tr>
    <td>🔍 <b>Job Recommendation Agent</b></td>
    <td>Embeddings + cosine similarity</td>
    <td>Recommends matching jobs based on seeker profile and skills</td>
  </tr>
  <tr>
    <td>📝 <b>JD Generator Agent</b></td>
    <td>Gemini 2.5 Flash</td>
    <td>Auto-generates professional job descriptions from minimal inputs</td>
  </tr>
  <tr>
    <td>💬 <b>Chatbot Agent</b></td>
    <td>Gemini / Groq</td>
    <td>Session-aware conversational assistant for recruiter queries</td>
  </tr>
  <tr>
    <td>📐 <b>Embeddings Engine</b></td>
    <td>sentence-transformers / Google</td>
    <td>Generates vector embeddings for semantic search and matching</td>
  </tr>
  <tr>
    <td>📑 <b>MCQ Paper Parser</b></td>
    <td>Gemini 2.5 Flash</td>
    <td>Extracts structured MCQ questions from uploaded question papers</td>
  </tr>
  <tr>
    <td>📄 <b>Resume PDF Renderer</b></td>
    <td>ReportLab + Pillow</td>
    <td>Generates professional PDF resumes from structured data</td>
  </tr>
</table>

### LLM Failover Architecture

```
Request → ┌────────────────────────────────────────────────────┐
          │             RotateLLMClient                        │
          │                                                    │
          │  1. Try Gemini keys (round-robin with cooldown)    │
          │     ├── Key 1 → ✓ Success → Return                │
          │     ├── Key 2 → ✗ Rate limited (cooldown 60s)     │
          │     └── Key N → ✗ All exhausted                   │
          │                                                    │
          │  2. Fallback to Groq (cascading models)            │
          │     ├── llama-3.3-70b-specdec                      │
          │     ├── llama-3.3-70b-versatile                    │
          │     ├── llama-3.1-8b-instant                       │
          │     └── llama3-8b-8192                             │
          │                                                    │
          │  3. Final fallback to OpenAI                        │
          │     └── gpt-4o-mini                                │
          └────────────────────────────────────────────────────┘
```

---

<a id="getting-started"></a>
## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| Python | 3.11 or higher | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ (LTS) | [nodejs.org](https://nodejs.org/) |
| PostgreSQL | 14 or higher | [postgresql.org](https://www.postgresql.org/download/) |
| Redis | 7.0+ | [redis.io](https://redis.io/download/) |
| Git | Latest | [git-scm.com](https://git-scm.com/downloads) |

### Installation

#### Option 1: Quick Start (Windows)

```bash
# Clone the repository
git clone https://github.com/Mayur-Purohit/Workly.git
cd Workly

# Run the one-click setup script
run.bat
```

The script will automatically:
1. Stop any existing processes on ports 5173/8000
2. Check and start Redis
3. Create a virtual environment and install Python dependencies
4. Run database migrations
5. Start the Django backend on port 8000
6. Install and start the Vite frontend on port 5173
7. Launch a Celery worker for background tasks
8. Open the app in your default browser

#### Option 2: Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/Mayur-Purohit/Workly.git
cd Workly

# 2. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

# 3. Configure backend environment
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux

# 4. Run database migrations
python manage.py migrate

# 5. Start the backend
python manage.py runserver 0.0.0.0:8000

# 6. In a new terminal — Frontend setup
cd frontend
npm install

# 7. Configure frontend environment
copy .env.local.example .env.local

# 8. Start the frontend
npm run dev

# 9. In a new terminal — Start Celery worker (optional, for async tasks)
cd backend
venv\Scripts\activate
python -m celery -A workers.celery_worker worker --loglevel=info --pool=threads --concurrency=4
```

### Configuration

#### Backend `.env`

```env
# ─── Database ────────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/workly
JWT_SECRET=your-secure-random-secret-key

# ─── LLM API Keys (at least one required) ───────────────────
GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEYS=key1,key2,key3          # Multiple keys for rotation
# GROQ_API_KEY=your-groq-key            # Optional fallback
# OPENAI_API_KEY=your-openai-key        # Optional fallback

# ─── Redis ───────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/1

# ─── OAuth (optional) ───────────────────────────────────────
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# ─── Payments (optional) ────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your-key-secret

# ─── Email (optional) ───────────────────────────────────────
BREVO_API_KEY=your-brevo-api-key
MAIL_FROM=noreply@yourdomain.com
```

#### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

### Running the Application

| Service | URL | Command |
|---------|-----|---------|
| 🎨 Frontend | `http://localhost:5173` | `npm run dev` (in `/frontend`) |
| 🐍 Backend | `http://localhost:8000` | `python manage.py runserver 0.0.0.0:8000` (in `/backend`) |
| ⚡ Celery | Background worker | `celery -A workers.celery_worker worker --loglevel=info` |

---

<a id="api-endpoints"></a>
## 📡 API Endpoints

### Recruiter Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new company account |
| `POST` | `/api/v1/auth/login` | Login with email/password |
| `POST` | `/api/v1/auth/login-google` | Google OAuth login |
| `POST` | `/api/v1/auth/login-github` | GitHub OAuth login |
| `GET` | `/api/v1/auth/me` | Get current company profile |
| `POST` | `/api/v1/auth/logout` | Logout (blacklist JWT) |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |

### Hiring Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/v1/sessions` | List all / Create new hiring session |
| `GET/PATCH/DELETE` | `/api/v1/sessions/:id` | Get / Update / Archive session |
| `POST` | `/api/v1/sessions/:id/match-all` | Trigger AI matching for all candidates |
| `POST` | `/api/v1/sessions/:id/infer-skills` | AI-infer required skills from JD |
| `POST` | `/api/v1/sessions/generate-jd` | Generate job description with AI |

### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/sessions/:id/candidates` | List candidates in a session |
| `GET/DELETE` | `/api/v1/sessions/:id/candidates/:cid` | Get / Remove candidate |
| `POST` | `/api/v1/sessions/:id/candidates/:cid/action` | Shortlist / Reject / Hire |
| `POST` | `/api/v1/sessions/:id/candidates/bulk-reject` | Bulk reject candidates |

### Resume Ingestion
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/ingest/upload` | Upload resume files (PDF/DOCX) |
| `POST` | `/api/v1/ingest/zip` | Upload ZIP archive of resumes |
| `POST` | `/api/v1/ingest/gmail/sync` | Sync resumes from Gmail |
| `POST` | `/api/v1/ingest/gdrive/sync` | Sync resumes from Google Drive |
| `POST` | `/api/v1/ingest/ats-import` | Import from external ATS |

### Assessment Rounds
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/sessions/:id/rounds` | Create assessment rounds |
| `POST` | `/api/v1/sessions/:id/generate-test-links` | Generate candidate test links |
| `GET` | `/api/v1/sessions/:id/applicant-results` | View assessment results |
| `POST` | `/api/v1/test/submit-mcq` | Submit MCQ answers |
| `POST` | `/api/v1/test/submit-coding` | Submit coding solutions |
| `POST` | `/api/v1/test/submit-interview-answer` | Submit interview response |

### Job Seeker
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/seeker/auth/register` | Register job seeker |
| `GET` | `/api/v1/seeker/jobs` | Browse available jobs |
| `POST` | `/api/v1/seeker/jobs/:id/apply` | Apply to a job |
| `POST` | `/api/v1/seeker/resume/upload` | Upload resume |
| `POST` | `/api/v1/seeker/resume/enhance` | AI-enhance resume |
| `POST` | `/api/v1/seeker/resume/check-ats` | Check ATS compatibility |
| `GET/POST` | `/api/v1/seeker/resume/drafts` | Manage resume drafts |
| `POST` | `/api/v1/seeker/resume/drafts/:id/export-pdf` | Export resume as PDF |
| `GET` | `/api/v1/seeker/predict-salary` | ML salary prediction |

### Developer Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/developer/auth/register` | Register developer account |
| `GET/POST` | `/api/developer/keys` | List / Generate API keys |
| `GET` | `/api/developer/usage` | Usage analytics |
| `GET/POST` | `/api/developer/webhooks` | Manage webhooks |
| `POST` | `/api/developer/embed/parse` | Parse resume via embed SDK |

---

<a id="deployment"></a>
## 🌍 Deployment

### Production Architecture

| Component | Platform | Configuration |
|-----------|----------|---------------|
| Backend | Render | `render.yaml` — Python web service with Gunicorn |
| Frontend | Vercel | `vercel.json` — SPA with API rewrites |
| Database | Neon | Serverless PostgreSQL with SSL |
| Redis | Render / Upstash | Rate limiting and Celery broker |

### Deploy to Production

```bash
# Backend — Push to Render (auto-deploys from render.yaml)
git push origin main

# Frontend — Push to Vercel (auto-deploys on push)
cd frontend && vercel --prod
```

---

## 🔒 Security

- **Password Hashing** — bcrypt with configurable salt rounds
- **JWT Authentication** — Stateless tokens with Redis-backed blacklisting on logout
- **Rate Limiting** — Per-API-key monthly limits with Redis counters, IP-based rate limiting for public endpoints
- **Security Headers** — `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `CSP` via custom middleware
- **Exception Sanitization** — Production errors return correlation IDs instead of stack traces
- **CORS Configuration** — Strict origin allowlisting with regex pattern support
- **OTP Verification** — Email and phone verification with time-limited one-time passwords
- **Tier-Based Access Control** — API features gated by subscription tier with decorator enforcement

---

## 🧪 ML Models & Training

The project includes custom-trained machine learning models:

| Model | Training Script | Dataset | Purpose |
|-------|----------------|---------|---------|
| Salary Predictor | `scripts/train_salary_model.py` | Stack Overflow Developer Survey | Predict salary ranges based on skills, experience, and location |
| Resume-JD Matcher | `scripts/train_matching_model.py` | Resume-Job Description pairs | Score resume relevance to job descriptions |
| NER Parser | `scripts/train_ner.py` | Entity Recognition in Resumes | Extract named entities (skills, organizations, dates) from resumes |
| Fraud Detector | `scripts/train_fraud_model.py` | Keystroke dynamics dataset | Detect anomalous behavior during assessments |

---

## 👥 Authors

**Mayur Purohit** — Full-Stack Development, AI Architecture & System Design

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed as a **Semester 4 Project** demonstrating applied knowledge of full-stack web development, multi-agent AI systems, machine learning, and modern software engineering practices.

---

<p align="center">
  <b>Built with ❤️ using Django, React, and Google Gemini AI</b>
  <br/>
  <sub>⭐ Star this repository if you found it helpful!</sub>
</p>
