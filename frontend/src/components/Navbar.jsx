import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, Code2 } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onSignIn, isLoggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const appsDropdownRef = useRef(null);

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
    <>
      <header className="az-nav">
        <div className="az-nav-inner">
          {/* Logo — left */}
          <Link to="/" className="az-logo no-underline">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs bg-[var(--google-blue,#4285f4)] p-0.5 shadow-sm mr-2 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad-az" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <line x1="32" y1="68" x2="68" y2="32" stroke="url(#logo-grad-az)" strokeWidth="14" strokeLinecap="round" />
                <circle cx="32" cy="68" r="16" fill="#38bdf8" />
                <circle cx="68" cy="32" r="24" fill="#2563eb" />
              </svg>
            </div>
            Workly<span className="az-logo-r">®</span>
          </Link>

          {/* Center nav links — compact */}
          <nav className="wk-nav-center">
            {/* Product dropdown */}
            <div className="product-dropdown-container">
              <button
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                className="wk-nav-link"
              >
                Product
                <svg className={`wk-chevron ${productDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className={`product-dropdown-menu ${productDropdownOpen ? 'open' : ''}`}>
                <a href="/#how-it-works" onClick={(e) => { setProductDropdownOpen(false); handleScrollTo(e, 'how-it-works'); }} className="product-dropdown-item">
                  <span className="product-dropdown-item-title">AI Recruiter & Screening</span>
                  <span className="product-dropdown-item-desc">Automated resume ranking & matching</span>
                </a>
                <a href="/#features" onClick={(e) => { setProductDropdownOpen(false); handleScrollTo(e, 'features'); }} className="product-dropdown-item">
                  <span className="product-dropdown-item-title">Smart Platform Features</span>
                  <span className="product-dropdown-item-desc">Deep-dive candidate profiles & analytics</span>
                </a>
                <a href="/#ingest" onClick={(e) => { setProductDropdownOpen(false); handleScrollTo(e, 'ingest'); }} className="product-dropdown-item">
                  <span className="product-dropdown-item-title">Multi-Source Intake</span>
                  <span className="product-dropdown-item-desc">Gmail, Drive, Forms & ATS ingestion</span>
                </a>
              </div>
            </div>

            <a href="/#features" className="wk-nav-link" onClick={(e) => handleScrollTo(e, 'features')}>Features</a>
            <a href="/#pricing" className="wk-nav-link" onClick={(e) => handleScrollTo(e, 'pricing')}>Pricing</a>
            <Link to="/developer" className="wk-nav-link">Developers</Link>
          </nav>

          {/* Right side — 3-dot switcher + Menu button */}
          <div className="wk-nav-right">
            {/* 3-Dots App Switcher */}
            <div className="relative" ref={appsDropdownRef}>
              <button
                onClick={() => setAppsOpen(!appsOpen)}
                title="Switch Platform"
                aria-label="Switch Platform"
                className="wk-dots-btn"
              >
                <img width="18" height="18" src="https://img.icons8.com/fluency-systems-regular/48/menu-2--v1.png" alt="apps" className="opacity-70" />
              </button>
              {appsOpen && (
                <div className="wk-apps-dropdown">
                  <div className="wk-apps-label">Switch Platform</div>
                  <Link to="/" onClick={() => setAppsOpen(false)} className="wk-apps-item">
                    <div className="wk-apps-icon bg-blue-100 text-blue-600"><Building2 size={14} /></div>
                    <div className="min-w-0">
                      <div className="wk-apps-name">Workly Recruiter <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /></div>
                      <div className="wk-apps-desc">Company & Hiring Platform</div>
                    </div>
                  </Link>
                  <Link to="/jobs" onClick={() => setAppsOpen(false)} className="wk-apps-item">
                    <div className="wk-apps-icon bg-emerald-100 text-emerald-600"><Briefcase size={14} /></div>
                    <div className="min-w-0">
                      <div className="wk-apps-name">Workly Jobs</div>
                      <div className="wk-apps-desc">Job Seeker Portal</div>
                    </div>
                  </Link>
                  <Link to="/developer" onClick={() => setAppsOpen(false)} className="wk-apps-item">
                    <div className="wk-apps-icon bg-purple-100 text-purple-600"><Code2 size={14} /></div>
                    <div className="min-w-0">
                      <div className="wk-apps-name">Workly Developer</div>
                      <div className="wk-apps-desc">APIs & Integrations</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Sign In / Dashboard button — Alwayzz pill style */}
            <button
              className="az-menu-btn"
              onClick={onSignIn}
            >
              {isLoggedIn ? 'Dashboard' : 'Sign In'}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
