import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Header } from "../../components/user/site-chrome";
import { seekerAPI, API_HOST } from "../../lib/api";
import { ResumePreview, TEMPLATE_META } from "../../components/user/templates/ResumePreview";
import {
  Download,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Target,
  ArrowLeft,
  Sun,
  Moon,
  History,
  Clock,
  XCircle,
  Lock
} from "lucide-react";
import toast from "react-hot-toast";


const emptyResume = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: ""
  },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  columns: 1
};

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    return {};
  }
}

function pickString(...vals) {
  for (const v of vals) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return "";
}

function isEffectivelyEmptyContent(content) {
  if (!content || typeof content !== "object") return true;
  const personal = content.personalInfo || content.personal_info || {};
  const hasPersonal = Object.values(personal).some((v) => String(v || "").trim());
  const hasSummary = Boolean(String(content.summary || content.professional_summary || "").trim());
  const hasSkills = Array.isArray(content.skills) && content.skills.length > 0;
  const hasExperience = Array.isArray(content.experience) && content.experience.length > 0;
  const hasEducation = Array.isArray(content.education) && content.education.length > 0;
  const hasProjects = Array.isArray(content.projects) && content.projects.length > 0;
  return !(hasPersonal || hasSummary || hasSkills || hasExperience || hasEducation || hasProjects);
}

/** Normalize API/import payloads into the editor schema (camelCase). */
function normalizeResumeContent(raw, fallbackColumns = 1, profile = null) {
  let data = parseMaybeJson(raw);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      ...emptyResume,
      personalInfo: {
        ...emptyResume.personalInfo,
        fullName: profile?.full_name || "",
        title: profile?.headline || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        location: profile?.location || ""
      },
      columns: fallbackColumns
    };
  }

  // Unwrap common nested envelopes without losing the inner resume object
  for (let i = 0; i < 3; i++) {
    const hasEditorShape =
      data.personalInfo ||
      data.personal_info ||
      data.summary ||
      data.professional_summary ||
      data.experience ||
      data.skills;
    if (hasEditorShape) break;
    const nested =
      data.resume ||
      data.content ||
      data.data ||
      data.parsed ||
      data.result ||
      data.draft;
    if (!nested) break;
    data = parseMaybeJson(nested);
    if (!data || typeof data !== "object" || Array.isArray(data)) break;
  }

  const srcPersonal = parseMaybeJson(data.personalInfo || data.personal_info || {}) || {};
  const personalInfo = {
    fullName: pickString(srcPersonal.fullName, srcPersonal.full_name, srcPersonal.name, data.fullName, data.full_name, data.name, profile?.full_name),
    title: pickString(srcPersonal.title, srcPersonal.headline, srcPersonal.current_role, data.title, data.headline, data.current_role, profile?.headline),
    email: pickString(srcPersonal.email, data.email, profile?.email),
    phone: pickString(srcPersonal.phone, data.phone, profile?.phone),
    location: pickString(srcPersonal.location, data.location, profile?.location),
    website: pickString(srcPersonal.website, srcPersonal.website_url, data.website, data.website_url),
    linkedin: pickString(srcPersonal.linkedin, srcPersonal.linkedin_url, data.linkedin, data.linkedin_url),
    github: pickString(srcPersonal.github, srcPersonal.github_url, data.github, data.github_url)
  };

  const skillsRaw = Array.isArray(data.skills) ? data.skills : [];
  const skills = skillsRaw
    .map((s) => {
      if (typeof s === "object" && s !== null) {
        return pickString(s.canonical_skill, s.raw_skill, s.name, s.skill);
      }
      return String(s || "").trim();
    })
    .filter(Boolean);

  const experience = (Array.isArray(data.experience) ? data.experience : [])
    .map((exp, idx) => {
      if (typeof exp === "string") {
        return {
          id: String(idx + 1),
          company: "",
          title: "",
          location: "",
          startDate: "",
          endDate: "",
          bullets: exp.trim() ? [exp.trim()] : []
        };
      }
      if (!exp || typeof exp !== "object") return null;
      let bullets = exp.bullets;
      if (!Array.isArray(bullets)) {
        bullets = exp.description ? [String(exp.description)] : [];
      }
      return {
        id: exp.id || String(idx + 1),
        company: pickString(exp.company),
        title: pickString(exp.title, exp.role),
        location: pickString(exp.location),
        startDate: pickString(exp.startDate, exp.start_date),
        endDate: pickString(exp.endDate, exp.end_date),
        bullets: bullets.map((b) => String(b || "").trim()).filter(Boolean)
      };
    })
    .filter(Boolean);

  const education = (Array.isArray(data.education) ? data.education : [])
    .map((edu, idx) => {
      if (typeof edu === "string") {
        return {
          id: String(idx + 1),
          school: edu,
          degree: "",
          location: "",
          startDate: "",
          endDate: ""
        };
      }
      if (!edu || typeof edu !== "object") return null;
      return {
        id: edu.id || String(idx + 1),
        school: pickString(edu.school, edu.institution),
        degree: pickString(edu.degree),
        location: pickString(edu.location),
        startDate: pickString(edu.startDate, edu.start_date),
        endDate: pickString(edu.endDate, edu.end_date, edu.year, edu.year_end)
      };
    })
    .filter(Boolean);

  const projects = (Array.isArray(data.projects) ? data.projects : [])
    .map((proj, idx) => {
      if (typeof proj === "string") {
        return {
          id: String(idx + 1),
          name: proj,
          link: "",
          description: "",
          bullets: [],
          techStack: []
        };
      }
      if (!proj || typeof proj !== "object") return null;
      const techRaw = proj.techStack || proj.tech_stack || proj.technologies || [];
      const techStack = Array.isArray(techRaw)
        ? techRaw.map((t) => String(t || "").trim()).filter(Boolean)
        : String(techRaw || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
      let bullets = Array.isArray(proj.bullets) ? proj.bullets : [];
      bullets = bullets.map((b) => String(b || "").trim()).filter(Boolean);
      const description = pickString(proj.description) || bullets.map((b) => `• ${b}`).join("\n");
      return {
        id: proj.id || String(idx + 1),
        name: pickString(proj.name),
        link: pickString(proj.link, proj.url),
        description,
        bullets,
        techStack
      };
    })
    .filter(Boolean);

  const certifications = (Array.isArray(data.certifications) ? data.certifications : [])
    .map((cert, idx) => {
      if (typeof cert === "string") {
        return { id: String(idx + 1), name: cert, issuer: "", date: "" };
      }
      if (!cert || typeof cert !== "object") return null;
      return {
        id: cert.id || String(idx + 1),
        name: pickString(cert.name),
        issuer: pickString(cert.issuer),
        date: pickString(cert.date)
      };
    })
    .filter(Boolean);

  const languages = (Array.isArray(data.languages) ? data.languages : [])
    .map((lang, idx) => {
      if (typeof lang === "string") {
        return { id: String(idx + 1), name: lang, proficiency: "" };
      }
      if (!lang || typeof lang !== "object") return null;
      return {
        id: lang.id || String(idx + 1),
        name: pickString(lang.name),
        proficiency: pickString(lang.proficiency)
      };
    })
    .filter(Boolean);

  const columns = Number(data.columns) === 2 ? 2 : (Number(data.columns) === 1 ? 1 : fallbackColumns);

  return {
    personalInfo,
    summary: pickString(data.summary, data.professional_summary),
    skills,
    experience,
    education,
    projects,
    certifications,
    languages,
    columns
  };
}

