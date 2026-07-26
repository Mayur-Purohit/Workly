import json
import logging
import re
import uuid
from agents.llm import RotateLLMClient

logger = logging.getLogger(__name__)

class AdvancedAtsParsingAgent:
    """
    Advanced, separate, and token-efficient Resume Parsing Agent.
    Uses gemini-2.5-flash for high extraction accuracy at low token cost.
    Parses resume text directly into the schema expected by the React frontend editor,
    extracting summary, skills, experience, education, projects (with techStack),
    certifications, languages, and links.
    """
    def __init__(self):
        self.client = RotateLLMClient()

    @staticmethod
    def extract_text_column_aware(file_path: str) -> str:
        """
        Column-aware PDF text extraction using PyMuPDF.
        Splits pages into left and right columns if a vertical layout division is detected.
        Conserves section integrity for two-column resumes.
        Falls back to standard get_text() for non-PDF files.
        """
        import fitz
        from pathlib import Path

        ext = Path(file_path).suffix.lower()
        try:
            if ext == ".pdf":
                doc = fitz.open(file_path)
                pages_text = []
                for page in doc:
                    blocks = page.get_text("blocks")
                    # filter out empty blocks and non-text blocks
                    blocks = [b for b in blocks if b[4].strip() and b[6] == 0]
                    
                    page_width = page.rect.width
                    page_height = page.rect.height
                    
                    # Search for best vertical split x between 25% and 75% width
                    best_x = None
                    min_crossings = float('inf')
                    
                    start_x = int(page_width * 0.25)
                    end_x = int(page_width * 0.75)
                    
                    for x in range(start_x, end_x, 5):
                        crossings = 0
                        for b in blocks:
                            x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
                            # A block crosses if it spans across x, but ignore top headers and bottom footers
                            if y0 >= 120 and y1 <= page_height - 80:
                                if x0 < x < x1:
                                    crossings += 1
                        
                        if crossings < min_crossings:
                            min_crossings = crossings
                            best_x = x
                            
                    # Treat as two-column ONLY if block geometry clearly shows two distinct columns
                    is_two_column = False
                    if len(blocks) > 4 and best_x is not None:
                        left_count = 0
                        right_count = 0
                        spanning_count = 0
                        for b in blocks:
                            x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
                            if y0 >= 100 and y1 <= page_height - 60:
                                width = x1 - x0
                                if width > page_width * 0.70:
                                    spanning_count += 1
                                elif x1 <= best_x + 15:
                                    left_count += 1
                                elif x0 >= best_x - 15:
                                    right_count += 1
                        if left_count >= 2 and right_count >= 2 and spanning_count <= 2:
                            is_two_column = True
                            
                    if is_two_column:
                        header_blocks = []
                        footer_blocks = []
                        left_blocks = []
                        right_blocks = []
                        
                        for b in blocks:
                            x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
                            if y0 < 120:
                                header_blocks.append(b)
                            elif y1 > page_height - 80:
                                footer_blocks.append(b)
                            else:
                                center_x = (x0 + x1) / 2.0
                                if center_x < best_x:
                                    left_blocks.append(b)
                                else:
                                    right_blocks.append(b)
                                    
                        header_blocks.sort(key=lambda x: (x[1], x[0]))
                        left_blocks.sort(key=lambda x: (x[1], x[0]))
                        right_blocks.sort(key=lambda x: (x[1], x[0]))
                        footer_blocks.sort(key=lambda x: (x[1], x[0]))
                        
                        page_text = []
                        for b in header_blocks:
                            page_text.append(b[4].strip())
                        
                        page_text.append("[LEFT COLUMN]")
                        for b in left_blocks:
                            page_text.append(b[4].strip())
                            
                        page_text.append("[RIGHT COLUMN]")
                        for b in right_blocks:
                            page_text.append(b[4].strip())
                            
                        for b in footer_blocks:
                            page_text.append(b[4].strip())
                            
                        pages_text.append("\n".join(page_text))
                    else:
                        blocks.sort(key=lambda x: (x[1], x[0]))
                        pages_text.append("\n".join(b[4].strip() for b in blocks))
                        
                return "\n\n".join(pages_text)
            elif ext in [".docx", ".doc"]:
                from docx import Document
                doc = Document(file_path)
                return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            else:
                with open(file_path, "r", errors="ignore") as f:
                    return f.read()
        except Exception as e:
            logger.error("Column-aware extraction failed for %s: %s", file_path, e)
            return ""

    def preprocess_text(self, text: str) -> str:
        """
        Compress text to save input tokens:
        - Replaces 3+ consecutive newlines with exactly 2 newlines.
        - Trims whitespace from individual lines.
        - Limits maximum text length.
        """
        if not text:
            return ""
        lines = [line.strip() for line in text.splitlines()]
        cleaned_lines = []
        consecutive_empty = 0
        for line in lines:
            if not line:
                consecutive_empty += 1
                if consecutive_empty <= 1:
                    cleaned_lines.append(line)
            else:
                consecutive_empty = 0
                cleaned_lines.append(line)
        
        cleaned_text = "\n".join(cleaned_lines)
        return cleaned_text[:12000]

    def clean_url(self, url: str) -> str:
        """Helper to ensure URLs are formatted properly with a protocol."""
        if not url:
            return ""
        url = url.strip()
        if not url:
            return ""
        url = url.rstrip(".,;)")
        if not re.match(r"^https?://", url, re.IGNORECASE):
            if "/" not in url and "." not in url:
                return ""
            return "https://" + url
        return url

    async def parse(self, text: str) -> dict:
        preprocessed = self.preprocess_text(text)
        if not preprocessed.strip():
            return self.get_empty_resume_dict()

        system_prompt = (
            "You are an elite AI Resume Parsing Agent. Your task is to perform 100% COMPLETE, VERBATIM EXTRACTION "
            "of ALL content from the candidate's resume. Do NOT omit, drop, combine, or compress any experience role, "
            "company, job title, date range, or bullet point.\n\n"
            "CRITICAL EXTRACTION MANDATES:\n"
            "1. EXPERIENCE: Extract EVERY SINGLE work experience / job entry listed on the resume. If the resume has "
            "2 or more jobs (e.g. 'Marketing Executive' and 'Operations Associate'), you MUST extract BOTH jobs as separate "
            "entries in the 'experience' array. NEVER drop an entry.\n"
            "2. SKILLS EXTRACTION: Extract ALL skills into a flat array of individual skill names. If skills are listed under "
            "category headings like 'Marketing: SEO, Google Ads', 'Analytics: Excel, Power BI', 'Tools: Canva', or 'Soft Skills: Negotiation', "
            "strip the category heading prefix ('Marketing:', 'Tools:', etc.) and extract each skill item separately.\n"
            "3. PROJECTS & EDUCATION: Extract 100% of all listed projects and degrees.\n\n"
            "Extract everything into this exact JSON schema:\n"
            "{\n"
            "  \"personalInfo\": {\n"
            "    \"fullName\": \"full legal name\",\n"
            "    \"title\": \"professional headline or current role\",\n"
            "    \"email\": \"email address\",\n"
            "    \"phone\": \"phone number\",\n"
            "    \"location\": \"city, state or country\",\n"
            "    \"website\": \"personal website URL\",\n"
            "    \"linkedin\": \"full LinkedIn profile URL\",\n"
            "    \"github\": \"full GitHub profile URL\"\n"
            "  },\n"
            "  \"summary\": \"professional summary or profile paragraph\",\n"
            "  \"skills\": [\"SEO\", \"Google Ads\", \"Excel\"],\n"
            "  \"experience\": [\n"
            "    {\n"
            "      \"company\": \"Company Name\",\n"
            "      \"title\": \"Job Title\",\n"
            "      \"location\": \"City, Country\",\n"
            "      \"startDate\": \"Jan 2024\",\n"
            "      \"endDate\": \"Present\",\n"
            "      \"bullets\": [\"Bullet 1\", \"Bullet 2\"]\n"
            "    }\n"
            "  ],\n"
            "  \"education\": [\n"
            "    {\n"
            "      \"school\": \"University / College name\",\n"
            "      \"degree\": \"B.E. Computer Engineering\",\n"
            "      \"location\": \"City\",\n"
            "      \"startDate\": \"2020\",\n"
            "      \"endDate\": \"2022\"\n"
            "    }\n"
            "  ],\n"
            "  \"projects\": [\n"
            "    {\n"
            "      \"name\": \"Project Name\",\n"
            "      \"link\": \"\",\n"
            "      \"bullets\": [\"Bullet 1\"],\n"
            "      \"techStack\": [\"Python\", \"React\"]\n"
            "    }\n"
            "  ],\n"
            "  \"certifications\": [\n"
            "    {\n"
            "      \"name\": \"Certification Name\",\n"
            "      \"issuer\": \"Issuing Organization\",\n"
            "      \"date\": \"Month Year\"\n"
            "    }\n"
            "  ],\n"
            "  \"languages\": [\n"
            "    {\n"
            "      \"name\": \"English\",\n"
            "      \"proficiency\": \"Native\"\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Return ONLY valid JSON. No markdown. No explanation."
        )

        try:
            response = self.client.chat.completions.create(
                model="gemini-1.5-flash",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Resume Text:\n{preprocessed}"}
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()
            
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()

            parsed = json.loads(raw)
            normalized = self.normalize_parsed_content(parsed)

            # If experience is empty but text has experience lines, run deterministic fallback as recovery
            if not normalized.get("experience") and ("experience" in preprocessed.lower() or "employment" in preprocessed.lower()):
                fallback = self._fallback_text_parse(text)
                if fallback.get("experience"):
                    normalized["experience"] = fallback["experience"]

            return normalized

        except Exception as e:
            logger.error("AdvancedAtsParsingAgent parsing failed: %s — running fallback parser", e)
            return self._fallback_text_parse(text)

    def _fallback_text_parse(self, text: str) -> dict:
        """Deterministic regex-based fallback parser when LLM response is incomplete or fails."""
        res = self.get_empty_resume_dict()
        if not text:
            return res

        # Contact Info
        email_re = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        if email_re:
            res["personalInfo"]["email"] = email_re.group(0)

        phone_re = re.search(r'[\+\(]?[0-9][0-9\s\-\(\)]{8,15}[0-9]', text)
        if phone_re:
            res["personalInfo"]["phone"] = phone_re.group(0).strip()

        # Simple section splitter
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        if lines:
            res["personalInfo"]["fullName"] = lines[0]

        # Extract Experience entries by searching for dates pattern (e.g., "Jan 2024 - Present")
        exp_entries = []
        date_pattern = re.compile(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[–\-\u2013—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|Current)', re.IGNORECASE)
        
        current_exp = None
        in_experience = False
        for line in lines:
            lower = line.lower()
            if "experience" in lower or "work history" in lower or "employment" in lower:
                in_experience = True
                continue
            elif in_experience and any(sec in lower for sec in ["education", "skills", "projects", "certifications"]):
                in_experience = False

            if in_experience:
                m = date_pattern.search(line)
                if m:
                    if current_exp:
                        exp_entries.append(current_exp)
                    parts = line.split("|") if "|" in line else (line.split("—") if "—" in line else line.split("-"))
                    role_comp = parts[0].strip() if parts else line
                    current_exp = {
                        "id": str(uuid.uuid4()),
                        "company": role_comp,
                        "title": role_comp,
                        "location": "",
                        "startDate": m.group(1),
                        "endDate": m.group(2),
                        "bullets": []
                    }
                elif current_exp and line.startswith(("•", "-", "▸", "*")):
                    current_exp["bullets"].append(line.lstrip("•-▸* ").strip())

        if current_exp:
            exp_entries.append(current_exp)
        res["experience"] = exp_entries

        # Extract Skills
        skills_set = set()
        in_skills = False
        for line in lines:
            lower = line.lower()
            if "skills" in lower:
                in_skills = True
                continue
            elif in_skills and any(sec in lower for sec in ["experience", "education", "projects"]):
                in_skills = False
            if in_skills:
                # Strip category prefixes
                cleaned_line = re.sub(r'^(Marketing|Analytics|Tools|Soft Skills|Technical Skills|Skills):\s*', '', line, flags=re.IGNORECASE)
                for item in re.split(r'[,|•·]', cleaned_line):
                    item_clean = item.strip()
                    if item_clean and len(item_clean) < 40:
                        skills_set.add(item_clean)
        res["skills"] = sorted(list(skills_set))

        return res

    def get_empty_resume_dict(self) -> dict:
        return {
            "personalInfo": {
                "fullName": "",
                "title": "",
                "email": "",
                "phone": "",
                "location": "",
                "website": "",
                "linkedin": "",
                "github": ""
            },
            "summary": "",
            "skills": [],
            "experience": [],
            "education": [],
            "projects": [],
            "certifications": [],
            "languages": []
        }

    def normalize_parsed_content(self, parsed: dict) -> dict:
        schema = self.get_empty_resume_dict()
        
        # Merge personal info
        p_info = parsed.get("personalInfo") or {}
        if isinstance(p_info, dict):
            for k in schema["personalInfo"]:
                val = p_info.get(k) or ""
                if k in ["website", "linkedin", "github"] and val:
                    schema["personalInfo"][k] = self.clean_url(val)
                else:
                    schema["personalInfo"][k] = str(val).strip()

        schema["summary"] = str(parsed.get("summary") or "").strip()

        # Skills
        raw_skills = parsed.get("skills") or []
        if isinstance(raw_skills, list):
            schema["skills"] = [str(s).strip() for s in raw_skills if s]

        # Experience
        raw_exp = parsed.get("experience") or []
        if isinstance(raw_exp, list):
            for item in raw_exp:
                if not isinstance(item, dict):
                    continue
                bullets = item.get("bullets") or []
                if not isinstance(bullets, list):
                    bullets = [bullets] if bullets else []
                schema["experience"].append({
                    "id": str(uuid.uuid4()),
                    "company": str(item.get("company") or "").strip(),
                    "title": str(item.get("title") or "").strip(),
                    "location": str(item.get("location") or "").strip(),
                    "startDate": str(item.get("startDate") or "").strip(),
                    "endDate": str(item.get("endDate") or "").strip(),
                    "bullets": [str(b).strip() for b in bullets if b]
                })

        # Education
        raw_edu = parsed.get("education") or []
        if isinstance(raw_edu, list):
            for item in raw_edu:
                if not isinstance(item, dict):
                    continue
                schema["education"].append({
                    "id": str(uuid.uuid4()),
                    "school": str(item.get("school") or "").strip(),
                    "degree": str(item.get("degree") or "").strip(),
                    "location": str(item.get("location") or "").strip(),
                    "startDate": str(item.get("startDate") or "").strip(),
                    "endDate": str(item.get("endDate") or "").strip()
                })

        # Projects
        raw_proj = parsed.get("projects") or []
        if isinstance(raw_proj, list):
            for item in raw_proj:
                if not isinstance(item, dict):
                    continue
                link = item.get("link") or ""
                # Parse techStack — can be list or comma-separated string
                raw_tech = item.get("techStack") or item.get("tech_stack") or item.get("technologies") or []
                if isinstance(raw_tech, str):
                    tech_list = [t.strip() for t in raw_tech.split(",") if t.strip()]
                elif isinstance(raw_tech, list):
                    tech_list = [str(t).strip() for t in raw_tech if t]
                else:
                    tech_list = []

                # Prefer the new "bullets" array; fall back to splitting a legacy "description"
                # string so older drafts / older LLM responses don't break.
                raw_bullets = item.get("bullets") or []
                if isinstance(raw_bullets, list) and raw_bullets:
                    bullets_list = [str(b).strip() for b in raw_bullets if str(b).strip()]
                else:
                    legacy_desc = str(item.get("description") or "").strip()
                    if legacy_desc:
                        # Split a dense paragraph into sentence-based bullets as a safety net
                        bullets_list = [
                            s.strip().rstrip(".") + "."
                            for s in re.split(r'(?<=[.!?])\s+', legacy_desc)
                            if s.strip()
                        ]
                    else:
                        bullets_list = []

                schema["projects"].append({
                    "id": str(uuid.uuid4()),
                    "name": str(item.get("name") or "").strip(),
                    "link": self.clean_url(link),
                    "bullets": bullets_list,
                    "description": str(item.get("description") or "").strip() or "\n".join(f"• {b}" for b in bullets_list),  # kept for backward-compat, UI should prefer `bullets`
                    "techStack": tech_list
                })

        # Certifications
        raw_certs = parsed.get("certifications") or []
        if isinstance(raw_certs, list):
            for item in raw_certs:
                if not isinstance(item, dict):
                    continue
                schema["certifications"].append({
                    "id": str(uuid.uuid4()),
                    "name": str(item.get("name") or "").strip(),
                    "issuer": str(item.get("issuer") or "").strip(),
                    "date": str(item.get("date") or "").strip()
                })

        # Languages
        raw_langs = parsed.get("languages") or []
        if isinstance(raw_langs, list):
            for item in raw_langs:
                if not isinstance(item, dict):
                    continue
                schema["languages"].append({
                    "id": str(uuid.uuid4()),
                    "name": str(item.get("name") or "").strip(),
                    "proficiency": str(item.get("proficiency") or "").strip()
                })

        return schema
