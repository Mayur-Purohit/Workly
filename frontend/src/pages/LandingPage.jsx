import React, { useState, useEffect, useRef, useMemo, useCallback, useId } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  animate,
  AnimatePresence,
} from 'framer-motion';
import {
  Brain,
  Target,
  Shield,
  MessageSquare,
  Upload,
  BarChart3,
  CheckCircle2,
  Star,
  ArrowRight,
  Code2,
  Sparkles,
  Zap,
  Mail,
  HardDrive,
  FileArchive,
  FormInput,
  Building2,
  FileText,
  Briefcase,
  ShieldCheck,
  Play,
  RefreshCw,
  TrendingUp,
  Users,
  AlertTriangle,
  X,
  User,
  Lock,
} from 'lucide-react';

import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FlipFadeText from '../components/ui/flip-fade-text';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { API_HOST, billingAPI } from '../lib/api';
import Testimonials from '../components/Testimonials';
import '../styles/alwayzz.css';

/* ═══════════════════ Animation Variants ═══════════════════ */
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1.0] },
  },
};

const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1.0] },
  },
};

const slideInLeftVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1.0] },
  },
};

const slideInRightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1.0] },
  },
};

/* ═══════════════════ Data Hook ═══════════════════ */
const FALLBACK_STATS = {
  total_candidates: 0,
  total_companies: 0,
  total_sessions: 0,
  fraud_flagged: 0,
};

const FALLBACK_LIVE = {
  title: 'Live Session',
  candidates: [
    { name: 'A. Chen', initials: 'AC', role: 'Senior ML Engineer', score: 96, recommendation: 'Strong Hire' },
    { name: 'M. Ortega', initials: 'MO', role: 'Full-stack Developer', score: 91, recommendation: 'Strong Hire' },
    { name: 'J. Patel', initials: 'JP', role: 'Data Engineer', score: 84, recommendation: 'Consider' },
    { name: 'S. Kim', initials: 'SK', role: 'Frontend Engineer', score: 78, recommendation: 'Consider' },
  ],
};

const FALLBACK_FRAUD = { originality: 94, ai_probability: 38, plagiarism: 12, verdict: 'Authentic' };

const FALLBACK_PLANS = [
  { id: 'free', name: 'Starter Plan', price: 0, features: ['1 active session', '100 resumes', 'Basic AI screening', 'Standard support'] },
  { id: 'business', name: 'Business Plan', price: 1499, popular: true, features: ['5 active sessions', '2,000 resumes', 'Advanced matching', 'API access'] },
  { id: 'enterprise', name: 'Enterprise Plan', price: 3999, features: ['Unlimited sessions', 'Priority VIP support', 'Custom integrations', 'Advanced analytics'] },
];

