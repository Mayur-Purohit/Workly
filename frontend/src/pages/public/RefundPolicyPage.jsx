import React from 'react';
import { Header, Footer } from '../../components/user/site-chrome';
import { motion } from 'framer-motion';
import { RefreshCcw, Mail, AlertCircle, Clock } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Header />

      <section className="mx-auto max-w-4xl px-6 pt-36 pb-16 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8 text-xs font-bold uppercase tracking-wider text-primary"
          >
            <RefreshCcw size={14} /> Policies
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl font-black tracking-tight leading-tight mb-6 text-foreground"
          >
            Refund Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed"
          >
            We strive to provide excellent service. If you are unsatisfied, please review our refund policies below.
          </motion.p>
        </div>

        <div className="bg-card border border-border rounded-[40px] p-8 sm:p-14 shadow-google-1 relative z-10 overflow-hidden space-y-10">
          <div className="border-b border-border pb-6">
            <h2 className="font-display text-3xl font-black mb-2 text-foreground">Standard Refund Terms</h2>
            <p className="text-sm text-muted-foreground">Last updated: June 27, 2026</p>
          </div>

          <div className="space-y-8 text-base text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xl">
                <AlertCircle className="text-primary" size={24} /> Eligibility
              </h3>
              <p>
                Refunds are considered on a case-by-case basis. You may be eligible for a refund if:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>You were billed incorrectly due to a technical error.</li>
                <li>The service experienced severe, undocumented downtime preventing you from using core features.</li>
                <li>You cancel a recurring subscription within 48 hours of renewal and have not utilized the premium features during that cycle.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xl">
                <Clock className="text-primary" size={24} /> Processing Time
              </h3>
              <p>
                Once a refund is approved, it will be processed through Razorpay and typically reflects in your original payment method within 5 to 7 business days, depending on your bank or credit card issuer.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xl">
                <Mail className="text-primary" size={24} /> How to Request
              </h3>
              <p>
                To request a refund, please follow these steps:
              </p>
              <ol className="list-decimal pl-8 space-y-2">
                <li>Please contact us at <strong>support@workly.com</strong> within 7 days of the transaction.</li>
                <li>Include your account email, the transaction ID, and a detailed reason for the request.</li>
                <li>Our billing team will review your case and respond within 2 business days.</li>
              </ol>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
