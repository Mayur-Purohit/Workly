import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  Star,
  RefreshCw,
  Copy,
  Check,
  Search,
  FileText,
  Brain,
  Zap,
  Lock,
  ArrowRight,
  ChevronDown,
  Terminal,
  ShieldCheck,
  Play,
  Activity,
  Layers,
  Globe,
  Code2,
  Menu,
  X,
  TrendingUp,
  Server,
  BarChart3
} from "lucide-react";
import { portalBilling, portalAuth } from "../../lib/portalApi";
import { usePortalAuthStore } from "../../stores/portalAuthStore";
import { SocialTooltip } from "../../components/ui/social-media";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { DEVELOPER_PLANS } from "../../lib/constants";
import ThemeToggle from "../../components/ThemeToggle";
import Testimonials from "../../components/Testimonials";

/* ═══════════════════ Framer Motion Animation System ═══════════════════ */
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
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
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ═══════════════════ Interactive Live API Playground ═══════════════════ */
const PLAYGROUND_ENDPOINTS = [
  {
    id: "parse",
    label: "POST /v1/parse-resume",
    badge: "Parser Engine",
    description: "Extract structured contact, experience, education, and normalized skill vectors.",
    payload: {
      file_name: "alex_chen_resume.pdf",
      extract_skills: true,
      normalize_job_titles: true,
      compute_seniority: true
    },
    response: {
      status: 200,
      processing_time_ms: 8.2,
      candidate: {
        full_name: "Alex Chen",
        email: "alex.chen@dev.io",
        phone: "+1 (555) 234-5678",
        location: "San Francisco, CA",
        primary_role: "Senior Full Stack Engineer",
        seniority_level: "Senior (6.5 YOE)",
        skills: ["React", "TypeScript", "Python", "Django", "PostgreSQL", "AWS", "Docker"],
        education: [{ degree: "B.S. Computer Science", institution: "UC Berkeley", year: 2019 }],
        parse_confidence: 0.992
      }
    }
  },
  {
    id: "match",
    label: "POST /v1/match-skills",
    badge: "Semantic Ranker",
    description: "Vector similarity score between candidate profiles and target job descriptions.",
    payload: {
      candidate_id: "cand_9831a",
      job_requirements: ["Python", "Django", "PostgreSQL", "Celery", "Redis", "Docker"]
    },
    response: {
      status: 200,
      match_score: 94.8,
      rating: "Strong Fit",
      matched_skills: ["Python", "PostgreSQL", "Docker", "Redis"],
      missing_skills: ["Django", "Celery"],
      implicit_skills_detected: ["REST APIs", "Async Queues"],
      fit_percentile: 98.4
    }
  },
  {
    id: "fraud",
    label: "POST /v1/detect-fraud",
    badge: "Authenticity Shield",
    description: "Detect AI-generated text, hidden prompt injections, and resume embellishments.",
    payload: {
      resume_text: "Senior Software Engineer with 15 years experience in Quantum AI...",
      check_ai_generated: true,
      check_keyword_stuffing: true
    },
    response: {
      status: 200,
      authentic: true,
      fraud_risk: "LOW",
      ai_text_probability: 0.03,
      hidden_text_detected: false,
      verification_hash: "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b"
    }
  }
];