export default function ResumeEditor() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const targetJobId = searchParams.get("targetJob");
  const seedFromNav = location.state || {};

  // State
  const [seeker, setSeeker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [templateId, setTemplateId] = useState("modern");
  const [content, setContent] = useState(emptyResume);

  // Version History state
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [showVersionsPanel, setShowVersionsPanel] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");

  // Dark Mode state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    document.documentElement.classList.contains("dark")
  );

  // Auto-save Status
  const [autoSaveStatus, setAutoSaveStatus] = useState("Saved");
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const loadVersions = async () => {
    if (!resumeId) return;
    setVersionsLoading(true);
    try {
      const res = await seekerAPI.getVersions(resumeId);
      setVersions(res || []);
    } catch (err) {
      console.error("Failed to load versions:", err);
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!resumeId) return;
    try {
      await seekerAPI.createVersion(resumeId, { title: newVersionName });
      toast.success("Version checkpoint saved!");
      setNewVersionName("");
      loadVersions();
    } catch (err) {
      toast.error("Failed to save version checkpoint");
      console.error(err);
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!resumeId) return;
    const confirmRestore = window.confirm("Are you sure you want to restore this version? Your unsaved edits will be overwritten.");
    if (!confirmRestore) return;
    
    try {
      const res = await seekerAPI.restoreVersion(resumeId, versionId);
      setContent(normalizeResumeContent(res.content, content.columns || 1));
      setDraftTitle(res.title);
      setTemplateId(res.templateId || "modern");
      setAtsReport(res.atsReport);
      toast.success("Version restored successfully!");
    } catch (err) {
      toast.error("Failed to restore version");
      console.error(err);
    }
  };

  useEffect(() => {
    if (showVersionsPanel) {
      loadVersions();
    }
  }, [showVersionsPanel]);

  // Debounced Auto-save (only after draft content has been hydrated)
  useEffect(() => {
    if (loading || !resumeId || !hasHydrated.current) return;
    // Never persist a blank shell over an imported draft
    if (isEffectivelyEmptyContent(content) && String(draftTitle || "").startsWith("Imported")) return;

    setAutoSaveStatus("Saving...");
    const timer = setTimeout(async () => {
      try {
        await seekerAPI.updateDraft(resumeId, {
          title: draftTitle,
          templateId,
          content: content
        });
        setAutoSaveStatus("Saved");

        // Background auto-backup snapshot
        const formattedTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        await seekerAPI.createVersion(resumeId, { title: `Auto-Save Backup - ${formattedTime}` });
        
        if (showVersionsPanel) {
          loadVersions();
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        setAutoSaveStatus("Error saving");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [content, draftTitle, templateId, loading, resumeId]);

  
  // Job tailoring state
  const [jobInfo, setJobInfo] = useState(null);
  const [targetJobDescription, setTargetJobDescription] = useState("");
  
  // ATS Check state
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsReport, setAtsReport] = useState(null);
  const [atsError, setAtsError] = useState(null);
  const [autoScan, setAutoScan] = useState(false);
  const [showAtsPanel, setShowAtsPanel] = useState(true);
  
  // AI Optimization state
  const [optimizing, setOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState([]);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  
  // AI Enhancement state
  const [enhancing, setEnhancing] = useState(false);
  const [enhancementReport, setEnhancementReport] = useState(null);
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);

  // Tracking changes for debouncing
  const lastCheckedHash = useRef("");
  const debounceTimer = useRef(null);

  // Accordion state
  const [open, setOpen] = useState({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: false,
    certifications: false,
    languages: false
  });

  const previewRef = useRef(null);

  // 1. Fetch Draft and Optional Job Description on Mount
  useEffect(() => {
    const fetchInitData = async () => {
      hasHydrated.current = false;
      try {
        setLoading(true);
        // Load Draft and Profile
        const [draft, profile] = await Promise.all([
          seekerAPI.getDraft(resumeId),
          seekerAPI.getMe().catch(() => null)
        ]);
        setSeeker(profile);
        setDraftTitle(draft.title || seedFromNav.seedTitle || "My Resume");
        setTemplateId(draft.templateId || seedFromNav.seedTemplateId || "modern");

        // Prefer server content; if empty (or malformed), fall back to import navigation seed
        let rawContent = draft.content;
        if (isEffectivelyEmptyContent(parseMaybeJson(rawContent)) && seedFromNav.seedContent) {
          rawContent = seedFromNav.seedContent;
        }

        const loadedContent = normalizeResumeContent(rawContent, emptyResume.columns, profile);
        setContent(loadedContent);

        // If server draft was empty/malformed but we recovered seed content, persist it once
        if (
          seedFromNav.seedContent &&
          isEffectivelyEmptyContent(parseMaybeJson(draft.content)) &&
          !isEffectivelyEmptyContent(loadedContent)
        ) {
          seekerAPI.updateDraft(resumeId, {
            title: draft.title || seedFromNav.seedTitle,
            templateId: draft.templateId || seedFromNav.seedTemplateId || "modern",
            content: loadedContent
          }).catch((err) => console.error("Failed to persist seeded import content:", err));
        }
        
        // Auto-open sections that have imported data so they are visible immediately
        setOpen((prev) => ({
          ...prev,
          personal: true,
          summary: true,
          experience: true,
          education: true,
          skills: true,
          projects: (loadedContent.projects || []).length > 0 ? true : prev.projects,
          certifications: (loadedContent.certifications || []).length > 0 ? true : prev.certifications,
          languages: (loadedContent.languages || []).length > 0 ? true : prev.languages
        }));
        
        // Only keep cached ATS reports from the current scorer version
        const savedReport = draft.atsReport;
        const reportIsCurrent =
          savedReport &&
          savedReport.mode === "general_ats" &&
          savedReport.reportVersion === "teal_v3" &&
          Array.isArray(savedReport.checklist);
        if (reportIsCurrent) {
          setAtsReport(savedReport);
          lastCheckedHash.current = JSON.stringify(loadedContent);
        } else {
          setAtsReport(null);
          lastCheckedHash.current = "";
        }

        // Load Job if query param is set
        if (targetJobId) {
          try {
            const job = await seekerAPI.getJob(targetJobId);
            setJobInfo(job);
            setTargetJobDescription(job.job_description || "");
          } catch (jobErr) {
            console.error("Failed to load job details for tailoring:", jobErr);
          }
        }

        hasHydrated.current = true;
      } catch (err) {
        console.error(err);
        toast.error("Failed to load resume draft");
        navigate("/resume-builder");
      } finally {
        setLoading(false);
      }
    };

    fetchInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per draft id
  }, [resumeId, targetJobId]);

  // 2. Debounced ATS Analyzer Call (triggers 2s after typing stops or job description changes)
  useEffect(() => {
    if (loading) return;
    if (!autoScan) return;

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const currentHash = JSON.stringify(content);
    // Cost control: Skip if content is identical
    if (currentHash === lastCheckedHash.current) {
      return;
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      runAtsCheck(content);
    }, 2000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [content, jobInfo, loading, autoScan, targetJobDescription]);

  const runAtsCheck = async (contentToCheck, { forceRefresh = false } = {}) => {
    if (seeker?.tier !== 'premium') {
      setAtsReport(null);
      setAtsError("ATS Score Checker is a Premium feature. Please upgrade to unlock ATS scoring and recommendations.");
      return;
    }
    setAtsLoading(true);
    setAtsError(null);
    try {
      const payload = {
        resumeDraftId: resumeId, // Link check to active draft
        content: contentToCheck,
        targetJobDescription: targetJobDescription || undefined,
        forceRefresh: !!forceRefresh
      };
      
      const report = await seekerAPI.atsCheck(payload);
      setAtsReport(report);
      lastCheckedHash.current = JSON.stringify(contentToCheck);
    } catch (err) {
      console.error("ATS Analyzer Error:", err);
      // Don't crash, render safe "Score unavailable" state
      setAtsError("ATS scan rate-limited or unavailable. Press refresh to try again.");
    } finally {
      setAtsLoading(false);
    }
  };

  const handleManualAtsCheck = () => {
    // Always bypass server cache on manual refresh so score updates immediately
    lastCheckedHash.current = "";
    runAtsCheck(content, { forceRefresh: true });
  };

  // After draft hydrates, if we discarded a stale ATS report, run a fresh scan once
  useEffect(() => {
    if (loading || !hasHydrated.current) return;
    if (atsReport) return;
    if (seeker?.tier !== "premium") return;
    if (isEffectivelyEmptyContent(content)) return;
    const timer = setTimeout(() => {
      runAtsCheck(content, { forceRefresh: true });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, seeker?.tier, resumeId]);

  const handleAITailor = async () => {
    if (seeker?.tier !== 'premium') {
      toast((t) => (
        <span className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-left">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>AI Resume Enhancer</strong> is a Premium feature. Please upgrade to unlock!</span>
          </span>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/jobs/billing');
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold w-fit transition-colors"
          >
            Upgrade Now
          </button>
        </span>
      ), { duration: 5000 });
      return;
    }
    setOptimizing(true);
    const startTime = Date.now();
    const toastId = toast.loading("Initiating Quick Polish (AI Patches)...");
    
    // Create instant backup snapshot before AI modifies draft content
    try {
      const formattedTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      await seekerAPI.createVersion(resumeId, { title: `Pre-AI Polish Backup - ${formattedTime}` });
      if (showVersionsPanel) {
        loadVersions();
      }
    } catch (backupErr) {
      console.error("Instant pre-AI Polish backup failed:", backupErr);
    }

    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      toast.loading(`Thinking for ${elapsed}s... (AI Patches)`, { id: toastId });
    }, 1000);

    try {
      const payload = {
        content,
        targetJobDescription: targetJobDescription || ""
      };
      const data = await seekerAPI.optimizeDraft(payload);
      clearInterval(interval);
      const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
      setOptimizations(data.optimizations || []);
      setShowOptimizeModal(true);
      toast.success(`AI Optimizations generated successfully! (Took ${elapsedSeconds} seconds)`, { id: toastId });
    } catch (err) {
      clearInterval(interval);
      console.error("AI Tailor Error:", err);
      toast.error(err.message || "Failed to generate AI Optimizations", { id: toastId });
    } finally {
      setOptimizing(false);
    }
  };

  const handleAIEnhance = async () => {
    if (seeker?.tier !== 'premium') {
      toast((t) => (
        <span className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-left">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>AI Resume Enhancer</strong> is a Premium feature. Please upgrade to unlock!</span>
          </span>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/jobs/billing');
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold w-fit transition-colors"
          >
            Upgrade Now
          </button>
        </span>
      ), { duration: 5000 });
      return;
    }
    setEnhancing(true);
    const startTime = Date.now();
    const toastId = toast.loading("Initiating Full AI Enhancement...");
    
    // Create instant backup snapshot before AI modifies draft content
    try {
      const formattedTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      await seekerAPI.createVersion(resumeId, { title: `Pre-AI Enhance Backup - ${formattedTime}` });
      if (showVersionsPanel) {
        loadVersions();
      }
    } catch (backupErr) {
      console.error("Instant pre-AI Enhance backup failed:", backupErr);
    }

    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      toast.loading(`Thinking for ${elapsed}s... (AI Enhancement)`, { id: toastId });
    }, 1000);

    try {
      const payload = {
        resumeDraftId: resumeId,
        content,
        targetJobDescription: targetJobDescription || "",
        liveAtsScore: atsReport?.overallScore || null   // send live score as anchor
      };
      const response = await seekerAPI.enhanceDraft(payload);
      clearInterval(interval);
      const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
      setEnhancementReport(response);
      setShowEnhanceModal(true);
      toast.success(`AI Enhancement analysis completed! (Took ${elapsedSeconds} seconds)`, { id: toastId });
    } catch (err) {
      clearInterval(interval);
      console.error("AI Enhance Error:", err);
      toast.error(err.message || "Failed to generate AI Enhancement", { id: toastId });
    } finally {
      setEnhancing(false);
    }
  };

  const saveUpdatedContent = async (updatedContent) => {
    try {
      await seekerAPI.updateDraft(resumeId, {
        title: draftTitle,
        templateId,
        content: updatedContent
      });
      // Re-evaluate compatibility immediately!
      runAtsCheck(updatedContent);
    } catch (err) {
      console.error("Auto-saving AI changes failed:", err);
      toast.error("Failed to save AI changes to database.");
    }
  };

  const applyMissingKeywords = () => {
    if (!enhancementReport || !enhancementReport.missing_keywords) return;
    const currentSkills = content.skills || [];
    const skillsToAdd = enhancementReport.missing_keywords.filter(
      (kw) => !currentSkills.some((s) => s.toLowerCase().trim() === kw.toLowerCase().trim())
    );
    if (skillsToAdd.length === 0) {
      toast.success("All keywords are already in your skills!");
      return;
    }
    const updatedContent = {
      ...content,
      skills: [...currentSkills, ...skillsToAdd]
    };
    setContent(updatedContent);
    saveUpdatedContent(updatedContent);
    toast.success("Added missing keywords to skills!");
  };

  const applyEnhancedSummary = (newSummary) => {
    let summaryText = newSummary ? newSummary.trim() : "";
    if (summaryText && !summaryText.endsWith(".")) {
      summaryText += ".";
    }
    const updatedContent = {
      ...content,
      summary: summaryText
    };
    setContent(updatedContent);
    saveUpdatedContent(updatedContent);
    toast.success("Applied AI summary rewrite!");
  };

  const dismissEnhancedSummary = () => {
    setEnhancementReport((prev) => ({ ...prev, summary_rewrite: null }));
    toast.success("Summary suggestion dismissed");
  };

  const dismissEnhancedExperience = (idx) => {
    setEnhancementReport((prev) => ({
      ...prev,
      enhanced_experience: (prev.enhanced_experience || []).filter((_, i) => i !== idx)
    }));
    toast.success("Experience suggestion dismissed");
  };

  const dismissEnhancedProject = (idx) => {
    setEnhancementReport((prev) => ({
      ...prev,
      enhanced_projects: (prev.enhanced_projects || []).filter((_, i) => i !== idx)
    }));
    toast.success("Project suggestion dismissed");
  };

  const applyEnhancedBullets = (expIdx, enhancedBullets) => {
    const newExp = [...(content.experience || [])];
    if (newExp[expIdx]) {
      newExp[expIdx] = {
        ...newExp[expIdx],
        bullets: enhancedBullets
      };
    }
    const updatedContent = { ...content, experience: newExp };
    setContent(updatedContent);
    saveUpdatedContent(updatedContent);
    toast.success("Applied enhanced bullets!");
  };

  const applySingleEnhancedBullet = (expIdx, bulletIdx, enhancedText) => {
    const newExp = [...(content.experience || [])];
    if (newExp[expIdx] && newExp[expIdx].bullets) {
      const newBullets = [...newExp[expIdx].bullets];
      newBullets[bulletIdx] = enhancedText;
      newExp[expIdx] = { ...newExp[expIdx], bullets: newBullets };
    }
    const updatedContent = { ...content, experience: newExp };
    setContent(updatedContent);
    saveUpdatedContent(updatedContent);
    toast.success("Applied enhanced bullet!");
  };

  const applyEnhancedProjectBullets = (projIdx, enhancedBullets) => {
    const newProjects = [...(content.projects || [])];
    if (newProjects[projIdx]) {
      const bullets = Array.isArray(enhancedBullets) ? enhancedBullets : [];
      newProjects[projIdx] = {
        ...newProjects[projIdx],
        bullets: bullets,
        description: bullets.map(b => `• ${b}`).join('\n')
      };
    }
    const updatedContent = { ...content, projects: newProjects };
    setContent(updatedContent);
    saveUpdatedContent(updatedContent);
    toast.success("Applied enhanced project bullets!");
  };

  const applySingleEnhancedProjectBullet = (projIdx, bulletIdx, enhancedText) => {
    const newProjects = [...(content.projects || [])];
    if (newProjects[projIdx]) {
      const newBullets = [...(newProjects[projIdx].bullets || [])];
      if (bulletIdx < newBullets.length) {
        newBullets[bulletIdx] = enhancedText;
      } else {
        newBullets.push(enhancedText);
      }
      newProjects[projIdx] = { 
        ...newProjects[projIdx], 
        bullets: newBullets,
        description: newBullets.map(b => `• ${b}`).join('\n')
      };
    }
    const updatedContent = { ...content, projects: newProjects };
    setContent(updatedContent);
    saveUpdatedContent(updatedContent);
    toast.success("Applied enhanced project bullet!");
  };

  const applyAllEnhancements = () => {
    if (!enhancementReport) return;
    const newContent = { ...content };
    
    if (enhancementReport.summary_rewrite) {
      let summaryText = enhancementReport.summary_rewrite.trim();
      if (summaryText && !summaryText.endsWith(".")) {
        summaryText += ".";
      }
      newContent.summary = summaryText;
    }
    
    if (enhancementReport.enhanced_experience && newContent.experience) {
      enhancementReport.enhanced_experience.forEach((item, idx) => {
        let expIdx = newContent.experience.findIndex(
          (e) =>
            e.company?.toLowerCase()?.trim() === item.company?.toLowerCase()?.trim() ||
            e.title?.toLowerCase()?.trim() === item.role?.toLowerCase()?.trim()
        );
        if (expIdx === -1 && newContent.experience[idx]) {
          expIdx = idx;
        }
        if (expIdx !== -1 && newContent.experience[expIdx]) {
          newContent.experience[expIdx] = {
            ...newContent.experience[expIdx],
            bullets: item.enhanced_bullets
          };
        }
      });
    }

    if (enhancementReport.enhanced_projects && newContent.projects) {
      enhancementReport.enhanced_projects.forEach((item, idx) => {
        let projIdx = newContent.projects.findIndex(
          (p) => p.name?.toLowerCase()?.trim() === item.name?.toLowerCase()?.trim()
        );
        if (projIdx === -1 && newContent.projects[idx]) {
          projIdx = idx;
        }
        if (projIdx !== -1 && newContent.projects[projIdx]) {
          const bullets = Array.isArray(item.enhanced_bullets) ? item.enhanced_bullets : [];
          newContent.projects[projIdx] = {
            ...newContent.projects[projIdx],
            bullets: bullets,
            description: bullets.map(b => `• ${b}`).join('\n')
          };
        }
      });
    }

    if (enhancementReport.missing_keywords && enhancementReport.missing_keywords.length > 0) {
      const currentSkills = newContent.skills || [];
      const skillsToAdd = enhancementReport.missing_keywords.filter(
        (kw) => !currentSkills.some((s) => s.toLowerCase().trim() === kw.toLowerCase().trim())
      );
      if (skillsToAdd.length > 0) {
        newContent.skills = [...currentSkills, ...skillsToAdd];
      }
    }
    
    setContent(newContent);
    saveUpdatedContent(newContent);
    toast.success("All enhancements applied successfully!");
    setShowEnhanceModal(false);
  };

  const applyOptimization = (opt) => {
    const id = opt.id;
    const newContent = { ...content };
    
    if (id === "summary") {
      let summaryText = opt.optimized_text ? opt.optimized_text.trim() : "";
      if (summaryText && !summaryText.endsWith(".")) {
        summaryText += ".";
      }
      newContent.summary = summaryText;
    } else if (id.startsWith("exp_")) {
      const parts = id.split("_");
      const expIdx = parseInt(parts[1], 10);
      const bulletIdx = parseInt(parts[2], 10);
      
      if (newContent.experience && newContent.experience[expIdx]) {
        const newExp = [...newContent.experience];
        const newBullets = [...(newExp[expIdx].bullets || [])];
        newBullets[bulletIdx] = opt.optimized_text;
        newExp[expIdx].bullets = newBullets;
        newContent.experience = newExp;
      }
    } else if (id.startsWith("proj_") && id.endsWith("_desc")) {
      const parts = id.split("_");
      const projIdx = parseInt(parts[1], 10);
      
      if (newContent.projects && newContent.projects[projIdx]) {
        const newProj = [...newContent.projects];
        newProj[projIdx].description = opt.optimized_text;
        const bulletLines = opt.optimized_text
          .split(/[\n•*-]+/)
          .map(line => line.trim())
          .filter(Boolean);
        newProj[projIdx].bullets = bulletLines;
        newContent.projects = newProj;
      }
    }
    
    setContent(newContent);
    saveUpdatedContent(newContent);
    setOptimizations((prev) => prev.filter((o) => o.id !== id));
    toast.success("Applied optimization!");
  };

  const rejectOptimization = (id) => {
    setOptimizations((prev) => prev.filter((o) => o.id !== id));
    toast.success("Suggestion dismissed");
  };

  const handlePatchContent = (patch) => {
    setContent((prev) => ({
      ...prev,
      ...patch
    }));
  };

  const handlePatchPersonalInfo = (field, val) => {
    setContent((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: val
      }
    }));
  };

  // 3. Save Draft
  const handleSaveDraft = async (silent = false) => {
    setSaveLoading(true);
    try {
      await seekerAPI.updateDraft(resumeId, {
        title: draftTitle,
        templateId,
        content
      });
      if (!silent) toast.success("Draft saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save draft");
    } finally {
      setSaveLoading(false);
    }
  };

  // 4. Export PDF (Frontend html2pdf download or backend high-fidelity renderer)
  const handleExportPdf = async () => {
    try {
      toast.loading("Generating high-fidelity PDF…", { id: "pdf" });

      if (templateId === "ats") {
        // Backend ReportLab high-fidelity render
        await seekerAPI.updateDraft(resumeId, {
          title: draftTitle,
          templateId,
          content
        });

        const res = await seekerAPI.exportDraftPdf(resumeId);
        if (res.downloadUrl) {
          const link = document.createElement("a");
          const fullUrl = res.downloadUrl.startsWith("http") 
            ? res.downloadUrl 
            : `${API_HOST}${res.downloadUrl}`;
          link.href = fullUrl;
          link.setAttribute("download", `${(draftTitle || "resume").replace(/\s+/g, "_")}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          toast.success("ATS-Safe PDF exported successfully", { id: "pdf" });
          return;
        }
      }

      // Standard html2pdf rendering fallback for other templates
      if (!previewRef.current) return;
      const html2pdf = (await import("html2pdf.js")).default;
      const node = previewRef.current.querySelector(".resume-page");
      if (!node) {
        toast.error("No preview node found to export", { id: "pdf" });
        return;
      }
      
      const options = {
        margin: 0,
        filename: `${(draftTitle || "resume").replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          onclone: (clonedDoc) => {
            const style = clonedDoc.createElement("style");
            style.innerHTML = `
              :root, [class*="rb-pro-scope"], body {
                --background: #ffffff !important;
                --foreground: #1a1a1a !important;
                --card: #ffffff !important;
                --card-foreground: #1a1a1a !important;
                --popover: #ffffff !important;
                --popover-foreground: #1a1a1a !important;
                --primary: #1a73e8 !important;
                --primary-foreground: #ffffff !important;
                --secondary: #f1f3f4 !important;
                --secondary-foreground: #1a1a1a !important;
                --muted: #f1f3f4 !important;
                --muted-foreground: #5f6368 !important;
                --accent: #f1f3f4 !important;
                --accent-foreground: #1a1a1a !important;
                --destructive: #d93025 !important;
                --destructive-foreground: #ffffff !important;
                --border: #dadce0 !important;
                --input: #dadce0 !important;
                --ring: #1a73e8 !important;
                --google-blue: #1a73e8 !important;
                --google-red: #ea4335 !important;
                --google-yellow: #fbbc05 !important;
                --google-green: #34a853 !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      };

      await html2pdf().set(options).from(node).save();
      toast.success("PDF exported successfully", { id: "pdf" });
    } catch (err) {
      console.error(err);
      toast.error("Export failed", { id: "pdf" });
    }
  };

  // 5. Activate Draft (Synchronize Profile)
  const handleActivateResume = async () => {
    setActivateLoading(true);
    try {
      toast.loading("Syncing draft and rendering PDF profile...", { id: "activate" });
      
      // Auto-save draft first so database is up to date
      await seekerAPI.updateDraft(resumeId, {
        title: draftTitle,
        templateId,
        content
      });

      let pdfBlob;
      if (templateId === "ats") {
        // Fetch from backend render
        const res = await seekerAPI.exportDraftPdf(resumeId);
        const pdfResponse = await fetch(res.downloadUrl);
        pdfBlob = await pdfResponse.blob();
      } else {
        // Generate from html2pdf
        if (!previewRef.current) {
          toast.error("No preview page found to activate", { id: "activate" });
          setActivateLoading(false);
          return;
        }
        const html2pdf = (await import("html2pdf.js")).default;
        const node = previewRef.current.querySelector(".resume-page");
        if (!node) {
          toast.error("No preview page found to activate", { id: "activate" });
          setActivateLoading(false);
          return;
        }

        const options = {
          margin: 0,
          filename: `active_resume.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            onclone: (clonedDoc) => {
              const style = clonedDoc.createElement("style");
              style.innerHTML = `
                :root, [class*="rb-pro-scope"], body {
                  --background: #ffffff !important;
                  --foreground: #1a1a1a !important;
                  --card: #ffffff !important;
                  --card-foreground: #1a1a1a !important;
                  --popover: #ffffff !important;
                  --popover-foreground: #1a1a1a !important;
                  --primary: #1a73e8 !important;
                  --primary-foreground: #ffffff !important;
                  --secondary: #f1f3f4 !important;
                  --secondary-foreground: #1a1a1a !important;
                  --muted: #f1f3f4 !important;
                  --muted-foreground: #5f6368 !important;
                  --accent: #f1f3f4 !important;
                  --accent-foreground: #1a1a1a !important;
                  --destructive: #d93025 !important;
                  --destructive-foreground: #ffffff !important;
                  --border: #dadce0 !important;
                  --input: #dadce0 !important;
                  --ring: #1a73e8 !important;
                  --google-blue: #1a73e8 !important;
                  --google-red: #ea4335 !important;
                  --google-yellow: #fbbc05 !important;
                  --google-green: #34a853 !important;
                }
              `;
              clonedDoc.head.appendChild(style);
            }
          },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };

        pdfBlob = await html2pdf().set(options).from(node).output("blob");
      }
      
      // Convert blob to file and upload
      const pdfFile = new File([pdfBlob], "active_resume.pdf", { type: "application/pdf" });
      const result = await seekerAPI.activateDraft(resumeId, pdfFile);
      
      // Save local storage profile to stay in sync
      localStorage.setItem("vish_seeker_data", JSON.stringify({
        ...JSON.parse(localStorage.getItem("vish_seeker_data") || "{}"),
        has_resume: true,
        resume_data: result.resumeData
      }));

      toast.success("Set as Active Profile Resume!", { id: "activate" });
      navigate("/jobs/profile");
    } catch (err) {
      console.error(err);
      toast.error("Activation failed: " + err.message, { id: "activate" });
    } finally {
      setActivateLoading(false);
    }
  };

  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  // Visual warning checks for accordions
  const hasFormattingIssues = atsReport?.breakdown?.formatting?.issues?.length > 0;
  const hasStructureIssues = atsReport?.breakdown?.structure?.issues?.length > 0;
  const hasContentIssues = atsReport?.breakdown?.content?.weakBullets?.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Loading draft settings...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-surface-2 rb-pro-scope">
      {/* Chrome Header */}
      <Header />

      {/* Editor Sub-Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-5 py-3 shadow-elevation-1">
        <div className="flex items-center gap-3">
          <Link to="/resume-builder" className="p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="text-base font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-2 py-0.5"
            placeholder="Untitled Resume"
          />
          <span className={`text-[10px] ml-2 px-2 py-0.5 rounded-full font-medium transition-all ${
            autoSaveStatus === "Saved" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
            autoSaveStatus === "Saving..." ? "bg-blue-500/10 text-blue-600 animate-pulse" :
            "bg-destructive/10 text-destructive"
          }`}>
            {autoSaveStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionsPanel(!showVersionsPanel)}
            className={`inline-flex items-center gap-1.5 pill border px-4 py-2 text-xs font-semibold transition-all ${
              showVersionsPanel 
                ? "bg-primary/10 text-primary border-primary/20" 
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Versions
          </button>
          <button
            disabled={saveLoading}
            onClick={() => handleSaveDraft(false)}
            className="inline-flex items-center gap-1.5 pill border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted transition-all disabled:opacity-50"
          >
            {saveLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </button>
          <button
            disabled={activateLoading}
            onClick={handleActivateResume}
            className="inline-flex items-center gap-1.5 pill bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
          >
            {activateLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Set as Active Resume
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR FOR EDITING FORM */}
        <aside className="flex w-[420px] flex-col border-r border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-muted/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Resume Content</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={templateId}
                onChange={(e) => {
                  const val = e.target.value;
                  const isPremium = ['executive', 'creative', 'compact'].includes(val);
                  if (isPremium && seeker?.tier !== 'premium') {
                    toast((t) => (
                      <span className="flex flex-col gap-2 text-left">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <span><strong>{TEMPLATE_META[val].name}</strong> is a Premium template. Please upgrade to use it!</span>
                        </span>
                        <button 
                          onClick={() => {
                            toast.dismiss(t.id);
                            navigate('/jobs/billing');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold w-fit transition-colors"
                        >
                          Upgrade Now
                        </button>
                      </span>
                    ), { duration: 5000 });
                    return;
                  }
                  setTemplateId(val);
                  // Trigger auto-save on template change
                  setTimeout(() => handleSaveDraft(true), 100);
                }}
                className="rounded-full border border-border bg-background px-2.5 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
              >
                {Object.keys(TEMPLATE_META).map((id) => {
                  const isPremium = ['executive', 'creative', 'compact'].includes(id);
                  const isLocked = isPremium && seeker?.tier !== 'premium';
                  return (
                    <option key={id} value={id}>
                      {TEMPLATE_META[id].name} {isLocked ? "🔒" : ""}
                    </option>
                  );
                })}
              </select>
              <select
                value={content.columns || 1}
                onChange={(e) => {
                  const cols = parseInt(e.target.value, 10);
                  const updated = { ...content, columns: cols };
                  setContent(updated);
                  saveUpdatedContent(updated);
                }}
                className="rounded-full border border-border bg-background px-2.5 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
              >
                <option value={1}>1 Col</option>
                <option value={2}>2 Cols</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 1. PERSONAL INFO SECTION */}
            <SectionShell
              icon={<User className="h-4 w-4" />}
              title="Personal info"
              open={open.personal}
              onToggle={() => toggle("personal")}
              hasWarning={
                hasFormattingIssues ||
                Boolean(
                  validateFullName(content.personalInfo?.fullName) ||
                  validateTextTitle(content.personalInfo?.title, "Title") ||
                  validateEmail(content.personalInfo?.email) ||
                  validatePhone(content.personalInfo?.phone) ||
                  validateUrl(content.personalInfo?.website, "Website") ||
                  validateUrl(content.personalInfo?.linkedin, "LinkedIn") ||
                  validateUrl(content.personalInfo?.github, "GitHub")
                )
              }
            >
              <Field label="Full name" value={content.personalInfo?.fullName || ""} error={validateFullName(content.personalInfo?.fullName)} onChange={(v) => handlePatchPersonalInfo("fullName", v)} />
              <Field label="Title" value={content.personalInfo?.title || ""} error={validateTextTitle(content.personalInfo?.title, "Title")} onChange={(v) => handlePatchPersonalInfo("title", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" type="email" value={content.personalInfo?.email || ""} error={validateEmail(content.personalInfo?.email)} onChange={(v) => handlePatchPersonalInfo("email", v)} />
                <Field label="Phone" type="phone" value={content.personalInfo?.phone || ""} error={validatePhone(content.personalInfo?.phone)} onChange={(v) => handlePatchPersonalInfo("phone", v)} />
              </div>
              <Field label="Location" value={content.personalInfo?.location || ""} onChange={(v) => handlePatchPersonalInfo("location", v)} />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Website" placeholder="https://..." value={content.personalInfo?.website || ""} error={validateUrl(content.personalInfo?.website, "Website")} onChange={(v) => handlePatchPersonalInfo("website", v)} />
                <Field label="LinkedIn" placeholder="https://..." value={content.personalInfo?.linkedin || ""} error={validateUrl(content.personalInfo?.linkedin, "LinkedIn")} onChange={(v) => handlePatchPersonalInfo("linkedin", v)} />
                <Field label="GitHub" placeholder="https://..." value={content.personalInfo?.github || ""} error={validateUrl(content.personalInfo?.github, "GitHub")} onChange={(v) => handlePatchPersonalInfo("github", v)} />
              </div>
            </SectionShell>

            {/* 2. PROFESSIONAL SUMMARY */}
            <SectionShell
              icon={<Layers className="h-4 w-4" />}
              title="Professional summary"
              open={open.summary}
              onToggle={() => toggle("summary")}
              hasWarning={(hasContentIssues && !content.summary) || Boolean(validateSummary(content.summary))}
            >
              <Field
                multiline
                label="Summary"
                value={content.summary || ""}
                error={validateSummary(content.summary)}
                onChange={(v) => handlePatchContent({ summary: v })}
              />
            </SectionShell>

            {/* 3. WORK EXPERIENCE */}
            <SectionShell
              icon={<Briefcase className="h-4 w-4" />}
              title="Experience"
              open={open.experience}
              onToggle={() => toggle("experience")}
              hasWarning={
                hasContentIssues ||
                (content.experience || []).some(
                  (x) =>
                    validateTextTitle(x.title, "Job title") ||
                    validateTextTitle(x.company, "Company name") ||
                    validateDateStr(x.startDate, "Start date") ||
                    validateDateStr(x.endDate, "End date") ||
                    validateDateRange(x.startDate, x.endDate) ||
                    (x.bullets || []).some((b) => validateBullet(b))
                )
              }
              onAdd={() =>
                handlePatchContent({
                  experience: [
                    ...(content.experience || []),
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      company: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      bullets: [""]
                    }
                  ]
                })
              }
            >
              {(content.experience || []).map((x, idx) => (
                <div key={x.id} className="rounded-2xl border border-border bg-surface p-3 space-y-2">
                  <div className="flex justify-end">
                    <IconBtn
                      onClick={() =>
                        handlePatchContent({
                          experience: content.experience.filter((e) => e.id !== x.id)
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                  <Field
                    label="Title"
                    value={x.title}
                    error={validateTextTitle(x.title, "Job title")}
                    onChange={(v) =>
                      handlePatchContent({
                        experience: content.experience.map((e, i) =>
                          i === idx ? { ...e, title: v } : e
                        )
                      })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Company"
                      value={x.company}
                      error={validateTextTitle(x.company, "Company name")}
                      onChange={(v) =>
                        handlePatchContent({
                          experience: content.experience.map((e, i) =>
                            i === idx ? { ...e, company: v } : e
                          )
                        })
                      }
                    />
                    <Field
                      label="Location"
                      value={x.location || ""}
                      onChange={(v) =>
                        handlePatchContent({
                          experience: content.experience.map((e, i) =>
                            i === idx ? { ...e, location: v } : e
                          )
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Start Date"
                      placeholder="e.g. Mar 2022"
                      value={x.startDate}
                      error={validateDateStr(x.startDate, "Start date")}
                      onChange={(v) =>
                        handlePatchContent({
                          experience: content.experience.map((e, i) =>
                            i === idx ? { ...e, startDate: v } : e
                          )
                        })
                      }
                    />
                    <Field
                      label="End Date"
                      placeholder="e.g. Present"
                      value={x.endDate}
                      error={validateDateStr(x.endDate, "End date") || validateDateRange(x.startDate, x.endDate)}
                      onChange={(v) =>
                        handlePatchContent({
                          experience: content.experience.map((e, i) =>
                            i === idx ? { ...e, endDate: v } : e
                          )
                        })
                      }
                    />
                  </div>
                  
                  {/* Bullets */}
                  <div className="mt-2">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Bullet Points</label>
                    {(x.bullets || []).map((b, bi) => (
                      <div key={bi} className="mt-1.5 flex flex-col gap-1">
                        <div className="flex gap-2">
                          <textarea
                            value={b}
                            rows={2}
                            onChange={(e) =>
                              handlePatchContent({
                                experience: content.experience.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        bullets: it.bullets.map((bb, j) =>
                                          j === bi ? e.target.value : bb
                                        )
                                      }
                                    : it
                                )
                              })
                            }
                            placeholder="Quantify details, e.g. increased X by Y%..."
                            className={`w-full resize-none rounded-xl border bg-background px-3 py-2 text-xs transition-all ${
                              validateBullet(b)
                                ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20 text-destructive font-medium"
                                : "border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            }`}
                          />
                          <IconBtn
                            onClick={() =>
                              handlePatchContent({
                                experience: content.experience.map((it, i) =>
                                  i === idx
                                    ? { ...it, bullets: it.bullets.filter((_, j) => j !== bi) }
                                    : it
                                )
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconBtn>
                        </div>
                        {validateBullet(b) && (
                          <span className="text-[10px] font-semibold text-destructive ml-1">{validateBullet(b)}</span>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        handlePatchContent({
                          experience: content.experience.map((it, i) =>
                            i === idx ? { ...it, bullets: [...it.bullets, ""] } : it
                          )
                        })
                      }
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Add bullet
                    </button>
                  </div>
                </div>
              ))}
            </SectionShell>

            {/* 4. EDUCATION */}
            <SectionShell
              icon={<GraduationCap className="h-4 w-4" />}
              title="Education"
              open={open.education}
              onToggle={() => toggle("education")}
              hasWarning={
                (hasStructureIssues && content.education?.length === 0) ||
                (content.education || []).some(
                  (e) =>
                    validateTextTitle(e.degree, "Degree") ||
                    validateTextTitle(e.school, "School name") ||
                    validateDateStr(e.startDate, "Start date") ||
                    validateDateStr(e.endDate, "End date") ||
                    validateDateRange(e.startDate, e.endDate)
                )
              }
              onAdd={() =>
                handlePatchContent({
                  education: [
                    ...(content.education || []),
                    {
                      id: crypto.randomUUID(),
                      school: "",
                      degree: "",
                      location: "",
                      startDate: "",
                      endDate: ""
                    }
                  ]
                })
              }
            >
              {(content.education || []).map((e, idx) => (
                <div key={e.id} className="rounded-2xl border border-border bg-surface p-3 space-y-2">
                  <div className="flex justify-end">
                    <IconBtn
                      onClick={() =>
                        handlePatchContent({
                          education: content.education.filter((x) => x.id !== e.id)
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                  <Field
                    label="Degree"
                    value={e.degree}
                    error={validateTextTitle(e.degree, "Degree")}
                    onChange={(v) =>
                      handlePatchContent({
                        education: content.education.map((it, i) =>
                          i === idx ? { ...it, degree: v } : it
                        )
                      })
                    }
                  />
                  <Field
                    label="School / University"
                    value={e.school}
                    error={validateTextTitle(e.school, "School name")}
                    onChange={(v) =>
                      handlePatchContent({
                        education: content.education.map((it, i) =>
                          i === idx ? { ...it, school: v } : it
                        )
                      })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Start Date"
                      placeholder="e.g. 2018"
                      value={e.startDate}
                      error={validateDateStr(e.startDate, "Start date")}
                      onChange={(v) =>
                        handlePatchContent({
                          education: content.education.map((it, i) =>
                            i === idx ? { ...it, startDate: v } : it
                          )
                        })
                      }
                    />
                    <Field
                      label="End Date"
                      placeholder="e.g. 2022"
                      value={e.endDate}
                      error={validateDateStr(e.endDate, "End date") || validateDateRange(e.startDate, e.endDate)}
                      onChange={(v) =>
                        handlePatchContent({
                          education: content.education.map((it, i) =>
                            i === idx ? { ...it, endDate: v } : it
                          )
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </SectionShell>

            {/* 5. SKILLS */}
            <SectionShell
              icon={<Sparkles className="h-4 w-4" />}
              title="Skills"
              open={open.skills}
              onToggle={() => toggle("skills")}
            >
              <Field
                multiline
                label="Skills (Comma-separated)"
                placeholder="e.g. React, Python, Product Design, SQL"
                value={(content.skills || []).join(", ")}
                onChange={(v) =>
                  handlePatchContent({
                    skills: v
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  })
                }
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(content.skills || []).map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </SectionShell>

            {/* 6. PROJECTS */}
            <SectionShell
              icon={<FolderGit2 className="h-4 w-4" />}
              title="Projects"
              open={open.projects}
              onToggle={() => toggle("projects")}
              hasWarning={(content.projects || []).some((p) => validateTextTitle(p.name, "Project name") || validateUrl(p.link, "Project link"))}
              onAdd={() =>
                handlePatchContent({
                  projects: [
                    ...(content.projects || []),
                    { 
                      id: crypto.randomUUID(), 
                      name: "", 
                      link: "", 
                      description: "",
                      techStack: []
                    }
                  ]
                })
              }
            >
              {(content.projects || []).map((p, idx) => (
                <div key={p.id} className="rounded-2xl border border-border bg-surface p-3 space-y-2">
                  <div className="flex justify-end">
                    <IconBtn
                      onClick={() =>
                        handlePatchContent({
                          projects: content.projects.filter((x) => x.id !== p.id)
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                  <Field
                    label="Project Name"
                    value={p.name}
                    error={validateTextTitle(p.name, "Project name")}
                    onChange={(v) =>
                      handlePatchContent({
                        projects: content.projects.map((it, i) =>
                          i === idx ? { ...it, name: v } : it
                        )
                      })
                    }
                  />
                  <Field
                    label="Link"
                    placeholder="https://..."
                    value={p.link || ""}
                    error={validateUrl(p.link, "Project link")}
                    onChange={(v) =>
                      handlePatchContent({
                        projects: content.projects.map((it, i) =>
                          i === idx ? { ...it, link: v } : it
                        )
                      })
                    }
                  />
                  <Field
                    multiline
                    label="Description"
                    value={p.description}
                    onChange={(v) =>
                      handlePatchContent({
                        projects: content.projects.map((it, i) =>
                          i === idx ? { ...it, description: v } : it
                        )
                      })
                    }
                  />
                  <Field
                    label="Tech Stack (comma-separated)"
                    placeholder="e.g. React, Python, Flask, MySQL"
                    value={(p.techStack || []).join(", ")}
                    onChange={(v) =>
                      handlePatchContent({
                        projects: content.projects.map((it, i) =>
                          i === idx
                            ? { ...it, techStack: v.split(",").map((s) => s.trim()).filter(Boolean) }
                            : it
                        )
                      })
                    }
                  />
                  {(p.techStack || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(p.techStack || []).map((t, ti) => (
                        <span key={ti} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </SectionShell>

            {/* 7. CERTIFICATIONS */}
            <SectionShell
              icon={<Sparkles className="h-4 w-4" />}
              title="Certifications"
              open={open.certifications}
              onToggle={() => toggle("certifications")}
              hasWarning={(content.certifications || []).some((c) => validateTextTitle(c.name, "Certification name") || validateTextTitle(c.issuer, "Issuer name") || validateDateStr(c.date, "Date"))}
              onAdd={() =>
                handlePatchContent({
                  certifications: [
                    ...(content.certifications || []),
                    { 
                      id: crypto.randomUUID(), 
                      name: "", 
                      issuer: "", 
                      date: "",
                      link: ""
                    }
                  ]
                })
              }
            >
              {(content.certifications || []).map((c, idx) => (
                <div key={c.id} className="rounded-2xl border border-border bg-surface p-3 space-y-2">
                  <div className="flex justify-end">
                    <IconBtn
                      onClick={() =>
                        handlePatchContent({
                          certifications: content.certifications.filter((x) => x.id !== c.id)
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                  <Field
                    label="Certification Name"
                    value={c.name}
                    error={validateTextTitle(c.name, "Certification name")}
                    onChange={(v) =>
                      handlePatchContent({
                        certifications: content.certifications.map((it, i) =>
                          i === idx ? { ...it, name: v } : it
                        )
                      })
                    }
                  />
                  <Field
                    label="Credential Link"
                    placeholder="https://..."
                    value={c.link || ""}
                    onChange={(v) =>
                      handlePatchContent({
                        certifications: content.certifications.map((it, i) =>
                          i === idx ? { ...it, link: v } : it
                        )
                      })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Issuer"
                      value={c.issuer || ""}
                      error={validateTextTitle(c.issuer, "Issuer name")}
                      onChange={(v) =>
                        handlePatchContent({
                          certifications: content.certifications.map((it, i) =>
                            i === idx ? { ...it, issuer: v } : it
                          )
                        })
                      }
                    />
                    <Field
                      label="Date"
                      placeholder="e.g. 2023"
                      value={c.date || ""}
                      error={validateDateStr(c.date, "Date")}
                      onChange={(v) =>
                        handlePatchContent({
                          certifications: content.certifications.map((it, i) =>
                            i === idx ? { ...it, date: v } : it
                          )
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </SectionShell>

            {/* 8. LANGUAGES */}
            <SectionShell
              icon={<Layers className="h-4 w-4" />}
              title="Languages"
              open={open.languages}
              onToggle={() => toggle("languages")}
              onAdd={() =>
                handlePatchContent({
                  languages: [
                    ...(content.languages || []),
                    { 
                      id: crypto.randomUUID(), 
                      name: "", 
                      proficiency: "" 
                    }
                  ]
                })
              }
            >
              {(content.languages || []).map((l, idx) => (
                <div key={l.id} className="rounded-2xl border border-border bg-surface p-3 space-y-2">
                  <div className="flex justify-end">
                    <IconBtn
                      onClick={() =>
                        handlePatchContent({
                          languages: content.languages.filter((x) => x.id !== l.id)
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Language"
                      value={l.name}
                      onChange={(v) =>
                        handlePatchContent({
                          languages: content.languages.map((it, i) =>
                            i === idx ? { ...it, name: v } : it
                          )
                        })
                      }
                    />
                    <Field
                      label="Proficiency"
                      value={l.proficiency || ""}
                      onChange={(v) =>
                        handlePatchContent({
                          languages: content.languages.map((it, i) =>
                            i === idx ? { ...it, proficiency: v } : it
                          )
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </SectionShell>
          </div>
        </aside>

          {/* CENTER PANE: RESUME TEMPLATE PREVIEW */}
          <main className="flex-1 overflow-hidden bg-surface-2 flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/85 px-6 py-3 backdrop-blur-xl">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                Active Template: <span className="font-semibold text-foreground">{TEMPLATE_META[templateId]?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 border border-border bg-background hover:bg-muted text-foreground rounded-full transition-all flex items-center justify-center"
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setShowAtsPanel(!showAtsPanel)}
                  className={`inline-flex items-center gap-1.5 pill border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition-all ${
                    showAtsPanel ? "bg-primary-soft text-primary border-primary/20" : "bg-background text-muted-foreground"
                  }`}
                >
                  <Target className="h-3.5 w-3.5" />
                  {showAtsPanel ? "Hide ATS Panel" : "Show ATS Panel"}
                </button>
                <button
                  onClick={handleExportPdf}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-elevation-1 hover:shadow-elevation-2 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
              </div>
            </div>
            <div ref={previewRef} className="flex-1 overflow-y-auto p-8 flex justify-center">
              <div className="shadow-elevation-3 rounded-2xl bg-white h-fit mb-8">
                <ResumePreview template={templateId} resume={content} />
              </div>
            </div>
          </main>

        {/* VERSIONS PANEL */}
        {showVersionsPanel && (
          <aside className="w-[320px] border-l border-border bg-card flex flex-col overflow-hidden">
            <div className="border-b border-border px-5 py-4 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <History className="h-4 w-4 text-primary" />
                <span>Version History</span>
              </div>
              <button
                onClick={() => setShowVersionsPanel(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 rounded-lg hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Save New Version snapshot */}
              <div className="bg-muted/30 border border-border/60 p-3.5 rounded-2xl space-y-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Create Named Checkpoint
                </span>
                <input
                  type="text"
                  placeholder="e.g. Before AI Enhancements"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-background border border-border rounded-xl focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleSaveVersion}
                  className="w-full bg-primary text-primary-foreground font-bold text-xs py-2 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" /> Save Backup
                </button>
              </div>

              {/* Versions List */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Saved Snapshots
                </span>
                
                {versionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground">Loading checkpoints...</span>
                  </div>
                ) : versions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/10 rounded-xl">
                    No saved checkpoints. Create one above to preserve draft states.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {versions.map((v) => {
                      const dt = new Date(v.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      return (
                        <div key={v.id} className="border border-border/60 p-3 rounded-2xl bg-muted/10 flex flex-col gap-2 hover:bg-muted/20 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground block truncate" title={v.title}>
                                {v.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" /> {dt}
                              </span>
                            </div>
                            {v.atsScore !== null && (
                              <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full shrink-0">
                                ATS {v.atsScore}%
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRestoreVersion(v.id)}
                            className="text-[10px] font-bold text-primary hover:underline self-end"
                          >
                            Restore snapshot ➔
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* RIGHT PANEL: DYNAMIC ATS COMPATIBILITY AGENT */}
        {showAtsPanel && (
          <aside className="w-[340px] border-l border-border bg-card flex flex-col overflow-hidden">
            <div className="border-b border-border px-5 py-4 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Target className="h-4 w-4 text-primary" />
                <span>ATS Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoScan}
                    onChange={(e) => setAutoScan(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/20 h-3.5 w-3.5 accent-primary"
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Auto</span>
                </label>
                <button
                  onClick={handleManualAtsCheck}
                  disabled={atsLoading}
                  className="p-1 text-muted-foreground hover:text-primary rounded-full hover:bg-muted transition-all disabled:opacity-50"
                  title="Recalculate ATS Score"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${atsLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Optional Job Description Input */}
              <div className="bg-muted/30 border border-border/60 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Target className="h-3 w-3 text-primary" /> Target Job Target
                  </span>
                  {jobInfo && (
                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                      Job-Targeted Mode
                    </span>
                  )}
                </div>
                {jobInfo && (
                  <div className="text-xs font-semibold text-foreground leading-tight">
                    {jobInfo.job_title} at {jobInfo.company?.name || "Target Company"}
                  </div>
                )}
                <textarea
                  value={targetJobDescription}
                  onChange={(e) => {
                    setTargetJobDescription(e.target.value);
                  }}
                  placeholder="Paste target job description or type a target job title (e.g. 'Frontend Developer') here to optimize your resume..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-[11px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-normal"
                />
              </div>

              {/* AI Optimize buttons */}
              <div className="px-1 space-y-2">
                <button
                  onClick={handleAIEnhance}
                  disabled={enhancing}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-elevation-1 hover:shadow-elevation-2 hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {enhancing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Running AI Enhancement...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>Full AI Enhancement</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleAITailor}
                  disabled={optimizing}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all disabled:opacity-50"
                >
                  {optimizing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating AI Patches...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Quick Polish (AI Patches)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error or Fallback State */}
              {atsError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex flex-col gap-3">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold block">Scan Unavailable</span>
                      {atsError}
                    </div>
                  </div>
                  <button
                    onClick={handleManualAtsCheck}
                    className="pill bg-destructive text-white py-1.5 text-[10px] font-bold hover:bg-destructive/90 transition-all inline-flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry Scan
                  </button>
                </div>
              )}

              {/* Loading Overlay */}
              {atsLoading && !atsReport && (
                <div className="h-48 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">Scanning compatibility...</span>
                </div>
              )}

              {/* Full report dashboard */}
              {atsReport && (
                <div className="space-y-4">
                  {atsReport.mode === "general_ats" && Array.isArray(atsReport.checklist) ? (
                    <AtsTealReport report={atsReport} />
                  ) : (
                    <>
                      {/* JD / legacy score indicator */}
                      <div className="text-center bg-muted/40 border border-border/60 p-5 rounded-3xl flex flex-col items-center">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="absolute w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="rgba(37, 99, 235, 0.1)" strokeWidth="8" fill="transparent" />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="rgb(37, 99, 235)"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 - (251.2 * (atsReport.overallScore || 0)) / 100}
                              className="transition-all duration-500 ease-out"
                            />
                          </svg>
                          <span className="text-2xl font-bold text-primary relative z-10">{atsReport.overallScore}%</span>
                        </div>
                        <h4 className="text-sm font-semibold mt-3">
                          {jobInfo || targetJobDescription ? "Job Match Score" : "ATS Score"}
                        </h4>
                      </div>

                      <div className="space-y-3.5">
                        <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Checks Breakdown</h5>
                        <BreakdownBar label="Keyword Match (30%)" score={atsReport.detailed_breakdown?.keyword_match?.score ?? atsReport.breakdown?.keywords?.score} />
                        <BreakdownBar label="Skills Match (15%)" score={atsReport.detailed_breakdown?.skills_match?.score ?? atsReport.breakdown?.integrity?.score} />
                        <BreakdownBar label="Experience Relevance (20%)" score={atsReport.detailed_breakdown?.experience_relevance?.score ?? 70} />
                        <BreakdownBar label={atsReport.detailed_breakdown?.project_relevance?.details?.includes("N/A") ? "Project Relevance (N/A)" : "Project Relevance (10%)"} score={atsReport.detailed_breakdown?.project_relevance?.score ?? 70} />
                        <BreakdownBar label="Achievement & Impact (10%)" score={atsReport.detailed_breakdown?.achievement_impact?.score ?? 80} />
                        <BreakdownBar label="ATS Formatting (10%)" score={atsReport.detailed_breakdown?.ats_formatting?.score ?? atsReport.breakdown?.formatting?.score} />
                        <BreakdownBar label="Job Title Match (5%)" score={atsReport.detailed_breakdown?.job_title_match?.score ?? 80} />
                      </div>

                      {/* Non-Weighted Quality Checks (Badges) */}
                      {atsReport.quality_checks && (
                        <div className="space-y-3 border-t border-border/60 pt-4">
                          <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quality Checks</h5>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-medium">
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-surface border border-border/40">
                              {atsReport.quality_checks.ats_parseability ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                              <span>Parseability</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-surface border border-border/40">
                              {atsReport.quality_checks.contact_info ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                              <span>Contact Info</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-surface border border-border/40">
                              {atsReport.quality_checks.grammar ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                              <span>Grammar</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-surface border border-border/40">
                              {atsReport.quality_checks.education_met ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                              <span>Education Match</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-surface border border-border/40">
                              {atsReport.quality_checks.resume_structure ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                              <span>Structure</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-surface border border-border/40">
                              {atsReport.quality_checks.readability ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                              <span>Readability</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {(atsReport.strengths?.length > 0 || atsReport.weaknesses?.length > 0) && (
                        <div className="space-y-3 border-t border-border/60 pt-4">
                          {atsReport.strengths?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1.5">Key Strengths</div>
                              <ul className="space-y-1">
                                {atsReport.strengths.map((str, idx) => (
                                  <li key={idx} className="flex gap-1.5 text-xs text-foreground items-start">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                                    <span>{str}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {atsReport.weaknesses?.length > 0 && (
                            <div className="mt-3.5">
                              <div className="text-[10px] font-bold text-destructive/80 uppercase tracking-wider mb-1.5">Weaknesses / Gaps</div>
                              <ul className="space-y-1">
                                {atsReport.weaknesses.map((weak, idx) => (
                                  <li key={idx} className="flex gap-1.5 text-xs text-foreground items-start">
                                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                                    <span>{weak}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {(jobInfo || targetJobDescription) && atsReport.breakdown?.keywords && (
                        <div className="space-y-3 border-t border-border/60 pt-4">
                          <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Job Keyword Density</h5>
                          <div>
                            <div className="text-[10px] font-bold text-destructive/80 uppercase tracking-wide mb-1">Missing Keywords</div>
                            {atsReport.breakdown.keywords.missingKeywords?.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {atsReport.breakdown.keywords.missingKeywords.map((kw, i) => (
                                  <span key={i} className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-lg font-medium">{kw}</span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">All critical keywords matched!</div>
                            )}
                          </div>
                        </div>
                      )}

                      {atsReport.topSuggestions?.length > 0 && (
                        <div className="space-y-3 border-t border-border/60 pt-4">
                          <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coach Recommendations</h5>
                          <ul className="space-y-2">
                            {atsReport.topSuggestions.map((s, idx) => (
                              <li key={idx} className="flex gap-2 text-xs text-foreground items-start leading-relaxed bg-surface border border-border/50 p-2.5 rounded-xl">
                                <span className="text-primary font-bold text-base shrink-0 mt-[-2px]">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* AI OPTIMIZATION COMPARE/DIFF DIALOG */}
      {showOptimizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">AI ATS Optimization Suggestions</h3>
                  <p className="text-xs text-muted-foreground">Selectively review and apply context-framing and keyword improvements.</p>
                </div>
              </div>
              <button
                onClick={() => setShowOptimizeModal(false)}
                className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-bold px-4 py-2 border border-border/50"
              >
                Done
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
              {optimizations.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-sm">All set! No pending optimizations.</h4>
                  <p className="text-xs text-muted-foreground max-w-[280px]">Your resume summary and bullets match target keywords or have been fully tailored.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizations.map((opt) => {
                    let label = "Professional Summary";
                    if (opt.id.startsWith("exp_")) {
                      const parts = opt.id.split("_");
                      const expIdx = parseInt(parts[1], 10) + 1;
                      label = `Work Experience #${expIdx} - Bullet Point`;
                    } else if (opt.id.startsWith("proj_")) {
                      const parts = opt.id.split("_");
                      const projIdx = parseInt(parts[1], 10) + 1;
                      label = `Project #${projIdx} - Description`;
                    }

                    return (
                      <div key={opt.id} className="border border-border/60 rounded-2xl bg-card overflow-hidden shadow-elevation-1 transition-all hover:shadow-elevation-2">
                        {/* Section Tag */}
                        <div className="bg-muted/30 px-5 py-2.5 border-b border-border/40 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => applyOptimization(opt)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                            </button>
                            <button
                              onClick={() => rejectOptimization(opt.id)}
                              className="px-3 py-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>

                        {/* Compare Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                          {/* Original */}
                          <div className="p-4 bg-red-500/5">
                            <span className="text-[9px] font-bold text-destructive/80 uppercase tracking-wider block mb-1">Original Text</span>
                            <p className="text-xs text-muted-foreground leading-relaxed line-through">{opt.original_text}</p>
                          </div>
                          {/* Optimized */}
                          <div className="p-4 bg-green-500/5">
                            <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider block mb-1">Optimized Text</span>
                            <p className="text-xs text-foreground leading-relaxed font-medium">{opt.optimized_text}</p>
                            
                            {/* Keywords added */}
                            {opt.keywords_added && opt.keywords_added.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1 items-center">
                                <span className="text-[9px] text-muted-foreground font-semibold uppercase mr-1">Added:</span>
                                {opt.keywords_added.map((kw, i) => (
                                  <span key={i} className="text-[9px] bg-green-500/10 text-green-700 border border-green-500/20 px-2 py-0.5 rounded-md font-bold">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI ENHANCEMENT DIALOG */}
      {showEnhanceModal && enhancementReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">AI Resume Enhancement Report</h3>
                  <p className="text-xs text-muted-foreground">Comprehensive optimization results: scores, skill gaps, keywords and rewrites.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={applyAllEnhancements}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-xs font-bold hover:shadow-lg transition-all"
                >
                  Apply All AI Changes
                </button>
                <button
                  onClick={() => setShowEnhanceModal(false)}
                  className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-bold px-4 py-2 border border-border/50"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
              
              {/* ATS SCORE BOOST WIDGET */}
              <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-around gap-6">
                <div className="flex items-center gap-6">
                  {/* Original Score */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Original Score</span>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="27"
                          stroke="rgba(239, 68, 68, 0.1)"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="27"
                          stroke="rgb(239, 68, 68)"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray="169.6"
                          strokeDashoffset={169.6 - (169.6 * (atsReport?.overallScore || 0)) / 100}
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <span className="text-lg font-bold text-destructive relative z-10">{atsReport?.overallScore ?? enhancementReport.ats_score_original}%</span>
                    </div>
                  </div>
                              {/* Arrow */}
                  <div className="text-muted-foreground text-xl font-bold">➔</div>

                  {/* Enhanced Score */}
                  {(() => {
                    const origScore = atsReport?.overallScore ?? enhancementReport.ats_score_original ?? 0;
                    const enhScore = enhancementReport.ats_score_enhanced ?? 0;
                    const isBoost = enhScore > origScore;
                    const diff = enhScore - origScore;
                    // Colors
                    const ringBg = isBoost ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)";
                    const ringFg = isBoost ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
                    const textColor = isBoost ? "text-green-600 dark:text-green-400" : "text-destructive";
                    const labelColor = isBoost ? "text-green-600 dark:text-green-400" : "text-destructive";
                    return (
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] font-bold ${labelColor} uppercase tracking-wider mb-2 flex items-center gap-1`}>
                          {isBoost ? <Sparkles size={10} /> : <AlertTriangle size={10} />} Predicted Enhanced
                        </span>
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="absolute w-full h-full transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke={ringBg}
                              strokeWidth="6"
                              fill="transparent"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke={ringFg}
                              strokeWidth="6"
                              fill="transparent"
                              strokeDasharray="213.6"
                              strokeDashoffset={213.6 - (213.6 * (enhScore || 0)) / 100}
                              className="transition-all duration-500 ease-out"
                            />
                          </svg>
                          <span className={`text-xl font-bold ${textColor} relative z-10`}>{enhScore}%</span>
                        </div>
                        <span className={`text-[10px] font-bold mt-1 ${isBoost ? 'text-green-600' : 'text-destructive'}`}>
                          {isBoost ? `+${diff}% boost` : `${diff}% (no gain)`}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div className="max-w-md text-center md:text-left space-y-3">
                  {(() => {
                    const origScore = atsReport?.overallScore ?? enhancementReport.ats_score_original ?? 0;
                    const enhScore = enhancementReport.ats_score_enhanced ?? 0;
                    const diff = enhScore - origScore;
                    const isBoost = diff > 0;
                    
                    const keywordsAddedCount = enhancementReport.keywords_added?.length || 0;
                    const skillsImprovedCount = enhancementReport.skills_improved || keywordsAddedCount;
                    const sectionsCount = enhancementReport.sections_improved?.length || 0;
                    const sectionsImprovedNames = enhancementReport.sections_improved?.join(", ") || "None";
                    
                    return (
                      <>
                        <h4 className={`font-semibold text-sm ${isBoost ? 'text-green-700 dark:text-green-400' : 'text-destructive'} flex items-center gap-1`}>
                          {isBoost ? <Sparkles size={14} /> : <AlertTriangle size={14} />}
                          {isBoost
                            ? `ATS Score Boosted by +${diff}%! (+${enhancementReport.improvement_percentage || 0}% boost)`
                            : `No improvement detected`
                          }
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          By adopting these AI enhancements, your resume passes more automated filters.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-2.5 text-left">
                          <div className="bg-background/40 p-2 rounded-xl border border-border/50">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Keywords Added</span>
                            <span className="text-xs font-bold text-foreground">{keywordsAddedCount} found in JD</span>
                          </div>
                          <div className="bg-background/40 p-2 rounded-xl border border-border/50">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Skills Improved</span>
                            <span className="text-xs font-bold text-foreground">{skillsImprovedCount} target skills</span>
                          </div>
                          <div className="bg-background/40 p-2 rounded-xl border border-border/50 col-span-2">
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Sections Optimized ({sectionsCount})</span>
                            <span className="text-xs font-bold text-foreground truncate block">{sectionsImprovedNames}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT & MIDDLE COLUMN: CONTENT REWRITES */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* 1. PROFESSIONAL SUMMARY REWRITE */}
                  {enhancementReport.summary_rewrite && (
                    <div className="border border-border/60 rounded-2xl bg-card overflow-hidden shadow-elevation-1">
                      <div className="bg-muted/30 px-5 py-3 border-b border-border/40 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Professional Summary Rewrite</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => applyEnhancedSummary(enhancementReport.summary_rewrite)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Apply Summary
                          </button>
                          <button
                            onClick={dismissEnhancedSummary}
                            className="px-3 py-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                          <span className="text-[9px] font-bold text-destructive/80 uppercase tracking-wider block mb-1">Original Summary</span>
                          <p className="text-xs text-muted-foreground leading-relaxed italic">{content.summary || "(No summary draft)"}</p>
                        </div>
                        <div className="bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                          <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider block mb-1">AI Enhanced Summary</span>
                          <p className="text-xs text-foreground leading-relaxed font-medium">{enhancementReport.summary_rewrite}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. ENHANCED EXPERIENCE BULLETS */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Enhanced Experience Bullets</h4>
                    
                    {(!enhancementReport.enhanced_experience || enhancementReport.enhanced_experience.length === 0) ? (
                      <div className="text-xs text-muted-foreground p-4 bg-muted/20 border border-border/50 rounded-xl text-center">
                        No experience enhancements generated. Make sure you have filled out details in your Experience section.
                      </div>
                    ) : (
                      enhancementReport.enhanced_experience.map((item, idx) => {
                        // Find matching index in content.experience
                        const matchedIdx = content.experience?.findIndex(
                          (e) =>
                            e.company?.toLowerCase()?.trim() === item.company?.toLowerCase()?.trim() ||
                            e.title?.toLowerCase()?.trim() === item.role?.toLowerCase()?.trim()
                        );

                        return (
                          <div key={idx} className="border border-border/60 rounded-2xl bg-card overflow-hidden shadow-elevation-1">
                            <div className="bg-muted/30 px-5 py-3 border-b border-border/40 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Company / Role</span>
                                <span className="text-xs font-bold text-foreground">{item.company} • {item.role}</span>
                              </div>
                              <div className="flex gap-2">
                                {matchedIdx !== -1 && (
                                  <button
                                    onClick={() => applyEnhancedBullets(matchedIdx, item.enhanced_bullets)}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                  >
                                    <CheckCircle2 className="h-3 w-3" /> Apply Role Bullets
                                  </button>
                                )}
                                <button
                                  onClick={() => dismissEnhancedExperience(idx)}
                                  className="px-3 py-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                            <div className="p-4 space-y-4">
                              {item.enhanced_bullets?.map((enhancedB, bIdx) => {
                                const originalB = item.original_bullets?.[bIdx] || "";
                                return (
                                  <div key={bIdx} className="space-y-2 border-b border-border/20 last:border-b-0 pb-3 last:pb-0">
                                    <div className="text-xs text-muted-foreground line-through pl-4 relative">
                                      <span className="absolute left-0 text-red-500 font-bold">-</span>
                                      {originalB}
                                    </div>
                                    <div className="text-xs text-foreground font-medium pl-4 relative flex justify-between items-start gap-3">
                                      <div>
                                        <span className="absolute left-0 text-green-500 font-bold">+</span>
                                        {enhancedB}
                                      </div>
                                      {matchedIdx !== -1 && (
                                        <button
                                          onClick={() => applySingleEnhancedBullet(matchedIdx, bIdx, enhancedB)}
                                          className="text-[10px] text-primary hover:underline font-semibold shrink-0"
                                        >
                                          Apply
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* 3. ENHANCED PROJECT BULLETS */}
                    {enhancementReport.enhanced_projects && enhancementReport.enhanced_projects.length > 0 && (
                      <div className="space-y-4 mt-6">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Enhanced Project Bullets</h4>
                        
                        {enhancementReport.enhanced_projects.map((item, idx) => {
                          const matchedIdx = content.projects?.findIndex(
                            (p) => p.name?.toLowerCase()?.trim() === item.name?.toLowerCase()?.trim()
                          );

                          return (
                            <div key={idx} className="border border-border/60 rounded-2xl bg-card overflow-hidden shadow-elevation-1">
                              <div className="bg-muted/30 px-5 py-3 border-b border-border/40 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Project Name</span>
                                  <span className="text-xs font-bold text-foreground">{item.name}</span>
                                </div>
                                <div className="flex gap-2">
                                  {matchedIdx !== -1 && (
                                    <button
                                      onClick={() => applyEnhancedProjectBullets(matchedIdx, item.enhanced_bullets)}
                                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                    >
                                      <CheckCircle2 className="h-3 w-3" /> Apply Project Bullets
                                    </button>
                                  )}
                                  <button
                                    onClick={() => dismissEnhancedProject(idx)}
                                    className="px-3 py-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                              <div className="p-4 space-y-4">
                                {item.enhanced_bullets?.map((enhancedB, bIdx) => {
                                  const originalB = item.original_bullets?.[bIdx] || "";
                                  return (
                                    <div key={bIdx} className="space-y-2 border-b border-border/20 last:border-b-0 pb-3 last:pb-0">
                                      {originalB && (
                                        <div className="text-xs text-muted-foreground line-through pl-4 relative">
                                          <span className="absolute left-0 text-red-500 font-bold">-</span>
                                          {originalB}
                                        </div>
                                      )}
                                      <div className="text-xs text-foreground font-medium pl-4 relative flex justify-between items-start gap-3">
                                        <div>
                                          <span className="absolute left-0 text-green-500 font-bold">+</span>
                                          {enhancedB}
                                        </div>
                                        {matchedIdx !== -1 && (
                                          <button
                                            onClick={() => applySingleEnhancedProjectBullet(matchedIdx, bIdx, enhancedB)}
                                            className="text-[10px] text-primary hover:underline font-semibold shrink-0"
                                          >
                                            Apply
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: SUGGESTIONS, KEYWORDS, TIPS */}
                <div className="space-y-6">
                  {/* 1. Missing Keywords */}
                  <div className="border border-border/60 rounded-2xl bg-card p-4 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Missing Keywords (ATS)</h5>
                      {enhancementReport.missing_keywords && enhancementReport.missing_keywords.length > 0 && (
                        <button
                          onClick={applyMissingKeywords}
                          className="text-[10px] text-primary hover:underline font-semibold"
                        >
                          Add All to Skills
                        </button>
                      )}
                    </div>
                    {enhancementReport.missing_keywords && enhancementReport.missing_keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {enhancementReport.missing_keywords.map((kw, i) => (
                          <span key={i} className="text-[10px] bg-red-500/10 text-red-700 border border-red-500/20 px-2 py-0.5 rounded-lg font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">All critical keywords identified are matched!</p>
                    )}
                  </div>

                  {/* 2. Skill Gaps */}
                  <div className="border border-border/60 rounded-2xl bg-card p-4 space-y-3">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Identified Skill Gaps</h5>
                    {enhancementReport.skill_gaps && enhancementReport.skill_gaps.length > 0 ? (
                      <ul className="space-y-2">
                        {enhancementReport.skill_gaps.map((gap, i) => (
                          <li key={i} className="text-xs text-foreground bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl flex gap-1.5 items-start">
                            <span className="text-amber-500 text-sm leading-none font-bold">!</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No critical skill gaps found for this job target.</p>
                    )}
                  </div>

                  {/* 3. Improvement Tips */}
                  <div className="border border-border/60 rounded-2xl bg-card p-4 space-y-3">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Improvement Tips</h5>
                    {enhancementReport.improvement_tips && enhancementReport.improvement_tips.length > 0 ? (
                      <ul className="space-y-2">
                        {enhancementReport.improvement_tips.map((tip, i) => (
                          <li key={i} className="text-xs text-foreground bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl flex gap-1.5 items-start">
                            <span className="text-primary text-sm leading-none font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No suggestions needed. Your resume is extremely strong.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function SectionShell({
  icon,
  title,
  open,
  onToggle,
  onAdd,
  children,
  hasWarning
}) {
  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between px-5 py-3 hover:bg-muted/10 transition-all">
        <button onClick={onToggle} className="flex items-center gap-2 text-sm font-semibold text-left">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className="text-muted-foreground">{icon}</span>
          <span>{title}</span>
          {hasWarning && (
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" title="Fix flagged issues in this section" />
          )}
        </button>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        )}
      </div>
      {open && <div className="space-y-3 px-5 pb-4 bg-muted/5">{children}</div>}
    </div>
  );
}

// Validation helpers
function validateFullName(name) {
  if (!name || !name.trim()) return null;
  const str = name.trim();
  if (/^\d+$/.test(str)) return "Name cannot be numbers-only";
  if (str.length < 2) return "Name must be at least 2 characters";
  return null;
}

function validateTextTitle(title, label = "Title") {
  if (!title || !title.trim()) return null;
  const str = title.trim();
  if (/^\d+$/.test(str)) return `${label} cannot be numbers-only`;
  if (str.length < 2) return `${label} is too short`;
  return null;
}

function validateSummary(summary) {
  if (!summary || !summary.trim()) return null;
  const words = summary.trim().split(/\s+/).filter(Boolean);
  if (/^\d+$/.test(summary.trim())) return "Summary cannot be numbers-only";
  if (words.length < 8) return "Summary is very short (aim for 15+ words)";
  return null;
}

function validateBullet(bullet) {
  if (!bullet || !bullet.trim()) return null;
  const str = bullet.trim();
  if (/^\d+$/.test(str)) return "Bullet cannot be numbers-only";
  if (str.length < 10) return "Bullet point is very brief";
  return null;
}

function validateEmail(email) {
  if (!email || !email.trim()) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim()) ? null : "Invalid email format";
}

function validatePhone(phone) {
  if (!phone || !phone.trim()) return null;
  const re = /^[+\d\s().-]{7,25}$/;
  const digitCount = (phone.match(/\d/g) || []).length;
  if (!re.test(phone.trim()) || digitCount < 5) {
    return "Invalid phone format";
  }
  return null;
}

function validateUrl(url, type = "URL") {
  if (!url || !url.trim()) return null;
  const str = url.trim().toLowerCase();
  if (str.includes(" ") || (!str.includes(".") && !str.startsWith("http"))) {
    return `Invalid ${type} format`;
  }
  return null;
}

const VALID_MONTH_NAMES = [
  "january", "jan", "february", "feb", "march", "mar",
  "april", "apr", "may", "june", "jun", "july", "jul",
  "august", "aug", "september", "sep", "october", "oct",
  "november", "nov", "december", "dec"
];

function validateDateStr(dateStr, label = "Date") {
  if (!dateStr || !dateStr.trim()) return null;
  const str = dateStr.trim().toLowerCase();
  
  // 1. Present / Current keywords
  if (["present", "current", "now", "ongoing"].includes(str)) return null;

  // 2. Must contain digits for year
  const yearMatch = str.match(/\b(19|20)\d{2}\b/);
  if (!yearMatch) {
    if (!/\d/.test(str)) {
      return `${label} must be a valid date (e.g. Mar 2022, 03/2022, or Present)`;
    }
    return `${label} must include a valid 4-digit year (1950-2035)`;
  }

  const year = parseInt(yearMatch[0], 10);
  if (year < 1950 || year > 2035) {
    return `${label} year must be between 1950 and 2035`;
  }

  // 3. Check for slash / hyphen / space patterns: e.g. "13/2022", "13-2022", "2022/13", "13 2022"
  const slashOrDashMatch = str.match(/\b(\d{1,2})[\/\-\s]+(19|20)\d{2}\b/) || str.match(/\b(19|20)\d{2}[\/\-\s]+(\d{1,2})\b/);
  if (slashOrDashMatch) {
    const monthNum = parseInt(slashOrDashMatch[1].length <= 2 ? slashOrDashMatch[1] : slashOrDashMatch[2], 10);
    if (monthNum < 1 || monthNum > 12) {
      return `${label} month must be between 1 and 12 (entered ${monthNum})`;
    }
  }

  // 4. Check if words are present and whether any word is a valid month name
  const words = str.replace(/[^a-z]/g, " ").split(/\s+/).filter(Boolean);
  const hasMonthWord = words.some((w) => VALID_MONTH_NAMES.includes(w));
  const hasOnlyYear = words.length === 0;

  if (!hasMonthWord && !hasOnlyYear && !slashOrDashMatch) {
    return `${label} month is invalid (use Jan-Dec or 1-12)`;
  }

  return null;
}

function parseYearMonth(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const str = dateStr.trim().toLowerCase();
  if (!str) return null;
  if (["present", "current", "now", "ongoing"].includes(str)) {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  const yearMatch = str.match(/\b(19|20)\d{2}\b/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[0], 10);
  if (year < 1950 || year > 2035) return null;

  let month = 0; // Default Jan for year-only entries
  const slashOrDashMatch = str.match(/\b(\d{1,2})[\/\-\s]+(19|20)\d{2}\b/) || str.match(/\b(19|20)\d{2}[\/\-\s]+(\d{1,2})\b/);
  if (slashOrDashMatch) {
    const monthNum = parseInt(slashOrDashMatch[1].length <= 2 ? slashOrDashMatch[1] : slashOrDashMatch[2], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      month = monthNum - 1;
      return year * 12 + month;
    } else {
      return null;
    }
  }

  const monthsMap = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
    nov: 10, november: 10, dec: 11, december: 11
  };
  const words = str.replace(/[^a-z]/g, " ").split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (w in monthsMap) {
      month = monthsMap[w];
      return year * 12 + month;
    }
  }

  if (words.length > 0) {
    return null;
  }

  return year * 12 + month;
}

function validateDateRange(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null;
  const startYm = parseYearMonth(startDateStr);
  const endYm = parseYearMonth(endDateStr);
  if (startYm !== null && endYm !== null && startYm > endYm) {
    return "End date cannot be before start date";
  }
  return null;
}

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  error,
  type = "text"
}) {
  const hasError = Boolean(error);
  return (
    <label className="block">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        {hasError && <span className="text-[10px] font-semibold text-destructive">{error}</span>}
      </div>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full resize-none rounded-xl border bg-background px-3 py-2 text-xs transition-all ${
            hasError
              ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20 text-destructive font-medium"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          }`}
        />
      ) : (
        <input
          type={type === "email" ? "email" : type === "phone" ? "tel" : "text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-background px-3 py-2 text-xs transition-all ${
            hasError
              ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20 text-destructive font-medium"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          }`}
        />
      )}
    </label>
  );
}

function IconBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
    >
      {children}
    </button>
  );
}

function BreakdownBar({ label, score = 100 }) {
  let color = "bg-primary";
  if (score < 50) color = "bg-destructive";
  else if (score < 80) color = "bg-amber-500";
  else color = "bg-[var(--google-green)]";

  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1">
        <span>{label}</span>
        <span className="font-bold">{score}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div style={{ width: `${score}%` }} className={`h-full ${color} rounded-full`} />
      </div>
    </div>
  );
}

function scorePillClass(score) {
  if (score >= 85) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (score >= 65) return "bg-orange-500/15 text-orange-700 dark:text-orange-400";
  return "bg-destructive/15 text-destructive";
}

function AtsCheckStatusIcon({ status }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (status === "locked") return <Lock className="h-4 w-4 text-amber-500 shrink-0" />;
  if (status === "fail") return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
  return <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />;
}

function AtsCheckRow({ item, nested = false }) {
  const [open, setOpen] = React.useState(false);
  const hasDetails = (item.issues || []).length > 0;
  const badge =
    item.status === "locked"
      ? "Locked"
      : item.issueCount > 0
        ? `${item.issueCount} issue${item.issueCount === 1 ? "" : "s"}`
        : "No issues";
  const badgeClass =
    item.status === "locked"
      ? "border border-border text-muted-foreground bg-muted/40"
      : item.status === "pass"
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
        : item.status === "fail"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";

  return (
    <div className={nested ? "pl-1" : ""}>
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 py-2.5 ${hasDetails ? "cursor-pointer" : "cursor-default"}`}
      >
        <span className="flex items-center gap-2 text-xs font-medium text-foreground min-w-0">
          <AtsCheckStatusIcon status={item.status} />
          <span className="truncate">{item.label}</span>
        </span>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {badge}
        </span>
      </button>
      {open && hasDetails && (
        <ul className="pb-2 pl-6 space-y-1">
          {item.issues.map((iss, idx) => (
            <li key={idx} className="text-[11px] text-muted-foreground leading-relaxed list-disc">
              {iss}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AtsGroupAccordion({ group, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-t border-border/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 py-3"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
          {group.label}
        </span>
        <span className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scorePillClass(group.score || 0)}`}>
            {group.score ?? 0}%
          </span>
          {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </span>
      </button>
      {open && (
        <div className="pb-2 divide-y divide-border/40">
          {(group.items || []).map((item) => (
            <AtsCheckRow key={item.key} item={item} nested />
          ))}
        </div>
      )}
    </div>
  );
}

function AtsTealReport({ report }) {
  const score = report.overallScore || 0;
  const scoreColor =
    score >= 85 ? "text-emerald-600" : score >= 65 ? "text-orange-500" : "text-destructive";
  const issueCount = report.issueCount ?? (report.checklist || []).reduce((n, i) => n + (i.issueCount || 0), 0);

  return (
    <div className="bg-card border border-border/70 rounded-2xl overflow-hidden">
      <div className="px-4 pt-5 pb-4">
        <div className="text-sm font-bold text-foreground">Your Score</div>
        <div className={`text-4xl font-black tracking-tight mt-1 ${scoreColor}`}>
          {score}<span className="text-lg font-bold text-muted-foreground">/100</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 font-medium">
          {issueCount} Issue{issueCount === 1 ? "" : "s"}
        </div>
      </div>

      <div className="px-4 divide-y divide-border/50 border-t border-border/50">
        {(report.checklist || []).map((item) => (
          <AtsCheckRow key={item.key} item={item} />
        ))}
      </div>

      <div className="px-4 pb-2">
        {(report.groups || []).map((group, idx) => (
          <AtsGroupAccordion key={group.key} group={group} defaultOpen={idx === 0} />
        ))}
      </div>

      {report.topSuggestions?.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Top Fixes
          </div>
          <ul className="space-y-1.5">
            {report.topSuggestions.slice(0, 4).map((s, idx) => (
              <li key={idx} className="text-[11px] text-foreground leading-relaxed flex gap-1.5">
                <span className="text-orange-500 font-bold shrink-0">{idx + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
