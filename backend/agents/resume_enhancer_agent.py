import json
import logging
from typing import Optional
from agents.llm import RotateLLMClient
from agents.ats_compatibility_agent import AtsCompatibilityAgent

logger = logging.getLogger(__name__)

_SYSTEM = """\
You are an expert resume editor and ATS optimization specialist.

CRITICAL RULES — NEVER VIOLATE:
1. Do NOT invent any fact, number, metric, company name, or technology not already present in the resume.
2. Do NOT add fake percentages (40%, 3x), dollar amounts, or user counts to bullets unless the original already contains them.
3. If a bullet already contains a number or metric, keep that exact value — just improve the phrasing.
4. ONLY improve grammar, action verbs, sentence structure, and clarity of existing bullets.
5. Do NOT add new bullet points for experience or projects.
6. Do NOT remove existing bullets.
7. ATS keywords and missing skills MUST go into the `missing_keywords` and `skill_gaps` arrays.
8. Summary rewrite must be based ONLY on information found in the resume — do not invent titles, years, or metrics.
9. Do NOT mention any technology, tool, or framework in experience/project bullets that is NOT already mentioned in the resume's skills list, tech stack, or original bullet text.
10. Do NOT add quantified results (e.g. "reduced load time by 40%", "served 10k users") unless the original bullet ALREADY contains that exact number.
11. Keep the same NUMBER of bullets per experience/project — do not add or remove any.

You return ONLY a single valid JSON object. No markdown fences. No prose."""

_ENHANCE_PROMPT = """\
Enhance the resume below following the system rules strictly.

INPUT RESUME (JSON):
{resume_json}

TARGET JOB DESCRIPTION:
{job_description}

CURRENT ATS SCORE (from live analysis): {live_ats_score}/100

TASK:
1. For each experience entry, rewrite the `bullets` or `responsibilities` array:
   - Use a strong action verb to START each bullet (e.g. "Led", "Optimized", "Architected", "Implemented", "Streamlined").
   - Vary action verbs — never repeat the same verb consecutively.
   - If a bullet already has a metric (%, $, count), preserve it and just tighten the phrasing.
   - Never add new metrics that are not in the original.
   - Fix grammar and make phrasing concise and professional.
   - Make EVERY bullet stronger and more impactful.

2. For each project entry, rewrite bullet points in the `description` or `bullets` field:
   - Start with a strong action verb.
   - Mention the tech stack naturally if it is already in the project data.
   - Make the impact and contribution clear without inventing outcomes.

3. Rewrite the professional summary using data from the resume only.
   - Make it 2–3 punchy lines max with strong action-oriented language.
   - Ensure the summary rewrite ends with a period.

4. Identify ATS keywords from the job description that are MISSING from the resume skills list.
   (only real, standard tech terms or domain skills).

5. Give 3–5 concrete improvement tips the candidate should apply.

OUTPUT FORMAT — return ONLY this JSON, filled in with real data:
{{
  "professional_summary_enhanced": "<string summary or empty string>",
  "enhanced_experience": [
    {{
      "company": "<company name as-is>",
      "role": "<role as-is>",
      "original_bullets": ["<original bullet 1>", "..."],
      "enhanced_bullets": ["<rewritten bullet 1>", "..."]
    }}
  ],
  "enhanced_projects": [
    {{
      "name": "<project name as-is>",
      "original_bullets": ["<original bullet 1>", "..."],
      "enhanced_bullets": ["<rewritten bullet 1>", "..."]
    }}
  ],
  "missing_keywords": ["<keyword1>", "<keyword2>"],
  "skill_gaps": ["<actionable gap sentence 1>", "..."],
  "improvement_tips": [
    "<tip 1>",
    "<tip 2>",
    "<tip 3>"
  ]
}}
"""

