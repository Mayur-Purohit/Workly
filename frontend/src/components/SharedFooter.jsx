import { Link } from 'react-router-dom';
import { Briefcase, Globe, Building2, Code2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Inline SVG icons for social media
const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function SharedFooter() {
  const currentYear = new Date().getFullYear();

  // Check for active tokens to enable smart routing
  const [tokens, setTokens] = useState({
    seeker: false,
    recruiter: false,
    developer: false
  });

  useEffect(() => {
    const checkTokens = () => {
      setTokens({
        seeker: !!localStorage.getItem('vish_seeker_token'),
        recruiter: !!localStorage.getItem('vish_jwt'),
        developer: !!localStorage.getItem('portal_jwt')
      });
    };
    
    checkTokens();
    window.addEventListener('storage', checkTokens);
    window.addEventListener('seeker_profile_updated', checkTokens);
    
    return () => {
      window.removeEventListener('storage', checkTokens);
      window.removeEventListener('seeker_profile_updated', checkTokens);
    };
  }, []);

  const bentoCards = [
    {
      title: 'Workly Talent',
      subtitle: 'Find Your Dream Job',
      description: 'Browse thousands of opportunities, build stunning resumes, and get matched with roles you\'ll love.',
      icon: Briefcase,
      accentColor: '#1a73e8',
      accentBg: 'rgba(26, 115, 232, 0.08)',
      glowBg: 'rgba(26, 115, 232, 0.04)',
      link: tokens.seeker ? '/jobs/dashboard' : '/jobs',
      features: ['AI Matching', 'Resume Builder', 'Market Insights'],
    },
    {
      title: 'Workly Business',
      subtitle: 'Hire Top Talent',
      description: 'Smart recruiting tools, fraud detection, and analytics to build your dream team efficiently.',
      icon: Building2,
      accentColor: '#1e8e3e',
      accentBg: 'rgba(30, 142, 62, 0.08)',
      glowBg: 'rgba(30, 142, 62, 0.04)',
      link: tokens.recruiter ? '/dashboard' : '/login',
      features: ['Smart Analyzer', 'ATS Screening', 'Fraud Protection'],
    },
    {
      title: 'Workly Developers',
      subtitle: 'Build with Our API',
      description: 'Enterprise-grade APIs, webhooks, and embeddable widgets for seamless talent integration.',
      icon: Code2,
      accentColor: '#7c3aed',
      accentBg: 'rgba(124, 58, 237, 0.08)',
      glowBg: 'rgba(124, 58, 237, 0.04)',
      link: tokens.developer ? '/developer/portal/dashboard' : '/developer',
      features: ['RESTful API', 'Webhooks', 'SDKs & Docs'],
    },
  ];

  // 100% real working routes synced with App.jsx routes
  const quickLinks = [
    {
      title: 'Job Seekers',
      links: [
        { to: '/jobs/search', label: 'Find Jobs' },
        { to: '/jobs/companies', label: 'Top Companies' },
        { to: '/resume-builder', label: 'Resume Builder' },
        { to: '/jobs/trends', label: 'Market Trends' },
        { to: '/jobs/mock-interview', label: 'AI Mock Interview' },
      ],
    },
    {
      title: 'Employers',
      links: [
        { to: tokens.recruiter ? '/dashboard' : '/login', label: 'Recruiter Platform' },
        { to: tokens.recruiter ? '/dashboard/sessions/new' : '/login', label: 'Post a Job' },
        { to: tokens.recruiter ? '/dashboard/smart-analyzer' : '/login', label: 'Smart Candidate Analyzer' },
        { to: tokens.recruiter ? '/dashboard/ai-recruiter' : '/login', label: 'AI Recruiter Assistant' },
        { to: tokens.recruiter ? '/dashboard/sessions' : '/login', label: 'Assessment Sessions' },
      ],
    },
    {
      title: 'Developers',
      links: [
        { to: '/developer', label: 'Developer Hub' },
        { to: '/developer/portal/docs', label: 'API Documentation' },
        { to: tokens.developer ? '/developer/portal/keys' : '/developer/login', label: 'API Keys' },
        { to: tokens.developer ? '/developer/portal/webhooks' : '/developer/login', label: 'Webhooks' },
        { to: tokens.developer ? '/developer/portal/billing' : '/developer/login', label: 'API Pricing' },
      ],
    },
    {
      title: 'Company & Legal',
      links: [
        { to: '/about', label: 'About Workly' },
        { to: '/contact', label: 'Contact Support' },
        { to: '/terms', label: 'Terms of Service' },
        { to: '/refund-policy', label: 'Refund Policy' },
      ],
    },
  ];

  const socialLinks = [
    { href: 'https://linkedin.com', icon: LinkedinIcon, label: 'LinkedIn' },
    { href: 'https://twitter.com', icon: TwitterIcon, label: 'Twitter' },
    { href: 'https://github.com', icon: GithubIcon, label: 'GitHub' },
  ];

  const handleLanguageClick = () => {
    toast.success('Language set to English (US)');
  };

  return (
    <footer className="bg-background border-t border-border mt-auto relative overflow-hidden">
      {/* 3-Color Gradient Glow Top Border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #1a73e8 0%, #1e8e3e 50%, #7c3aed 100%)' }}
      />

      {/* Background Decorative Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: 'rgba(26, 115, 232, 0.03)' }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: 'rgba(30, 142, 62, 0.03)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">

        {/* ══════════ BENTO BOX CARDS ══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-14">
          {bentoCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link
                  to={card.link}
                  className="group relative block bg-card border border-border rounded-2xl p-6 shadow-google-1 hover:shadow-google-2 transition-all duration-300 overflow-hidden h-full"
                >
                  {/* Gradient Background Wash */}
                  <div
                    className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${card.glowBg} 0%, transparent 70%)` }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: card.accentBg }}
                    >
                      <Icon className="h-6 w-6" style={{ color: card.accentColor }} />
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-base font-display font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {card.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {card.description}
                    </p>

                    {/* Features as Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {card.features.map((feature) => (
                        <span
                          key={feature}
                          className="pill text-[10px] font-bold px-2.5 py-1 bg-muted text-muted-foreground border border-border"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Arrow Link */}
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Corner Glow on Hover */}
                  <div
                    className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-500"
                    style={{ background: card.accentBg }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ══════════ QUICK LINKS GRID ══════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {quickLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ══════════ GRADIENT DIVIDER ══════════ */}
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%)' }} />

        {/* ══════════ BOTTOM BAR ══════════ */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

          {/* Left — Brand + Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-semibold tracking-tight text-foreground">workly</span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <p className="text-sm text-muted-foreground font-medium">
              © {currentYear} Workly Inc. All rights reserved.
            </p>
          </div>

          {/* Center — System Status Pill */}
          <div className="order-first lg:order-none">
            <Link 
              to="/developer/portal/docs"
              className="pill inline-flex items-center gap-2 px-4 py-2 border border-border bg-card text-sm hover:border-primary/40 transition-all group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">All Systems Operational</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-0.5" />
            </Link>
          </div>

          {/* Right — Social + Language */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const SocialIcon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill inline-flex items-center justify-center w-10 h-10 border border-border bg-background text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  aria-label={social.label}
                  title={social.label}
                >
                  <SocialIcon className="h-4 w-4" />
                </a>
              );
            })}
            <div className="h-6 w-px bg-border mx-1" />
            <button 
              onClick={handleLanguageClick}
              className="pill inline-flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-muted transition-all cursor-pointer"
              title="Select Language"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">EN</span>
            </button>
          </div>
        </div>

        {/* Final Tagline */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Built with 💙 for talent, recruiters, and developers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
