import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { portalBilling, portalUsage } from "../../lib/portalApi";
import { DEVELOPER_PLANS } from "../../lib/constants";
import { CreditCard, CheckCircle2, AlertTriangle, Star, RefreshCw, Activity, Zap, Layers } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { usePortalAuthStore } from "../../stores/portalAuthStore";

/* ═══════════════════ Framer Motion Animation System ═══════════════════ */
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

export default function DeveloperBilling() {
  const { tier, setAuth } = usePortalAuthStore();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    if (!document.getElementById("razorpay-sdk")) {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const { data: plans } = useQuery({
    queryKey: ["billing-plans"],
    queryFn: portalBilling.plans,
    initialData: DEVELOPER_PLANS
  });

  const { data: current } = useQuery({
    queryKey: ["billing-current"],
    queryFn: async () => {
      try {
        if (portalBilling.current) return await portalBilling.current();
      } catch (err) {
        console.error("Failed to load billing current data:", err);
      }
      return { plan: tier || "free", next_billing: "June 1, 2026", status: "Active" };
    }
  });

  const { data: usageSummary } = useQuery({
    queryKey: ["billing-usage-summary"],
    queryFn: async () => {
      try {
        if (portalUsage.summary) return await portalUsage.summary();
      } catch (err) {
        console.error("Failed to load usage summary:", err);
      }
      return { used_calls: 38, total_quota: 100 };
    }
  });

  const handleUpgrade = async (planId) => {
    setLoadingPlan(planId);
    try {
      const orderData = await portalBilling.subscribe(planId);

      if (orderData.order_id?.startsWith("order_mock_")) {
        setTimeout(async () => {
          try {
            await portalBilling.verifyPayment({
              razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
              razorpay_order_id: orderData.order_id,
              razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(7),
              plan: planId
            });
            toast.success("Successfully upgraded plan! (Mock Payment)");
            setAuth({ ...usePortalAuthStore.getState().developer, tier: planId });
            window.location.reload();
          } catch (err) {
            toast.error("Mock upgrade verification failed");
            setLoadingPlan(null);
          }
        }, 1000);
        return;
      }

      if (!window.Razorpay) {
        setTimeout(() => {
          toast.success("Mock Upgrade Successful.");
          setAuth({ ...usePortalAuthStore.getState().developer, tier: planId });
          window.location.reload();
        }, 1000);
        return;
      }

      const rzp = new window.Razorpay({
        key: orderData.razorpay_key_id || "rzp_test_mock",
        order_id: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Workly Developer API",
        description: `Upgrade to ${plans.find(p=>p.id===planId)?.name || planId} Plan`,
        theme: { color: "#4285F4" },
        handler: async function(response) {
          try {
            await portalBilling.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId
            });
            toast.success("Successfully upgraded plan!");
            setAuth({ ...usePortalAuthStore.getState().developer, tier: planId });
            window.location.reload();
          } catch (err) {
            toast.error("Payment verification failed");
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
            toast("Payment window closed", { icon: "ℹ️" });
          }
        }
      });

      rzp.on('payment.failed', function () { 
        toast.error("Payment failed"); 
        setLoadingPlan(null); 
      });
      rzp.open();
    } catch (e) {
      toast.error(e.message || "Failed to initiate payment");
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    try {
      await portalBilling.cancel();
      toast.success("Subscription cancelled. Downgraded to Free plan.");
      setCancelModal(false);
      
      const currentDev = usePortalAuthStore.getState().developer;
      setAuth({ ...currentDev, tier: "free" });
      window.location.reload();
    } catch (e) {
      toast.error(e.message || "Failed to cancel subscription");
    }
  };

  const activePlan = current?.plan || tier || "free";
  const usedCalls = usageSummary?.used_calls || 38;
  const totalQuota = activePlan === "free" ? 100 : activePlan === "starter" ? 1000 : 10000;
  const usagePercentage = Math.min(100, Math.round((usedCalls / totalQuota) * 100));

  return (
    <div className="w-full max-w-6xl mx-auto pb-16 pt-4 px-4 font-sans text-foreground">
      {/* HEADER */}
      <div className="mb-10 text-left">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--google-blue)] mb-1">
          Subscriptions & Billing
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight">
          Billing & Quotas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your active API subscription tier and monthly limits.</p>
      </div>

      {/* CURRENT ACTIVE PLAN & USAGE QUOTA CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-7 shadow-sm flex flex-col gap-6 mb-12 relative overflow-hidden text-left"
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-[var(--google-blue)]"></div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pl-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Active Subscription</span>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2.5">
                <CreditCard size={24} className="text-[var(--google-blue)]" /> {plans.find(p=>p.id===activePlan)?.name || "Free"} Plan
              </h2>
              <span className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {current?.status || "Active"}
              </span>
            </div>
            {activePlan !== "free" && (
              <p className="text-muted-foreground text-sm mt-0.5">
                ₹{plans.find(p=>p.id===activePlan)?.price.toLocaleString()}/month. Next billing date: <strong className="text-foreground">{current?.next_billing || "June 1, 2026"}</strong>
              </p>
            )}
          </div>
          {activePlan !== "free" && (
            <button 
              onClick={() => setCancelModal(true)} 
              className="px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-all cursor-pointer border border-border"
            >
              Cancel Plan
            </button>
          )}
        </div>

        {/* Usage Progress Bar */}
        <div className="pl-2 pt-2 border-t border-border">
          <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[var(--google-blue)]" /> Monthly API Quota Used
            </span>
            <span className="text-foreground font-mono">
              {usedCalls.toLocaleString()} / {totalQuota.toLocaleString()} parses ({usagePercentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-[var(--google-blue)] rounded-full transition-all duration-500" 
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* MONTHLY / YEARLY TOGGLE SWITCH */}
      <div className="text-center mb-10">
        <div className="inline-flex p-1.5 rounded-full border border-border bg-card shadow-sm relative">
          {["Monthly", "Yearly"].map((t, i) => {
            const active = (i === 1) === yearly;
            return (
              <button 
                key={t} 
                onClick={() => setYearly(i === 1)}
                className={`relative flex items-center justify-center px-6 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer ${active ? "text-white" : "text-muted-foreground"}`}
              >
                {active && (
                  <motion.div 
                    layoutId="portal-billing-pill-master" 
                    className="absolute inset-0 bg-[var(--google-blue)] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} 
                  />
                )}
                <span className="relative">{t}{i === 1 && <span className="ml-1 text-[11px]">(Save 20%)</span>}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PLANS GRID */}
      <motion.div 
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-6 items-stretch text-left"
      >
        {plans.map(p => {
          const isActive = activePlan === p.id;
          const rawPrice = typeof p.price === 'number' ? p.price : parseInt(p.price) || 0;
          const price = yearly ? Math.round(rawPrice * 0.8) : rawPrice;
          const currency = rawPrice > 100 ? '₹' : '$';
          const isPopular = p.id === 'starter' || p.id === 'business' || p.popular;
          const isSubscribing = loadingPlan === p.id;

          return (
            <motion.div 
              key={p.id} 
              variants={staggerItemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`rounded-2xl border p-7 flex flex-col transition-all duration-300 ${isActive ? "border-[var(--google-blue)] bg-card shadow-lg ring-2 ring-[var(--google-blue)]/20 md:scale-105" : isPopular ? "border-[var(--google-blue)]/60 bg-card shadow-md" : "border-border bg-card shadow-sm"}`}
            >
              {isPopular && (
                <span className="self-start pill mb-4 bg-[var(--google-blue)] text-white text-xs px-3 py-1 font-semibold rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
                </span>
              )}
              
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-display font-bold text-xl text-foreground uppercase tracking-tight">{p.name}</h3>
                {isActive && (
                  <span className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>

              <div className="text-xs text-muted-foreground mb-4">
                {p.id === 'free' ? 'For testing & sandbox API development' : p.id === 'starter' ? 'For growing platforms & SaaS tools' : 'For enterprise volume applications'}
              </div>
              
              <div className="mb-6 border-b border-border pb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-4xl text-foreground">
                    {rawPrice === 0 ? 'Free' : `${currency}${price.toLocaleString()}`}
                  </span>
                  {rawPrice > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                </div>
                {yearly && rawPrice > 0 && (
                  <div className="text-xs text-[var(--google-green)] font-medium mt-1">Billed annually ({currency}{(price * 12).toLocaleString()}/yr)</div>
                )}
              </div>
              
              <ul className="flex flex-col gap-3 font-medium text-sm text-foreground mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex gap-2.5 items-start">
                    <CheckCircle2 className="w-4 h-4 text-[var(--google-green)] shrink-0 mt-0.5" /> 
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {!isActive && (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubscribing}
                  onClick={() => handleUpgrade(p.id)} 
                  className={`w-full py-3.5 rounded-full font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${isPopular ? "bg-[var(--google-blue)] text-white hover:opacity-90 shadow-md shadow-blue-500/20" : "border border-border bg-background hover:bg-muted text-foreground"}`}
                >
                  {isSubscribing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Upgrade to ${p.name}`
                  )}
                </motion.button>
              )}
              {isActive && (
                <button disabled className="w-full py-3.5 rounded-full font-semibold bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 flex items-center justify-center gap-2 cursor-default">
                   <CheckCircle2 className="w-4 h-4" /> Current Active Plan
                </button>
              )}
            </motion.div>
          );
       })}
      </motion.div>

      {/* CANCEL PLAN MODAL */}
      <AnimatePresence>
        {cancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative p-8 text-left"
            >
              <div className="w-14 h-14 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-5">
                <AlertTriangle size={28}/>
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Downgrade to Free?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Canceling your plan will downgrade your API access to the Free tier. You will lose access to webhooks, higher SLA parsing speed, and priority support.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCancelModal(false)} 
                  className="flex-1 py-3 border border-border bg-card text-foreground font-semibold rounded-full hover:bg-muted transition-colors cursor-pointer"
                >
                  Keep Plan
                </button>
                <button 
                  onClick={handleCancel} 
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 cursor-pointer"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
