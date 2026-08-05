import React, { useState } from 'react';
import { Header, Footer } from '../../components/user/site-chrome';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicAPI } from '../../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await publicAPI.sendContactMessage(form);
      toast.success(res?.message || "Message sent successfully! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Header />

      <section className="mx-auto max-w-6xl px-6 pt-36 pb-16 relative">
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8 text-xs font-bold uppercase tracking-wider text-primary"
          >
            <Clock size={14} /> Contact Workly
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl font-black tracking-tight leading-tight mb-6 text-foreground"
          >
            We are here to help.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed"
          >
            Have a question about our platforms, pricing, or need technical assistance? Drop us a message or reach out directly.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 relative z-10">
          {/* Info Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-[32px] p-8 space-y-8 shadow-google-1">
              <div>
                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2">Entity Details</h3>
                <p className="text-lg font-bold text-foreground">Workly Technologies Private Limited</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block mb-1">Registered Address</span>
                    <span className="text-muted-foreground text-sm leading-relaxed block">
                      4th Floor, Innovation Hub, Block A, DA-IICT Campus, Gandhinagar, Gujarat, India - 382007
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block mb-0.5">Support Email</span>
                    <a href="mailto:support@workly.com" className="text-muted-foreground text-sm hover:text-primary transition">
                      support@workly.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block mb-0.5">Contact Number</span>
                    <span className="text-muted-foreground text-sm">+91 98765 43210</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted border border-border rounded-[24px] p-6 flex gap-4 text-sm leading-relaxed text-muted-foreground">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p>
                Our support desk hours are Monday to Friday, 9:00 AM to 6:00 PM IST. We strive to reply to all queries within 1 business day.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3 bg-card border border-border rounded-[40px] p-8 sm:p-12 shadow-google-1">
            <h3 className="font-display text-2xl sm:text-3xl font-bold mb-8 text-foreground">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full p-4 bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-bold text-foreground focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full p-4 bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-bold text-foreground focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Message</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full p-4 bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-bold text-foreground focus:outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-base transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Sending...' : <><Send size={18} /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
