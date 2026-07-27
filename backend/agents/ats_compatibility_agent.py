import json
import logging
import re
from datetime import datetime, timezone
from collections import Counter
from agents.llm import RotateLLMClient
import numpy as np
from agents.embeddings import get_embedding_model

def compute_semantic_similarity(queries, candidates):
    model = get_embedding_model()
    if not model or not queries or not candidates:
        return 0.0, []
        
    try:
        # Encode lists of sentences
        query_embs = model.encode(queries, convert_to_numpy=True)
        cand_embs = model.encode(candidates, convert_to_numpy=True)
        
        # Normalize embeddings
        query_embs = query_embs / (np.linalg.norm(query_embs, axis=1, keepdims=True) + 1e-8)
        cand_embs = cand_embs / (np.linalg.norm(cand_embs, axis=1, keepdims=True) + 1e-8)
        
        # Compute cosine similarities matrix (shape: num_queries, num_candidates)
        sim_matrix = np.dot(query_embs, cand_embs.T)
        
        # For each query, find the best matching candidate sentence
        max_sims = np.max(sim_matrix, axis=1)
        mean_similarity = float(np.mean(max_sims))
        
        # Also return detail mapping
        details = []
        for i, q in enumerate(queries):
            best_idx = int(np.argmax(sim_matrix[i]))
            best_sim = float(max_sims[i])
            details.append({
                "query": q,
                "best_match": candidates[best_idx],
                "similarity": best_sim
            })
            
        return mean_similarity, details
    except Exception as e:
        logger.error("Error in compute_semantic_similarity: %s", e)
        return 0.0, []

logger = logging.getLogger(__name__)

TECH_DICT = {
    # Languages
    "python", "javascript", "java", "typescript", "golang", "rust", "ruby", "php", "sql", "nosql", "cplusplus", "cpp", "csharp", "bash", "scala", "kotlin", "swift", "dart",
    # Frontend
    "react", "angular", "vue", "svelte", "nextjs", "nuxt", "gatsby", "html", "css", "tailwind", "tailwindcss", "bootstrap", "sass", "less", "webpack", "vite", "redux", "graphql", "apollo",
    # Backend & Frameworks
    "node", "express", "django", "flask", "fastapi", "spring", "laravel", "rails", "nest", "nestjs", "asp", "dotnet",
    # Databases
    "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "sqlite", "mariadb", "oracle", "dynamodb", "cassandra", "firebase", "supabase",
    # DevOps & Cloud
    "docker", "kubernetes", "aws", "gcp", "azure", "ci", "cd", "cicd", "jenkins", "gitlab", "github", "bitbucket", "ansible", "terraform", "prometheus", "grafana", "opentelemetry", "elk", "nginx", "apache",
    # Testing & Tools
    "jest", "cypress", "playwright", "selenium", "pytest", "junit", "mocha", "chai",
    # Concepts
    "microservices", "agile", "scrum", "rest", "grpc", "soap", "mvc", "tdd", "bdd", "ci/cd"
}

SOFT_SKILLS_DICT = {
    "communication", "leadership", "teamwork", "problem solving", "analytical",
    "collaboration", "mentoring", "project management", "time management",
    "critical thinking", "adaptability", "creativity", "presentation",
    "negotiation", "conflict resolution", "decision making", "strategic planning",
    "stakeholder management", "cross functional", "team leadership"
}

DOMAIN_SKILLS_DICT = {
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "data science", "data engineering", "data analysis",
    "data visualization", "etl", "big data", "hadoop", "spark", "kafka",
    "airflow", "tableau", "power bi", "looker", "snowflake", "databricks",
    "sagemaker", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "jupyter", "mlops", "devops", "sre", "site reliability",
    "cybersecurity", "penetration testing", "blockchain", "web3", "solidity",
    "smart contracts", "mobile development", "ios", "android", "flutter",
    "react native", "responsive design", "accessibility", "seo",
    "ui design", "ux design", "figma", "adobe xd", "sketch",
    "product management", "business analysis", "requirements gathering",
    "system design", "distributed systems", "cloud architecture",
    "serverless", "lambda", "api gateway", "load balancing",
    "caching", "message queue", "rabbitmq", "celery", "websocket"
}

# --- Constants used only for the General (No-JD) ATS checklist ---

WEAK_PHRASES = [
    "responsible for", "duties included", "worked on", "helped with",
    "in charge of", "tasked with", "assisted in", "was involved in",
    "familiar with", "exposure to", "participated in", "involved in",
    "worked with", "helped to", "duties consisted"
]

STRONG_ACTION_VERBS = {
    "led", "built", "developed", "designed", "implemented", "engineered", "architected",
    "created", "launched", "optimized", "improved", "reduced", "increased", "automated",
    "streamlined", "spearheaded", "drove", "delivered", "managed", "coordinated",
    "established", "initiated", "resolved", "researched", "analyzed", "deployed",
    "integrated", "migrated", "refactored", "orchestrated", "mentored", "trained",
    "presented", "negotiated", "generated", "achieved", "executed", "scaled",
    "authored", "pioneered", "transformed", "accelerated", "boosted", "cut",
    "enhanced", "configured", "provisioned", "monitored", "containerized",
    "devised", "formulated", "restructured", "consolidated", "modernized"
}

WEAK_START_VERBS = {
    "responsible", "worked", "helped", "assisted", "participated", "involved",
    "tasked", "handled", "did", "was", "familiar", "exposure", "duties"
}

# --- Constants used only for the Professional Tone / Red-Flags checklist item
# (General ATS mode only). These catch what pure keyword/format checkers miss —
# unrealistic self-projected claims, seniority-mismatched language, and templated
# cross-bullet repetition — usually the single biggest driver of the gap between
# an "everything parses cleanly" score and how a real recruiter reads the resume. ---

UNREALISTIC_CLAIM_PATTERNS = [
    r'\u20b9\s?\d+(\.\d+)?\s?(cr|crore)\+?',
    r'\$\s?\d+(\.\d+)?\s?(m|million)\+?',
    r'\b(goal|target(ing)?)\b.{0,25}\bctc\b',
    r'\bctc\b.{0,25}\b(goal|target)\b',
    r'\bair\s?-?\s?1\b',
    r'\brank\s?-?\s?1\b',
]

SENIORITY_BUZZWORDS = [
    "google-level", "faang-level", "world-class engineer", "10x engineer",
    "rockstar developer", "ninja developer", "coding ninja", "principal engineer",
    "staff engineer", "world's best", "best in the world", "top 1% engineer",
    "elite engineer", "genius-level",
]

ELITE_COMPANIES = ["google", "meta", "amazon", "microsoft", "apple", "netflix", "openai"]
ASPIRATION_VERBS = ["targeting", "aiming for", "aspiring to"]

# Baseline SWE-fundamentals keywords checked only for presence/absence — widens
# the "General Technical Keywords" check beyond web-framework density, since
# these are near-universal in real engineering job descriptions.
BASELINE_SWE_KEYWORDS = {
    "data structures", "algorithms", "system design", "docker", "kubernetes",
    "aws", "gcp", "azure", "ci/cd", "cicd", "unit testing", "distributed systems",
}

# Module-level cache for JD parse results to ensure deterministic scoring
_jd_parse_cache = {}

