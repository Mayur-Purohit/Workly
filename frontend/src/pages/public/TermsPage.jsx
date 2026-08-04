import React, { useState } from 'react';
import { Header, Footer } from '../../components/user/site-chrome';
import { motion } from 'framer-motion';
import { FileText, Shield, Scale, HelpCircle } from 'lucide-react';

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'privacy'

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Header />

      <section className="mx-auto max-w-5xl px-6 pt-36 pb-16 relative">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8 text-xs font-bold uppercase tracking-wider text-primary"
          >
            <Scale size={14} /> Legal Information
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl font-black tracking-tight leading-tight mb-6 text-foreground"
          >
            Terms & Privacy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed"
          >
            Please read our Terms of Service and Privacy Policy carefully to understand your rights, responsibilities, and how we handle your personal data.
          </motion.p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10 relative z-10">
          <div className="bg-card border border-border p-2 rounded-[24px] flex gap-2 shadow-sm">
            <button
              onClick={() => setActiveTab('terms')}
              className={`py-3 px-8 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <FileText size={16} /> Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-3 px-8 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Shield size={16} /> Privacy Policy
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-card border border-border rounded-[40px] p-8 sm:p-14 shadow-google-1 relative z-10 overflow-hidden">
          {activeTab === 'terms' ? (
            <div className="space-y-10">
              <div className="border-b border-border pb-6">
                <h2 className="font-display text-3xl font-black mb-2 text-foreground">Terms of Service</h2>
                <p className="text-sm text-muted-foreground">Last updated: June 27, 2026</p>
              </div>

              <div className="space-y-8 text-base text-muted-foreground leading-relaxed">
                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">1. Acceptance of Terms</h3>
                  <p>
                    By accessing or using the Workly platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">2. Description of Service</h3>
                  <p>
                    Workly is an AI-powered recruitment platform designed to assist job seekers in optimizing their resumes and applying for jobs, and recruiters/companies in managing applicant pools and evaluating talent.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">3. User Accounts</h3>
                  <p>
                    To access certain features, you must create an account. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your credentials.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">4. Subscriptions and Payments</h3>
                  <p>
                    We offer paid subscriptions (e.g. Premium plans) for both job seekers and recruiters. Payments are processed securely via Razorpay. Subscriptions are billed in advance on a recurring monthly basis. You can cancel your subscription at any time, which will prevent further renewals.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">5. Intellectual Property</h3>
                  <p>
                    All content, design, code, logos, and features of Workly are the intellectual property of Workly Technologies Private Limited. You may not reproduce, copy, distribute, or modify any portion of our platform without prior written authorization.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">6. Governing Law</h3>
                  <p>
                    These terms are governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Gandhinagar, Gujarat, India.
                  </p>
                </section>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="border-b border-border pb-6">
                <h2 className="font-display text-3xl font-black mb-2 text-foreground">Privacy Policy</h2>
                <p className="text-sm text-muted-foreground">Last updated: June 27, 2026</p>
              </div>

              <div className="space-y-8 text-base text-muted-foreground leading-relaxed">
                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">1. Information We Collect</h3>
                  <p>
                    We collect personal information necessary to deliver our services, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Account details (name, email address, password, contact number).</li>
                    <li>Profile data (resumes, work history, skills, portfolio links, profile pictures).</li>
                    <li>Payment information (processed securely through Razorpay; we do not store full card numbers).</li>
                    <li>Recruitment metrics (API usage logs, session histories, scan metadata).</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">2. How We Use Information</h3>
                  <p>
                    Your data is used to match job seekers with vacancies, score resumes using AI models, secure accounts against fraud, and process subscription payments. We do not sell your personal data to third parties.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">3. Data Sharing</h3>
                  <p>
                    When a job seeker applies for a position, their resume, contact info, and match scores are shared with the respective recruiter. We may also share data with third-party service providers (like payment processors and hosting services) under strict confidentiality agreements.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">4. Security Measures</h3>
                  <p>
                    We implement industry-standard security protocols, including SSL encryption and secure API key tokenization, to protect your data from unauthorized access, modification, or disclosure.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-foreground text-xl">5. Your Data Rights</h3>
                  <p>
                    You have the right to access, edit, download, or delete your personal account data at any time through your profile settings page. For data deletion requests, you may also email support@workly.com.
                  </p>
                </section>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
