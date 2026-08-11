import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Briefcase, Search, Building2, User, LayoutDashboard, LogOut, Shield, TrendingUp, FileText, HelpCircle, Sparkles, Home, BarChart3, ChevronRight, ChevronDown, Info, Heart, Grid3x3, Code2 } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { OnboardingTour, useTour } from "../OnboardingTour";
import { SocialTooltip } from "../ui/social-media";
import ThemeToggle from "../ThemeToggle";
import SharedFooter from "../SharedFooter";
import { seekerAPI, API_HOST } from "../../lib/api";
import { useSeekerAuthStore } from "../../stores/seekerAuthStore";

const SEEKER_TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Workly',
    content: 'A calmer, AI-powered job search experience. Take a quick tour to get started and make the most of every feature.',
    icon: Sparkles,
    target: null,
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    content: 'View your applications, active ATS scores, and top improvements in one clean layout.',
    icon: LayoutDashboard,
    target: '[data-tour="seeker-nav-dashboard"]',
    placement: 'bottom',
  },
  {
    id: 'jobs',
    title: 'Search Jobs',
    content: 'Browse hand-picked positions, check match scores, and apply directly to matching roles.',
    icon: Search,
    target: '[data-tour="seeker-nav-jobs"]',
    placement: 'bottom',
  },
  {
    id: 'career-tools',
    title: 'Career Tools',
    content: 'Access powerful career utilities like the AI Resume Builder, Market Trends, and Companies list from this menu.',
    icon: Sparkles,
    target: '[data-tour="seeker-nav-career-tools"]',
    placement: 'bottom',
  },
  {
    id: 'billing',
    title: 'Pricing & Plans',
    content: 'Upgrade to Premium for Rs 199/month — unlock unlimited applications and full AI diagnostics.',
    icon: Sparkles,
    target: '[data-tour="seeker-nav-premium-plans"]',
    placement: 'bottom',
  },
  {
    id: 'help',
    title: 'Help, anytime',
    content: 'Click the help button in the navbar to replay this tour whenever you need a refresher.',
    icon: HelpCircle,
    target: '[data-tour="seeker-help-btn"]',
    placement: 'bottom',
  },
];

const links = [
  { to: "/jobs", label: "Home", icon: Home },
  { to: "/jobs/search", label: "Find Jobs", icon: Search },
  { to: "/jobs/companies", label: "Companies", icon: Building2 },
  { to: "/jobs/following", label: "Following", icon: Heart },
  { to: "/resume-builder", label: "Resume Builder", icon: FileText },
  { to: "/jobs/trends", label: "Market Trends", icon: TrendingUp },
  { to: "/jobs/applications", label: "Applications", icon: Briefcase },
  { to: "/jobs/mock-interview", label: "Mock Interview", icon: Sparkles },
  { to: "/jobs/billing", label: "Premium Plans", icon: Sparkles },
];

