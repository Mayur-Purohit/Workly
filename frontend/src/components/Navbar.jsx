import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Grid3x3, Building2, Briefcase, Code2 } from 'lucide-react';
import './Navbar.css';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ onSignIn, isLoggedIn }) => {
  const [scrolled, setScrolled] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const appsDropdownRef = useRef(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.product-dropdown-container')) {
        setProductDropdownOpen(false);
      }
      if (appsDropdownRef.current && !appsDropdownRef.current.contains(e.target)) {
        setAppsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleScrollTo = (e, id) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, null, `/#${id}`);
      }
    }
  };

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }}
    >
      <Link to="/" className="nav-left no-underline text-inherit">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm bg-[var(--google-blue)] p-1 shadow-sm">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-grad-nav-new" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <line x1="32" y1="68" x2="68" y2="32" stroke="url(#logo-grad-nav-new)" strokeWidth="14" strokeLinecap="round" />
            <circle cx="32" cy="68" r="16" fill="#38bdf8" />
            <circle cx="68" cy="32" r="24" fill="#2563eb" />
          </svg>
        </div>
        <span className="font-display text-[22px] text-foreground tracking-tight font-semibold">
          Workly
        </span>
      </Link>

      <div className="nav-center">
        {['Product', 'Features', 'Pricing', 'Developers'].map((item) => {
          if (item === 'Developers') {
            return (
              <Link 
                key={item}
                to="/developer" 
                className="nav-link font-semibold transition-all hover:translate-y-[-2px]"
              >
                Developers
              </Link>
            );
          }
          if (item === 'Product') {
            return (
              <div key={item} className="product-dropdown-container">
                <button 
                  onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                  className="nav-link dropdown-trigger font-semibold transition-all hover:translate-y-[-2px] flex items-center gap-1"
                >
                  Product
                  <svg className={`chevron transition-transform duration-200 ${productDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                <div className={`product-dropdown-menu skeuo-dropdown-panel ${productDropdownOpen ? 'open' : ''}`}>
                  <a 
                    href="/#how-it-works" 
                    onClick={(e) => { setProductDropdownOpen(false); handleScrollTo(e, 'how-it-works'); }} 
                    className="product-dropdown-item skeuo-dropdown-item"
                  >
                    <span className="product-dropdown-item-title">AI Recruiter & Screening</span>
                    <span className="product-dropdown-item-desc">Automated resume ranking & matching</span>
                  </a>
                  <a 
                    href="/#features" 
                    onClick={(e) => { setProductDropdownOpen(false); handleScrollTo(e, 'features'); }} 
                    className="product-dropdown-item skeuo-dropdown-item"
                  >
                    <span className="product-dropdown-item-title">Smart Platform Features</span>
                    <span className="product-dropdown-item-desc">Deep-dive candidate profiles & analytics</span>
                  </a>
                  <a 
                    href="/#ingest" 
                    onClick={(e) => { setProductDropdownOpen(false); handleScrollTo(e, 'ingest'); }} 
                    className="product-dropdown-item skeuo-dropdown-item"
                  >
                    <span className="product-dropdown-item-title">Multi-Source Intake</span>
                    <span className="product-dropdown-item-desc">Gmail, Drive, Forms & ATS ingestion</span>
                  </a>
                </div>
              </div>
            );
          }
          return (
            <motion.a 
              key={item}
              href={`/#${item.toLowerCase()}`} 
              className="nav-link"
              onClick={(e) => handleScrollTo(e, item.toLowerCase())}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {item}
            </motion.a>
          );
        })}
      </div>

      <div className="nav-right" style={{ gap: '8px' }}>
        <ThemeToggle />

        {/* 9-Dots App Switcher */}
        <div className="relative" ref={appsDropdownRef}>
          <button
            onClick={() => setAppsOpen(!appsOpen)}
            title="Switch Platform"
            aria-label="Switch Platform"
            className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-foreground transition-all duration-200"
          >
            <Grid3x3 size={18} />
          </button>
          {appsOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl p-2 z-50 flex flex-col gap-1 skeuo-dropdown-panel bg-white/95 dark:bg-zinc-950/95 border border-gray-200 dark:border-zinc-800 shadow-2xl backdrop-blur-md">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Switch Platform</div>
              <Link
                to="/"
                onClick={() => setAppsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-charcoal dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 size={16} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-charcoal dark:text-white flex items-center gap-1.5">
                    Workly Recruiter
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-400 truncate">Company & Hiring Platform</div>
                </div>
              </Link>
              <Link
                to="/jobs"
                onClick={() => setAppsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-charcoal dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Briefcase size={16} />
                </div>
                <div className="min-w-0">
                   <div className="font-bold text-charcoal dark:text-white">Workly Jobs</div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-400 truncate">Job Seeker Portal</div>
                </div>
              </Link>
              <Link
                to="/developer"
                onClick={() => setAppsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-charcoal dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Code2 size={16} />
                </div>
                <div className="min-w-0">
                   <div className="font-bold text-charcoal dark:text-white">Workly Developer</div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-400 truncate">APIs & Integrations</div>
                </div>
              </Link>
            </div>
          )}
        </div>

        <motion.button 
          className="sign-in-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSignIn}
        >
          {isLoggedIn ? 'Dashboard' : 'Sign In'}
          <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