function useLandingData() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [liveSession, setLiveSession] = useState(FALLBACK_LIVE);
  const [fraudSignals, setFraudSignals] = useState(FALLBACK_FRAUD);
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const statsUrl = `${API_HOST}/api/v1/public/stats`;
      const plansUrl = `${API_HOST}/api/v1/billing/plans`;

      const [statsRes, plansRes] = await Promise.allSettled([
        fetch(statsUrl, { cache: 'no-cache' }),
        fetch(plansUrl, { cache: 'no-cache' }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json();
        if (data.success && data.data) {
          setStats(prev => ({ ...prev, ...data.data.stats }));
          if (data.data.live_session?.candidates?.length) {
            setLiveSession(data.data.live_session);
          }
          if (data.data.fraud_signals) {
            setFraudSignals(data.data.fraud_signals);
          }
        }
      }

      if (plansRes.status === 'fulfilled' && plansRes.value.ok) {
        const data = await plansRes.value.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Merge in popular flag and map description
          const planDescriptions = {
            free: 'For small teams getting started',
            business: 'For growing recruiting teams',
            enterprise: 'For large-scale operations',
          };
          const mapped = data.data.map((p, i) => ({
            ...p,
            popular: p.id === 'business' || i === 1,
            desc: planDescriptions[p.id] || '',
          }));
          setPlans(mapped);
        }
      }

      setLastFetched(new Date());
    } catch (err) {
      console.warn('[LandingPage] Could not fetch live data, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Refresh every 60 seconds for live feel
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { stats, liveSession, fraudSignals, plans, loading, lastFetched, refresh: fetchAll };
}

/* ═══════════════════ Background Lines (from Alwayzz design) ═══════════════════ */
function BackgroundLines() {
  const numLines = 35;
  return (
    <>
      <div className="az-lines" aria-hidden="true">
        {Array.from({ length: numLines }).map((_, i) => {
          // Exponential spacing so lines are packed near the edge and space out
          const distance = 5 + Math.pow(i, 1.35) * 6;
          // Opacity fades out towards the center
          const maxOpacity = Math.max(0.02, 0.4 - (i * 0.015));
          
          return (
            <span
              key={`l-${i}`}
              style={{ 
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${distance}px`,
                width: '1px',
                background: `linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,${maxOpacity}), rgba(255,255,255,0))`,
                animation: `line-pulse-straight 6s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                opacity: 0
              }}
            />
          );
        })}
        {Array.from({ length: numLines }).map((_, i) => {
          const distance = 5 + Math.pow(i, 1.35) * 6;
          const maxOpacity = Math.max(0.02, 0.4 - (i * 0.015));
          
          return (
            <span
              key={`r-${i}`}
              style={{ 
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: `${distance}px`,
                width: '1px',
                background: `linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,${maxOpacity}), rgba(255,255,255,0))`,
                animation: `line-pulse-straight 6s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                opacity: 0
              }}
            />
          );
        })}
      </div>

    </>
  );
}

/* ═══════════════════ Hero Section ═══════════════════ */
const rotatingWords = ["smarter", "faster", "better", "calmer"];

function HeroSection({ onStart, companiesCount, bgY, bgOpacity, bgScale, videoRef }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const words = useMemo(() => rotatingWords, []);

  useEffect(() => {
    setIsMounted(true);
    const t = setInterval(() => setWordIdx((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(t);
  }, [words.length]);

  const pillLabel = companiesCount > 0
    ? `Trusted by ${companiesCount.toLocaleString()}+ recruiting teams worldwide`
    : 'Trusted by recruiting teams worldwide';

  return (
    <section className="az-hero">
      {/* Animated straight lines matching Alwayzz reference */}
      <BackgroundLines />

      <div className="az-hero-content">
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pill inline-flex items-center gap-2 border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur rounded-full shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--google-green)] animate-pulse" />
          {pillLabel}
        </motion.div>

        {/* Title — exact 4-line line breaks matching Alwayzz structure */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="az-title"
        >
          Recruit<br />
          <span className="relative inline-flex overflow-hidden h-[1.15em] w-[4.2em] items-center justify-center align-middle">
            {!isMounted ? (
              <span className="az-serif absolute google-gradient-text">smarter</span>
            ) : (
              words.map((word, index) => (
                <motion.span
                  key={word}
                  className="az-serif absolute google-gradient-text"
                  initial={{ opacity: 0, y: 40 }}
                  transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
                  animate={
                    wordIdx === index
                      ? { y: 0, opacity: 1 }
                      : { y: -40, opacity: 0 }
                  }
                >
                  {word}
                </motion.span>
              ))
            )}
          </span><br />
          with AI<br />
          screening.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="az-subtitle text-gray-400 font-normal"
        >
          Parse resumes from any source, match candidates with semantic precision,
          and detect fraud — all before they reach your pipeline.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="az-cta"
        >
          <button 
            onClick={onStart} 
            className="az-btn-primary google-shadow flex items-center justify-center gap-2"
            style={{ background: 'var(--google-blue)', color: 'white', border: 'none' }}
          >
            Start Free Trial
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </motion.div>
      </div>

      {/* Progressive blur at bottom */}
      <div className="az-blur" aria-hidden="true" />
    </section>
  );
}


/* ═══════════════════ Live Demo Card ═══════════════════ */
const SCAN_DURATION_MS = 3200;
const SCAN_DELAY_MS = 400;
const CYCLE_MS = 10000; // full rescan interval

// Anonymized candidate pool — no real names, emails, or exact locations.
// Rotated automatically so the demo always shows a *different* profile
// and score on each rescan.
const CANDIDATES = [
  {
    id: "Candidate #4471",
    title: "Senior Product Designer · Applicant",
    meta: ["6 yrs experience", "Full-time", "Remote-eligible"],
    score: 98.7, skillsMatch: "9/10", expYears: "6 yrs", risk: "None",
    experience: [
      { company: "Figma", role: "Lead Product Designer", years: "2022 — Present", desc: "Spearheaded the complete redesign of Dev Mode, leading a team of 4 designers to bridge design and engineering." },
      { company: "Stripe", role: "Senior Designer", years: "2019 — 2022", desc: "Designed and launched Stripe Identity, driving a 40% increase in verification conversion rates." },
      { company: "Airbnb", role: "Product Designer", years: "2017 — 2019", desc: "Revamped the mobile booking flow and established core components for the cross-platform design system." },
    ],
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "A/B Testing"],
    education: { school: "RISD", degree: "BFA Industrial Design" },
  },
  {
    id: "Candidate #2093",
    title: "Full-Stack Engineer · Applicant",
    meta: ["5 yrs experience", "Full-time", "Hybrid"],
    score: 91.4, skillsMatch: "8/10", expYears: "5 yrs", risk: "None",
    experience: [
      { company: "Datadog", role: "Senior Software Engineer", years: "2023 — Present", desc: "Built real-time ingestion pipelines handling 2M+ events/sec across the monitoring platform." },
      { company: "Notion", role: "Software Engineer", years: "2021 — 2023", desc: "Shipped the collaborative editing engine used by the block-based document canvas." },
      { company: "Stripe", role: "Backend Engineer", years: "2019 — 2021", desc: "Maintained core billing infrastructure processing millions of transactions daily." },
    ],
    skills: ["React", "Node.js", "PostgreSQL", "AWS", "GraphQL"],
    education: { school: "UC Berkeley", degree: "BS Computer Science" },
  },
  {
    id: "Candidate #7788",
    title: "Marketing Manager · Applicant",
    meta: ["4 yrs experience", "Full-time", "Remote-eligible"],
    score: 84.2, skillsMatch: "7/10", expYears: "4 yrs", risk: "Low",
    experience: [
      { company: "HubSpot", role: "Growth Marketing Manager", years: "2023 — Present", desc: "Owns lifecycle campaigns across a 200K+ subscriber base, lifting qualified-lead conversion by 22%." },
      { company: "Mailchimp", role: "Marketing Specialist", years: "2021 — 2023", desc: "Ran multi-channel acquisition campaigns and built the attribution reporting dashboard." },
      { company: "Segment", role: "Marketing Associate", years: "2020 — 2021", desc: "Coordinated launch campaigns for three major product releases." },
    ],
    skills: ["SEO", "Content Strategy", "Analytics", "Campaign Management", "Copywriting"],
    education: { school: "NYU", degree: "BA Communications" },
  },
  {
    id: "Candidate #5560",
    title: "Data Scientist · Applicant",
    meta: ["7 yrs experience", "Full-time", "On-site"],
    score: 95.0, skillsMatch: "9/10", expYears: "7 yrs", risk: "None",
    experience: [
      { company: "Snowflake", role: "Senior Data Scientist", years: "2022 — Present", desc: "Built demand-forecasting models deployed across enterprise customer accounts." },
      { company: "Palantir", role: "Data Scientist", years: "2019 — 2022", desc: "Developed anomaly-detection pipelines for government and commercial partners." },
      { company: "Databricks", role: "Analytics Engineer", years: "2017 — 2019", desc: "Built the internal experimentation framework used across 6 product teams." },
    ],
    skills: ["Python", "SQL", "Machine Learning", "Statistics", "Tableau"],
    education: { school: "MIT", degree: "MS Data Science" },
  },
];

function LiveDemoCard() {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [showPills, setShowPills] = useState(false);
  const [flash, setFlash] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [activeLine, setActiveLine] = useState(-1);
  const [checkedLines, setCheckedLines] = useState(new Set());
  const [frozenElapsed, setFrozenElapsed] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const startRef = useRef(Date.now());
  const cardRef = useRef(null);
  const cancelledRef = useRef(false);
  const rafRef = useRef(0);
  const cycleTimeoutRef = useRef(null);
  const pillsTimeoutRef = useRef(null);
  const cycleCountRef = useRef(0);

  const isInView = useInView(cardRef, { once: true, amount: 0.1, margin: "0px 0px -50px 0px" });

  const candidate = CANDIDATES[candidateIndex];

  const resumeSections = useMemo(() => ([
    { type: "header", id: candidate.id, title: candidate.title },
    { type: "meta", items: candidate.meta },
    { type: "section", label: "Experience" },
    ...candidate.experience.map((e) => ({ type: "role", ...e })),
    { type: "section", label: "Skills" },
    { type: "chips", items: candidate.skills },
    { type: "section", label: "Education" },
    { type: "edu", ...candidate.education },
  ]), [candidate]);

  // Single orchestrating loop: runs one scan, then schedules the next
  // cycle with a different candidate. Only ever one RAF and one timeout
  // alive — both are torn down before the next cycle starts, and on
  // unmount, so nothing accumulates over repeated rescans.
  useEffect(() => {
    if (!isInView) return;
    cancelledRef.current = false;

    const prefersReducedMotion = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const runCycle = () => {
      if (cancelledRef.current) return;

      const idx = cycleCountRef.current % CANDIDATES.length;
      cycleCountRef.current += 1;

      setCandidateIndex(idx);
      setScanning(true);
      setShowPills(false);
      setFlash(false);
      setDisplayScore(0);
      setCheckedLines(new Set());
      setActiveLine(-1);
      setFrozenElapsed(null);

      const targetScore = CANDIDATES[idx].score;
      const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
      let startTime = 0;

      const step = (now) => {
        if (cancelledRef.current) return;
        if (!startTime) startTime = now;
        const elapsedMs = now - startTime - SCAN_DELAY_MS;
        if (elapsedMs < 0) { rafRef.current = requestAnimationFrame(step); return; }
        const t = Math.min(1, elapsedMs / SCAN_DURATION_MS);
        setDisplayScore(targetScore * easeOutCubic(t));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setDisplayScore(targetScore);
          setScanning(false);
          setFlash(true);
          pillsTimeoutRef.current = setTimeout(() => {
            if (!cancelledRef.current) setShowPills(true);
          }, 300);
        }
      };
      rafRef.current = requestAnimationFrame(step);

      if (!prefersReducedMotion) {
        cycleTimeoutRef.current = setTimeout(runCycle, CYCLE_MS);
      }
    };

    runCycle();

    return () => {
      cancelledRef.current = true;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(cycleTimeoutRef.current);
      clearTimeout(pillsTimeoutRef.current);
    };
  }, [isInView]);

  useEffect(() => {
    if (frozenElapsed !== null) return;
    startRef.current = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [frozenElapsed]);

  useEffect(() => {
    if (!scanning && frozenElapsed === null) setFrozenElapsed(elapsed);
  }, [scanning, elapsed, frozenElapsed]);

  useEffect(() => {
    if (!scanning || !isInView) { setActiveLine(-1); return; }
    let idx = 0;
    const total = resumeSections.length;
    const id = setInterval(() => {
      if (idx >= total) { clearInterval(id); setActiveLine(-1); return; }
      setActiveLine(idx);
      setCheckedLines((prev) => { const next = new Set(prev); next.add(idx); return next; });
      idx++;
    }, 300);
    return () => clearInterval(id);
  }, [scanning, isInView, resumeSections]);

  const shownElapsed = frozenElapsed !== null ? frozenElapsed : elapsed;

  return (
    <motion.section
      id="demo"
      className="mx-auto w-full max-w-4xl px-6 py-12 md:py-20 scroll-mt-24"
      initial={{ opacity: 0, y: 80, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity' }}
    >
      <div ref={cardRef} className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10 dark:ring-white/5" style={{ transform: 'translateZ(0)' }}>
        <div className="border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 px-5 py-3">
            <div className="flex gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="#FF5F57" /></svg>
              <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="#FEBC2E" /></svg>
              <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="#28C840" /></svg>
            </div>
            <div className="flex-1 flex justify-center min-w-0 px-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-background border border-border/80 text-[11px] text-muted-foreground font-mono max-w-full overflow-hidden">
                <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-[var(--google-green)]" />
                <span className="truncate">workly.ai/screening/session-482</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${scanning ? "bg-[var(--google-blue)] animate-pulse" : "bg-[var(--google-green)]"}`} />
              <span className="text-muted-foreground font-medium">{scanning ? "Analyzing…" : "✓ Complete"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-7">
          <div className="grid lg:grid-cols-[1fr_auto] gap-4 sm:gap-5 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="relative bg-surface rounded-2xl p-4 sm:p-5 border border-border overflow-hidden min-h-[340px]"
            >
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mb-3 pb-3 border-b border-border/60">
                <FileText className="w-3.5 h-3.5" />
                Resume.pdf
                <span className="ml-auto tabular-nums">2 pages · 184 KB</span>
              </div>
              <div className="flex items-center gap-1.5 mb-4 text-[10px] font-medium text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Name, contact & location redacted for bias-free review</span>
              </div>
              <div className="space-y-3 text-left">
                {resumeSections.map((s, i) => {
                  const isActive = activeLine === i;
                  const isChecked = checkedLines.has(i) && !isActive;
                  const bc = `relative transition-all duration-300 ${isActive ? "opacity-100 -translate-y-0.5" : isChecked ? "opacity-100" : scanning ? "opacity-40" : "opacity-100"}`;
                  if (s.type === "header") return (
                    <div key={i} className={`${bc} flex items-center gap-3`}>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--google-blue)] to-[var(--google-green)] flex items-center justify-center text-white flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate tabular-nums">{s.id}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{s.title}</div>
                      </div>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--google-green)] ml-auto flex-shrink-0" />}
                    </div>
                  );
                  if (s.type === "meta") return (
                    <div key={i} className={`${bc} flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground`}>
                      {s.items.map((m) => <span key={m}>· {m}</span>)}
                    </div>
                  );
                  if (s.type === "section") return (
                    <div key={i} className={`${bc} text-[10px] font-semibold uppercase tracking-widest text-[var(--google-blue)] pt-1`}>{s.label}</div>
                  );
                  if (s.type === "role") return (
                    <div key={i} className={`${bc} flex items-start justify-between gap-2`}>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-foreground truncate">{s.role} · {s.company}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed pr-2">{s.desc}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums mt-0.5">{s.years}</div>
                    </div>
                  );
                  if (s.type === "chips") return (
                    <div key={i} className={`${bc} flex flex-wrap gap-1.5`}>
                      {s.items.map((c) => (
                        <span key={c} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors duration-500 ${isChecked || !scanning ? "border-[var(--google-green)]/40 bg-[var(--google-green)]/10 text-[var(--google-green)]" : "border-border bg-card text-muted-foreground"}`}>{c}</span>
                      ))}
                    </div>
                  );
                  if (s.type === "edu") return (
                    <div key={i} className={`${bc} text-xs`}>
                      <span className="font-medium text-foreground">{s.school}</span>
                      <span className="text-muted-foreground"> — {s.degree}</span>
                    </div>
                  );
                  return null;
                })}
              </div>
              {scanning && (
                <motion.div
                  className="absolute left-0 right-0 h-20 pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(66,133,244,0.06) 40%, rgba(66,133,244,0.18) 75%, rgba(66,133,244,0.5) 95%, var(--google-blue) 100%)',
                    borderBottom: '2px solid var(--google-blue)',
                    boxShadow: '0 4px 20px rgba(66, 133, 244, 0.25)',
                  }}
                  initial={{ top: "-20%" }}
                  animate={{ top: ["0%", "90%", "0%"] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {!scanning && (
                <motion.div
                  className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ background: 'radial-gradient(ellipse at center, rgba(40, 200, 64, 0.08), transparent 70%)' }}
                />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              className="flex lg:flex-col items-center lg:items-stretch justify-between lg:justify-center gap-3 lg:min-w-[200px] rounded-2xl border border-border bg-surface p-4 sm:p-5"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Match Score</div>
              <motion.div animate={flash ? { scale: [1, 1.12, 1] } : {}} transition={{ duration: 0.9 }}
                className="font-display text-4xl sm:text-5xl font-bold tabular-nums leading-none text-foreground flex items-baseline">
                {displayScore.toFixed(1)}<span className="text-xl sm:text-3xl text-muted-foreground ml-1">%</span>
              </motion.div>
              <div className="text-[10px] text-muted-foreground tabular-nums lg:mt-1 hidden sm:block">
                {scanning ? "Scanning…" : `Scanned ${shownElapsed}s ago`}
              </div>
              <div className="hidden lg:block space-y-2 mt-3 pt-3 border-t border-border">
                {[
                  { label: "Skills", val: scanning ? "—" : candidate.skillsMatch, color: scanning ? "text-muted-foreground" : "text-[var(--google-blue)]" },
                  { label: "Experience", val: scanning ? "—" : candidate.expYears, color: scanning ? "text-muted-foreground" : "text-[var(--google-green)]" },
                  { label: "Risk Flags", val: scanning ? "—" : candidate.risk, color: scanning ? "text-muted-foreground" : "text-[var(--google-green)]" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground uppercase tracking-wider">{m.label}</span>
                    <span className={`font-semibold ${m.color} tabular-nums transition-colors duration-500`}>{m.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="flex flex-wrap gap-2 mt-5 min-h-[44px]"
          >
            <AnimatePresence mode="wait">
              {showPills && (
                <>
                  {[
                    { icon: Brain, label: "Credentials Verified", color: "text-[var(--google-blue)]" },
                    { icon: CheckCircle2, label: "Skills Match", color: "text-[var(--google-green)]" },
                    { icon: Shield, label: "No Risk Flags", color: "text-[var(--google-red)]" },
                  ].map((p, i) => (
                    <motion.span key={`${candidate.id}-${p.label}`} initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.9 }}
                      transition={{ delay: i * 0.15, type: "spring", stiffness: 400, damping: 22 }}
                      className="pill rounded-full bg-card border border-border px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                      <p.icon className={`w-4 h-4 ${p.color}`} />{p.label}
                    </motion.span>
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Stats Strip ═══════════════════ */
function CountUp({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.5, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function StatsStrip({ stats, loading }) {
  // Format counts for display
  const formatCount = (n) => {
    if (n >= 1_000_000) return { v: parseFloat((n / 1_000_000).toFixed(1)), suffix: 'M+' };
    if (n >= 1_000) return { v: parseFloat((n / 1_000).toFixed(1)), suffix: 'K+' };
    return { v: n, suffix: '+' };
  };

  const candidatesFmt = formatCount(Math.max(stats.total_candidates || 0, 0));
  const companiesFmt = formatCount(Math.max(stats.total_companies || 0, 0));
  const jobsFmt = formatCount(Math.max(stats.total_jobs || stats.total_sessions || 0, 0));
  const avgMatchScore = Math.round(stats.avg_match_score || 92);

  const statsData = [
    { label: "Resumes screened", value: candidatesFmt.v, suffix: candidatesFmt.suffix, color: "var(--google-blue)" },
    { label: "Active job postings", value: jobsFmt.v, suffix: jobsFmt.suffix, color: "var(--google-green)" },
    { label: "Avg ATS Match Rate", value: avgMatchScore, suffix: "%", color: "var(--google-red)" },
    { label: "Enterprise clients", value: companiesFmt.v, suffix: companiesFmt.suffix, color: "var(--google-yellow)" },
  ];

  return (
    <motion.section className="mx-auto w-full max-w-7xl px-6 my-12"
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: "easeOut" }}>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-4 sm:p-6 shadow-sm relative">
        {loading && (
          <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] text-muted-foreground">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw className="w-3 h-3" />
            </motion.div>
            Live
          </div>
        )}
        {statsData.map((s) => (
          <div key={s.label} className="px-2 text-center sm:text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-bold sm:text-3xl" style={{ color: s.color }}>
              <CountUp to={s.value} suffix={s.suffix} />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Expandable Bento Feature Grid ═══════════════════ */
function BentoFeatures() {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setActive(null);
      }
    }

    if (active && typeof active === 'object') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setActive(null);
      }
    }
    if (active) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [active]);

  const items = [
    {
      id: 'parsing',
      title: 'Intelligent Resume Parsing',
      subtitle: 'Multi-Format Neural AI Extraction',
      description: 'Extract skills, timelines, and career trajectories with 99%+ accuracy from PDFs, DOCX, images, and scanned documents.',
      color: 'var(--google-blue)',
      icon: <Brain className="h-6 w-6 text-[var(--google-blue)]" />,
      className: 'md:col-span-2',
      tags: ["PDF & DOCX", "OCR Scanned Docs", "Multi-Language"],
      skills: ["React 18", "Python 3.11", "TypeScript", "System Architecture", "PostgreSQL", "AWS ECS"],
      details: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Workly's neural parsing engine automatically parses raw resume files into structured JSON data models in under 500 milliseconds.
          </p>
          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/60 font-mono text-xs space-y-1.5 text-foreground">
            <div className="text-[var(--google-blue)] font-semibold">✓ Parsed Entities:</div>
            <div>• Candidate Name & Contact Info</div>
            <div>• Normalized Skill Taxonomy (87+ categories)</div>
            <div>• Work Experience Chronology & Gap Analysis</div>
            <div>• Education & Certification Degrees</div>
          </div>
          <p>
            Supports multi-language documents and low-resolution scanned PDFs with embedded optical character recognition (OCR).
          </p>
        </div>
      )
    },

    {
      id: 'matching',
      title: 'Semantic Matching',
      subtitle: 'Context-Aware Vector Scoring',
      description: 'Intelligent scoring that evaluates role equivalency, transferable skills, and career progression beyond exact keyword matches.',
      color: 'var(--google-green)',
      icon: <Target className="h-6 w-6 text-[var(--google-green)]" />,
      className: 'md:col-span-1',
      tags: ["Vector Similarity", "Rank 1 Matching", "Skill Transferability"],
      details: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Traditional keyword search misses top candidates. Workly uses high-dimensional vector embeddings to understand underlying candidate capabilities.
          </p>
          <div className="p-4 rounded-2xl bg-muted/50 border border-border/60 text-center">
            <div className="text-3xl font-bold font-display text-[var(--google-green)]">96% Match</div>
            <div className="text-xs text-foreground font-medium mt-1">High Relevance Fit</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Understands "React Developer" ≡ "Frontend Engineer"</div>
          </div>
          <p>
            Automatically ranks candidate applications in real-time, giving recruiters an instant prioritized shortlist for screening calls.
          </p>
        </div>
      )
    },
    {
      id: 'intake',
      title: 'Six-Source Resume Intake',
      subtitle: 'Unified Multi-Channel Pipeline',
      description: 'Unify candidates arriving from direct uploads, ZIP batches, Gmail, Google Drive, Google Forms, and ATS integrations.',
      color: 'var(--google-yellow)',
      icon: <Upload className="h-6 w-6 text-[var(--google-yellow)]" />,
      className: 'md:col-span-3',
      tags: ["6 Intake Channels", "Auto-Deduplication", "Unified Storage"],
      sources: [
        { icon: FileText, label: "Direct Upload", desc: "PDF & Word" },
        { icon: FileArchive, label: "ZIP Batch", desc: "Bulk archives" },
        { icon: Mail, label: "Gmail Sync", desc: "Inbox fetch" },
        { icon: HardDrive, label: "Google Drive", desc: "Folder sync" },
        { icon: FormInput, label: "Google Forms", desc: "Live forms" },
        { icon: Building2, label: "ATS Import", desc: "Greenhouse / Lever" },
      ],
      details: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            No matter how applicants submit their resumes, Workly automatically aggregates, deduplicates, and standardizes candidates into one single view.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60">
              <div className="font-semibold text-foreground">Direct & Batch</div>
              <div className="text-[11px]">Upload up to 500 resumes at once</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60">
              <div className="font-semibold text-foreground">Live Automated Sync</div>
              <div className="text-[11px]">Syncs directly with email & Drive</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <motion.section id="features" className="mx-auto w-full max-w-7xl px-6 my-20 scroll-mt-24"
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainerVariants}>

      {/* Modal Overlay backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs h-full w-full z-[100]"
          />
        )}
      </AnimatePresence>

      {/* Expanded Card Modal */}
      <AnimatePresence>
        {active && typeof active === 'object' && (
          <div className="fixed inset-0 grid place-items-center z-[101] p-4 sm:p-6 overflow-y-auto">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[560px] flex flex-col bg-card border border-border text-card-foreground rounded-3xl overflow-hidden shadow-2xl relative my-auto"
            >
              {/* Header Visual Box */}
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <div className="w-full h-44 sm:h-52 bg-gradient-to-br from-muted/60 to-muted/20 border-b border-border/60 flex flex-col items-center justify-center relative p-6 text-center">
                  <button
                    onClick={() => setActive(null)}
                    className="absolute top-4 right-4 flex items-center justify-center bg-background/80 hover:bg-background border border-border/80 rounded-full h-8 w-8 text-foreground transition-all shadow-sm"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="h-16 w-16 rounded-2xl bg-background border border-border/80 flex items-center justify-center shadow-md mb-3">
                    {active.icon}
                  </div>
                  <motion.h3
                    layoutId={`title-${active.title}-${id}`}
                    className="font-display text-2xl font-bold tracking-tight text-foreground"
                  >
                    {active.title}
                  </motion.h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                    {active.subtitle}
                  </p>
                </div>
              </motion.div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-5">
                <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                  {active.description}
                </p>

                {active.details}

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">Workly Intelligence Engine</span>
                  <button
                    onClick={() => setActive(null)}
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Section Header */}
      <motion.div variants={fadeInUpVariants} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--google-blue)]/10 text-xs font-semibold uppercase tracking-wider text-[var(--google-blue)] border border-[var(--google-blue)]/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Platform Capabilities
        </div>
        <FlipFadeText
          words={[
            "Everything you need to screen at scale",
            "Intelligent Multi-Format Resume Parsing",
            "Automated Three-Signal Fraud Verification",
            "Context-Aware Vector Candidate Matching"
          ]}
          interval={3500}
          textClassName="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground font-display"
          className="min-h-[60px] my-2"
        />
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Click any card to expand and explore our core screening technology.
        </p>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={staggerItemVariants}
            className={item.className}
          >
            <motion.div
              layoutId={`card-${item.title}-${id}`}
              onClick={() => setActive(item)}
              className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-7 h-full flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-foreground/20 hover:-translate-y-1 group isolate"
            >
              <div>
                <motion.div layoutId={`image-${item.title}-${id}`} className="flex items-start gap-4 mb-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted/60 border border-border/60 shadow-sm group-hover:scale-105 transition-transform">
                    {item.icon}
                  </span>
                  <div>
                    <motion.h3
                      layoutId={`title-${item.title}-${id}`}
                      className="font-display text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {item.title}
                    </motion.h3>
                    <span className="text-xs text-muted-foreground font-medium block mt-0.5">{item.subtitle}</span>
                  </div>
                </motion.div>

                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  {item.description}
                </p>

                {/* Optional mini skills or source items preview */}
                {item.skills && (
                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {item.skills.slice(0, 4).map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs bg-muted/50 border border-border/60 text-foreground font-medium">
                        {s}
                      </span>
                    ))}
                    <span className="px-2.5 py-1 rounded-lg text-xs bg-muted/50 text-muted-foreground font-medium">+2 more</span>
                  </div>
                )}

                {item.sources && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
                    {item.sources.map((s) => (
                      <div key={s.label} className="p-2.5 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-2 text-xs">
                        <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground truncate">{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Click to Expand</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Ingest Showcase ═══════════════════ */
function IngestShowcase({ onNavigateDev }) {
  const sources = [
    { icon: FileText, label: "Direct Upload", color: "var(--google-blue)" },
    { icon: FileArchive, label: "ZIP Archive", color: "var(--google-green)" },
    { icon: Mail, label: "Gmail Sync", color: "var(--google-red)" },
    { icon: HardDrive, label: "Google Drive", color: "var(--google-yellow)" },
    { icon: FormInput, label: "Google Form", color: "var(--google-blue)" },
    { icon: Building2, label: "ATS Import", color: "var(--google-green)" },
  ];
  return (
    <motion.section id="ingest" className="mx-auto w-full max-w-7xl px-6 my-16 scroll-mt-24"
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainerVariants}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <motion.div variants={slideInLeftVariants} className="order-2 lg:order-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-blue)]">Multi-Source Ingest</div>
          <h2 className="mt-1.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Every channel your candidates use
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            No competitor combines Gmail sync, Google Drive sync, Google Form intake, and ATS import in one platform. Pipe resumes in from six sources — Workly normalizes them into one clean session.
          </p>
          <button onClick={onNavigateDev} className="pill rounded-full mt-6 cursor-pointer inline-flex items-center gap-2 border border-border bg-background px-6 py-2.5 text-sm font-medium hover:bg-muted shadow-sm transition-all">
            See ingest docs <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        <motion.div variants={slideInRightVariants} className="order-1 lg:order-2 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {sources.map((s) => (
            <motion.div
              key={s.label}
              variants={staggerItemVariants}
              className="rounded-2xl border border-border bg-card p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ color: s.color, backgroundColor: `color-mix(in oklab, ${s.color} 10%, transparent)` }}
              >
                <s.icon className="w-5.5 h-5.5" />
              </div>
              <div className="text-xs font-semibold text-center text-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Workflow Section — Dynamic ═══════════════════ */
function WorkflowSection({ liveSession }) {
  const steps = [
    { icon: Briefcase, title: "Create a session", desc: "Define your role requirements — title, description, must-have skills, and evaluation criteria.", color: "var(--google-blue)" },
    { icon: Upload, title: "Ingest from any source", desc: "Upload directly, sync from Gmail or Drive, accept via Google Forms, or pull from your ATS.", color: "var(--google-yellow)" },
    { icon: CheckCircle2, title: "Review your shortlist", desc: "AI parses, scores, and ranks every candidate. Fraud checks run automatically. Your shortlist is ready.", color: "var(--google-green)" },
  ];

  const candidates = liveSession.candidates;
  const sessionTitle = liveSession.title;

  return (
    <motion.section id="how-it-works" className="mx-auto w-full max-w-7xl px-6 my-16 scroll-mt-24"
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainerVariants}>
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Live session card — dynamic data */}
        <motion.div variants={slideInLeftVariants} className="order-2 lg:order-1">
          <div className="rounded-2xl border border-border bg-card shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Live Session</div>
                {sessionTitle && sessionTitle !== 'Live Session' && (
                  <div className="text-xs text-muted-foreground mt-0.5 font-medium truncate max-w-[180px]" title={sessionTitle}>
                    {sessionTitle}
                  </div>
                )}
              </div>
              <span className="pill px-3 py-1 text-xs font-semibold rounded-full bg-[var(--google-green)]/10 text-[var(--google-green)] border border-[var(--google-green)]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--google-green)] animate-pulse" /> Ranking
              </span>
            </div>
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No candidates yet. Upload resumes to see live rankings.
              </div>
            ) : (
              candidates.map((c, i) => {
                // Color the recommendation badge
                const recLower = (c.recommendation || '').toLowerCase();
                const badgeColor = recLower.includes('strong')
                  ? 'text-[var(--google-green)]'
                  : recLower.includes('reject')
                    ? 'text-[var(--google-red)]'
                    : 'text-[var(--google-blue)]';
                const barColor = recLower.includes('reject')
                  ? 'bg-[var(--google-red)]'
                  : 'bg-[var(--google-blue)]';

                return (
                  <motion.div key={c.name + i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-surface transition-colors group/row">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-sm font-semibold border border-border flex-shrink-0">
                      {c.initials || c.name?.[0] || '?'}
                    </div>
                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{c.name}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-muted-foreground truncate">{c.role}</span>
                        {c.experience > 0 && (
                          <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                            · {c.experience}y exp
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="hidden sm:block w-24 h-1.5 bg-border/70 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.min(c.score, 100)}%` }}
                        viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.08, duration: 0.8 }}
                        className={`h-full ${barColor} rounded-full`} />
                    </div>
                    {/* Score */}
                    <div className={`w-8 text-right text-sm font-bold tabular-nums ${badgeColor}`}>
                      {Math.round(c.score)}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Steps */}
        <div className="order-1 lg:order-2">
          <motion.div variants={fadeInUpVariants}>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-green)]">How it works</div>
            <h2 className="mt-1.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">From upload to shortlist in minutes</h2>
          </motion.div>
          <div className="mt-6 space-y-3.5">
            {steps.map((s, idx) => (
              <motion.div key={s.title} variants={staggerItemVariants} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${s.color} 14%, transparent)` }}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">STEP 0{idx + 1}</span>
                  <h3 className="mt-0.5 font-display text-base font-semibold tracking-tight text-foreground">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}



/* ═══════════════════ Pricing — Dynamic & Razorpay ═══════════════════ */
function PricingSection({ onStart, plans }) {
  const [yearly, setYearly] = useState(false);
  const [subscribingId, setSubscribingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById('razorpay-sdk')) {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSubscribe = async (plan) => {
    const rawPrice = typeof plan.price === 'number' ? plan.price : parseInt(plan.price) || 0;
    if (plan.id === 'free' || rawPrice === 0) {
      onStart();
      return;
    }

    const jwt = localStorage.getItem("vish_jwt");
    if (!jwt) {
      toast.error(`Please sign in to subscribe to ${plan.name}`);
      navigate('/login');
      return;
    }

    setSubscribingId(plan.id);
    try {
      const orderData = await billingAPI.subscribe(plan.id);

      // Handle mock order flow if Razorpay credentials are test/mock
      if (orderData.order_id?.startsWith("order_mock_")) {
        setTimeout(async () => {
          try {
            await billingAPI.verifyPayment({
              razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
              razorpay_order_id: orderData.order_id,
              razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(7),
              plan: plan.id
            });
            toast.success(`Successfully activated ${plan.name}! (Mock Payment)`);
            navigate('/dashboard');
          } catch (err) {
            toast.error("Payment verification failed: " + (err.message || "Unknown error"));
          } finally {
            setSubscribingId(null);
          }
        }, 1000);
        return;
      }

      // Real Razorpay checkout flow
      if (!window.Razorpay) {
        toast.error("Razorpay SDK failed to load. Please refresh and try again.");
        setSubscribingId(null);
        return;
      }

      const options = {
        key: orderData.razorpay_key_id || "rzp_test_mock",
        order_id: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Workly AI",
        description: `Upgrade to ${plan.name}`,
        theme: { color: "#4285F4" },
        handler: async function (response) {
          try {
            await billingAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id
            });
            toast.success(`Payment successful! Welcome to ${plan.name}.`);
            navigate('/dashboard');
          } catch (err) {
            toast.error("Payment verification failed");
          } finally {
            setSubscribingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setSubscribingId(null);
            toast("Payment window closed", { icon: "ℹ️" });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error("Payment failed: " + (response.error?.description || "Declined"));
        setSubscribingId(null);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Failed to initiate subscription");
      setSubscribingId(null);
    }
  };

  return (
    <motion.section id="pricing" className="mx-auto w-full max-w-7xl px-6 my-16 scroll-mt-24"
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainerVariants}>
      <motion.div variants={fadeInUpVariants} className="text-center mb-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-yellow)]">Pricing</div>
        <h2 className="mt-1.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Transparent pricing, no surprises</h2>
        <div className="mt-5 inline-flex p-1.5 rounded-full border border-border bg-card shadow-sm relative">
          {["Monthly", "Yearly"].map((t, i) => {
            const active = (i === 1) === yearly;
            return (
              <button key={t} onClick={() => setYearly(i === 1)}
                className={`relative flex items-center justify-center px-6 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer ${active ? "text-white" : "text-muted-foreground"}`}>
                {active && <motion.div layoutId="pricing-pill" className="absolute inset-0 bg-[var(--google-blue)] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative">{t}{i === 1 && <span className="ml-1 text-[11px]">(Save 20%)</span>}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => {
          const rawPrice = typeof p.price === 'number' ? p.price : parseInt(p.price) || 0;
          const price = yearly ? Math.round(rawPrice * 0.8 * 12) : rawPrice;
          const currency = rawPrice > 100 ? '₹' : '$';
          const isSubscribing = subscribingId === p.id;

          return (
            <motion.div key={p.id || p.name} variants={staggerItemVariants}
              className={`rounded-2xl border p-7 flex flex-col ${p.popular ? "border-[var(--google-blue)] bg-card shadow-lg md:scale-105" : "border-border bg-card shadow-sm"}`}>
              {p.popular && (
                <span className="self-start pill mb-4 bg-[var(--google-blue)] text-white border-transparent text-xs px-3 py-1 font-semibold rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
                </span>
              )}
              <div className="font-display font-bold text-xl text-foreground">{p.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.desc || p.description || ''}</div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display font-extrabold text-4xl text-foreground">
                  {rawPrice === 0 ? 'Free' : `${currency}${price.toLocaleString()}`}
                </span>
                {rawPrice > 0 && <span className="text-muted-foreground text-sm">/{yearly ? "yr" : "mo"}</span>}
              </div>
              <ul className="mt-6 space-y-3.5 flex-1">
                {(p.features || []).map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-[var(--google-green)] mt-0.5 flex-shrink-0" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(p)}
                disabled={isSubscribing}
                className={`mt-8 flex items-center justify-center gap-2 h-12 rounded-full font-semibold transition-all cursor-pointer ${p.popular ? "bg-[var(--google-blue)] text-white hover:opacity-90 shadow-md" : "border border-border bg-background hover:bg-muted text-foreground"}`}
              >
                {isSubscribing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : rawPrice === 0 ? (
                  "Start free"
                ) : (
                  "Subscribe with Razorpay"
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Split CTA ═══════════════════ */
function SplitCTA({ onStart, onNavigateDev }) {
  const navigate = useNavigate();

  return (
    <motion.section id="enterprise" className="mx-auto w-full max-w-7xl px-6 my-16 scroll-mt-24"
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainerVariants}>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recruiting Teams Card */}
        <motion.div variants={slideInLeftVariants} className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div aria-hidden className="absolute inset-0 -z-10"
            style={{ background: "radial-gradient(60% 70% at 0% 100%, color-mix(in oklab, var(--google-blue) 16%, transparent), transparent 70%)" }} />
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[var(--google-blue)]" /> For Recruiting Teams
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">Screen candidates in minutes, not days</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Upload resumes from any source. AI handles parsing, matching, and fraud checks automatically.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={onStart} className="pill cursor-pointer inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 rounded-full shadow-sm">
              Start free trial
            </button>
            <button onClick={() => navigate('/contact')} className="pill cursor-pointer inline-flex items-center gap-2 border border-border bg-background px-5 py-2.5 text-xs font-semibold hover:bg-muted rounded-full">
              <Briefcase className="h-3.5 w-3.5" /> Book a demo
            </button>
          </div>
        </motion.div>

        {/* Developers Card */}
        <motion.div variants={slideInRightVariants} className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div aria-hidden className="absolute inset-0 -z-10"
            style={{ background: "radial-gradient(60% 70% at 100% 0%, color-mix(in oklab, var(--google-green) 16%, transparent), transparent 70%)" }} />
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
            <Code2 className="h-3.5 w-3.5 text-[var(--google-green)]" /> For Developers
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">Build on our API</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">RESTful API with 15+ endpoints, webhooks, and embed tokens. Full docs and SDK included.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => navigate('/developer')} className="pill cursor-pointer inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-semibold text-background hover:opacity-90 rounded-full shadow-sm">
              Read the docs
            </button>
            <button onClick={() => navigate('/developer/portal/docs')} className="pill cursor-pointer inline-flex items-center gap-2 border border-border bg-background px-5 py-2.5 text-xs font-semibold hover:bg-muted rounded-full">
              API reference
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Final CTA ═══════════════════ */
function MagneticButton({ onClick }) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const ref = useRef(null);
  return (
    <motion.button ref={ref} style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseMove={(e) => { const r = ref.current.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.3); y.set((e.clientY - r.top - r.height / 2) * 0.3); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[var(--google-blue)] text-white font-semibold text-base sm:text-lg shadow-md hover:opacity-90 transition-opacity cursor-pointer">
      Start Free Trial <ArrowRight className="w-5 h-5" />
    </motion.button>
  );
}

function FinalCTA({ onStart, companiesCount }) {
  const label = companiesCount > 0
    ? `Join ${companiesCount.toLocaleString()}+ recruiting teams using Workly to screen candidates faster, with fraud detection and semantic matching built in.`
    : 'Join recruiting teams worldwide using Workly to screen candidates faster, with fraud detection and semantic matching built in.';
  return (
    <motion.section className="mx-auto w-full max-w-7xl px-6 my-16"
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUpVariants}>
      <div className="rounded-3xl border border-border bg-card p-10 md:p-16 text-center shadow-md">
        <h2 className="font-display font-bold text-3xl sm:text-5xl max-w-3xl mx-auto text-foreground tracking-tight">Ready to transform your hiring?</h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          {label}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <MagneticButton onClick={onStart} />
          <span className="text-xs text-muted-foreground mt-2">No credit card required · 14-day free trial · Cancel anytime</span>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Main Landing Page Component ═══════════════════ */
export default function LandingPage() {
  useDocumentTitle(
    "AI Resume Parsing & Intelligent Recruiter Screening | Workly",
    "Workly is a next-generation resume intelligence platform that automates candidate matching, ATS scoring, and background verification."
  );

  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("vish_jwt");

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 30 });
  const width = useTransform(scaleX, [0, 1], ["0%", "100%"]);

  // Scroll animations for background video (only visible in the hero section)
  // Fades out and scales up as user scrolls past the hero section
  const bgOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const bgScale = useTransform(scrollY, [0, 600], [1.06, 1.15]);
  const bgY = useTransform(scrollY, [0, 600], [0, 80]); // smooth translation for parallax

  // ── Live data from backend ──────────────────────────────────────────────────
  const { stats, liveSession, fraudSignals, plans, loading } = useLandingData();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  const handleAuth = () => {
    if (localStorage.getItem("vish_jwt")) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playVideo = () => {
        video.play().catch(err => {
          console.log("Autoplay deferred or blocked:", err);
        });
      };
      video.addEventListener('canplay', playVideo);
      playVideo();
      return () => {
        video.removeEventListener('canplay', playVideo);
      };
    }
  }, []);

  const handleNavigateDev = () => {
    navigate('/developer');
  };

  return (
    <div style={{ padding: '0', backgroundColor: 'transparent', color: 'var(--text)', minHeight: '100vh', transition: 'background-color 0.3s, color 0.3s', position: 'relative' }}>

      {/* Dynamic base background that matches theme when video fades out */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--bg)',
          zIndex: -3,
          pointerEvents: 'none',
          transition: 'background-color 0.3s'
        }}
      />

      {/* Background and scrim overlay styling */}
      <style>{`
        .bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        .bg-scrim {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: 
            radial-gradient(circle at 50% 44%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.80) 30%, rgba(255,255,255,0.46) 58%, rgba(255,255,255,0.20) 100%),
            linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, transparent 18%, transparent 82%, rgba(255,255,255,0.90) 100%);
        }

        /* Accent bloom behind H1 */
        .bg-scrim::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 46%, rgba(124,108,255,0.10) 0%, transparent 62%);
          filter: blur(40px);
          pointer-events: none;
        }

        /* Solid card backgrounds so rainbow gradient only shows as a border and glow */
        section {
          background-color: transparent !important;
        }
        .bg-card, .bg-surface {
          background-color: #ffffff !important;
          border-color: rgba(228, 228, 231, 0.8) !important;
        }
        .dark .bg-card, .dark .bg-surface {
          background-color: #121214 !important;
          border-color: rgba(63, 63, 70, 0.8) !important;
        }

        /* Rainbow borders and reflection animations for cards */
        .rainbow-bg {
          background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000);
          background-size: 400%;
        }
        
        .group:hover .rainbow-bg {
          animation: rainbow 20s linear infinite;
        }
        
        @keyframes rainbow {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>

      <motion.div style={{ width }} className="fixed top-0 left-0 h-[3px] bg-[var(--google-blue)] z-[60]" />

      <Navbar onSignIn={handleAuth} isLoggedIn={isLoggedIn} />

      <main className="flex flex-col w-full overflow-x-hidden" style={{ background: 'transparent' }}>
        <HeroSection
          onStart={handleAuth}
          companiesCount={stats.total_companies}
          bgY={bgY}
          bgOpacity={bgOpacity}
          bgScale={bgScale}
          videoRef={videoRef}
        />
        <LiveDemoCard />
        <StatsStrip stats={stats} loading={loading} />
        <BentoFeatures />
        <IngestShowcase onNavigateDev={handleNavigateDev} />
        <WorkflowSection liveSession={liveSession} />
        <PricingSection onStart={handleAuth} plans={plans} />
        <SplitCTA onStart={handleAuth} onNavigateDev={handleNavigateDev} />
        <Testimonials userTypeFilter="recruiter" title="Trusted by Innovative Teams" label="Voices of Impact" />
        <FinalCTA onStart={handleAuth} companiesCount={stats.total_companies} />
      </main>

      <Footer />
    </div>
  );
}