class AtsCompatibilityAgent:
    """
    Independent agent that performs production-grade ATS compatibility checks.
    Scores are strictly calculated using 6 weighted components:
      - Keyword Match (35%)
      - Skills Match (25%)
      - Experience Relevance (15%)
      - Project Relevance (10%)
      - Education Match (5%)
      - ATS Formatting (10%)
    """
    def __init__(self):
        self.client = RotateLLMClient()

    def _extract_techs_from_text(self, text: str) -> set:
        if not text:
            return set()
        # Clean text preserving some special chars like +, #, .
        cleaned = re.sub(r'[^a-zA-Z0-9+#.\s-]', ' ', text.lower())
        # Replace common occurrences of node.js, react.js etc.
        cleaned = cleaned.replace("react.js", "react").replace("reactjs", "react")
        cleaned = cleaned.replace("node.js", "node").replace("nodejs", "node")
        cleaned = cleaned.replace("next.js", "nextjs").replace("nextjs", "nextjs")
        cleaned = cleaned.replace("vue.js", "vue").replace("vuejs", "vue")
        # Tokenize and look up in TECH_DICT
        words = cleaned.split()
        found = set()
        for w in words:
            if w in TECH_DICT:
                found.add(w)
            elif w in ["c++", "cpp", "cplusplus"]:
                found.add("cpp")
            elif w in ["c#", "csharp"]:
                found.add("csharp")
            elif w in ["ci/cd", "cicd"]:
                found.add("ci/cd")
            elif w in ["dotnet", ".net"]:
                found.add("dotnet")
        return found

    def _is_partial_match(self, jd_item: str, proj_item: str) -> bool:
        """Determines if a JD technology/keyword partially matches a project technology/keyword."""
        j = jd_item.lower().strip()
        p = proj_item.lower().strip()
        if j == p:
            return True
            
        j_clean = re.sub(r'[^a-z0-9]', '', j)
        p_clean = re.sub(r'[^a-z0-9]', '', p)
        if j_clean == p_clean:
            return True
            
        if len(j_clean) > 2 and len(p_clean) > 2:
            if j_clean in p_clean or p_clean in j_clean:
                return True
                
        aliases = {
            "ci/cd": ["cicd", "continuous integration", "continuous deployment", "github actions", "gitlab ci", "jenkins"],
            "rest api": ["restful api", "rest apis", "restful apis", "restful", "apis"],
            "cloud": ["aws", "gcp", "azure", "cloud native", "cloud infrastructure"],
            "react": ["reactjs", "react.js"],
            "node": ["nodejs", "node.js"],
            "next": ["nextjs", "next.js"],
            "vue": ["vuejs", "vue.js"],
            "c++": ["cpp", "cplusplus"],
            "c#": ["csharp"]
        }
        for main_name, list_aliases in aliases.items():
            if (j == main_name or j in list_aliases) and (p == main_name or p in list_aliases):
                return True
        return False

    def _extract_keywords_deterministic(self, text: str) -> list:
        """Extract keywords from text using dictionaries only — no LLM, fully deterministic."""
        if not text:
            return []
        text_lower = text.lower()
        found = set()
        # Check TECH_DICT
        for tech in TECH_DICT:
            pattern = rf'\b{re.escape(tech)}\b'
            if re.search(pattern, text_lower):
                found.add(tech)
        # Check DOMAIN_SKILLS_DICT
        for skill in DOMAIN_SKILLS_DICT:
            if skill in text_lower:
                found.add(skill)
        # Check SOFT_SKILLS_DICT
        for skill in SOFT_SKILLS_DICT:
            if skill in text_lower:
                found.add(skill)
        return sorted(found)

    def _extract_jd_requirements(self, jd_text: str) -> dict:
        """Extract key components from target job description using LLM + deterministic fallback.
        Results are cached per JD text hash for deterministic scoring."""
        if not jd_text or not jd_text.strip():
            return {
                "required_skills": [],
                "preferred_skills": [],
                "technologies": [],
                "frameworks": [],
                "responsibilities": [],
                "min_experience_years": 0,
                "preferred_degree": ""
            }

        # Cache check — ensures same JD always produces same keywords
        import hashlib
        jd_hash = hashlib.md5(jd_text.strip().lower().encode('utf-8')).hexdigest()
        if jd_hash in _jd_parse_cache:
            return _jd_parse_cache[jd_hash]

        # Step 1: Deterministic extraction (always runs, always consistent)
        deterministic_keywords = self._extract_keywords_deterministic(jd_text)

        system_prompt = (
            "You are an ATS Job Description Parser. Analyze the job description and extract details into a JSON object.\n"
            "Include:\n"
            "1. 'required_skills': List of required hard and soft skills (limit 15).\n"
            "2. 'preferred_skills': List of preferred or nice-to-have skills (limit 10).\n"
            "3. 'technologies': Programming languages, tools, cloud services, and software systems mentioned.\n"
            "4. 'frameworks': Software frameworks and libraries.\n"
            "5. 'responsibilities': Primary responsibilities (short bullet strings).\n"
            "6. 'min_experience_years': Minimum years of experience required (extract integer, default to 0).\n"
            "7. 'preferred_degree': Preferred education (e.g. 'Bachelor', 'Master', 'PhD', or empty string).\n\n"
            "Return ONLY a valid JSON object matching this schema. No markdown prose or explanation."
        )

        try:
            response = self.client.chat.completions.create(
                model="gemini-1.5-flash",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Job Description:\n{jd_text[:4000]}"}
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.startswith("```"): raw = raw[3:]
            if raw.endswith("```"): raw = raw[:-3]
            raw = raw.strip()
            parsed = json.loads(raw)
            # Safe parsing ensure fields are present
            parsed.setdefault("required_skills", [])
            parsed.setdefault("preferred_skills", [])
            parsed.setdefault("technologies", [])
            parsed.setdefault("frameworks", [])
            parsed.setdefault("responsibilities", [])
            parsed.setdefault("min_experience_years", 0)
            parsed.setdefault("preferred_degree", "")

            # Step 2: Merge deterministic keywords into LLM results (union)
            llm_techs = set(t.lower().strip() for t in parsed.get("technologies", []))
            llm_frameworks = set(f.lower().strip() for f in parsed.get("frameworks", []))
            all_llm = llm_techs | llm_frameworks
            for kw in deterministic_keywords:
                if kw not in all_llm:
                    # Add to technologies if it's a tech term, otherwise to required_skills
                    if kw in TECH_DICT or kw in DOMAIN_SKILLS_DICT:
                        parsed["technologies"].append(kw)
                    elif kw in SOFT_SKILLS_DICT:
                        if kw not in [s.lower() for s in parsed["required_skills"]]:
                            parsed["required_skills"].append(kw)

            # Cache the result
            _jd_parse_cache[jd_hash] = parsed
            return parsed
        except Exception as e:
            logger.error("JD Parsing agent failed: %s", e)
            # Fallback: use deterministic extraction only
            fallback = {
                "required_skills": [k for k in deterministic_keywords if k in SOFT_SKILLS_DICT],
                "preferred_skills": [],
                "technologies": [k for k in deterministic_keywords if k in TECH_DICT or k in DOMAIN_SKILLS_DICT],
                "frameworks": [],
                "responsibilities": [],
                "min_experience_years": 0,
                "preferred_degree": ""
            }
            _jd_parse_cache[jd_hash] = fallback
            return fallback

    def _calculate_experience_years(self, parsed_data: dict) -> float:
        """Parse work experience dates and calculate total experience years."""
        total_years = 0.0
        experiences = parsed_data.get("experience", []) or []
        for exp in experiences:
            sd = str(exp.get("startDate") or "")
            ed = str(exp.get("endDate") or "")
            s_year = None
            e_year = None
            
            s_match = re.search(r'\b(19|20)\d{2}\b', sd)
            if s_match:
                s_year = int(s_match.group(0))
                
            if not ed or ed.lower() in ["present", "current", "now", "ongoing"]:
                e_year = datetime.now().year
            else:
                e_match = re.search(r'\b(19|20)\d{2}\b', ed)
                if e_match:
                    e_year = int(e_match.group(0))
                    
            if s_year and e_year and e_year >= s_year:
                diff = e_year - s_year
                total_years += max(1.0, float(diff))
            else:
                total_years += 1.0
        return round(total_years, 1)

    def _get_degree_level(self, degree_str: str) -> int:
        """Helper to get a numeric level representing a degree for comparison."""
        deg = str(degree_str).lower()
        if any(x in deg for x in ["phd", "doctorate", "ph.d"]):
            return 4
        if any(x in deg for x in ["master", "ms", "mtech", "m.tech", "mba", "m.s."]):
            return 3
        if any(x in deg for x in ["bachelor", "bs", "btech", "b.tech", "ba", "b.s.", "b.a."]):
            return 2
        if any(x in deg for x in ["associate", "diploma"]):
            return 1
        return 0

    def _check_formatting(self, resume_text: str) -> tuple:
        score = 100
        issues = []
        
        # Strip our own column-aware extraction markers before evaluating
        # (these are parser artifacts, NOT part of the original resume)
        clean_text = re.sub(r'\[(?:LEFT|RIGHT)\s+COLUMN\]', '', resume_text, flags=re.IGNORECASE)
        resume_text = clean_text
            
        # 2. Table dividers check
        pipe_count = resume_text.count("|")
        if pipe_count >= 5:
            score -= 10
            issues.append("Table markers or dividers (|) detected. Table structures often scramble text inside ATS parsers.")
            
        # 3. Creative icons check
        icons = ["✉", "☎", "📞", "📧", "🔗", "🏠", "💼", "💻", "🎓", "🚀", "📱"]
        found_icons = [icon for icon in icons if icon in resume_text]
        if found_icons:
            score -= 10
            issues.append(f"Creative icons ({', '.join(found_icons)}) found. Use clean text labels.")
            
        # 4. Excessive bullet length check
        long_bullets = 0
        for line in resume_text.split("\n"):
            line_stripped = line.strip()
            if (line_stripped.startswith("-") or line_stripped.startswith("▸") or line_stripped.startswith("•")) and len(line_stripped) > 220:
                long_bullets += 1
        if long_bullets >= 2:
            score -= 10
            issues.append("Excessively long bullet points detected (> 220 characters). Keep achievements concise.")
            
        return max(0, score), issues

    def _check_structure(self, resume_text: str, parsed_data: dict) -> tuple:
        score = 100
        issues = []
        
        # 1. Section Header Checks — trust the STRUCTURED parsed data first (it
        # reflects what the resume parser actually recognized as a distinct
        # section). Only fall back to scanning raw text for a line that IS a
        # header. A substring match anywhere in the body text is NOT enough —
        # e.g. "hands-on experience building web platforms" inside a Profile
        # paragraph must never count as an "Experience" section.
        def _has_header_line(keywords):
            for raw_line in resume_text.split("\n"):
                line = raw_line.strip().strip(":-\u2022\u25b8*\u25cf\u25e6").strip().lower()
                if not line or len(line.split()) > 4:
                    continue
                for kw in keywords:
                    if line == kw or re.fullmatch(rf'{re.escape(kw)}s?', line):
                        return True
            return False

        has_experience = bool(parsed_data.get("experience")) or _has_header_line(
            ["experience", "work experience", "work history", "employment", "professional experience"]
        )
        has_education = bool(parsed_data.get("education")) or _has_header_line(
            ["education", "academic background", "academics"]
        )
        has_skills = bool(parsed_data.get("skills")) or _has_header_line(
            ["skills", "technical skills", "technologies", "expertise", "core competencies"]
        )

        if not has_experience:
            score -= 30
            issues.append("No Work Experience / Internship section detected (projects don't count as a substitute). Add internships, freelance, or client work if you have any — a projects-only resume is a weaker signal.")
        if not has_education:
            score -= 20
            issues.append("Education section header not found. Ensure section is clearly labeled.")
        if not has_skills:
            score -= 20
            issues.append("Skills section header not found. Ensure section is clearly labeled.")
            
        # 2. Date Format Consistency Check
        experiences = parsed_data.get("experience", []) or []
        education = parsed_data.get("education", []) or []
        
        all_dates = []
        for exp in experiences:
            if exp.get("startDate"): all_dates.append(exp["startDate"])
            if exp.get("endDate"): all_dates.append(exp["endDate"])
        for edu in education:
            if edu.get("startDate"): all_dates.append(edu["startDate"])
            if edu.get("endDate"): all_dates.append(edu["endDate"])
            
        pattern_month_year = re.compile(r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}$', re.IGNORECASE)
        pattern_numeric = re.compile(r'^\d{1,2}/\d{2,4}$', re.IGNORECASE)
        pattern_present = re.compile(r'^(Present|Current|Ongoing)$', re.IGNORECASE)
        pattern_year_only = re.compile(r'^\d{4}$', re.IGNORECASE)
        
        inconsistent_dates = 0
        for date_str in all_dates:
            date_str = str(date_str).strip()
            if not date_str:
                continue
            matched = (pattern_month_year.match(date_str) or 
                       pattern_numeric.match(date_str) or 
                       pattern_present.match(date_str) or 
                       pattern_year_only.match(date_str))
            if not matched:
                inconsistent_dates += 1
                
        if inconsistent_dates > 0:
            score -= 15
            issues.append("Inconsistent date formats found. Standardize on 'Month YYYY' (e.g. 'Jul 2024') or 'MM/YYYY'.")
            
        return max(0, score), issues

    def _check_spelling_and_grammar(self, resume_text: str, parsed_data: dict) -> tuple:
        score = 100
        spelling_issues = []
        grammar_issues = []
        
        # Local SpellChecker
        try:
            from spellchecker import SpellChecker
            spell = SpellChecker()
            
            skills = parsed_data.get("skills", []) or []
            personal = parsed_data.get("personalInfo", {}) or {}
            name = personal.get("fullName", "") or parsed_data.get("fullName", "")
            title = personal.get("title", "") or parsed_data.get("title", "")
            
            whitelist = {
                "fastapi", "react", "threejs", "cloudinary", "render", "gunicorn", "eventlet",
                "playwright", "skillverse", "studyverse", "testverse", "github", "linkedin",
                "sqlite", "mongodb", "oauth", "socketio", "pomodoro", "freelance", "saas",
                "hud", "jdbc", "mysql", "frontend", "backend", "fullstack", "devops", "kubernetes",
                "docker", "api", "apis", "jwt", "xlsx", "csv", "sql", "plsql", "subagent",
                "subagents", "py", "js", "html", "css", "java", "cpp", "cplusplus", "nodejs", 
                "freelancer", "postgresql", "aws", "gcp", "azure", "vite", "miteshbhai",
                "parmar", "yuvraj", "fiverr", "git", "servlets", "jakarta", "ee", "vsh", "auth",
                "tech", "gmail", "app", "admin", "https", "multi", "http", "www", "com", "net", 
                "org", "edu", "slug", "freelance", "deployed", "implemented", "managed", 
                "created", "designed", "assisted", "improved", "integrated", "optimized", "led",
                "gamification", "opentelemetry", "jenkins", "tailwind", "tailwindcss", "gitlab", 
                "ci", "cd", "cicd", "promql", "jaeger", "dockerfile", "microservices", "microservice",
                "bitbucket", "terraform", "k8s", "helm", "orchestrated", "streamlined", "configured", 
                "refactored", "containerized", "monitored", "automated", "provisioned", "redhat",
                "centos", "debian", "ubuntu", "linux", "graphql", "restful", "apis", "sdk", "sdks",
                "spearheaded", "engineered"
            }
            
            for s in skills:
                for word in re.findall(r'\b[a-zA-Z]+\b', str(s)):
                    whitelist.add(word.lower())
            for word in re.findall(r'\b[a-zA-Z]+\b', name):
                whitelist.add(word.lower())
            for word in re.findall(r'\b[a-zA-Z]+\b', title):
                whitelist.add(word.lower())
                
            words = re.findall(r'\b[a-zA-Z]{3,22}\b', resume_text)
            candidates = set()
            for w in words:
                if any(c.isupper() for c in w[1:]):
                    continue
                w_lower = w.lower()
                if w_lower in whitelist:
                    continue
                candidates.add(w)
                
            misspelled = spell.unknown(list(candidates))
            for m in misspelled:
                if m.lower() not in whitelist:
                    spelling_issues.append(m)
                    
        except Exception as e:
            logger.error("Spellchecker execution failed: %s", e)
            
        # Capitalization and trailing punctuation
        lowercase_starts = 0
        double_spaces = 0
        for line in resume_text.split("\n"):
            line = line.strip()
            if not line:
                continue
            if "  " in line:
                double_spaces += 1
            if line.startswith("-") or line.startswith("▸") or line.startswith("•"):
                content = re.sub(r'^[-▸•]\s*', '', line).strip()
                if content and content[0].islower():
                    lowercase_starts += 1
                    
        if double_spaces > 0:
            grammar_issues.append("Double spaces detected. Ensure clean, single spacing throughout.")
        if lowercase_starts > 0:
            grammar_issues.append("Capitalization: Bullet points should start with a capital letter.")
            
        total_penalties = len(spelling_issues) * 4 + len(grammar_issues) * 5
        score -= total_penalties
        
        issues = []
        if spelling_issues:
            issues.append(f"Spelling issues found: {', '.join(spelling_issues[:6])}")
        for g in grammar_issues[:4]:
            issues.append(f"Grammar/Style: {g}")
            
        return max(0, score), issues

    # ==========================================================================
    # GENERAL (NO-JD) ATS CHECKLIST — 12 categories, weights sum to 100
    # ==========================================================================

    def _get_all_bullets(self, parsed_data: dict) -> list:
        """Collects every experience + project bullet/description for content-level checks."""
        bullets = []
        for exp in parsed_data.get("experience", []) or []:
            b = exp.get("bullets") or exp.get("responsibilities") or []
            if isinstance(b, list):
                bullets.extend([str(x).strip() for x in b if str(x).strip()])
            elif isinstance(b, str) and b.strip():
                bullets.append(b.strip())
        for proj in parsed_data.get("projects", []) or []:
            b = proj.get("bullets") or proj.get("responsibilities") or []
            if isinstance(b, list):
                bullets.extend([str(x).strip() for x in b if str(x).strip()])
            elif isinstance(b, str) and b.strip():
                bullets.append(b.strip())
            desc = proj.get("description") or ""
            if desc and desc.strip():
                bullets.append(desc.strip())
        return bullets

    def _check_contact_info(self, parsed_data: dict, resume_text: str) -> tuple:
        """5%: Name, valid email, valid phone, LinkedIn/GitHub presence."""
        score = 100
        issues = []
        personal = parsed_data.get("personalInfo", {}) or {}
        name = personal.get("fullName") or parsed_data.get("fullName") or ""
        email = personal.get("email") or parsed_data.get("email") or ""
        phone = personal.get("phone") or parsed_data.get("phone") or ""
        linkedin = personal.get("linkedin") or parsed_data.get("linkedin") or ""
        github = personal.get("github") or parsed_data.get("github") or ""
        text_lower = (resume_text or "").lower()

        if not str(name).strip():
            score -= 35
            issues.append("Full name not detected. Make sure your name is clearly visible at the top of the resume.")

        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not email or not email_pattern.match(str(email).strip()):
            score -= 30
            issues.append("Valid email address not found. Add a professional email address.")

        phone_digits = re.sub(r'[^0-9]', '', str(phone) or "")
        if not phone or len(phone_digits) < 10:
            score -= 20
            issues.append("Valid phone number not found. Include a reachable 10+ digit contact number.")

        if not linkedin and not github and "linkedin.com" not in text_lower and "github.com" not in text_lower:
            score -= 15
            issues.append("No LinkedIn or GitHub link found. Adding one is recommended for stronger credibility.")

        return max(0, score), issues

    def _check_content_quality(self, parsed_data: dict) -> tuple:
        """15%: Vague phrasing, bullet depth, and presence of a professional summary."""
        bullets = self._get_all_bullets(parsed_data)
        if not bullets:
            return 25, ["No experience/project bullet points detected to evaluate content quality."]

        score = 100
        issues = []

        # Content Depth check
        if len(bullets) < 4:
            score -= 35
            issues.append(f"Only {len(bullets)} bullet point(s) total across all entries. Strong resumes have 8-15 achievement-focused bullets.")
        elif len(bullets) < 7:
            score -= 15
            issues.append(f"Only {len(bullets)} bullet points total — add more detail to your work experience and projects.")

        weak_count = sum(1 for b in bullets if any(p in b.lower() for p in WEAK_PHRASES))
        short_count = sum(1 for b in bullets if len(b.split()) < 6)

        weak_ratio = weak_count / len(bullets)
        short_ratio = short_count / len(bullets)

        if weak_count > 0:
            score -= min(40, round(weak_ratio * 100))
            issues.append(f"{weak_count} bullet(s) use vague phrasing like 'responsible for' or 'worked on'. Rewrite as action + result.")

        if short_ratio > 0.3:
            score -= 20
            issues.append("Several bullet points are too short to show real impact. Expand with what you did, how, and the outcome.")

        summary = parsed_data.get("summary") or parsed_data.get("professional_summary") or ""
        if not str(summary).strip():
            score -= 10
            issues.append("No professional summary found. A 2-3 line summary helps both ATS parsers and recruiters quickly grasp your profile.")

        return max(0, score), issues

    def _check_quantified_achievements(self, parsed_data: dict) -> tuple:
        """10%: Share of bullets carrying a measurable metric (%, $, counts, time)."""
        bullets = self._get_all_bullets(parsed_data)
        if not bullets or len(bullets) < 2:
            return 20, ["Too few bullet points to evaluate quantified impact."]

        metric_pattern = re.compile(
            r'(\d+(\.\d+)?\s?(%|percent|x|k\+|k\b|m\+|hours?|days?|months?|years?|users?|customers?|ms|s|sec))|(\$\s?\d)',
            re.IGNORECASE
        )
        quantified = 0
        for b in bullets:
            if metric_pattern.search(b):
                quantified += 1
            elif re.search(r'\b\d+\b', b):
                quantified += 0.4

        ratio = quantified / len(bullets)
        if quantified == 0:
            score = 30
            issues = ["No metrics or quantified numbers found in bullet points. Add percentages, user scale, speedups, or dollar figures."]
        elif quantified == 1:
            score = 55
            issues = ["Only 1 bullet contains measurable metrics. Aim to quantify at least 40-50% of your achievements."]
        else:
            score = round(min(100, max(50, ratio * 110)))
            issues = []
            if ratio < 0.35:
                issues.append("Very few bullets include measurable results. Quantify impact wherever possible, e.g. 'reduced load time by 40%'.")

        return score, issues

    def _check_action_verbs(self, parsed_data: dict) -> tuple:
        """4%: Bullets should start with a strong, varied action verb."""
        bullets = self._get_all_bullets(parsed_data)
        if not bullets:
            return 30, ["No bullet points found to evaluate action verb usage."]

        strong_start = 0
        weak_start = 0
        used_verbs = []
        for b in bullets:
            words = re.findall(r"[A-Za-z']+", b)
            if not words:
                continue
            first = words[0].lower()
            if first in STRONG_ACTION_VERBS:
                strong_start += 1
                used_verbs.append(first)
            elif first in WEAK_START_VERBS:
                weak_start += 1

        ratio = strong_start / len(bullets)
        score = round(min(100, ratio * 100))
        issues = []
        if weak_start > 0:
            issues.append(f"{weak_start} bullet(s) start with weak phrasing (e.g. 'Responsible for', 'Helped', 'Worked on'). Lead with a strong verb like 'Led', 'Built', or 'Optimized'.")
        repeated = [v for v, c in Counter(used_verbs).items() if c > 2]
        if repeated:
            score -= 10
            issues.append(f"Verb repetition detected ({', '.join(repeated[:3])} used too often). Vary action verbs across bullets.")
        if ratio < 0.5 and not issues:
            issues.append("Most bullets don't open with a strong action verb. Start each one with an active, specific verb.")
        return max(0, score), issues

    def _check_bullet_consistency(self, parsed_data: dict) -> tuple:
        """3%: Punctuation, tense, and length consistency across bullets."""
        bullets = self._get_all_bullets(parsed_data)
        if len(bullets) < 2:
            return 100, []

        score = 100
        issues = []

        ends_period = sum(1 for b in bullets if b.strip().endswith("."))
        if 0 < ends_period < len(bullets):
            score -= 15
            issues.append("Inconsistent bullet punctuation — some end with a period, others don't. Pick one style and use it everywhere.")

        past_tense = present_tense = 0
        for b in bullets:
            words = re.findall(r"[A-Za-z']+", b)
            if not words:
                continue
            first = words[0].lower()
            if first.endswith("ed"):
                past_tense += 1
            elif first.endswith("ing") or (first.endswith("s") and first not in STRONG_ACTION_VERBS):
                present_tense += 1
        if past_tense > 0 and present_tense > 0 and min(past_tense, present_tense) / len(bullets) > 0.15:
            score -= 15
            issues.append("Mixed verb tense across bullets. Use past tense for previous roles; present tense only for your current, ongoing role.")

        lengths = [len(b) for b in bullets]
        avg_len = sum(lengths) / len(lengths)
        very_short = sum(1 for l in lengths if l < avg_len * 0.35)
        if very_short > len(bullets) * 0.2:
            score -= 10
            issues.append("Bullet lengths vary a lot — some are much shorter than others. Aim for a consistent 1-2 line length.")

        return max(0, score), issues

    def _check_general_keywords(self, resume_text: str, parsed_data: dict) -> tuple:
        """Evaluates domain-agnostic keyword richness and skill density across any industry/role."""
        skills = parsed_data.get("skills", []) or []
        skills_declared = len(skills)

        # Collect all unique multi-character tokens from skills and text
        extracted_tokens = set()
        for s in skills:
            if isinstance(s, dict):
                val = s.get("name") or s.get("skill") or str(s)
            else:
                val = str(s)
            for token in re.findall(r'\b[a-zA-Z0-9+#.-]{2,30}\b', val.lower()):
                extracted_tokens.add(token)

        for exp in parsed_data.get("experience", []) or []:
            title = exp.get("title", "") or exp.get("role", "")
            for token in re.findall(r'\b[a-zA-Z]{3,20}\b', title.lower()):
                extracted_tokens.add(token)

        found_techs = [k for k in self._extract_keywords_deterministic(resume_text) if k in TECH_DICT or k in DOMAIN_SKILLS_DICT]

        skill_density_score = min(100, (skills_declared / 8) * 100)
        token_richness_score = min(100, (len(extracted_tokens) / 10) * 100)
        tech_variety_score = min(100, max(60, (len(found_techs) / 5) * 100)) if found_techs else 80

        score = round(0.50 * skill_density_score + 0.30 * token_richness_score + 0.20 * tech_variety_score)
        score = max(40, min(100, score))

        issues = []
        if skills_declared < 5:
            issues.append("Skills section looks sparse. List more specific industry tools and competencies.")
        if len(extracted_tokens) < 8:
            issues.append("Low density of specialized keywords. Mention specific tools, methodologies, and platforms.")

        matched_display = [str(s.get("name") if isinstance(s, dict) else s) for s in skills if s]
        return score, issues, matched_display[:15]

    def _check_readability_formatting(self, resume_text: str) -> tuple:
        """4%: Bullet symbol consistency, spacing, and overall length."""
        score = 100
        issues = []
        lines = resume_text.split("\n")

        bullet_symbols = set()
        for line in lines:
            s = line.strip()
            if s[:1] in ("-", "•", "▸", "*", "●", "◦"):
                bullet_symbols.add(s[0])
        if len(bullet_symbols) > 1:
            score -= 20
            issues.append(f"Multiple bullet symbols used ({', '.join(bullet_symbols)}). Stick to one bullet style throughout.")

        blank_run = max_blank_run = 0
        for line in lines:
            if not line.strip():
                blank_run += 1
                max_blank_run = max(max_blank_run, blank_run)
            else:
                blank_run = 0
        if max_blank_run > 2:
            score -= 10
            issues.append("Large gaps of blank space detected. Keep spacing between sections compact and consistent.")

        word_count = len(resume_text.split())
        if word_count > 1100:
            score -= 15
            issues.append("Content looks lengthy (likely 2+ pages). Aim for 1 page as a fresher, up to 2 pages max with more experience.")
        elif word_count < 150:
            score -= 15
            issues.append("Content looks very sparse. Add more detail to experience, projects, and skills sections.")

        return max(0, score), issues

    def _check_certifications(self, parsed_data: dict, resume_text: str) -> tuple:
        """5%: Are certifications actually named on the resume, or just linked out to
        an external profile? A link-only line is invisible to ATS parsers."""
        certs = parsed_data.get("certifications", []) or []

        def _cert_name(c):
            if isinstance(c, dict):
                return str(c.get("name") or c.get("title") or "").strip()
            return str(c).strip()

        named_certs = [n for n in (_cert_name(c) for c in certs) if n]

        link_only_pattern = re.compile(
            r'(view (all )?certifications on linkedin|see certifications on linkedin|certifications?\s*:?\s*(https?://|www\.))',
            re.IGNORECASE
        )
        is_link_only = bool(link_only_pattern.search(resume_text or "")) and not named_certs

        if is_link_only:
            return 20, ["Certifications section only links out to LinkedIn instead of naming actual certificates. ATS parsers cannot follow links, so this reads as zero certifications to automated screening — list 3-4 certificate names directly on the resume."]

        if not named_certs:
            return 40, ["No certifications section found. Optional, but 2-3 relevant certifications add keyword density and credibility."]

        score = min(100, 60 + len(named_certs) * 15)
        issues = []
        if len(named_certs) < 2:
            issues.append("Only one certification listed — adding 1-2 more relevant ones strengthens this section.")
        return score, issues

    def _check_professional_tone(self, resume_text: str, parsed_data: dict, cand_years: float) -> tuple:
        """15%: Flags unrealistic self-projected claims, seniority-mismatched language,
        and templated cross-bullet repetition — the category pure keyword/format
        checkers miss entirely but is usually the biggest driver of a human recruiter
        scoring a resume lower than an "everything parses cleanly" tool would."""
        text_lower = (resume_text or "").lower()
        score = 100
        issues = []

        bullets = self._get_all_bullets(parsed_data)
        if len(bullets) < 3:
            score -= 30
            issues.append("Resume narrative is too brief to demonstrate professional tone or depth.")

        claim_hits = []
        for pattern in UNREALISTIC_CLAIM_PATTERNS:
            m = re.search(pattern, text_lower)
            if m:
                claim_hits.append(m.group(0))
        if claim_hits:
            score -= 35
            issues.append("Resume states specific salary/CTC targets or exam-rank goals. Keep career goals qualitative and role-focused.")

        buzzword_hits = [b for b in SENIORITY_BUZZWORDS if b in text_lower]
        is_junior = cand_years < 2
        if buzzword_hits and is_junior:
            score -= 25
            issues.append(f"Language like \"{buzzword_hits[0]}\" reads as a seniority mismatch against an early-career profile.")
        elif buzzword_hits:
            score -= 10
            issues.append("Self-promotional superlatives detected — prefer concrete, quantified achievements over subjective claims.")

        for verb in ASPIRATION_VERBS:
            if verb in text_lower:
                hit_company = next((c for c in ELITE_COMPANIES if c in text_lower), None)
                if hit_company:
                    score -= 10
                    issues.append(f"Naming a specific target company (\"{hit_company.title()}\") in career objectives reads as presumptuous.")
                break

        if bullets:
            label_prefixes = Counter()
            for b in bullets:
                m = re.match(r'^\s*([A-Za-z][A-Za-z\s]{0,15}):', b)
                if m:
                    label_prefixes[m.group(1).strip().lower()] += 1
            repeated_labels = [(lbl, c) for lbl, c in label_prefixes.items() if c >= 3]
            if repeated_labels:
                lbl, c = repeated_labels[0]
                score -= 15
                issues.append(f"The label \"{lbl.title()}:\" is reused as a bullet opener {c} times across projects.")

            dupe_bullets = [b for b, c in Counter(b.strip().lower() for b in bullets).items() if c > 1]
            if dupe_bullets:
                score -= 10
                issues.append("Identical bullet text reused across more than one entry — every bullet should say something new.")

        return max(0, score), issues

    def _build_general_ats_report(self, resume_text: str, parsed_data: dict, fmt_score: int, fmt_issues: list,
                                   cand_years: float, parsed_projects: list, proj_titles: list, candidate_skills: list) -> dict:
        """Builds the full report for the General (No-JD) ATS checklist using calibrated weights."""

        # 1. Keyword Match (30%)
        keyword_score, keyword_issues, tech_found = self._check_general_keywords(resume_text, parsed_data)
        
        # 2. Skills Match (15%)
        skills_score = min(100, 40 + len(candidate_skills) * 4.5)
        
        # 3. Experience Relevance (20% - dynamically shifted with Projects)
        if cand_years < 2.0:
            proj_weight = 0.15
            exp_weight = 0.10
        elif cand_years >= 5.0:
            proj_weight = 0.03
            exp_weight = 0.27
        else:
            ratio = (cand_years - 2.0) / 3.0
            proj_weight = 0.15 - ratio * 0.12
            exp_weight = 0.10 + ratio * 0.17

        exp_score = min(100, 50 + int(cand_years * 10))

        # 4. Achievement & Impact (10%)
        verbs_score, verbs_issues = self._check_action_verbs(parsed_data)
        quant_score, quant_issues = self._check_quantified_achievements(parsed_data)
        achievement_impact_score = round(0.4 * verbs_score + 0.6 * quant_score)

        # 5. Project Relevance (10% - dynamically shifted)
        has_experience = bool(parsed_data.get("experience", []))
        if not parsed_projects:
            if cand_years >= 1.0 or has_experience:
                exp_weight += proj_weight
                proj_weight = 0.0
                project_score = exp_score
                proj_details = "N/A — Experienced candidate profile relies on professional work history."
            else:
                project_score = 0.0
                proj_details = "No projects listed on candidate's resume."
        else:
            project_score = min(100, 50 + len(parsed_projects) * 15)
            proj_details = f"Found {len(parsed_projects)} project(s)."

        # 6. ATS Formatting (10%)
        structure_score, structure_issues = self._check_structure(resume_text, parsed_data)
        readability_score, readability_issues = self._check_readability_formatting(resume_text)

        # 7. Job Title & Summary Match (5%)
        headline = parsed_data.get("personalInfo", {}).get("title", "") or parsed_data.get("title", "")
        summary = parsed_data.get("summary", "") or parsed_data.get("professional_summary", "")
        if headline and summary:
            job_title_match_score = 100
        elif headline or summary:
            job_title_match_score = 70
        else:
            job_title_match_score = 30

        # Calculate Overall Score
        overall_score = round(
            keyword_score * 0.30 +
            skills_score * 0.15 +
            exp_score * exp_weight +
            project_score * proj_weight +
            achievement_impact_score * 0.10 +
            fmt_score * 0.10 +
            job_title_match_score * 0.05
        )

        word_count = len((resume_text or "").split())
        if word_count < 180:
            overall_score = round(overall_score * 0.70)
        elif word_count < 320:
            overall_score = round(overall_score * 0.85)

        overall_score = max(5, min(overall_score, 100))

        # Quality Checks (Badges)
        grammar_score, grammar_issues = self._check_spelling_and_grammar(resume_text, parsed_data)
        contact_score, contact_issues = self._check_contact_info(parsed_data, resume_text)
        
        quality_checks = {
            "ats_parseability": fmt_score >= 80,
            "contact_info": contact_score >= 80,
            "grammar": grammar_score >= 80,
            "education_met": True,
            "resume_structure": structure_score >= 80,
            "file_format": True,
            "readability": readability_score >= 80
        }

        # Strengths & Weaknesses
        strengths = []
        weaknesses = []
        if keyword_score >= 80:
            strengths.append("Strong technical keyword presence across experience and skills.")
        else:
            weaknesses.append("Resume could benefit from more specific technical and domain terms.")

        if achievement_impact_score >= 80:
            strengths.append("Excellent use of quantified metrics and action verbs.")
        else:
            weaknesses.append("Add measurable percentages, scale, or metrics to highlight job impact.")

        if fmt_score >= 85:
            strengths.append("Professional formatting layout that parses easily.")
        else:
            weaknesses.append("Formatting layout warnings detected (avoid tables/dividers, icons).")

        # Suggestions
        top_suggestions = []
        if keyword_score < 75:
            top_suggestions.append("Enrich technical skills section with baseline industry keywords.")
        if achievement_impact_score < 75:
            top_suggestions.append("Vary action verbs and quantify at least 40% of achievements.")
        if fmt_score < 80:
            top_suggestions.append("Ensure clean typography, single-spacing, and no text tables.")

        if not top_suggestions:
            top_suggestions.append("Your resume structure is well optimized! Upload a target Job Description to check match score.")

        explanations = [
            f"Keyword Match (30.0% weight): Scored {keyword_score}%. Evaluates density of relevant technical and domain-specific keywords.",
            f"Skills Match (15.0% weight): Scored {skills_score}%. Assesses the volume and alignment of technical skills listed.",
            f"Experience Relevance ({round(exp_weight * 100, 1)}% weight): Scored {exp_score}%. Evaluates depth and years of experience.",
            f"Project Relevance ({round(proj_weight * 100, 1)}% weight): Scored {project_score}%. {proj_details}",
            f"Achievement & Impact (10.0% weight): Scored {achievement_impact_score}%. Evaluates use of strong action verbs and quantified metrics.",
            f"ATS Formatting (10.0% weight): Scored {fmt_score}%. Checks parseability, standard headings, and layout hazards.",
            f"Job Title & Summary Match (5.0% weight): Scored {job_title_match_score}%. Validates headline and professional summary presence."
        ]

        report = {
            "overallScore": overall_score,
            "strengths": strengths[:4] or ["Resume parses cleanly with no major structural issues."],
            "weaknesses": weaknesses[:4],
            "topSuggestions": top_suggestions[:4],
            "computedAt": datetime.now(timezone.utc).isoformat() + "Z",
            "_jd_requirements": None,
            "mode": "general_ats",
            "explanations": explanations,
            "top_missing_keywords": [],

            "quality_checks": quality_checks,

            "detailed_breakdown": {
                "keyword_match": {"score": keyword_score, "matched": tech_found[:12], "missing": []},
                "skills_match": {"score": skills_score, "matched": candidate_skills[:12], "missing": []},
                "experience_relevance": {"score": exp_score, "details": "Evaluated based on tenure and descriptions."},
                "achievement_impact": {
                    "score": achievement_impact_score,
                    "action_verbs_score": verbs_score,
                    "quantified_score": quant_score
                },
                "project_relevance": {"score": project_score, "details": proj_details},
                "ats_formatting": {"score": fmt_score, "issues": fmt_issues},
                "job_title_match": {"score": job_title_match_score, "details": "Based on headline & summary presence."}
            },

            "breakdown": {
                "formatting": {"score": fmt_score, "issues": fmt_issues},
                "structure": {"score": structure_score, "issues": structure_issues},
                "keywords": {"score": keyword_score, "missingKeywords": [], "matchedKeywords": tech_found[:15]},
                "content": {"score": round((exp_score + project_score) / 2), "weakBullets": grammar_issues},
                "integrity": {"score": contact_score, "flags": contact_issues}
            }
        }
        return report

    def analyze(self, resume_text: str, parsed_data: dict, target_job_description: str = None, jd_requirements: dict = None) -> dict:
        if not resume_text:
            lines = []
            personal = parsed_data.get("personalInfo", {}) or {}
            name = personal.get("fullName", "") or parsed_data.get("fullName", "")
            title = personal.get("title", "") or parsed_data.get("title", "")
            email = personal.get("email", "") or parsed_data.get("email", "")
            phone = personal.get("phone", "") or parsed_data.get("phone", "")
            location = personal.get("location", "") or parsed_data.get("location", "")
            summary = parsed_data.get("summary", "") or parsed_data.get("professional_summary", "")
            
            if name: lines.append(f"Name: {name}")
            if title: lines.append(f"Title: {title}")
            if email or phone or location:
                lines.append(f"Contact: {email} | {phone} | {location}")
            if summary:
                lines.append(f"Summary: {summary}")
            
            skills_raw = parsed_data.get("skills", [])
            skills = []
            for s in skills_raw:
                if isinstance(s, dict):
                    val = s.get("name") or s.get("skill") or s.get("fullName") or s.get("title") or str(s)
                    skills.append(str(val))
                elif s:
                    skills.append(str(s))
            if skills:
                lines.append("Skills: " + ", ".join(skills))
                
            lines.append("\nWork Experience:")
            for exp in parsed_data.get("experience", []):
                company = exp.get("company", "")
                role = exp.get("title", "") or exp.get("role", "")
                start = exp.get("startDate", "") or exp.get("start_date", "")
                end = exp.get("endDate", "") or exp.get("end_date", "")
                bullets = "\n".join(f"- {b}" for b in exp.get("bullets", []) if b)
                lines.append(f"{role} at {company} ({start} - {end})\n{bullets}")
                
            lines.append("\nEducation:")
            for edu in parsed_data.get("education", []):
                inst = edu.get("school", "") or edu.get("institution", "")
                deg = edu.get("degree", "")
                start = edu.get("startDate", "") or edu.get("start_date", "")
                end = edu.get("endDate", "") or edu.get("end_date", "")
                lines.append(f"{deg} from {inst} ({start} - {end})")
                
            lines.append("\nProjects:")
            for proj in parsed_data.get("projects", []):
                pname = proj.get("name", "") or proj.get("title", "")
                link = proj.get("link", "") or proj.get("url", "")
                pbullets = proj.get("bullets", [])
                if isinstance(pbullets, list) and pbullets:
                    pbullets_str = "\n".join(f"- {b}" for b in pbullets if b)
                    lines.append(f"Project: {pname} ({link})\n{pbullets_str}")
                else:
                    desc = proj.get("description", "")
                    lines.append(f"Project: {pname} ({link}): {desc}")
                
            resume_text = "\n".join(lines)

        resume_text_lower = resume_text.lower()
        model = get_embedding_model()
        
        fmt_score, fmt_issues = self._check_formatting(resume_text)
        cand_years = self._calculate_experience_years(parsed_data)
        
        candidate_skills = []
        for s in parsed_data.get("skills", []):
            if isinstance(s, dict):
                val = s.get("name") or s.get("skill") or s.get("fullName") or str(s)
                candidate_skills.append(str(val).lower().strip())
            elif s:
                candidate_skills.append(str(s).lower().strip())
        candidate_skills = list(set(candidate_skills))
        
        parsed_projects = parsed_data.get("projects", []) or []
        proj_titles = [proj.get("name") or proj.get("title") or "" for proj in parsed_projects]
        proj_titles = [t for t in proj_titles if t]
        
        if not target_job_description or not target_job_description.strip():
            return self._build_general_ats_report(
                resume_text, parsed_data, fmt_score, fmt_issues, cand_years,
                parsed_projects, proj_titles, candidate_skills
            )

        jd_req = jd_requirements if jd_requirements else self._extract_jd_requirements(target_job_description)
        
        # --- 1. Keyword Match (30%) ---
        target_keywords = list(set(k.lower().strip() for k in (jd_req.get("technologies", []) + jd_req.get("frameworks", [])) if k))
        if not target_keywords:
            jd_words = re.findall(r'\b[a-zA-Z]{3,18}\b', target_job_description.lower())
            target_keywords = list(set(w for w in jd_words if w in TECH_DICT))
            
        matched_keywords = []
        missing_keywords = []
        
        if target_keywords:
            sim_matrix_kw = None
            if model and candidate_skills:
                try:
                    kw_embs = model.encode(target_keywords, convert_to_numpy=True)
                    cand_embs = model.encode(candidate_skills, convert_to_numpy=True)
                    kw_embs = kw_embs / (np.linalg.norm(kw_embs, axis=1, keepdims=True) + 1e-8)
                    cand_embs = cand_embs / (np.linalg.norm(cand_embs, axis=1, keepdims=True) + 1e-8)
                    sim_matrix_kw = np.dot(kw_embs, cand_embs.T)
                except Exception:
                    pass
            
            for i, kw in enumerate(target_keywords):
                pattern = rf"\b{re.escape(kw)}\b"
                if re.search(pattern, resume_text_lower):
                    matched_keywords.append(kw)
                elif sim_matrix_kw is not None and candidate_skills:
                    max_sim = float(np.max(sim_matrix_kw[i]))
                    if max_sim > 0.82:
                        matched_keywords.append(kw)
                    else:
                        missing_keywords.append(kw)
                else:
                    missing_keywords.append(kw)
            keyword_match_score = int((len(matched_keywords) / len(target_keywords)) * 100) if target_keywords else 80
        else:
            resume_tech_count = len([w for w in re.findall(r'\b[a-zA-Z]{2,18}\b', resume_text_lower) if w in TECH_DICT])
            keyword_match_score = min(85, 50 + resume_tech_count * 3)

        # --- 2. Skills Match (15%) ---
        jd_skills = list(set(s.lower().strip() for s in (jd_req.get("required_skills", []) + jd_req.get("preferred_skills", [])) if s))
        matched_skills = []
        missing_skills = []
        
        if jd_skills:
            if candidate_skills and model:
                try:
                    jd_embs = model.encode(jd_skills, convert_to_numpy=True)
                    cand_embs = model.encode(candidate_skills, convert_to_numpy=True)
                    jd_embs = jd_embs / (np.linalg.norm(jd_embs, axis=1, keepdims=True) + 1e-8)
                    cand_embs = cand_embs / (np.linalg.norm(cand_embs, axis=1, keepdims=True) + 1e-8)
                    sim_matrix_sk = np.dot(jd_embs, cand_embs.T)
                    for i, s in enumerate(jd_skills):
                        max_sim = float(np.max(sim_matrix_sk[i]))
                        if s in candidate_skills or max_sim > 0.82:
                            matched_skills.append(s)
                        else:
                            missing_skills.append(s)
                except Exception:
                    for s in jd_skills:
                        if any(s in cs or cs in s for cs in candidate_skills):
                            matched_skills.append(s)
                        else:
                            missing_skills.append(s)
            else:
                for s in jd_skills:
                    if any(s in cs or cs in s for cs in candidate_skills):
                        matched_skills.append(s)
                    else:
                        missing_skills.append(s)
            skills_match_score = int((len(matched_skills) / len(jd_skills)) * 100) if jd_skills else 80
        else:
            skills_match_score = min(85, 40 + len(candidate_skills) * 4)

        # --- 3. Experience Relevance (20% - dynamically shifted with Projects) ---
        req_years = int(jd_req.get("min_experience_years", 0))
        if req_years <= 0:
            years_score = 100
        else:
            years_score = min(100.0, (cand_years / req_years) * 100.0)
            
        jd_responsibilities = [r.strip() for r in jd_req.get("responsibilities", []) if r.strip()]
        if not jd_responsibilities and target_job_description:
            jd_responsibilities = [line.strip() for line in target_job_description.split("\n") if line.strip() and len(line.strip()) > 35][:12]
            
        cand_bullets = []
        for exp in parsed_data.get("experience", []):
            bullets = exp.get("bullets", []) or exp.get("responsibilities", []) or []
            if isinstance(bullets, list):
                cand_bullets.extend([b.strip() for b in bullets if b.strip()])
            elif isinstance(bullets, str) and bullets.strip():
                cand_bullets.append(bullets.strip())
                
        if not jd_responsibilities or not cand_bullets:
            semantic_exp_score = 70.0
            exp_details = "Default experience relevance profile applied (no responsibilities or candidate experience bullets found)."
        else:
            mean_sim, _ = compute_semantic_similarity(jd_responsibilities, cand_bullets)
            semantic_exp_score = min(100.0, max(0.0, (mean_sim - 0.25) / 0.5 * 100.0))
            semantic_exp_score = round(semantic_exp_score)
            exp_details = f"Experience bullets exhibit {round(mean_sim*100, 1)}% semantic similarity with JD responsibilities."
            
        experience_relevance_score = round(0.4 * years_score + 0.6 * semantic_exp_score)

        # --- 4. Achievement & Impact (10%) ---
        verbs_score, verbs_issues = self._check_action_verbs(parsed_data)
        quant_score, quant_issues = self._check_quantified_achievements(parsed_data)
        achievement_impact_score = round(0.4 * verbs_score + 0.6 * quant_score)

        # --- 5. Project Relevance (10% - dynamically shifted) ---
        if cand_years < 2.0:
            proj_weight = 0.15
            exp_weight = 0.10
        elif cand_years >= 5.0:
            proj_weight = 0.03
            exp_weight = 0.27
        else:
            ratio = (cand_years - 2.0) / 3.0
            proj_weight = 0.15 - ratio * 0.12
            exp_weight = 0.10 + ratio * 0.17

        has_experience = bool(parsed_data.get("experience", []))
        if not parsed_projects:
            if cand_years >= 1.0 or has_experience:
                exp_weight += proj_weight
                proj_weight = 0.0
                project_relevance_score = experience_relevance_score
                proj_details = "N/A — Experienced candidate profile relies on professional work history."
            else:
                project_relevance_score = 0.0
                proj_details = "No projects listed on candidate's resume."
            jd_techs_all = []
            matched_techs = []
        else:
            all_project_techs = set()
            proj_descriptions_bullets = []
            for proj in parsed_projects:
                pname = proj.get("name") or proj.get("title") or ""
                pdesc = proj.get("description") or ""
                pbullets = proj.get("bullets") or proj.get("responsibilities") or []
                if isinstance(pbullets, list):
                    proj_descriptions_bullets.extend([str(b) for b in pbullets if b])
                elif isinstance(pbullets, str) and pbullets.strip():
                    proj_descriptions_bullets.append(pbullets.strip())
                ptags = proj.get("techStack") or proj.get("tech_stack") or proj.get("technologies") or []
                if isinstance(ptags, str):
                    ptags = [ptags]
                for tag in ptags:
                    all_project_techs.update(self._extract_techs_from_text(str(tag)))
                all_project_techs.update(self._extract_techs_from_text(pname))
                all_project_techs.update(self._extract_techs_from_text(pdesc))

            proj_combined_parts = []
            for proj in parsed_projects:
                pname = proj.get("name") or proj.get("title") or ""
                pdesc = proj.get("description") or ""
                ptags = ", ".join(str(t) for t in (proj.get("techStack") or proj.get("tech_stack") or proj.get("technologies") or []) if t)
                pbullets = " ".join(str(b) for b in (proj.get("bullets") or proj.get("responsibilities") or []) if b)
                proj_combined_parts.append(f"{pname} {pdesc} {ptags} {pbullets}")
            combined_project_text = " ".join(proj_combined_parts).strip()
            
            if model and combined_project_text and target_job_description:
                try:
                    proj_emb = model.encode([combined_project_text], convert_to_numpy=True)
                    jd_emb = model.encode([target_job_description], convert_to_numpy=True)
                    proj_emb = proj_emb / (np.linalg.norm(proj_emb, axis=1, keepdims=True) + 1e-8)
                    jd_emb = jd_emb / (np.linalg.norm(jd_emb, axis=1, keepdims=True) + 1e-8)
                    cos_sim = float(np.dot(proj_emb, jd_emb.T)[0][0])
                    semantic_sim_score = min(100.0, max(0.0, (cos_sim - 0.2) / 0.45 * 100.0))
                except Exception:
                    semantic_sim_score = 50.0
            else:
                semantic_sim_score = 50.0
                
            jd_techs_all = set(t.lower().strip() for t in (jd_req.get("technologies", []) + jd_req.get("frameworks", [])) if t)
            if not jd_techs_all and target_job_description:
                jd_techs_all = self._extract_techs_from_text(target_job_description)
            
            matched_techs = []
            for jd_t in jd_techs_all:
                matched = False
                for p_t in all_project_techs:
                    if self._is_partial_match(jd_t, p_t):
                        matched = True
                        break
                if matched:
                    matched_techs.append(jd_t)
            
            technology_overlap_score = 100.0 if not jd_techs_all else (len(matched_techs) / len(jd_techs_all)) * 100.0
            
            jd_resps = jd_req.get("responsibilities", [])
            if not jd_resps and target_job_description:
                jd_resps = [line.strip() for line in target_job_description.split("\n") if line.strip() and len(line.strip()) > 35][:12]
            
            if not jd_resps:
                responsibility_overlap_score = 100.0
            elif not proj_descriptions_bullets:
                responsibility_overlap_score = 0.0
            else:
                mean_sim_resp, _ = compute_semantic_similarity(jd_resps, proj_descriptions_bullets)
                responsibility_overlap_score = min(100.0, max(0.0, (mean_sim_resp - 0.15) / 0.5 * 100.0))
                
            calculated_score = (0.60 * semantic_sim_score + 0.30 * technology_overlap_score + 0.10 * responsibility_overlap_score)
            project_relevance_score = round(calculated_score)
            proj_details = f"Project similarity: {round(semantic_sim_score)}%, technology overlap: {round(technology_overlap_score)}%."

        # --- 6. ATS Formatting (10%) ---
        # Already calculated at top: fmt_score

        # --- 7. Job Title & Summary Match (5%) ---
        target_title = jd_req.get("title", "") or (target_job_description.split("\n")[0] if target_job_description else "")
        cand_title = parsed_data.get("personalInfo", {}).get("title", "") or parsed_data.get("title", "")
        cand_summary = parsed_data.get("summary", "") or parsed_data.get("professional_summary", "")
        
        job_title_match_score = 50
        if cand_title and target_title and model:
            try:
                title_embs = model.encode([target_title.lower(), cand_title.lower()], convert_to_numpy=True)
                title_embs = title_embs / (np.linalg.norm(title_embs, axis=1, keepdims=True) + 1e-8)
                t_sim = float(np.dot(title_embs[0], title_embs[1]))
                job_title_match_score = max(0, min(100, round((t_sim - 0.2) / 0.6 * 100)))
            except Exception:
                if target_title.lower() in cand_title.lower() or cand_title.lower() in target_title.lower():
                    job_title_match_score = 90
        elif cand_title or cand_summary:
            job_title_match_score = 70

        # Calculate final overall score
        overall_score = round(
            keyword_match_score * 0.30 +
            skills_match_score * 0.15 +
            experience_relevance_score * exp_weight +
            project_relevance_score * proj_weight +
            achievement_impact_score * 0.10 +
            fmt_score * 0.10 +
            job_title_match_score * 0.05
        )
        overall_score = max(5, min(overall_score, 100))

        structure_score, structure_issues = self._check_structure(resume_text, parsed_data)
        grammar_score, grammar_issues = self._check_spelling_and_grammar(resume_text, parsed_data)
        contact_score, contact_issues = self._check_contact_info(parsed_data, resume_text)
        readability_score, readability_issues = self._check_readability_formatting(resume_text)
        
        req_degree = jd_req.get("preferred_degree", "")
        education_met = True
        if req_degree:
            edu_list = parsed_data.get("education", []) or []
            if not edu_list:
                education_met = False
            else:
                max_cand_level = 0
                for edu in edu_list:
                    max_cand_level = max(max_cand_level, self._get_degree_level(edu.get("degree", "")))
                target_level = self._get_degree_level(req_degree)
                education_met = max_cand_level >= target_level

        quality_checks = {
            "ats_parseability": fmt_score >= 80,
            "contact_info": contact_score >= 80,
            "grammar": grammar_score >= 80,
            "education_met": education_met,
            "resume_structure": structure_score >= 80,
            "file_format": True,
            "readability": readability_score >= 80
        }

        strengths = []
        weaknesses = []
        if keyword_match_score >= 80:
            strengths.append("High alignment with Job Description keywords.")
        else:
            weaknesses.append("Missing critical keywords or frameworks from the Job Description.")

        if skills_match_score >= 80:
            strengths.append("Required skill competencies are strongly represented.")
        else:
            weaknesses.append("Missing core required skills outlined in the job criteria.")

        if experience_relevance_score >= 80:
            strengths.append("Past experience bullets have strong semantic alignment with the role.")
        else:
            weaknesses.append("Past work experience roles do not clearly match job responsibilities.")

        top_suggestions = []
        if missing_keywords:
            top_suggestions.append(f"Incorporate missing keywords: {', '.join(missing_keywords[:3])}")
        if missing_skills:
            top_suggestions.append(f"Add missing required skills: {', '.join(missing_skills[:3])}")
        if achievement_impact_score < 75:
            top_suggestions.append("Vary action verbs and quantify bullet achievements with percentages.")

        if not top_suggestions:
            top_suggestions.append("Your resume is extremely well-optimized for this job description!")

        explanations = [
            f"Keyword Match (30.0% weight): Scored {keyword_match_score}%. Evaluated {len(matched_keywords)} matching JD technical keywords.",
            f"Skills Match (15.0% weight): Scored {skills_match_score}%. Assesses specific technology competencies list.",
            f"Experience Relevance ({round(exp_weight * 100, 1)}% weight): Scored {experience_relevance_score}%. Alignment of job duties and years.",
            f"Project Relevance ({round(proj_weight * 100, 1)}% weight): Scored {project_relevance_score}%. {proj_details}",
            f"Achievement & Impact (10.0% weight): Scored {achievement_impact_score}%. Measures action verbs and metric density.",
            f"ATS Formatting (10.0% weight): Scored {fmt_score}%. Verifies layout hazard check (dividers, icons).",
            f"Job Title Match (5.0% weight): Scored {job_title_match_score}%. Headline matches role target title."
        ]

        report = {
            "overallScore": overall_score,
            "strengths": strengths[:4],
            "weaknesses": weaknesses[:4],
            "topSuggestions": top_suggestions[:4],
            "computedAt": datetime.now(timezone.utc).isoformat() + "Z",
            "_jd_requirements": jd_req,
            "explanations": explanations,
            "top_missing_keywords": missing_keywords[:8],

            "quality_checks": quality_checks,

            "detailed_breakdown": {
                "keyword_match": {"score": keyword_match_score, "matched": matched_keywords[:12], "missing": missing_keywords[:12]},
                "skills_match": {"score": skills_match_score, "matched": matched_skills[:12], "missing": missing_skills[:12]},
                "experience_relevance": {"score": experience_relevance_score, "details": exp_details},
                "achievement_impact": {
                    "score": achievement_impact_score,
                    "action_verbs_score": verbs_score,
                    "quantified_score": quant_score
                },
                "project_relevance": {"score": project_relevance_score, "details": proj_details},
                "ats_formatting": {"score": fmt_score, "issues": fmt_issues},
                "job_title_match": {"score": job_title_match_score, "details": "Matches headline to JD title."}
            },

            "breakdown": {
                "formatting": {"score": fmt_score, "issues": fmt_issues},
                "structure": {"score": structure_score, "issues": structure_issues},
                "keywords": {"score": keyword_match_score, "missingKeywords": missing_keywords[:12], "matchedKeywords": matched_keywords[:15]},
                "content": {"score": round((experience_relevance_score + project_relevance_score) / 2), "weakBullets": grammar_issues},
                "integrity": {"score": contact_score, "flags": contact_issues}
            }
        }
        return report