export function Header() {
  const getSeekerInitial = (name) => {
    if (!name) return "D";
    const parts = name.trim().split(" ").filter(Boolean);
    const dakshPart = parts.find(p => p.toUpperCase() === "DAKSH");
    if (dakshPart) return "D";

    if (parts.length > 0) {
      const firstUpper = parts[0].toUpperCase();
      const lastNames = ["BHAVSAR", "PATEL", "SHAH", "MEHTA", "JOSHI", "TRIVEDI"];
      if (lastNames.includes(firstUpper) && parts.length >= 2) {
        return parts[1][0].toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return "D";
  };

  const { pathname } = useLocation();
  const [seekerData, setSeekerData] = useState(() => {
    const token = localStorage.getItem('vish_seeker_token');
    const data = localStorage.getItem('vish_seeker_data');
    if (token && data) {
      try { return JSON.parse(data); } catch { }
    }
    return null;
  });
  const { isOpen: tourOpen, startTour, closeTour } = useTour('seeker_portal');

  useEffect(() => {
    const handleProfileUpdate = () => {
      const data = localStorage.getItem('vish_seeker_data');
      if (data) {
        try { setSeekerData(JSON.parse(data)); } catch { }
      } else {
        setSeekerData(null);
      }
    };
    window.addEventListener('seeker_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('seeker_profile_updated', handleProfileUpdate);
  }, []);

  const isLoggedIn = !!seekerData;

  useEffect(() => {
    if (isLoggedIn) {
      seekerAPI.getMe()
        .then((profile) => {
          setSeekerData(profile);
          useSeekerAuthStore.getState().updateSeeker(profile);
        })
        .catch((err) => console.error("Error syncing profile to navbar:", err));
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('vish_seeker_token');
    localStorage.removeItem('vish_seeker_data');
    window.location.href = '/jobs';
  };

  const [toolsOpen, setToolsOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const toolsDropdownRef = useRef(null);
  const appsDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setToolsOpen(false);
      }
      if (appsDropdownRef.current && !appsDropdownRef.current.contains(event.target)) {
        setAppsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredLinks = links.filter((l) => {
    if (l.to === "/jobs/applications" || l.to === "/jobs/profile" || l.to === "/jobs/billing") {
      return isLoggedIn;
    }
    return true;
  });

  const filteredPrimary = filteredLinks.filter(l => l.to === "/jobs" || l.to === "/jobs/search" || l.to === "/jobs/applications");
  const filteredTools = filteredLinks.filter(l => l.to === "/resume-builder" || l.to === "/jobs/trends" || l.to === "/jobs/companies" || l.to === "/jobs/following" || l.to === "/jobs/mock-interview");

  return (
    <div className="sticky top-0 z-40 w-full transition-all duration-300 p-0 pointer-events-none">
      <header className={`mx-auto transition-all duration-300 pointer-events-auto backdrop-blur-xl ${isScrolled
        ? "max-w-7xl mt-3 rounded-full border border-border bg-background/80 shadow-lg"
        : "w-full border-b border-border/60 bg-background/80"
        }`}>
        <div className={`mx-auto flex max-w-7xl items-center gap-4 py-3 transition-all duration-300 ${isScrolled ? "px-8" : "px-4 sm:px-6"
          }`}>
          <Link to="/jobs" className="flex items-center gap-2 pr-1 sm:pr-3 shrink-0 no-underline text-inherit">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm bg-[#2A2A2A] p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad-site-chrome" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <line x1="32" y1="68" x2="68" y2="32" stroke="url(#logo-grad-site-chrome)" strokeWidth="14" strokeLinecap="round" />
                <circle cx="32" cy="68" r="16" fill="#38bdf8" />
                <circle cx="68" cy="32" r="24" fill="#2563eb" />
              </svg>
            </div>
            <span className="font-display text-[22px] text-foreground tracking-tight font-semibold">
              Workly
            </span>
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-1.5 md:flex">
            {filteredPrimary.map((l) => {
              const active = pathname === l.to;
              const tourId = `seeker-nav-${l.label.toLowerCase().replace(/\s+/g, '-')}`;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  data-tour={tourId}
                  className={`pill px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${active
                    ? "bg-muted text-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {l.label}
                </Link>
              );
            })}

            {/* Tools Dropdown */}
            {filteredTools.length > 0 && (
              <div className="relative" ref={toolsDropdownRef}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  data-tour="seeker-nav-career-tools"
                  className={`pill px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1 ${filteredTools.some(l => pathname === l.to)
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <span>Career Tools</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
                </button>

                {toolsOpen && (
                  <div className="absolute left-0 mt-2 w-52 rounded-xl p-1.5 z-20 flex flex-col gap-0.5 skeuo-dropdown-panel">
                    {filteredTools.map((l) => {
                      const Icon = l.icon;
                      const active = pathname === l.to;
                      const tourId = `seeker-nav-${l.label.toLowerCase().replace(/\s+/g, '-')}`;
                      return (
                        <Link
                          key={l.to}
                          to={l.to}
                          data-tour={tourId}
                          onClick={() => setToolsOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm skeuo-dropdown-item ${active
                            ? "bg-[#faf9f6] dark:bg-[#212126] text-foreground font-semibold"
                            : "text-muted-foreground"
                            }`}
                        >
                          <Icon size={14} className="text-muted-foreground shrink-0 transition-colors" />
                          <span className="transition-colors">{l.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Premium plans featured pill */}
            {isLoggedIn && (
              <Link
                to="/jobs/billing"
                data-tour="seeker-nav-premium-plans"
                className={`pill px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${pathname === "/jobs/billing"
                  ? "bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20"
                  : "text-amber-500 hover:bg-amber-500/5"
                  }`}
              >
                <Sparkles size={14} />
                <span>Premium Plans</span>
              </Link>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* 9-Dots App Switcher */}
            <div className="relative" ref={appsDropdownRef}>
              <button
                onClick={() => setAppsOpen(!appsOpen)}
                title="Switch Platform"
                aria-label="Switch Platform"
                className="pill p-2 text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition shrink-0"
              >
                <img width="18" height="18" src="https://img.icons8.com/fluency-systems-regular/48/menu-2--v1.png" alt="menu-2--v1" className="dark:invert opacity-80" />
              </button>
              {appsOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl p-2 z-50 flex flex-col gap-1 skeuo-dropdown-panel bg-background/95 border border-border shadow-2xl backdrop-blur-md">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Switch Platform</div>
                  <Link
                    to="/"
                    onClick={() => setAppsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground">Workly Recruiter</div>
                      <div className="text-[10px] text-muted-foreground truncate">Company & Hiring Platform</div>
                    </div>
                  </Link>
                  <Link
                    to="/jobs"
                    onClick={() => setAppsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        Workly Jobs
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">Job Seeker Portal</div>
                    </div>
                  </Link>
                  <Link
                    to="/developer"
                    onClick={() => setAppsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <Code2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground">Workly Developer</div>
                      <div className="text-[10px] text-muted-foreground truncate">APIs & Integrations</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <ThemeToggle />
            {isLoggedIn && (
              <button
                data-tour="seeker-help-btn"
                aria-label="Help & Tour"
                onClick={startTour}
                className="pill p-2 text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition shrink-0"
                title="Help & Tour"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
            {isLoggedIn ? (
              <>
                <Link
                  to="/jobs/dashboard"
                  data-tour="seeker-nav-dashboard"
                  className="pill hidden border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted sm:inline-flex"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  {seekerData?.avatar_url ? (
                    <Link
                      to="/jobs/profile"
                      className="flex items-center justify-center h-10 w-10 rounded-full border border-accent/20 bg-muted overflow-hidden transition shrink-0 hover:opacity-90"
                      aria-label="Profile"
                    >
                      <img
                        src={seekerData.avatar_url.startsWith('http') ? seekerData.avatar_url : `${API_HOST}${seekerData.avatar_url}`}
                        alt={seekerData.full_name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  ) : (
                    <Link
                      to="/jobs/profile"
                      className="flex items-center justify-center h-10 w-10 rounded-full bg-[#1a73e8] text-white font-extrabold text-sm uppercase transition shrink-0 hover:bg-[#155cb0] shadow-sm"
                      aria-label="Profile"
                    >
                      {getSeekerInitial(seekerData?.full_name)}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="pill p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/jobs/login"
                  className="pill hidden border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  to="/jobs/register"
                  className="pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto hide-scrollbar border-t border-border/60 px-3 py-2 md:hidden">
          {filteredLinks.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            const tourId = `seeker-nav-${l.label.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <Link
                key={l.to}
                to={l.to}
                data-tour={tourId}
                className={`pill flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${active
                  ? "bg-muted text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {isLoggedIn && (
          <OnboardingTour
            tourKey="seeker_portal"
            steps={SEEKER_TOUR_STEPS}
            isOpen={tourOpen}
            onClose={closeTour}
          />
        )}
      </header>
    </div>
  );
}


export function Footer() {
  return <SharedFooter />;
}