function InteractiveApiPlayground() {
  const [selectedEp, setSelectedEp] = useState(PLAYGROUND_ENDPOINTS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunDemo = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      toast.success(`Executed ${selectedEp.badge} request in ${selectedEp.response.processing_time_ms || 8.2}ms!`);
    }, 400);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedEp.response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("JSON response copied to clipboard!");
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-left relative">
      {/* Top Bar */}
      <div className="px-5 py-3.5 border-b border-border bg-muted/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span className="ml-2 text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[var(--google-blue)]" /> Live API Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            className="px-3 py-1 rounded-full border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--google-green)]" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            {copied ? "Copied" : "Copy Response"}
          </button>
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="p-3 border-b border-border bg-background/60 flex flex-wrap items-center gap-2">
        {PLAYGROUND_ENDPOINTS.map((ep) => (
          <button
            key={ep.id}
            onClick={() => setSelectedEp(ep)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
              selectedEp.id === ep.id
                ? "bg-[var(--google-blue)] text-white shadow-md shadow-blue-500/20"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {ep.label}
          </button>
        ))}
      </div>

      {/* Payload & Response Display */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border bg-[#111215] text-zinc-100 font-mono text-xs p-4 gap-4">
        {/* Left: Request Payload */}
        <div className="flex flex-col justify-between gap-3">
          <div>
            <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
              <span>Request JSON</span>
              <span className="text-[var(--google-blue)]">{selectedEp.badge}</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-emerald-400 overflow-x-auto leading-relaxed max-h-[190px]">
              {JSON.stringify(selectedEp.payload, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-[11px] font-sans text-zinc-400 mb-3">{selectedEp.description}</p>
            <button
              onClick={handleRunDemo}
              disabled={isRunning}
              className="w-full py-2.5 px-4 rounded-full bg-[var(--google-blue)] hover:opacity-90 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? "Executing Query..." : "Test Endpoint Now"}
            </button>
          </div>
        </div>

        {/* Right: Response JSON */}
        <div className="flex flex-col justify-between gap-3">
          <div>
            <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
              <span>Output Response</span>
              <span className="text-[var(--google-green)]">200 OK</span>
            </div>
            {isRunning ? (
              <div className="h-[190px] rounded-xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-center gap-2 text-zinc-400">
                <RefreshCw className="w-5 h-5 animate-spin text-[var(--google-blue)]" />
                <span className="font-sans text-xs">Parsing candidate JSON payload...</span>
              </div>
            ) : (
              <pre className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-sky-300 overflow-x-auto max-h-[190px] leading-relaxed">
                {JSON.stringify(selectedEp.response, null, 2)}
              </pre>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400 pt-1 border-t border-zinc-800/60">
            <span className="flex items-center gap-1.5 text-[var(--google-green)] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--google-green)] animate-pulse"></span> Verified Status 200
            </span>
            <span>Latency: ~{selectedEp.response.processing_time_ms || 8.2}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ Developer Pricing Component (Job Seeker Material Theme & Razorpay) ═══════════════════ */
function DeveloperPricingSection({ plans, isDevLoggedIn, currentTier, navigate }) {
  const [yearly, setYearly] = useState(false);
  const [subscribingId, setSubscribingId] = useState(null);

  useEffect(() => {
    if (!document.getElementById("razorpay-sdk")) {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSubscribe = async (plan) => {
    const rawPrice = typeof plan.price === "number" ? plan.price : parseInt(plan.price) || 0;
    if (plan.id === "free" || rawPrice === 0) {
      if (isDevLoggedIn) {
        navigate("/developer/portal");
      } else {
        navigate("/developer/register");
      }
      return;
    }

    if (!isDevLoggedIn) {
      toast.error(`Please sign in or register to subscribe to ${plan.name}`);
      navigate("/developer/login");
      return;
    }

    setSubscribingId(plan.id);
    try {
      const orderData = await portalBilling.subscribe(plan.id);

      if (orderData.order_id?.startsWith("order_mock_")) {
        setTimeout(async () => {
          try {
            await portalBilling.verifyPayment({
              razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
              razorpay_order_id: orderData.order_id,
              razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(7),
              plan: plan.id
            });
            toast.success(`Successfully activated ${plan.name}! (Mock Payment)`);
            usePortalAuthStore.getState().setAuth({ ...usePortalAuthStore.getState().developer, tier: plan.id });
            navigate("/developer/portal/billing");
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
        name: "Workly Developer API",
        description: `Upgrade to ${plan.name} Plan`,
        theme: { color: "#4285F4" },
        handler: async function (response) {
          try {
            await portalBilling.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id
            });
            toast.success(`Payment successful! Activated ${plan.name}.`);
            usePortalAuthStore.getState().setAuth({ ...usePortalAuthStore.getState().developer, tier: plan.id });
            navigate("/developer/portal/billing");
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
      rzp.on("payment.failed", function (response) {
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
    <motion.section
      id="pricing"
      className="mx-auto w-full max-w-7xl px-6 my-24 scroll-mt-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainerVariants}
    >
      <motion.div variants={fadeInUpVariants} className="text-center mb-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-yellow)] mb-1.5">
          Developer Pricing
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Transparent pricing, zero hidden fees
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Start free. Upgrade API call limits seamlessly as your user base expands.</p>

        {/* Toggle Pill Switch */}
        <div className="mt-6 inline-flex p-1.5 rounded-full border border-border bg-card shadow-sm relative">
          {["Monthly", "Yearly"].map((t, i) => {
            const active = (i === 1) === yearly;
            return (
              <button
                key={t}
                onClick={() => setYearly(i === 1)}
                className={`relative flex items-center justify-center px-6 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer ${
                  active ? "text-white" : "text-muted-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="dev-pricing-pill-master"
                    className="absolute inset-0 bg-[var(--google-blue)] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {t}
                  {i === 1 && <span className="ml-1 text-[11px]">(Save 20%)</span>}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Grid of Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
        {plans.map((p) => {
          const rawPrice = typeof p.price === "number" ? p.price : parseInt(p.price) || 0;
          const price = yearly ? Math.round(rawPrice * 0.8) : rawPrice;
          const currency = rawPrice > 100 ? "₹" : "$";
          const isSubscribing = subscribingId === p.id;
          const isCurrentPlan = isDevLoggedIn && currentTier === p.id;
          const isPopular = p.id === "starter" || p.id === "business" || p.popular;

          return (
            <motion.div
              key={p.id || p.name}
              variants={staggerItemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`rounded-2xl border p-7 flex flex-col transition-all duration-300 text-left ${
                isPopular
                  ? "border-[var(--google-blue)] bg-card shadow-lg ring-2 ring-[var(--google-blue)]/20 md:scale-105"
                  : "border-border bg-card shadow-sm"
              }`}
            >
              {isPopular && (
                <span className="self-start pill mb-4 bg-[var(--google-blue)] text-white text-xs px-3 py-1 font-semibold rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
                </span>
              )}
              <div className="font-display font-bold text-xl text-foreground uppercase tracking-tight">{p.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {p.desc || p.description || (p.id === "free" ? "For sandbox testing & side projects" : p.id === "starter" ? "For growing SaaS platforms" : "For enterprise volume applications")}
              </div>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display font-extrabold text-4xl text-foreground">
                  {rawPrice === 0 ? "Free" : `${currency}${price.toLocaleString()}`}
                </span>
                {rawPrice > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
              </div>
              {yearly && rawPrice > 0 && (
                <div className="text-xs text-[var(--google-green)] font-medium mt-1">
                  Billed annually ({currency}{(price * 12).toLocaleString()}/yr)
                </div>
              )}

              <ul className="mt-6 space-y-3.5 flex-1">
                {(p.features || []).map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[var(--google-green)] mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="mt-8 flex items-center justify-center gap-2 h-12 rounded-full font-semibold bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 cursor-default w-full"
                >
                  <CheckCircle2 className="w-4 h-4" /> Current Active Plan
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubscribe(p)}
                  disabled={isSubscribing}
                  className={`mt-8 flex items-center justify-center gap-2 h-12 rounded-full font-semibold transition-all cursor-pointer w-full ${
                    isPopular
                      ? "bg-[var(--google-blue)] text-white hover:opacity-90 shadow-md shadow-blue-500/20"
                      : "border border-border bg-background hover:bg-muted text-foreground"
                  }`}
                >
                  {isSubscribing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : rawPrice === 0 ? (
                    "Start Free"
                  ) : (
                    `Subscribe to ${p.name}`
                  )}
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

/* ═══════════════════ Main Developer Landing Page Component ═══════════════════ */
export default function DeveloperLandingPage() {
  useDocumentTitle(
    "Developer Hub - Workly API",
    "Integrate ATS scoring and resume parser APIs into your platform."
  );
  const navigate = useNavigate();

  const socialLinks = [
    { href: "#", ariaLabel: "LinkedIn", tooltip: "LinkedIn", color: "#0A66C2" },
    { href: "#", ariaLabel: "Twitter", tooltip: "Twitter", color: "#000000" },
    { href: "#", ariaLabel: "Instagram", tooltip: "Instagram", color: "#E1306C" },
    { href: "#", ariaLabel: "Facebook", tooltip: "Facebook", color: "#3B5998" },
    { href: "#", ariaLabel: "Telegram", tooltip: "Telegram", color: "#0088CC" }
  ];

  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState("Python");
  const [openFaq, setOpenFaq] = useState(null);

  const [plans, setPlans] = useState(DEVELOPER_PLANS);

  const { tier, jwt, initFromStorage, setAuth } = usePortalAuthStore();
  const [isDevLoggedIn, setIsDevLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("portal_jwt");
    if (token && token !== "undefined") {
      setIsDevLoggedIn(true);
      initFromStorage();

      portalAuth.getMe()
        .then((meData) => {
          setAuth(meData);
        })
        .catch((err) => {
          console.error("Failed to sync developer account:", err);
        });
    } else {
      setIsDevLoggedIn(false);
    }
  }, [jwt, initFromStorage, setAuth]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await portalBilling.plans();
        if (data && data.length > 0) setPlans(data);
      } catch (err) {
        console.error("Failed to load live plans:", err);
      }
    };
    fetchPlans();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const codeSnippets = {
    Python: `import requests

url = "https://api.between.indevs.in/api/v1/parse"
headers = {"X-API-Key": "between_live_your_key"}
files = {"file": open("resume.pdf", "rb")}

response = requests.post(url, headers=headers, files=files)
data = response.json()
print("Matched Skill Score:", data["match_score"])`,
    NodeJS: `import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const form = new FormData();
form.append('file', fs.createReadStream('resume.pdf'));

const res = await fetch('https://api.between.indevs.in/api/v1/parse', {
  method: 'POST',
  headers: { 'X-API-Key': 'between_live_your_key' },
  body: form
});
const data = await res.json();
console.log(data);`,
    cURL: `curl -X POST \\
  https://api.between.indevs.in/api/v1/parse \\
  -H "X-API-Key: between_live_your_key" \\
  -F "file=@resume.pdf"`
  };

  const faqs = [
    {
      q: "How fast is the resume parser API?",
      a: "Our neural parsing pipeline averages under 10ms response time per resume PDF/DOCX, delivering instant JSON output for high-throughput ATS systems."
    },
    {
      q: "Can I test the API without a credit card?",
      a: "Yes! The Free Developer plan provides 100 free resume parses every month with no credit card required."
    },
    {
      q: "What file formats are supported?",
      a: "We support PDF, DOCX, DOC, TXT, RTF, ZIP archives, and Google Drive links natively."
    },
    {
      q: "How does the Razorpay payment integration work?",
      a: "Subscriptions are billed safely through Razorpay with standard GST invoicing and auto-renewal options in your Developer Portal."
    }
  ];

  return (
    <div className="min-h-screen font-sans text-foreground bg-background dark:text-zinc-100 dark:bg-[#09090b]">
      {/* ════════════════ NAVBAR ════════════════ */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-card/95 border-b border-border shadow-sm py-2" : "bg-background/80 border-b border-transparent backdrop-blur-md py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm bg-[var(--google-blue)] p-1 shadow-sm">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="32" y1="68" x2="68" y2="32" stroke="white" strokeWidth="14" strokeLinecap="round" />
                <circle cx="32" cy="68" r="16" fill="white" />
                <circle cx="68" cy="32" r="24" fill="white" />
              </svg>
            </div>
            <span className="font-display text-[22px] text-foreground tracking-tight font-bold">Workly</span>
            <span className="text-[13px] text-muted-foreground font-medium ml-1">for Developers</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-[var(--google-blue)] transition-colors">Home</Link>
            <a href="#playground" className="hover:text-[var(--google-blue)] transition-colors">API Console</a>
            <a href="#features" className="hover:text-[var(--google-blue)] transition-colors">Capabilities</a>
            <a href="#pricing" className="hover:text-[var(--google-blue)] transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-[var(--google-blue)] transition-colors">Docs</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-[11px] font-semibold text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-[var(--google-green)] animate-pulse"></span> API Operational
            </div>
            {isDevLoggedIn ? (
              <Link to="/developer/portal" className="px-5 py-2 rounded-full text-[var(--google-blue)] border border-border font-semibold hover:bg-muted transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link to="/developer/login" className="px-5 py-2 rounded-full text-[var(--google-blue)] border border-border font-semibold hover:bg-muted transition-colors">
                Sign In
              </Link>
            )}
            <Link to="/developer/register" className="px-5 py-2 rounded-full bg-[var(--google-blue)] text-white font-semibold hover:opacity-90 transition-all shadow-sm">
              Get API Key
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button className="text-foreground" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="fixed inset-0 top-[60px] bg-card z-40 p-6 flex flex-col gap-6 md:hidden border-b border-border">
          <Link to="/" className="text-lg font-semibold text-foreground" onClick={() => setMobileMenu(false)}>Home</Link>
          <a href="#playground" className="text-lg font-semibold text-foreground" onClick={() => setMobileMenu(false)}>API Console</a>
          <a href="#features" className="text-lg font-semibold text-foreground" onClick={() => setMobileMenu(false)}>Capabilities</a>
          <a href="#pricing" className="text-lg font-semibold text-foreground" onClick={() => setMobileMenu(false)}>Pricing</a>
          <a href="#docs" className="text-lg font-semibold text-foreground" onClick={() => setMobileMenu(false)}>Docs</a>
          <div className="border-t border-border pt-6 flex flex-col gap-4">
            {isDevLoggedIn ? (
              <Link to="/developer/portal" className="w-full text-center px-5 py-3 rounded-full text-[var(--google-blue)] border border-border font-semibold" onClick={() => setMobileMenu(false)}>
                Dashboard
              </Link>
            ) : (
              <Link to="/developer/login" className="w-full text-center px-5 py-3 rounded-full text-[var(--google-blue)] border border-border font-semibold" onClick={() => setMobileMenu(false)}>
                Sign In
              </Link>
            )}
            <Link to="/developer/register" className="w-full text-center px-5 py-3 rounded-full bg-[var(--google-blue)] text-white font-semibold" onClick={() => setMobileMenu(false)}>
              Get API Key
            </Link>
          </div>
        </div>
      )}

      {/* ════════════════ HERO SECTION ════════════════ */}
      <header className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
          <span className="px-4 py-1.5 rounded-full border border-border bg-card text-foreground text-xs font-semibold flex flex-row items-center gap-2 shadow-sm">
            <Sparkles size={14} className="text-[var(--google-blue)]" /> Google Material 3 Developer Platform
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-display font-extrabold text-foreground leading-[1.1] tracking-tight">
            Resume Intelligence API <br />
            <span className="google-gradient-text">for Next-Gen Hiring</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Parse resume PDFs, match candidate skill vectors semantically, and detect AI plagiarism with a single, sub-10ms REST call.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-1">
            <Link
              to={isDevLoggedIn ? "/developer/portal" : "/developer/register"}
              className="flex justify-center items-center px-6 py-3.5 rounded-full bg-[var(--google-blue)] text-white font-bold hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-md shadow-blue-500/20 gap-2 cursor-pointer"
            >
              {isDevLoggedIn ? "Go to Dashboard" : "Get Free API Key"} <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#playground"
              className="flex justify-center items-center px-6 py-3.5 rounded-full border border-border bg-card text-foreground font-bold hover:bg-muted transition-all"
            >
              Try Live API Console
            </a>
          </div>

          <div className="flex flex-col gap-2 pt-2 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[var(--google-green)]" /> 100 Free parses every month
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[var(--google-green)]" /> Native Razorpay monthly & yearly billing
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[var(--google-green)]" /> 99.99% Guaranteed Uptime SLA
            </div>
          </div>
        </div>

        {/* Hero Code Playground */}
        <div className="lg:col-span-7" id="playground">
          <InteractiveApiPlayground />
        </div>
      </header>

      {/* ════════════════ STATS BAND ════════════════ */}
      <section className="w-full bg-card border-y border-border py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-border">
          <div className="flex flex-col px-4">
            <span className="text-3xl font-display font-extrabold text-[var(--google-blue)]">500+</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Parses / Sec</span>
          </div>
          <div className="flex flex-col px-4">
            <span className="text-3xl font-display font-extrabold text-[var(--google-red)]">&lt;10ms</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Average Latency</span>
          </div>
          <div className="flex flex-col px-4">
            <span className="text-3xl font-display font-extrabold text-[var(--google-yellow)]">99.99%</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Uptime SLA</span>
          </div>
          <div className="flex flex-col px-4">
            <span className="text-3xl font-display font-extrabold text-[var(--google-green)]">5,000+</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Normalized Skills</span>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES & CAPABILITIES GRID ════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="features">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-blue)] mb-1.5">
            Engineered For Scale
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
            Everything you need for intelligent talent parsing
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2">
            Build talent sourcing tools, automated ATS rankers, or custom recruiter bots using our REST primitives.
          </p>
        </div>

        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6 }}
            className="p-7 rounded-2xl bg-card border border-border hover:border-[var(--google-blue)] hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[var(--google-blue)] flex items-center justify-center mb-5 font-bold">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">Semantic Skill Matching</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Maps skill synonyms ("ReactJS" = "React.js" = "React") and detects implied competencies automatically.
            </p>
          </motion.div>

          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6 }}
            className="p-7 rounded-2xl bg-card border border-border hover:border-[var(--google-red)] hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-[var(--google-red)] flex items-center justify-center mb-5 font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">Multi-Format Parser</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Native OCR & layout extraction for PDF, DOCX, RTF, ZIP archives, and direct Google Drive file URLs.
            </p>
          </motion.div>

          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6 }}
            className="p-7 rounded-2xl bg-card border border-border hover:border-[var(--google-yellow)] hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[var(--google-yellow)] flex items-center justify-center mb-5 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">AI Plagiarism Detector</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Identify AI-generated text, hidden white-text keyword stuffing, and fake work histories instantly.
            </p>
          </motion.div>

          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6 }}
            className="p-7 rounded-2xl bg-card border border-border hover:border-[var(--google-green)] hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/40 text-[var(--google-green)] flex items-center justify-center mb-5 font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">Natural Language Queries</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Query candidate datasets in natural language: "Find senior frontend devs with 5+ years React in SF".
            </p>
          </motion.div>

          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6 }}
            className="p-7 rounded-2xl bg-card border border-border hover:border-[var(--google-blue)] hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[var(--google-blue)] flex items-center justify-center mb-5 font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">Async Webhooks</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Submit batch jobs of 500+ resumes asynchronously and receive webhook push payloads on completion.
            </p>
          </motion.div>

          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6 }}
            className="p-7 rounded-2xl bg-card border border-border hover:border-[var(--google-red)] hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-[var(--google-red)] flex items-center justify-center mb-5 font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">Enterprise Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scoped API keys, automated key rotation, domain whitelisting, and strict CORS compliance out of the box.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════ MULTI-LANGUAGE SDK SECTION ════════════════ */}
      <section className="py-20 bg-card border-y border-border" id="docs">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-blue)] mb-1.5">
            Developer Integration
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground">Integrate with 3 lines of code</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-8">Works out of the box in Python, Node.js, and cURL.</p>

          <div className="bg-[#121316] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl text-left">
            <div className="flex border-b border-zinc-800 bg-[#1A1B1E] px-4 pt-2">
              {Object.keys(codeSnippets).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeTab(lang)}
                  className={`px-5 py-3 text-xs font-mono font-bold transition-all cursor-pointer rounded-t-lg ${
                    activeCodeTab === lang
                      ? "text-white bg-[#121316] border-t-2 border-[var(--google-blue)]"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <div className="p-5 font-mono text-xs text-sky-300 leading-relaxed overflow-x-auto">
              <pre>{codeSnippets[activeCodeTab]}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ DEVELOPER PRICING SECTION ════════════════ */}
      <DeveloperPricingSection plans={plans} isDevLoggedIn={isDevLoggedIn} currentTier={tier} navigate={navigate} />

      {/* ════════════════ FAQ ACCORDION ════════════════ */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-yellow)] mb-1.5">
            FAQ
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-5 transition-all text-left cursor-pointer"
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <div className="flex items-center justify-between gap-4 font-display font-bold text-foreground text-base">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 text-sm text-muted-foreground leading-relaxed"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Developer Testimonials */}
      <Testimonials userTypeFilter="developer" title="What Developers Say" label="Developer Reviews" />

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-card border-t border-border text-muted-foreground py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-display font-bold text-xs bg-[var(--google-blue)] p-1 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="32" y1="68" x2="68" y2="32" stroke="white" strokeWidth="14" strokeLinecap="round" />
                  <circle cx="32" cy="68" r="16" fill="white" />
                  <circle cx="68" cy="32" r="24" fill="white" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">Workly</span>
            </div>
            <p className="text-xs mt-1">Built for high performance resume parsing & intelligence.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <Link to="/privacy" className="hover:text-[var(--google-blue)] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[var(--google-blue)] transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-[var(--google-blue)] transition-colors">Contact Support</Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <SocialTooltip items={socialLinks} className="justify-center md:justify-end" />
            <div className="text-xs">© {new Date().getFullYear()} Workly Developer Hub.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
