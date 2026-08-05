import React from 'react';
import { Header, Footer } from '../../components/user/site-chrome';
import { motion } from 'framer-motion';
import { Target, Users, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 pt-36 pb-16 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8 text-xs font-bold uppercase tracking-wider text-primary"
        >
          <Sparkles size={14} /> About Workly
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 font-display text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-6 text-foreground"
        >
          A calmer, human-centric <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">job search.</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          We are redesigning how recruitment works. No spam, no ghosting, no cold interfaces — just transparent matched opportunities powered by intelligent AI.
        </motion.p>
      </section>

      {/* Main content grid */}
      <section className="mx-auto max-w-6xl px-6 py-12 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Our Mission",
              desc: "To eliminate the friction of job hunting by offering candidates instant match scores, transparency of hiring steps, and direct, spam-free applications."
            },
            {
              icon: Users,
              title: "Built For Teams",
              desc: "Helping recruiters screen and identify top talents through specialized AI matching, automated assessments, and robust fraud prevention filters."
            },
            {
              icon: ShieldAlert,
              title: "Transparency First",
              desc: "No hidden filters or secret algorithm downgrades. Every applicant receives clear feedback, ATS report scores, and key improvement insights."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group rounded-[32px] border border-border bg-card p-8 space-y-5 hover:shadow-google-2 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <item.icon size={28} strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Story Section */}
        <div className="mt-16 bg-card border border-border rounded-[40px] p-10 sm:p-16 shadow-google-1 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">Why Workly?</h2>
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                The modern recruitment space is broken. Candidates send hundreds of applications into the void, while recruiters get overwhelmed by spam and fraudulent resumes. 
              </p>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                Workly acts as the peaceful interface — the bridge where candidates receive accurate AI ATS evaluations and safety check ratings on listings, and recruiters get genuine, highly-relevant candidate profiles.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/jobs/search" className="inline-flex items-center gap-3 py-4 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-base transition-all shadow-md hover:shadow-lg">
                Browse Active Jobs <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