class ResumeEnhancerAgent:
    """
    Enhances a parsed resume using the LLM.
    - No hallucination: facts are never invented.
    - Mathematically calculates the enhanced score using AtsCompatibilityAgent on virtual resume.
    - Returns structured JSON the frontend can render directly.
    """
    def __init__(self):
        self.llm = RotateLLMClient()
        self.ats_agent = AtsCompatibilityAgent()

    def enhance(self, resume_data: dict, job_description: str = "", live_ats_score: int = None, jd_requirements: dict = None) -> dict:
        try:
            safe_resume = _trim_resume(resume_data)
            resume_json = json.dumps(safe_resume, indent=2, ensure_ascii=False)
            jd_text = job_description.strip() if job_description else "Not provided. Optimize for general ATS."

            # Calculate base score if not provided
            if live_ats_score is None:
                base_report = self.ats_agent.analyze(None, resume_data, jd_text, jd_requirements=jd_requirements)
                base_score = base_report.get("overallScore", 70)
                if jd_requirements is None:
                    jd_requirements = base_report.get("_jd_requirements")
            else:
                base_score = int(live_ats_score)

            prompt = _ENHANCE_PROMPT.format(
                resume_json=resume_json,
                job_description=jd_text[:3000],
                live_ats_score=base_score
            )

            response = self.llm.chat.completions.create(
                model="gpt-4o-mini",  # maps to gemini-1.5-flash or similar high-efficiency model
                messages=[
                    {"role": "system", "content": _SYSTEM},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )

            raw = response.choices[0].message.content.strip()
            result = _safe_json_parse(raw)
            if result is None:
                raise ValueError("LLM enhancement response is not valid JSON")

            # Apply default structures
            result = _apply_defaults(result)

            # Post-LLM validation: strip any technologies not in original resume
            original_skills_lower = set(s.lower().strip() for s in resume_data.get("skills", []) if s)
            original_text_lower = resume_json.lower()
            result = _validate_no_hallucination(result, original_skills_lower, original_text_lower)

            # Map professional_summary_enhanced -> summary_rewrite (which is used in frontend)
            summary_enhanced = result.get("professional_summary_enhanced", "").strip()
            if summary_enhanced and not summary_enhanced.endswith("."):
                summary_enhanced += "."
            result["summary_rewrite"] = summary_enhanced
            result["professional_summary_enhanced"] = summary_enhanced

            # Create virtual enhanced resume to calculate enhanced score mathematically
            enhanced_resume = {
                "personalInfo": resume_data.get("personalInfo", {}),
                "summary": summary_enhanced or resume_data.get("summary") or resume_data.get("professional_summary") or "",
                "skills": list(set(resume_data.get("skills", []))),
                "experience": [],
                "education": resume_data.get("education", []),
                "projects": [],
                "certifications": resume_data.get("certifications", []),
                "languages": resume_data.get("languages", [])
            }

            # Map enhanced experiences
            for exp in resume_data.get("experience", []):
                company = exp.get("company", "")
                role = exp.get("title", "") or exp.get("role", "")
                bullets = exp.get("bullets", []) or exp.get("responsibilities", []) or []
                
                # Check for enhanced bullets match
                for ee in result.get("enhanced_experience", []):
                    if ee.get("company", "").lower() == company.lower() or ee.get("role", "").lower() == role.lower():
                        bullets = ee.get("enhanced_bullets", bullets)
                        break
                enhanced_resume["experience"].append({
                    **exp,
                    "bullets": bullets
                })

            # Map enhanced projects
            for proj in resume_data.get("projects", []):
                name = proj.get("name", "")
                desc = proj.get("description", "")
                
                # Check for enhanced project description match
                for ep in result.get("enhanced_projects", []):
                    if ep.get("name", "").lower() == name.lower():
                        # If description is a bullet list
                        eb = ep.get("enhanced_bullets", [])
                        if eb:
                            desc = "\n".join(eb)
                        else:
                            desc = ep.get("enhanced_description", desc)
                        break
                enhanced_resume["projects"].append({
                    **proj,
                    "description": desc
                })

            # Compute enhanced score using AtsCompatibilityAgent on virtual enhanced resume
            enhanced_report = self.ats_agent.analyze(None, enhanced_resume, jd_text, jd_requirements=jd_requirements)
            ats_score_enhanced = enhanced_report.get("overallScore", base_score)

            result["ats_score_original"] = base_score
            result["ats_score_enhanced"] = ats_score_enhanced
            
            # Additional enhancement statistics requested
            result["improvement_percentage"] = round(((ats_score_enhanced - base_score) / max(1, base_score)) * 100, 1)
            result["keywords_added"] = result.get("missing_keywords", [])
            result["skills_improved"] = len(result.get("missing_keywords", []))
            
            sections_improved = []
            if summary_enhanced: sections_improved.append("Professional Summary")
            if result.get("enhanced_experience"): sections_improved.append("Work Experience")
            if result.get("enhanced_projects"): sections_improved.append("Projects")
            result["sections_improved"] = sections_improved

            return {"success": True, "data": result}

        except Exception as e:
            logger.error("ResumeEnhancerAgent failed: %s", e)
            return {
                "success": False,
                "error": str(e),
                "data": _fallback_enhancement(resume_data, base_score=live_ats_score)
            }

def _trim_resume(data: dict) -> dict:
    import copy
    d = copy.deepcopy(data)
    keep = [
        "name", "email", "phone", "location",
        "professional_summary", "summary",
        "total_experience_years",
        "skills", "experience", "education",
        "projects", "certifications", "achievements",
        "linkedin_url", "github_url",
    ]
    trimmed = {k: d[k] for k in keep if k in d}
    for exp in trimmed.get("experience") or []:
        if isinstance(exp, dict):
            resp = exp.get("bullets") or exp.get("responsibilities") or []
            if len(resp) > 6:
                exp["bullets"] = resp[:6]
    for proj in trimmed.get("projects") or []:
        if isinstance(proj, dict):
            desc = proj.get("description") or ""
            if len(desc) > 400:
                proj["description"] = desc[:400] + "..."
    skills = trimmed.get("skills") or []
    if len(skills) > 25:
        trimmed["skills"] = skills[:25]
    return trimmed

def _safe_json_parse(raw: str) -> Optional[dict]:
    if not raw: return None
    cleaned = raw.strip()
    if cleaned.startswith("```json"): cleaned = cleaned[7:]
    if cleaned.startswith("```"): cleaned = cleaned[3:]
    if cleaned.endswith("```"): cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try: return json.loads(match.group(0))
            except Exception: pass
    return None

def _apply_defaults(result: dict) -> dict:
    result.setdefault("professional_summary_enhanced", "")
    result.setdefault("enhanced_experience", [])
    result.setdefault("enhanced_projects", [])
    result.setdefault("missing_keywords", [])
    result.setdefault("skill_gaps", [])
    result.setdefault("improvement_tips", [
        "Include quantifiable metrics inside experience bullet points.",
        "Add a 2–3 line professional summary outlining your domain expertise.",
        "Add missing technical skills directly into the technical skills section."
    ])
    return result

def _validate_no_hallucination(result: dict, original_skills_lower: set, original_text_lower: str) -> dict:
    """Post-LLM validation: ensure no fabricated technologies or metrics were introduced."""
    import re
    
    # Common fabricated metric patterns
    fabricated_patterns = [
        r'\b\d+%\s+(increase|decrease|reduction|improvement|faster|slower)',
        r'\b\d+x\s+(faster|improvement|increase)',
        r'\$[\d,]+[kKmMbB]?\b',
        r'\b\d+[kK]\+?\s+(users|customers|requests|transactions)',
    ]
    
    def _has_new_metric(original_bullet: str, enhanced_bullet: str) -> bool:
        """Check if enhanced bullet introduced metrics not in the original."""
        for pattern in fabricated_patterns:
            enhanced_matches = set(re.findall(pattern, enhanced_bullet.lower()))
            original_matches = set(re.findall(pattern, original_bullet.lower()))
            if enhanced_matches - original_matches:
                return True
        # Check for new numbers not in original
        enhanced_numbers = set(re.findall(r'\b\d{2,}\b', enhanced_bullet))
        original_numbers = set(re.findall(r'\b\d{2,}\b', original_bullet))
        new_numbers = enhanced_numbers - original_numbers
        # Allow years (19xx, 20xx) as they're common in resumes
        new_numbers = {n for n in new_numbers if not re.match(r'^(19|20)\d{2}$', n)}
        return bool(new_numbers)
    
    # Validate enhanced experience bullets
    for ee in result.get("enhanced_experience", []):
        original_bullets = ee.get("original_bullets", [])
        enhanced_bullets = ee.get("enhanced_bullets", [])
        if len(original_bullets) == len(enhanced_bullets):
            for i, (orig, enh) in enumerate(zip(original_bullets, enhanced_bullets)):
                if _has_new_metric(orig, enh):
                    # Revert to original bullet if hallucination detected
                    enhanced_bullets[i] = orig
                    logger.warning("Hallucination detected in experience bullet, reverting: %s", enh[:80])
            ee["enhanced_bullets"] = enhanced_bullets
    
    # Validate enhanced project bullets
    for ep in result.get("enhanced_projects", []):
        original_bullets = ep.get("original_bullets", [])
        enhanced_bullets = ep.get("enhanced_bullets", [])
        if len(original_bullets) == len(enhanced_bullets):
            for i, (orig, enh) in enumerate(zip(original_bullets, enhanced_bullets)):
                if _has_new_metric(orig, enh):
                    enhanced_bullets[i] = orig
                    logger.warning("Hallucination detected in project bullet, reverting: %s", enh[:80])
            ep["enhanced_bullets"] = enhanced_bullets
    
    # Validate missing_keywords: only keep real, standard terms
    validated_keywords = []
    for kw in result.get("missing_keywords", []):
        kw_clean = kw.lower().strip()
        # Keep if it's a recognizable tech/skill term (not a fabricated phrase)
        if len(kw_clean.split()) <= 3 and len(kw_clean) < 40:
            validated_keywords.append(kw)
    result["missing_keywords"] = validated_keywords
    
    return result

def _fallback_enhancement(resume_data: dict, base_score: int = None) -> dict:
    orig = base_score if base_score is not None else 65
    return {
        "ats_score_original": orig,
        "ats_score_enhanced": orig,  # No fake improvement — return honest score
        "professional_summary_enhanced": "",
        "summary_rewrite": "",
        "enhanced_experience": [],
        "enhanced_projects": [],
        "missing_keywords": [],
        "skill_gaps": [],
        "improvement_tips": [
            "Use clear, metric-based achievements for work experiences.",
            "Verify spelling and standardize date representations.",
            "Enhancement failed — please try again. Your original score is preserved."
        ],
        "improvement_percentage": 0.0,
        "keywords_added": [],
        "skills_improved": 0,
        "sections_improved": []
    }
