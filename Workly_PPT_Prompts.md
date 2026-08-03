# Workly — AI Prompts to Generate PowerPoint Presentation (Slide by Slide)

Use these prompts in AI presentation tools like **Gamma.app**, **Canva AI**, **PowerPoint Copilot**, **ChatGPT**, or **Tome** to generate your presentation slides automatically with beautiful visual designs!

---

## 🚀 Master Prompt (For Gamma.app / Canva AI / Tome / Single-Prompt Generators)

> **Copy & Paste this entire master prompt into Gamma.app or Canva AI to generate all 5 slides at once:**

```text
Create a modern, sleek, high-tech 5-slide presentation for a project named "Workly". 
Use a dark dark navy (#0F172A), deep slate (#1E293B), vibrant indigo (#6366F1), and cyan accent color palette. 

Slide 1: Title & Team Slide
- Title: Workly
- Subtitle: A Comprehensive Multi-Agent AI Platform for Semantic Resume Parsing, ATS Optimization, Candidate Matching, and Recruitment Intelligence
- Team Members Table:
  1. PUROHIT MAYUR DINESH | Enrolment: 24002171310127 | Roll No: 131 | Branch: CST
  2. MANSURI MOHAMMADAFTAB FIROJBHAI | Enrolment: 24002171310076 | Roll No: 132 | Branch: CST
  3. PATEL KRISH VIPULKUMAR | Enrolment: 24002171310115 | Roll No: 105 | Branch: CST

Slide 2: Project Overview (What is Workly?)
- Overview: Workly is an end-to-end multi-agent AI ecosystem bridging job seekers and recruiters with automated resume parsing, skill normalization, vector candidate matching, and dynamic resume building.
- Three Content Box Grid:
  * Box 1 (The Problem): Recruiters waste hours manually scanning unstructured PDF/DOCX resumes. Keyword search fails context and soft skills. Job seekers lack real-time ATS feedback.
  * Box 2 (The Solution): Multi-Agent AI ecosystem (7+ specialized agents) providing instant resume parsing, skill taxonomy mapping, real-time ATS feedback, and vector similarity search.
  * Box 3 (Core Idea): Automating document extraction, skill taxonomy alignment, and interview generation to make candidate evaluation fast, accurate, and transparent.

Slide 3: Key Features (2x2 Card Grid Layout)
- Title: Key Features
- Card 1: Multi-Agent Resume Parser & Skill Normalizer (Extracts structured profiles from PDF/DOCX; Normalization Agent maps 1,000+ skills to canonical taxonomy)
- Card 2: Semantic Candidate Matching & ATS Engine (Vector similarity scoring via ChromaDB; ATS Compatibility Agent evaluates keyword density and formatting)
- Card 3: AI Interview Generator & Candidate Chatbot (Interview Agent generates role-specific technical questions; Chatbot Agent allows natural language candidate querying)
- Card 4: Live AI Resume Builder & ReportLab Exporter (7 high-fidelity templates with 1-column/2-column toggle; ReportLab backend engine for ATS-friendly PDF exports)

Slide 4: Technology Stack (3 Vertical Columns)
- Title: Technology Stack
- Column 1 (Frontend): React 18, Vite, Tailwind CSS, Lucide Icons, Zustand, React Query, Recharts, Framer Motion
- Column 2 (Backend & Agents): Python 3.10+, Django REST, Celery, Redis, Multi-Agent Pipeline, PyMuPDF, pdfplumber, python-docx
- Column 3 (Database & AI Engine): Google Gemini API (RotateLLMClient key rotation), ChromaDB Vector Store, PostgreSQL (Supabase), ReportLab PDF Engine

Slide 5: Conclusion & Future Scope
- Title: Conclusion & Future Scope
- Conclusion Box: Workly replaces manual resume screening with a coordinated multi-agent AI system, delivering automated resume parsing, canonical skill normalization, ATS optimization, and semantic matching.
- Future Scope (4 Items):
  1. AI Video Interview Agent (Automated communication and cadence scoring)
  2. Enterprise ATS Webhooks (Integration with Greenhouse, Workday, Lever)
  3. Native Mobile Application (React Native iOS and Android apps)
  4. Advanced Fraud & Identity Verification (AI detection for fake jobs and deepfake profiles)
- Closing Slogan Banner: "Workly — Where Intelligence Meets Recruitment Opportunity"
```

---

## 📌 Slide-by-Slide Individual Prompts (For ChatGPT / Midjourney / Copilot / Individual Slide Design)

### 🔹 Slide 1 Prompt: Title & Team Information

