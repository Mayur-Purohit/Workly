import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
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
  Calculator,
  Lock,
  Server,
  Clock,
  DollarSign,
  Layers,
  Cpu,
  Search,
} from 'lucide-react';

import toast from 'react-hot-toast';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { API_HOST, billingAPI } from '../lib/api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  total_companies: 17,
  total_sessions: 27,
  fraud_flagged: 0,
};

const FALLBACK_LIVE = {
  title: 'Live Session',
  candidates: [
    { name: 'A. Chen', initials: 'AC', role: 'Senior ML Engineer', score: 96, recommendation: 'Strong Hire', experience: 5 },
    { name: 'M. Ortega', initials: 'MO', role: 'Full-stack Developer', score: 91, recommendation: 'Strong Hire', experience: 4 },
    { name: 'J. Patel', initials: 'JP', role: 'Data Engineer', score: 84, recommendation: 'Consider', experience: 3 },
    { name: 'S. Kim', initials: 'SK', role: 'Frontend Engineer', score: 78, recommendation: 'Consider', experience: 2 },
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
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { stats, liveSession, fraudSignals, plans, loading, lastFetched, refresh: fetchAll };
}

/* ═══════════════════ Hero Section ═══════════════════ */
const rotatingWords = ["smarter", "faster", "better", "calmer"];

function HeroSection({ onStart, companiesCount }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const words = useMemo(() => rotatingWords, []);
  const heroRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    const t = setInterval(() => setWordIdx((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(t);
  }, [words.length]);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-hero-badge',
        { opacity: 0, scale: 0.9, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const pillLabel = companiesCount > 0
    ? `Trusted by ${companiesCount.toLocaleString()}+ recruiting teams worldwide`
    : 'Trusted by recruiting teams worldwide';

  return (
    <section ref={heroRef} className="relative overflow-hidden pt-12 md:pt-16 pb-8">
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 50% at 15% 10%, color-mix(in oklab, var(--google-blue) 14%, transparent), transparent 70%), radial-gradient(45% 40% at 95% 0%, color-mix(in oklab, var(--google-red) 10%, transparent), transparent 70%), radial-gradient(45% 50% at 50% 100%, color-mix(in oklab, var(--google-green) 10%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto w-full flex max-w-4xl flex-col items-center text-center px-6">
        <div className="flex flex-col items-center w-full">
          {/* Status pill */}
          <div className="gsap-hero-badge pill inline-flex items-center gap-2 border border-border bg-background/80 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-md rounded-full shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--google-green)] animate-pulse" />
            {pillLabel}
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.5rem] text-foreground"
          >
            <span>Recruit </span>
            <span className="relative inline-flex overflow-hidden h-[1.2em] w-[4em] items-center justify-center align-middle">
              {!isMounted ? (
                <span className="gradient-text font-extrabold">smarter</span>
              ) : (
                words.map((word, index) => (
                  <motion.span
                    key={word}
                    className="absolute gradient-text font-extrabold"
                    initial={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", stiffness: 75, damping: 15 }}
                    animate={
                      wordIdx === index
                        ? { y: 0, opacity: 1 }
                        : { y: "-100%", opacity: 0 }
                    }
                  >
                    {word}
                  </motion.span>
                ))
              )}
            </span>
            <br />
            <span>with AI-powered screening</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5 max-w-[620px] mx-auto text-base text-muted-foreground leading-relaxed"
          >
            Parse resumes from any source, match candidates with semantic precision,
            and detect fraud — all before they reach your pipeline.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={onStart}
              className="pill cursor-pointer bg-primary text-primary-foreground px-8 py-3.5 text-base font-semibold hover:opacity-90 shadow-md flex items-center gap-2 rounded-full transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ Live Demo Card ═══════════════════ */
const SCORE_KEYFRAMES = [
  { t: 0, v: 0 }, { t: 0.15, v: 12 }, { t: 0.28, v: 34 },
  { t: 0.42, v: 41 }, { t: 0.55, v: 61 }, { t: 0.72, v: 78 },
  { t: 0.82, v: 87 }, { t: 0.9, v: 92 }, { t: 0.95, v: 95 },
  { t: 1, v: 98.7 },
];

function LiveDemoCard() {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-100px" });
  const [displayScore, setDisplayScore] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    setScanning(true);
    let startTime = null;
    let animationFrameId;
    const duration = 2400;

    const animateScore = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      let currentVal = 0;
      for (let i = 0; i < SCORE_KEYFRAMES.length - 1; i++) {
        const k1 = SCORE_KEYFRAMES[i];
        const k2 = SCORE_KEYFRAMES[i + 1];
        if (progress >= k1.t && progress <= k2.t) {
          const segmentProgress = (progress - k1.t) / (k2.t - k1.t);
          const eased = segmentProgress < 0.5 
            ? 2 * segmentProgress * segmentProgress 
            : 1 - Math.pow(-2 * segmentProgress + 2, 2) / 2;
          currentVal = k1.v + (k2.v - k1.v) * eased;
          break;
        }
      }

      setDisplayScore(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateScore);
      } else {
        setDisplayScore(98.7);
        setScanning(false);
      }
    };

    animationFrameId = requestAnimationFrame(animateScore);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView]);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto w-full max-w-4xl px-6 my-8 scroll-mt-24"
    >
      <div ref={cardRef} className="relative rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Window Top Bar */}
        <div className="border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 px-5 py-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--google-red)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--google-yellow)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--google-green)]" />
            </div>
            <div className="flex-1 flex justify-center min-w-0 px-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-background border border-border/80 text-[11px] text-muted-foreground font-mono max-w-full overflow-hidden">
                <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-[var(--google-green)]" />
                <span className="truncate">workly.ai/screening/session-482</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${scanning ? 'bg-[var(--google-yellow)] animate-ping' : 'bg-[var(--google-green)]'}`} />
              <span className="text-muted-foreground font-medium">{scanning ? "Analyzing" : "Complete"}</span>
            </div>
          </div>
        </div>

        {/* Workspace Card Body */}
        <div className="p-5 md:p-7">
          <div className="grid md:grid-cols-[1fr_auto] gap-5 items-stretch">
            {/* Resume Preview */}
            <div className="relative bg-surface rounded-2xl p-5 border border-border overflow-hidden min-h-[340px]">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mb-4 pb-3 border-b border-border/60">
                <FileText className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">Sarah_Mitchell_Resume.pdf</span>
                <span className="ml-auto tabular-nums">2 pages · 184 KB</span>
              </div>
              <div className="space-y-3 text-left">
                {[
                  { name: "Sarah Mitchell", title: "Senior Full Stack Engineer", type: "candidate" },
                  { title: "Experience Breakdown", type: "section", items: ["Staff Engineer @ Stripe", "Senior Developer @ Vercel"] },
                  { title: "Core Skill Stack", type: "skills", items: ["React.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Python", "GraphQL"] },
                  { title: "Education & Impact", type: "education", school: "UC Berkeley", degree: "B.S. Computer Science" }
                ].map((s, idx) => {
                  const isChecked = displayScore > (idx + 1) * 22;
                  if (s.type === 'candidate') {
                    return (
                      <div key={idx} className="flex items-center gap-3 pb-2 border-b border-border/40">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--google-blue)] to-[var(--google-green)] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">SM</div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{s.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{s.title}</div>
                        </div>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--google-green)] ml-auto flex-shrink-0" />}
                      </div>
                    );
                  }
                  if (s.type === 'skills') {
                    return (
                      <div key={idx} className="text-xs pt-1">
                        <div className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <span>{s.title}</span>
                          {isChecked && <CheckCircle2 className="w-3 h-3 text-[var(--google-green)]" />}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {s.items.map((skill) => (
                            <span key={skill} className="px-2 py-0.5 rounded bg-background border border-border text-[10px] font-mono text-foreground">{skill}</span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="text-xs pt-1">
                      <div className="text-[11px] font-semibold text-muted-foreground mb-1">{s.title}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {s.items ? s.items.join(" · ") : `${s.school} — ${s.degree}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scanning Beam Bar */}
              {scanning && (
                <motion.div 
                  className="absolute left-4 right-4 h-[2px] bg-[var(--google-blue)] pointer-events-none rounded-full shadow-[0_0_12px_var(--google-blue)]"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            {/* Score Ring Right Card */}
            <div className="flex md:flex-col items-center md:items-stretch justify-between md:justify-center gap-3 md:min-w-[190px] rounded-2xl border border-border bg-surface p-5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Match Score</div>
              <div className="font-display text-4xl md:text-5xl font-bold tabular-nums leading-none text-foreground">
                {displayScore.toFixed(1)}<span className="text-2xl md:text-3xl text-muted-foreground">%</span>
              </div>
              <div className="flex flex-col gap-1.5 text-left w-full mt-2 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Skill Match</span>
                  <span className="font-semibold text-[var(--google-green)]">99%</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Originality</span>
                  <span className="font-semibold text-[var(--google-blue)]">96%</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Fraud Check</span>
                  <span className="font-semibold text-[var(--google-green)]">Passed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Stats Strip ═══════════════════ */
function StatsStrip({ stats, loading }) {
  const items = [
    { label: "Active Companies", val: stats.total_companies || 17, suffix: "+", color: "text-[var(--google-blue)]" },
    { label: "Active Sessions", val: stats.total_sessions || 27, suffix: "", color: "text-[var(--google-green)]" },
    { label: "Parse Accuracy", val: 99.4, suffix: "%", color: "text-[var(--google-yellow)]" },
    { label: "Avg Screening Time", val: 1.2, suffix: "s", color: "text-[var(--google-red)]" },
  ];

  return (
    <div className="border-y border-border/60 bg-card/60 backdrop-blur-md py-8 my-12">
      <div className="mx-auto w-full max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {items.map((it) => (
          <div key={it.label} className="flex flex-col items-center">
            <div className={`font-display text-3xl sm:text-4xl font-extrabold tabular-nums ${it.color}`}>
              {loading ? "..." : `${it.val}${it.suffix}`}
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ [NEW] Interactive Candidate Match Simulator ═══════════════════ */
const SIM_ROLES = [
  {
    role: 'Senior Full Stack Engineer',
    reqSkills: ['React.js', 'Node.js', 'PostgreSQL', 'Docker'],
    expReq: 4,
    score: 96,
    recommendation: 'Strong Hire',
    summary: 'Candidate has 5+ years building distributed React/Node web apps. Excellent match.'
  },
  {
    role: 'Lead ML Scientist',
    reqSkills: ['PyTorch', 'Python', 'Transformers', 'Computer Vision'],
    expReq: 5,
    score: 92,
    recommendation: 'Strong Hire',
    summary: 'Strong background in deep learning research & PyTorch pipeline optimization.'
  },
  {
    role: 'DevOps & Site Reliability Lead',
    reqSkills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    expReq: 4,
    score: 88,
    recommendation: 'Consider',
    summary: 'Solid cloud infrastructure experience, meets all core Terraform & K8s criteria.'
  }
];

function InteractiveMatchSimulator() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeRole = SIM_ROLES[selectedIdx];

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInUpVariants}
      className="mx-auto w-full max-w-7xl px-6 my-16"
    >
      <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-blue)] flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> AI Screening Simulator
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Test AI Resume Matching Live
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a target role to see how Workly automatically calculates skill weightings & candidate rankings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SIM_ROLES.map((r, i) => (
              <button
                key={r.role}
                onClick={() => setSelectedIdx(i)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedIdx === i 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-surface border border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {r.role.split(' ')[0]} {r.role.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Role Criteria Box */}
          <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-2">Job Description Target</div>
              <h3 className="font-display text-lg font-bold text-foreground">{activeRole.role}</h3>
              <p className="text-xs text-muted-foreground mt-1">Min. Experience: {activeRole.expReq} Years</p>

              <div className="mt-4">
                <div className="text-xs font-semibold text-foreground mb-2">Required Skills Criteria:</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeRole.reqSkills.map((sk) => (
                    <span key={sk} className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-medium text-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[var(--google-green)]" /> {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Weights: Skills 50% · Exp 30% · Location 20%</span>
              <span className="font-semibold text-[var(--google-blue)]">Auto-Calculated</span>
            </div>
          </div>

          {/* AI Match Result Box */}
          <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground">AI Evaluation Result</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--google-green)]/15 text-[var(--google-green)] border border-[var(--google-green)]/30">
                  {activeRole.recommendation}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-4xl font-extrabold text-foreground tabular-nums">{activeRole.score}%</span>
                <span className="text-xs text-muted-foreground">Match Score Confidence</span>
              </div>

              <div className="h-2 w-full bg-border/60 rounded-full overflow-hidden mb-4">
                <motion.div 
                  key={activeRole.score}
                  initial={{ width: 0 }}
                  animate={{ width: `${activeRole.score}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[var(--google-blue)] to-[var(--google-green)] rounded-full"
                />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed bg-background p-3 rounded-xl border border-border/60">
                "{activeRole.summary}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-[var(--google-blue)] font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Parsed & Screened in 1.14 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Bento Features ═══════════════════ */
function BentoFeatures() {
  return (
    <motion.section id="features" className="mx-auto w-full max-w-7xl px-6 my-16 scroll-mt-24"
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainerVariants}>
      <motion.div variants={fadeInUpVariants} className="text-center mb-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-blue)]">Platform</div>
        <h2 className="mt-1.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to screen at scale
        </h2>
        <p className="mt-2 text-base text-muted-foreground max-w-lg mx-auto">
          A complete AI recruitment platform — from resume intake to shortlist.
        </p>
      </motion.div>
      <div className="grid gap-5 md:grid-cols-3">
        {/* Large card — AI Parsing */}
        <motion.div variants={staggerItemVariants} className="md:col-span-2 relative z-0 p-[1px] rounded-2xl group transition-all duration-500 ease-out hover:z-10 hover:shadow-xl hover:-translate-y-1 cursor-pointer isolate">
          {/* Rainbow borders and blur reflections on hover */}
          <div className="absolute inset-[-4px] md:inset-[-6px] rounded-[1.25rem] opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl pointer-events-none -z-20 rainbow-bg" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10 rainbow-bg" />
          <div className="absolute inset-0 border border-border/80 rounded-2xl opacity-50 md:opacity-100 group-hover:opacity-0 transition-opacity duration-500 -z-10" />

          <div className="relative rounded-[15px] bg-card p-7 h-full w-full overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: "color-mix(in oklab, var(--google-blue) 14%, transparent)" }}>
                  <Brain className="h-5 w-5 text-[var(--google-blue)]" />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Intelligent Resume Parsing</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Multi-format extraction from PDFs, DOCX, images and scanned documents. Our AI understands context,
                    not just keywords — extracting skills, experience timelines, and career trajectories with enterprise-grade accuracy.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6 w-full">
                {["PDF & DOCX", "Scanned docs", "Multi-language"].map((t) => (
                  <div key={t} className="border border-border bg-background hover:bg-muted px-4 py-2 rounded-full text-xs font-semibold text-foreground flex items-center justify-center transition-all duration-200">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Small card — Fraud */}
        <motion.div variants={staggerItemVariants} className="relative z-0 p-[1px] rounded-2xl group transition-all duration-500 ease-out hover:z-10 hover:shadow-xl hover:-translate-y-1 cursor-pointer isolate">
          {/* Rainbow borders and blur reflections on hover */}
          <div className="absolute inset-[-4px] md:inset-[-6px] rounded-[1.25rem] opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl pointer-events-none -z-20 rainbow-bg" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10 rainbow-bg" />
          <div className="absolute inset-0 border border-border/80 rounded-2xl opacity-50 md:opacity-100 group-hover:opacity-0 transition-opacity duration-500 -z-10" />

          <div className="relative rounded-[15px] bg-card p-7 h-full w-full overflow-hidden flex flex-col justify-start">
            <div className="relative z-10 flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{ background: "color-mix(in oklab, var(--google-red) 14%, transparent)" }}>
                <Shield className="h-5 w-5 text-[var(--google-red)]" />
              </span>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Fraud Detection</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Three-signal verification: plagiarism, AI-generated content, and originality scoring per candidate.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Small card — Matching */}
        <motion.div variants={staggerItemVariants} className="relative z-0 p-[1px] rounded-2xl group transition-all duration-500 ease-out hover:z-10 hover:shadow-xl hover:-translate-y-1 cursor-pointer isolate">
          {/* Rainbow borders and blur reflections on hover */}
          <div className="absolute inset-[-4px] md:inset-[-6px] rounded-[1.25rem] opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl pointer-events-none -z-20 rainbow-bg" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10 rainbow-bg" />
          <div className="absolute inset-0 border border-border/80 rounded-2xl opacity-50 md:opacity-100 group-hover:opacity-0 transition-opacity duration-500 -z-10" />

          <div className="relative rounded-[15px] bg-card p-7 h-full w-full overflow-hidden flex flex-col justify-start">
            <div className="relative z-10 flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{ background: "color-mix(in oklab, var(--google-green) 14%, transparent)" }}>
                <Target className="h-5 w-5 text-[var(--google-green)]" />
              </span>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Semantic Matching</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Context-aware scoring that understands role equivalency, transferable skills, and career progression.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Large card — Multi-Source */}
        <motion.div variants={staggerItemVariants} className="md:col-span-2 relative z-0 p-[1px] rounded-2xl group transition-all duration-500 ease-out hover:z-10 hover:shadow-xl hover:-translate-y-1 cursor-pointer isolate">
          {/* Rainbow borders and blur reflections on hover */}
          <div className="absolute inset-[-4px] md:inset-[-6px] rounded-[1.25rem] opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl pointer-events-none -z-20 rainbow-bg" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10 rainbow-bg" />
          <div className="absolute inset-0 border border-border/80 rounded-2xl opacity-50 md:opacity-100 group-hover:opacity-0 transition-opacity duration-500 -z-10" />

          <div className="relative rounded-[15px] bg-card p-7 h-full w-full overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: "color-mix(in oklab, var(--google-yellow) 14%, transparent)" }}>
                  <Upload className="h-5 w-5 text-[var(--google-yellow)]" />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Six-Source Resume Intake</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    The only platform combining direct upload, ZIP batch, Gmail sync, Google Drive, Google Forms, and ATS import
                    into one normalized pipeline. Candidates arrive from everywhere — Workly unifies them.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6 w-full">
                {[
                  { icon: FileText, label: "Direct Upload" },
                  { icon: FileArchive, label: "ZIP Batch" },
                  { icon: Mail, label: "Gmail" },
                  { icon: HardDrive, label: "Google Drive" },
                  { icon: FormInput, label: "Forms" },
                  { icon: Building2, label: "ATS" },
                ].map((s) => (
                  <div key={s.label} className="border border-border bg-background px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground flex items-center gap-1.5 hover:bg-muted transition-all duration-200">
                    <s.icon className="h-3.5 w-3.5 text-muted-foreground" /> {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
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
              className="rounded-2xl border border-border bg-card p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
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
                    <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-sm font-semibold border border-border flex-shrink-0">
                      {c.initials || c.name?.[0] || '?'}
                    </div>
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
                    <div className="hidden sm:block w-24 h-1.5 bg-border/70 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.min(c.score, 100)}%` }}
                        viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.08, duration: 0.8 }}
                        className={`h-full ${barColor} rounded-full`} />
                    </div>
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

/* ═══════════════════ [NEW] Hiring ROI & Time Calculator ═══════════════════ */
function HiringROICalculator() {
  const [resumes, setResumes] = useState(500);
  const [minsPerResume, setMinsPerResume] = useState(15);

  const hoursSavedPerMonth = Math.round((resumes * (minsPerResume - 1.2)) / 60);
  const dollarsSavedPerYear = Math.round(hoursSavedPerMonth * 35 * 12);

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInUpVariants}
      className="mx-auto w-full max-w-7xl px-6 my-16"
    >
      <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-lg">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-yellow)] inline-flex items-center gap-1.5">
            <Calculator className="w-4 h-4" /> ROI Calculator
          </div>
          <h2 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-foreground">
            Calculate Your Time & Cost Savings
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            See how much recruiter capacity Workly unlocks for your hiring team every month.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Sliders Control */}
          <div className="space-y-6 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-2">
                <span className="text-foreground">Resumes Screened Per Month:</span>
                <span className="text-[var(--google-blue)] font-bold text-base tabular-nums">{resumes.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={resumes}
                onChange={(e) => setResumes(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[var(--google-blue)]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                <span>50</span>
                <span>2,500</span>
                <span>5,000+</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-2">
                <span className="text-foreground">Manual Screen Time Per Resume:</span>
                <span className="text-[var(--google-green)] font-bold text-base tabular-nums">{minsPerResume} mins</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="5"
                value={minsPerResume}
                onChange={(e) => setMinsPerResume(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[var(--google-green)]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                <span>5 mins</span>
                <span>25 mins</span>
                <span>45 mins</span>
              </div>
            </div>
          </div>

          {/* Calculated Output Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--google-blue)]/10 text-[var(--google-blue)] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-3xl font-display font-extrabold text-foreground tabular-nums">{hoursSavedPerMonth} hrs</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Recruiter Hours Saved / Mo</div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--google-green)]/10 text-[var(--google-green)] flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-3xl font-display font-extrabold text-[var(--google-green)] tabular-nums">${dollarsSavedPerYear.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Estimated Annual Cost Savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════ [NEW] Security & Enterprise Trust ═══════════════════ */
function SecurityComplianceSection() {
  const trustItems = [
    { icon: Lock, title: "SOC2 Type II & GDPR", desc: "Enterprise data isolation with 256-bit AES encryption at rest and TLS 1.3 in transit." },
    { icon: ShieldCheck, title: "Plagiarism & AI Detection", desc: "Triangulates three independent signal checks to verify candidate authenticity." },
    { icon: Server, title: "99.99% SLA Uptime", desc: "Built on high-availability distributed architecture with sub-second API responses." },
  ];

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainerVariants}
      className="mx-auto w-full max-w-7xl px-6 my-16"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {trustItems.map((item) => (
          <motion.div
            key={item.title}
            variants={staggerItemVariants}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center mb-4 text-[var(--google-blue)]">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-semibold text-[var(--google-green)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Compliant
            </div>
          </motion.div>
        ))}
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
  const bgOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const bgScale = useTransform(scrollY, [0, 600], [1.06, 1.15]);
  const bgY = useTransform(scrollY, [0, 600], [0, 80]);

  // Live data from backend
  const { stats, liveSession, fraudSignals, plans, loading } = useLandingData();
  const videoRef = useRef(null);

  // Initialize Lenis smooth scroll and sync with GSAP
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  // Background video autoplay hook
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

  const handleNavigateDev = () => {
    navigate('/developer');
  };

  return (
    <div style={{ padding: '0', backgroundColor: 'transparent', color: 'var(--text)', minHeight: '100vh', transition: 'background-color 0.3s, color 0.3s', position: 'relative' }}>
      
      {/* Dynamic base background */}
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

      {/* Lenis Smooth Scroll & Styling Overrides */}
      <style>{`
        html.lenis, html.lenis body {
          height: auto;
        }
        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }
        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }
        .lenis.lenis-stopped {
          overflow: hidden;
        }
        .lenis.lenis-smooth iframe {
          pointer-events: none;
        }

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

      {/* SCROLL-ACTIVATED HERO VIDEO BACKGROUND CONTAINER */}
      <motion.div
        style={{
          opacity: bgOpacity,
          scale: bgScale,
          y: bgY,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          pointerEvents: 'none'
        }}
      >
        <video
          ref={videoRef}
          src="https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/flux.mp4"
          className="bg-video"
          autoPlay
          muted
          loop
          playsInline
          style={{ filter: 'blur(2px) saturate(1.06)' }}
        />
        <div className="bg-scrim" />
      </motion.div>

      <motion.div style={{ width }} className="fixed top-0 left-0 h-[3px] bg-[var(--google-blue)] z-[60]" />
      
      <Navbar onSignIn={handleAuth} isLoggedIn={isLoggedIn} />
      
      <main className="flex flex-col w-full overflow-x-hidden pt-16" style={{ background: 'transparent' }}>
        <HeroSection onStart={handleAuth} companiesCount={stats.total_companies} />
        <LiveDemoCard />
        <StatsStrip stats={stats} loading={loading} />
        <InteractiveMatchSimulator />
        <BentoFeatures />
        <IngestShowcase onNavigateDev={handleNavigateDev} />
        <WorkflowSection liveSession={liveSession} />
        <HiringROICalculator />
        <SecurityComplianceSection />
        <PricingSection onStart={handleAuth} plans={plans} />
        <SplitCTA onStart={handleAuth} onNavigateDev={handleNavigateDev} />
        <FinalCTA onStart={handleAuth} companiesCount={stats.total_companies} />
      </main>

      <Footer />
    </div>
  );
}
