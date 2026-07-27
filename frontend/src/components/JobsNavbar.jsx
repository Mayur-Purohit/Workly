import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Upload, Briefcase, TrendingUp, FolderGit, Home, Shield, Bell, Sparkles, LayoutDashboard, ChevronDown, Building2, Grid3x3, Code2 } from 'lucide-react';
import ResumeUploadModal from './ResumeUploadModal';

export default function JobsNavbar({ onUploadClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);
  const appsDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
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

  const isSeekerLoggedIn = !!localStorage.getItem('vish_seeker_token');

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedFile, setPreselectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreselectedFile(file);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setPreselectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Sync profile from local storage
  const syncProfile = () => {
    const seekerData = localStorage.getItem('vish_seeker_data');
    if (seekerData) {
      try {
        const parsed = JSON.parse(seekerData);
        setProfile({
          name: parsed.full_name,
          email: parsed.email,
          skills: parsed.skills || []
        });
        return;
      } catch (e) {}
    }

    const saved = localStorage.getItem('vish_seeker_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    syncProfile();
    // Listen for custom event triggered when profile is uploaded
    window.addEventListener('seeker_profile_updated', syncProfile);
    return () => window.removeEventListener('seeker_profile_updated', syncProfile);
  }, []);

  const handleClearProfile = () => {
    localStorage.removeItem('vish_seeker_profile');
    localStorage.removeItem('vish_applied_jobs');
    localStorage.removeItem('vish_seeker_token');
    localStorage.removeItem('vish_seeker_data');
    setProfile(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('seeker_profile_updated'));
    navigate('/jobs');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sticky top-0 z-40 w-full transition-all duration-300 p-0 pointer-events-none">
      <nav className={`mx-auto transition-all duration-300 flex items-center justify-between pointer-events-auto backdrop-blur-md ${
        isScrolled
          ? "max-w-7xl mt-3 rounded-full border border-[#e6dfcd] bg-white/80 px-8 py-3 shadow-lg dark:bg-[#131316]/80 dark:border-[#222226]"
          : "w-full bg-[#FFFFFF]/80 border-b border-[#e6dfcd] px-6 py-4 shadow-sm dark:bg-[#0b0b0c]/80 dark:border-[#222226]"
      }`}>
      {/* Brand logo */}
      <div className="flex items-center space-x-8">
        <Link to="/jobs" className="flex items-center gap-2 pr-1 sm:pr-3 shrink-0 no-underline text-inherit">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm bg-[#2A2A2A] p-1">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-grad-jobs-nav" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <line x1="32" y1="68" x2="68" y2="32" stroke="url(#logo-grad-jobs-nav)" strokeWidth="14" strokeLinecap="round" />
              <circle cx="32" cy="68" r="16" fill="#38bdf8" />
              <circle cx="68" cy="32" r="24" fill="#2563eb" />
            </svg>
          </div>
          <span className="font-display text-[22px] text-foreground tracking-tight font-semibold">
            Workly
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-2 xl:space-x-4 lg:space-x-3">
          <Link
            to="/jobs"
            className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              isActive('/jobs')
                ? 'text-[#111111] bg-gray-100 font-semibold'
                : 'text-[#5c5c5c] hover:text-[#2A2A2A]'
            }`}
          >
            <Home size={16} />
            <span>Home</span>
          </Link>

          {isSeekerLoggedIn && (
            <Link
              to="/jobs/dashboard"
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/jobs/dashboard')
                  ? 'text-[#111111] bg-gray-100 font-semibold'
                  : 'text-[#5c5c5c] hover:text-[#2A2A2A]'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
          )}
          
          <Link
            to="/jobs/search"
            className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              isActive('/jobs/search')
                ? 'text-[#111111] bg-gray-100 font-semibold'
                : 'text-[#5c5c5c] hover:text-[#2A2A2A]'
            }`}
          >
            <Briefcase size={16} />
            <span>Find Jobs</span>
          </Link>

          {isSeekerLoggedIn && (
            <Link
              to="/jobs/applications"
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/jobs/applications')
                  ? 'text-[#111111] bg-gray-100 font-semibold'
                  : 'text-[#5c5c5c] hover:text-[#2A2A2A]'
              }`}
            >
              <FolderGit size={16} />
              <span>My Applications</span>
            </Link>
          )}

          {isSeekerLoggedIn && (
            <Link
              to="/jobs/notifications"
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/jobs/notifications')
                  ? 'text-[#111111] bg-gray-100 font-semibold'
                  : 'text-[#5c5c5c] hover:text-[#2A2A2A]'
              }`}
            >
              <Bell size={16} />
              <span>Notifications</span>
            </Link>
          )}

          {/* Tools Dropdown */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/jobs/resume') || isActive('/jobs/companies') || isActive('/jobs/trends')
                  ? 'text-[#111111] bg-gray-100 font-semibold'
                  : 'text-[#5c5c5c] hover:text-[#2A2A2A]'
              }`}
            >
              <span>Career Tools</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
            </button>

            {toolsOpen && (
              <div className="absolute left-0 mt-2 w-52 rounded-xl p-1.5 z-20 flex flex-col gap-0.5 skeuo-dropdown-panel">
                {isSeekerLoggedIn && (
                  <Link
                    to="/jobs/resume"
                    onClick={() => setToolsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm skeuo-dropdown-item ${
                      isActive('/jobs/resume')
                        ? 'bg-[#faf9f6] dark:bg-[#212126] text-[#111111] font-semibold dark:text-[#f3f4f6]'
                        : 'text-[#5c5c5c]'
                    }`}
                  >
                    <Sparkles size={14} className="text-gray-400 shrink-0 transition-colors" />
                    <span className="transition-colors">AI Resume Enhancer</span>
                  </Link>
                )}
                <Link
                  to="/jobs/companies"
                  onClick={() => setToolsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm skeuo-dropdown-item ${
                    isActive('/jobs/companies')
                      ? 'bg-[#faf9f6] dark:bg-[#212126] text-[#111111] font-semibold dark:text-[#f3f4f6]'
                      : 'text-[#5c5c5c]'
                  }`}
                >
                  <Building2 size={14} className="text-gray-400 shrink-0 transition-colors" />
                  <span className="transition-colors">Companies</span>
                </Link>
                <Link
                  to="/jobs/trends"
                  onClick={() => setToolsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm skeuo-dropdown-item ${
                    isActive('/jobs/trends')
                      ? 'bg-[#faf9f6] dark:bg-[#212126] text-[#111111] font-semibold dark:text-[#f3f4f6]'
                      : 'text-[#5c5c5c]'
                  }`}
                >
                  <TrendingUp size={14} className="text-gray-400 shrink-0 transition-colors" />
                  <span className="transition-colors">Market Trends</span>
                </Link>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-3">
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
                  <div className="font-bold text-charcoal dark:text-white">Workly Recruiter</div>
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
                  <div className="font-bold text-charcoal dark:text-white flex items-center gap-1.5">
                    Workly Jobs
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
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

        {profile ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 border border-[#e6dfcd] hover:border-gray-400 rounded-full px-4 py-2 text-sm font-medium text-[#2A2A2A] transition-colors"
            >
              <div className="w-6 h-6 bg-[#111111] text-white rounded-full flex items-center justify-center text-xs font-bold capitalize">
                {profile.name ? profile.name[0] : 'U'}
              </div>
              <span className="max-w-[120px] truncate">
                {profile.name ? profile.name.split(' ')[0] : 'User'}
              </span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#e6dfcd] rounded-xl shadow-lg z-20 overflow-hidden"
                >
                  <div className="p-3 border-b border-[#e6dfcd] bg-[#f5f4ef]/50">
                    <div className="text-sm font-bold text-[#2A2A2A] truncate">{profile.name}</div>
                    <div className="text-xs text-[#5c5c5c] truncate">{profile.email || 'No email associated'}</div>
                    <div className="mt-1 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded inline-block font-semibold">
                      {profile.skills?.length || 0} Skills Extracted
                    </div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-[#2A2A2A] hover:bg-[#f5f4ef] rounded-lg text-left transition-colors"
                    >
                      <Upload size={14} />
                      <span>Update Resume</span>
                    </button>
                    <button
                      onClick={handleClearProfile}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-red-50 rounded-lg text-left transition-colors"
                    >
                      <LogOut size={14} />
                      <span>{isSeekerLoggedIn ? 'Log Out' : 'Clear AI Profile'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-[#111111] hover:bg-[#333333] text-white font-medium rounded-full px-5 py-2.5 text-sm transition-all shadow-sm active:scale-95"
          >
            <Upload size={14} />
            <span>Upload Resume</span>
          </button>
        )}

        {!isSeekerLoggedIn && (
          <button 
            onClick={() => navigate('/jobs/login')} 
            className="text-sm font-bold text-[#111111] border border-[#e6dfcd] hover:border-[#111111] hover:bg-[#fdfcfb] rounded-full px-5 py-2 transition-all bg-white shadow-sm active:scale-95"
          >
            Sign In
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
        />
        <ResumeUploadModal isOpen={modalOpen} onClose={handleModalClose} preselectedFile={preselectedFile} />

      </div>
    </nav>
  </div>
);
}