```text
Design Slide 1 for a presentation titled "Workly". 
Dark blue tech theme (#0F172A).

Content:
- Main Header: Workly
- Subtitle: A Comprehensive Multi-Agent AI Platform for Semantic Resume Parsing, ATS Optimization, Candidate Matching, and Recruitment Intelligence
- Bottom Card / Table layout listing Team Members:
  * PUROHIT MAYUR DINESH (Enrolment: 24002171310127 | Roll: 131 | Branch: CST)
  * MANSURI MOHAMMADAFTAB FIROJBHAI (Enrolment: 24002171310076 | Roll: 132 | Branch: CST)
  * PATEL KRISH VIPULKUMAR (Enrolment: 24002171310115 | Roll: 105 | Branch: CST)

Style: Professional, high-contrast, modern clean sans-serif typography, dark theme.
```

---

### 🔹 Slide 2 Prompt: Project Overview

```text
Design Slide 2 for "Workly" titled "What is Workly?".

Layout:
- Top Banner Card: Overview statement explaining that Workly is an AI multi-agent ecosystem for automated resume parsing, skill normalization, vector candidate matching, and ATS resume building.
- 3 side-by-side card blocks:
  1. The Problem (Red highlight border): Manual resume scanning is slow, keyword search fails, candidates lack real-time ATS feedback.
  2. The Solution (Green highlight border): 7+ specialized AI agents for instant parsing, canonical skill mapping, ATS feedback, and vector search.
  3. Core Idea (Blue highlight border): Automated document extraction and interview generation for transparent recruitment.

Style: Dark mode UI card container visual aesthetic with color accent highlights.
```

---

### 🔹 Slide 3 Prompt: Key Features

```text
Design Slide 3 for "Workly" titled "Key Features".
Sub-header: "Workly combines multi-agent intelligence with intuitive web interfaces to deliver an intelligent recruitment ecosystem."

Layout: 2x2 Grid with 4 modern rounded feature cards.

Card 1: Multi-Agent Resume Parser & Skill Normalizer
- Extracts structured profile data from PDF/DOCX/TXT files.
- Normalization Agent maps raw skills against 1,000+ canonical skills.

Card 2: Semantic Candidate Matching & ATS Engine
- Vector similarity scoring using ChromaDB.
- ATS Compatibility Agent evaluates keyword density and formatting layout.

Card 3: AI Interview Generator & Candidate Chatbot
- Interview Agent generates role-specific technical questions.
- Chatbot Agent allows recruiters to query candidate pools in natural language.

Card 4: Live AI Resume Builder & ReportLab Exporter
- 7 high-fidelity resume templates with 1-column & 2-column dynamic toggles.
- Server-side ReportLab PDF generation engine for ATS-optimized exports.

Style: Clean tech dashboard layout with vibrant icons.
```

---

### 🔹 Slide 4 Prompt: Technology Stack

```text
Design Slide 4 for "Workly" titled "Technology Stack".
Sub-header: "Engineered with modern, scalable, and high-performance technologies across frontend, backend, database, and AI pipelines."

Layout: 3 vertical columns with distinct headers and icon bullet lists.

Column 1 (Frontend Stack):
- React 18 & Vite (Modular SPA architecture)
- Tailwind CSS & Lucide Icons (Responsive design system)
- Zustand & React Query (State management & async fetching)
- Framer Motion & Recharts (Animations & salary trends charts)

Column 2 (Backend & Agents):
- Python 3.10+ & Django REST (Core API framework)
- Celery & Redis (Async task queue for resume processing)
- Multi-Agent Pipeline (7+ specialized agents)
- PyMuPDF, pdfplumber, python-docx (Document parsers)

Column 3 (Database, AI & Infrastructure):
- Google Gemini API (RotateLLMClient key rotation & failover)
- ChromaDB & Sentence Transformers (Vector similarity search)
- PostgreSQL / Supabase (Relational data storage)
- ReportLab Engine (Dynamic PDF compilation)

Style: Modern developer architectural diagram visual with tech stack badges.
```

---

### 🔹 Slide 5 Prompt: Conclusion & Future Scope

```text
Design Slide 5 for "Workly" titled "Conclusion & Future Scope".

Layout:
- Top Main Container: Project Conclusion stating that Workly transforms recruitment by replacing manual screening with a coordinated multi-agent AI system.
- Grid of 4 Future Scope Items:
  1. AI Video Interview Agent (Communication & voice cadence scoring)
  2. Enterprise ATS Webhooks (Integration with Greenhouse, Workday, Lever)
  3. Native Mobile Application (React Native iOS and Android apps)
  4. Advanced Fraud Verification (AI detection for fake jobs and deepfake candidate profiles)
- Bottom Callout Banner: "Workly — Where Intelligence Meets Recruitment Opportunity"

Style: Dark gradient card layout with sleek futuristic accent badges.
```
