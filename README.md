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

The platform provides dedicated workspaces for two distinct user roles:
1. **Recruiters & Companies**: Create hiring sessions, upload applicant resumes, screen candidates with semantic match algorithms, configure assessment pipelines, and review candidate scorecards.
2. **Job Seekers**: Search and apply to open positions, generate job-tailored cover letters, build resumes using a 7-template live editor with ATS scoring and PDF export, and practice assessments in a mock interview environment.

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
- [Configuration](#-configuration)
- [License](#-license)

---

## 🏗️ System Architecture

```text
                               ┌─────────────────────────────────────────┐
                               │         React 18 SPA (Vite)             │
                               │      (Recruiter & Seeker Portals)       │
                               └────────────────────┬────────────────────┘
                                                    │ HTTP / JSON
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │         Django 5 REST Backend           │
                               │  - JWT Auth (passlib/bcrypt)            │
                               │  - Sliding-window Redis Rate Limiting   │
                               │  - Security Headers & Sanitization      │
                               └───────┬─────────────────────────┬───────┘
                                       │                         │
                     ┌─────────────────┴────────┐                │ Async Tasks
                     ▼                          ▼                ▼
        ┌─────────────────────────┐  ┌────────────────┐  ┌───────────────┐
        │  PostgreSQL Database    │  │ Redis 7.0+     │  │ Celery 5.4    │
        │  - Django ORM Models    │  │ - Token Black- │  │ Workers       │
        │  - Sessions & Candidates│  │   list Cache   │  │ - Batch Parse │
        │  - Rounds & Submissions │  │ - Rate Limit   │  │ - Async ML    │
        └─────────────────────────┘  └────────────────┘  └───────┬───────┘
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
| Technology | Purpose in Codebase |
|---|---|
| **Python / Django 5** | Backend runtime environment, ORM models, routing, and HTTP views |
| **PostgreSQL** | Primary relational database configured via `dj-database-url` |
| **Redis & Celery** | Asynchronous background processing (batch resume ingestion), caching, and rate limiting |
| **PyMuPDF (`fitz`) / pdfplumber** | PDF text extraction, column-layout analysis, and candidate photo extraction |
| **python-docx / Pillow** | Word document extraction and image processing |
| **ReportLab** | Dynamic ATS-compatible PDF resume generation |
| **scikit-learn** | Salary regressors, matching classifiers, and KMeans clustering |
| **sentence-transformers** | `all-MiniLM-L6-v2` dense embeddings for semantic matching |
| **python-jose / passlib** | JWT token creation/decoding and bcrypt password hashing |
| **OpenAI SDK / google-generativeai** | LLM orchestration (Gemini, Groq, OpenAI) and Vision OCR |
| **django-anymail** | Transactional email delivery |

### Frontend
| Technology | Purpose in Codebase |
|---|---|
| **React 18 / Vite / Tailwind** | Core UI library, build tool, and utility styling |
| **react-router-dom** | Client-side routing with lazy-loaded route components |
| **Zustand** | Global state management across application stores |
| **@tanstack/react-query**| Server state management and cache management |
| **framer-motion** | UI transitions and component animations |
| **recharts** | Analytical data visualization (charts on dashboards and usage trends) |
| **react-dropzone** | Drag-and-drop file upload interface for resume files |
| **react-syntax-highlighter**| Code snippet display in coding tests |
| **html2pdf.js** | Client-side PDF export fallback in resume editor |

---

## ✨ Key Features

### 1. Recruiter & Company Workspace
- **Hiring Sessions Management**: Create vacancy sessions with required skills, minimum experience, salary parameters, and customizable weighting.
- **AI Job Description Generator**: Generate structured markdown job descriptions from minimal role attributes.
- **Skill Inference**: Extract required and preferred skill tags from existing job descriptions.
- **Resume Ingestion**: Bulk upload individual PDF, DOCX, TXT files, ZIP archives, or standard ATS CSV/Excel imports.
- **Candidate Processing & Screening**:
  - Automated text parsing with profile photo detection.
  - Skill normalization against a canonical 320-skill taxonomy.
  - Semantic similarity calculation combined with machine learning match blending.
  - Recruiter candidate chat assistant with context-aware session memory.
  - Pipeline management: Shortlist, Reject, Bulk Reject, and Hire.
  - Data export in CSV, Excel (`.xlsx`), and JSON formats.

### 2. Multi-Stage Candidate Assessment Engine (`/test/*`)
- **Assessment Pipeline Builder**: Configure multi-round testing sequences (Multiple Choice, Programming, AI Voice Interview).
- **Multiple Choice Round (MCQ)**: Timed test execution with randomized question delivery. Includes a parser agent for bulk question extraction from uploaded exam documents.
- **Programming Challenge Round**: In-browser Python/JavaScript code editor. Server-side execution runner evaluating code against predefined test cases with execution time/memory tracking.
- **AI Voice Interview Round**:
  - Live webcam feed check and audio input verification.
  - Question delivery via Web Speech synthesis.
  - Hands-free audio recording with Voice Activity Detection (VAD).
  - Speech-to-text transcription powered by Groq Whisper (`whisper-large-v3-turbo`).
  - Real-time response evaluation grading accuracy, confidence, and keyword coverage.
- **Candidate Integrity Monitoring**: Browser tab-switch tracking and periodic webcam capture flags.

### 3. Job Seeker Portal
- **Job Search & Filters**: Search active jobs with multi-currency salary filtering and location toggles.
- **Company Profiles**: Company directories with opening counts and follow capability.
- **Application Tracking**: Application status tracking across all recruitment pipeline stages.
- **AI Cover Letter Generator**: Generate custom cover letters based on profile details and target job descriptions.
- **Resume Builder (`/resume-builder`)**:
  - 7 templates: Modern, Classic, Minimal, Executive, Creative, Compact, and ATS-Optimized.
  - Live dual-pane editor for personal info, summary, experience, education, projects, and skills.
  - ATS score breakdown and actionable improvement feedback.
  - Export to PDF using ReportLab with client-side fallback.
- **Mock Assessment Arena**: Practice MCQ aptitude tests, coding challenges, and voice interviews.

---

## 🤖 AI & Machine Learning System

The intelligence layer combines large language models with specialized local machine learning models:

### AI Agents Implementation
- **RotateLLMClient**: Central LLM client managing multi-key rotation (Gemini Flash primary, Groq/OpenAI failovers) with automatic cooldowns.
- **Advanced ATS Parser**: Extracts text from multi-column PDFs using geometric analysis (`PyMuPDF`) and converts it to structured JSON via LLM.
- **ATS Compatibility Agent**: Evaluates resumes using a weighted scoring formula against JD requirements.
- **Skill Normalizer**: Standardizes raw skill text against a canonical taxonomy using KMeans clustering and Embeddings.
- **Semantic Matcher**: Combines cosine similarity on dense embeddings (`all-MiniLM-L6-v2`), TF-IDF n-grams, and classification models.
- **Interview Conductor**: Generates tailored questions, evaluates transcribed audio responses, and compiles interview scorecards.
- **Resume Quality Scorer**: Computes ATS baseline quality scores using scikit-learn `LogisticRegression` fitted on text features.
- **Salary Predictor**: Predicts salary baselines using a rule-engine and scikit-learn `GradientBoosting`.
- **Job Recommender**: Matches job seekers to active vacancies using scikit-learn `NearestNeighbors` on TF-IDF vectors.
- **Recruiter Chatbot**: Session-aware assistant that references applicant records to answer recruiter queries.

---

## 🗄️ Database Schema

```mermaid
erDiagram
    COMPANY ||--o{ API_KEY : "issues"
    COMPANY ||--o{ SESSION : "creates"
    COMPANY ||--o{ NOTIFICATION : "receives"

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

    RESUME_DRAFT ||--o{ RESUME_VERSION : "versions"
```

---

## 📡 API Endpoints

### Authentication & Profiles
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new employer/recruiter account |
| `POST` | `/api/v1/auth/login` | Recruiter login (returns JWT) |
| `GET` | `/api/v1/auth/me` | Fetch authenticated recruiter profile |
| `POST` | `/api/v1/auth/logout` | Invalidate token via Redis blacklist |

### Sessions & Candidate Screening
| Method | Endpoint | Description |
|---|---|---|
| `GET`, `POST` | `/api/v1/sessions` | List sessions or create a new hiring session |
| `GET`, `PATCH`, `DELETE`| `/api/v1/sessions/<id>` | Retrieve, modify, or archive a session |
| `POST` | `/api/v1/sessions/generate-jd` | AI generation of job descriptions |
| `POST` | `/api/v1/sessions/<id>/infer-skills` | Extract required skills from session JD |
| `POST` | `/api/v1/sessions/<id>/match-all` | Trigger re-matching for all session candidates |
| `GET` | `/api/v1/sessions/<id>/candidates` | List candidates in a session with filters |
| `POST` | `/api/v1/sessions/<id>/candidates/<cid>/action`| Update status (shortlist, reject, hire) |
| `GET` | `/api/v1/sessions/<id>/candidate-clusters` | Compute KMeans candidate clusters |
| `POST` | `/api/v1/sessions/<id>/chat` | Query candidate pool via session chatbot |

### Resume Ingestion
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/ingest/upload` | Upload resume files (PDF, DOCX, TXT) |
| `POST` | `/api/v1/ingest/zip` | Upload ZIP archive of resumes |
| `POST` | `/api/v1/ingest/ats-import` | Import candidates from CSV/Excel |

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
| `POST` | `/api/v1/test/transcribe-audio` | Transcribe speech via Groq Whisper |
| `POST` | `/api/v1/test/submit-interview-answer`| Evaluate single interview answer |
| `POST` | `/api/v1/test/finalize-interview` | Generate complete interview summary |

### Job Seeker Services
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/seeker/auth/login` | Job seeker login |
| `GET` | `/api/v1/seeker/jobs` | Browse active job openings |
| `POST` | `/api/v1/seeker/jobs/<id>/apply` | Apply for a position |
| `POST` | `/api/v1/seeker/jobs/generate-cover-letter` | Generate AI cover letter |
| `GET`, `POST` | `/api/v1/seeker/resume/drafts` | List or create resume builder drafts |
| `POST` | `/api/v1/seeker/resume/drafts/<id>/export-pdf`| Export resume draft as styled PDF |
| `POST` | `/api/v1/seeker/resume/drafts/optimize` | AI optimize resume draft against JD |
| `POST` | `/api/agents/ats-check` | Run ATS score evaluation |

---

## 🔒 Security & Authentication

- **Password Hashing**: Cryptographic hashing using `bcrypt` via `passlib`.
- **JWT Authorization**: Stateless `HS256` tokens.
- **Token Blacklisting**: Logout operations add tokens to a Redis blacklist checked on authenticated requests.
- **Sliding-Window IP Rate Limiting**: Redis-backed sliding-window counters protect endpoints from abuse.
- **HTTP Security Headers**: Enforced via middleware (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `CSP`).

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14 or higher
- **Redis**: 7.0 or higher

### Local Execution (Windows)
A convenience script `run.bat` is included to automatically start the backend, frontend, Redis, and Celery workers concurrently:
```bash
./run.bat
```

### Manual Setup
1. **Backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **Celery Worker**:
   ```bash
   cd backend
   python -m celery -A workers.celery_worker worker --loglevel=info
   ```

---

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/workly
REDIS_URL=redis://localhost:6379/1
SECRET_KEY=your-django-secret-key
JWT_SECRET=your-jwt-signing-secret

# LLM Keys
GEMINI_API_KEY=your-primary-gemini-key
GROQ_API_KEY=your-groq-api-key

# OAuth & Integrations
GOOGLE_CLIENT_ID=your-google-client-id
GITHUB_CLIENT_ID=your-github-client-id
```

### Frontend Environment Variables (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed as a **Semester 4 Project** demonstrating full-stack engineering, asynchronous task queues, applied machine learning, and multi-agent LLM orchestration.
