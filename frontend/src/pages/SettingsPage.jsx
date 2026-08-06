import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI, billingAPI } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import PageTransition from '../components/PageTransition';
import VerificationModal from '../components/VerificationModal';
import { LocationSelector } from '../components/ui/LocationSelector';
import { 
  Building, 
  Key, 
  Upload, 
  X, 
  Plus, 
  Copy, 
  Trash2, 
  Bell, 
  User, 
  Check, 
  Lock,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const { company, clearAuth, tier, setAuth } = useAuthStore();
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [industry, setIndustry] = useState(company?.industry || '');
  const [hqLocation, setHqLocation] = useState(company?.hq_location || '');
  const [about, setAbout] = useState(company?.about || '');
  const [companySize, setCompanySize] = useState(company?.company_size || '');
  const [foundedYear, setFoundedYear] = useState(company?.founded_year || '');
  const [websiteUrl, setWebsiteUrl] = useState(company?.website_url || '');

  useEffect(() => {
    if (company) {
      if (company.name) setCompanyName(company.name);
      setIndustry(company.industry || '');
      setHqLocation(company.hq_location || '');
      setAbout(company.about || '');
      setCompanySize(company.company_size || '');
      setFoundedYear(company.founded_year || '');
      setWebsiteUrl(company.website_url || '');
    }
  }, [company]);

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").replace("/api/v1", "");
    return `${apiBase}${path}`;
  };

  const [logo, setLogo] = useState(company?.logo_path ? getFullUrl(company.logo_path) : (localStorage.getItem('vish_company_logo') || ''));
  const [logoFile, setLogoFile] = useState(null);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };
  
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile'); // 'profile' | 'api-keys' | 'notifications' | 'account' | 'billing'
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  
  // New key modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState('production');

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    // Dynamically load Razorpay
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const { data: keysData, refetch: refetchKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => authAPI.getKeys(),
    retry: false
  });

  const { data: plans } = useQuery({
    queryKey: ["recruiter-billing-plans"],
    queryFn: billingAPI.plans,
    initialData: [
      { id: "free", name: "Starter Plan", price: 0, features: ["One active session", "Up to 100 resumes", "Basic AI screening", "Standard support"] },
      { id: "business", name: "Business Plan", price: 1499, features: ["Five active sessions", "Up to 2,000 resumes", "Advanced matching", "API access"] },
      { id: "enterprise", name: "Enterprise Plan", price: 3999, features: ["Unlimited sessions", "Priority VIP support", "Custom integrations", "Advanced analytics"] }
    ]
  });

  const { data: currentSub, refetch: refetchSub } = useQuery({
    queryKey: ["recruiter-billing-current"],
    queryFn: async () => {
      try {
        return await billingAPI.current();
      } catch (e) {
        return { plan: company?.tier || tier || "free", status: "active" };
      }
    }
  });

  const [loadingPlan, setLoadingPlan] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);

  const handleUpgrade = async (planId) => {
    setLoadingPlan(planId);
    try {
      const orderData = await billingAPI.subscribe(planId);
      if (orderData.order_id.startsWith("order_mock_")) {
         setTimeout(async () => {
           try {
             await billingAPI.verifyPayment({
               razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
               razorpay_order_id: orderData.order_id,
               razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(7),
               plan: planId
             });
             toast.success("Successfully upgraded plan (Mock Mode)!");
             
             const updatedCompany = { ...company, tier: planId, jwt_token: localStorage.getItem("vish_jwt") };
             setAuth(updatedCompany);
             refetchSub();
             window.location.reload();
           } catch (err) {
             toast.error("Mock upgrade verification failed");
             setLoadingPlan(null);
           }
         }, 1000);
         return;
      }

      const rzp = new window.Razorpay({
        key: orderData.razorpay_key_id || "rzp_test_mock",
        order_id: orderData.order_id,
        name: "Workly",
        description: `Upgrade to ${planId.toUpperCase()} Plan`,
        theme: { color: "#111111" },
        handler: async function(response) {
          try {
            await billingAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId
            });
            toast.success("Successfully upgraded plan!");
            
            const updatedCompany = { ...company, tier: planId, jwt_token: localStorage.getItem("vish_jwt") };
            setAuth(updatedCompany);
            refetchSub();
            window.location.reload();
          } catch (err) {
            toast.error("Payment verification failed");
          }
        }
      });

      rzp.on('payment.failed', function () { toast.error("Payment failed"); setLoadingPlan(null); });
      rzp.open();
    } catch (e) {
      toast.error(e.message || "Failed to initiate payment");
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    try {
      await billingAPI.cancel();
      toast.success("Subscription cancelled. Downgraded to Starter Plan.");
      setCancelModal(false);
      
      const updatedCompany = { ...company, tier: "free", jwt_token: localStorage.getItem("vish_jwt") };
      setAuth(updatedCompany);
      refetchSub();
      window.location.reload();
    } catch (e) {
      toast.error(e.message || "Failed to cancel subscription");
    }
  };

  const activePlan = currentSub?.plan || company?.tier || tier || "free";

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo('');
    setLogoFile(null);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: companyName,
        industry,
        hq_location: hqLocation,
        about,
        company_size: companySize,
        founded_year: foundedYear ? Number(foundedYear) : null,
        website_url: websiteUrl
      };

      // 1. Update company profile details
      await authAPI.updateProfile(payload);
      
      let updatedLogoPath = company?.logo_path;

      // 2. If a new logo file was selected, upload it to the backend
      if (logoFile) {
        const uploadResult = await authAPI.uploadLogo(logoFile);
        updatedLogoPath = uploadResult.logo_path;
        setLogoFile(null);
      } else if (!logo) {
        // If the logo was cleared/removed, update backend to empty string (which sets it to None in DB)
        await authAPI.updateProfile({ ...payload, logo_path: "" });
        updatedLogoPath = null;
      }

      // 3. Update auth state in zustand store
      const updatedCompanyData = {
        ...company,
        ...payload,
        logo_path: updatedLogoPath
      };
      setAuth(updatedCompanyData);

      // Sync local storage for sidebar backward compatibility
      if (logo) {
        localStorage.setItem('vish_company_logo', logo);
      } else {
        localStorage.removeItem('vish_company_logo');
      }

      window.dispatchEvent(new Event('company_logo_updated'));
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    try {
      await authAPI.generateKey({
        key_name: newKeyName,
        environment: newKeyEnv
      });
      toast.success("API key generated successfully");
      setShowCreateModal(false);
      setNewKeyName('');
      refetchKeys();
    } catch (err) {
      toast.error(err.message || "Failed to generate key");
    }
  };

  const handleCopyKey = (keyString, id) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const keys = Array.isArray(keysData) ? keysData : [];

  const tabItems = [
    { id: 'profile', label: 'Company profile', icon: Building },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <>
    <PageTransition className="max-w-[1400px] mx-auto pt-4 pb-24 px-4 w-full space-y-10">
      {/* HEADER - Material 3 Style */}
      <header className="mb-10">
        <h1 className="font-display text-[32px] sm:text-[36px] font-bold text-charcoal tracking-tight leading-tight">Settings</h1>
        <p className="text-gray-500 text-[15px] mt-1.5 max-w-2xl">Manage your account, API keys, billing, and company profile.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
        {/* LEFT TAB BAR - Elevated Tonal Surface */}
        <div className="w-full lg:w-72 bg-white border border-gray-100 rounded-[28px] p-4 shadow-[0_2px_24px_rgba(0,0,0,0.02)] shrink-0 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3.5 px-5 py-3.5 rounded-[20px] font-bold text-[14px] tracking-wide transition-all duration-300 text-left whitespace-nowrap lg:whitespace-normal w-full ${
                  isSelected 
                    ? 'bg-blue-50/70 text-indigo-700 shadow-sm' 
                    : 'text-gray-500 hover:bg-[#F8F9FA] hover:text-charcoal'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                   <Icon size={16} />
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT CARD - Filled Elevated Container */}
        <div className="flex-1 w-full bg-white rounded-[32px] shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-[500px]">
          {activeTab === 'profile' && (
            <div className="p-8 sm:p-10 space-y-8">
              <h2 className="text-[20px] font-display font-bold text-charcoal flex items-center gap-3 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center"><Building size={18} /></div> Company Profile
              </h2>
              
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Admin Email</label>
                  <div className="flex items-center gap-3">
                    <input type="text" value={company?.email || 'N/A'} readOnly className="flex-1 p-4 bg-[#F8F9FA] border-none rounded-[20px] text-[15px] text-gray-500 font-medium focus:outline-none" />
                    {company?.email_verified ? (
                      <span className="shrink-0 inline-flex items-center px-4 py-4 rounded-[20px] text-[13px] font-bold bg-emerald-50 text-emerald-600 gap-2">
                        <Check size={16} /> Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => setVerifyTarget({ type: 'email', value: company?.email })}
                        className="shrink-0 px-5 py-4 text-[13px] font-bold rounded-[20px] bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors focus:outline-none"
                      >
                        Verify Email
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Company Name</label>
                  <input 
                    type="text" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    className="w-full p-4 bg-[#F8F9FA] hover:bg-gray-100 focus:bg-white border border-transparent focus:border-accent/30 focus:ring-4 focus:ring-accent/10 rounded-[20px] text-[15px] font-bold text-charcoal outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Company Logo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[24px] border border-gray-100 bg-[#F8F9FA] flex items-center justify-center overflow-hidden shrink-0 relative group shadow-sm">
                      {logo ? (
                        <>
                          <img src={logo} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={handleRemoveLogo} 
                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            title="Remove logo"
                          >
                            <X size={24} />
                          </button>
                        </>
                      ) : (
                        <Building size={32} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer bg-white hover:bg-gray-50 text-charcoal border border-gray-200 px-6 py-3 rounded-full text-[14px] font-bold transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md inline-flex items-center gap-2 w-max">
                        <Upload size={16} /> Upload Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoChange} 
                          className="hidden" 
                        />
                      </label>
                      <span className="text-[11px] text-gray-400 font-medium ml-1">PNG, JPG, SVG or WEBP up to 5MB</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Industry</label>
                  <input 
                    type="text" 
                    value={industry} 
                    placeholder="e.g. Technology, Healthcare, Finance"
                    onChange={(e) => setIndustry(e.target.value)} 
                    className="w-full p-4 bg-[#F8F9FA] hover:bg-gray-100 focus:bg-white border border-transparent focus:border-accent/30 focus:ring-4 focus:ring-accent/10 rounded-[20px] text-[15px] font-bold text-charcoal outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">HQ / Location</label>
                  <div className="relative bg-[#F8F9FA] rounded-[20px] p-2 hover:bg-gray-100 transition-colors focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10">
                    <LocationSelector 
                      value={hqLocation} 
                      onChange={setHqLocation} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Company Size</label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full p-4 bg-[#F8F9FA] hover:bg-gray-100 focus:bg-white border border-transparent focus:border-accent/30 focus:ring-4 focus:ring-accent/10 rounded-[20px] text-[15px] font-bold text-charcoal outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select size...</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="50-200">50-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Founded Year</label>
                    <input 
                      type="number" 
                      value={foundedYear} 
                      placeholder="e.g. 2020"
                      onChange={(e) => setFoundedYear(e.target.value)} 
                      className="w-full p-4 bg-[#F8F9FA] hover:bg-gray-100 focus:bg-white border border-transparent focus:border-accent/30 focus:ring-4 focus:ring-accent/10 rounded-[20px] text-[15px] font-bold text-charcoal outline-none transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Website URL</label>
                  <input 
                    type="url" 
                    value={websiteUrl} 
                    placeholder="https://example.com"
                    onChange={(e) => setWebsiteUrl(e.target.value)} 
                    className="w-full p-4 bg-[#F8F9FA] hover:bg-gray-100 focus:bg-white border border-transparent focus:border-accent/30 focus:ring-4 focus:ring-accent/10 rounded-[20px] text-[15px] font-bold text-charcoal outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">About / Overview</label>
                  <textarea 
                    value={about} 
                    placeholder="Provide a brief overview of your company..."
                    onChange={(e) => setAbout(e.target.value)} 
                    rows={4}
                    className="w-full p-4 bg-[#F8F9FA] hover:bg-gray-100 focus:bg-white border border-transparent focus:border-accent/30 focus:ring-4 focus:ring-accent/10 rounded-[24px] text-[15px] font-medium text-charcoal outline-none transition-all resize-none" 
                  />
                </div>
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Account Tier</label>
                    <span className="inline-block bg-indigo-50 text-indigo-700 font-black px-4 py-2 rounded-full text-[11px] uppercase tracking-widest shadow-sm">
                      {company?.tier || 'Free'}
                    </span>
                  </div>
                  <button onClick={handleSave} className="bg-charcoal hover:bg-black text-white px-8 py-4 rounded-full text-[15px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="p-8 sm:p-10 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                <h2 className="text-[20px] font-display font-bold text-charcoal flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center"><Key size={18} /></div> API Keys
                </h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-accent hover:bg-blue-700 text-white px-6 py-3 rounded-full text-[14px] font-bold transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
                >
                  <Plus size={18} /> Create Key
                </button>
              </div>

              {/* Keys List */}
              {keys.length > 0 ? (
                <div className="space-y-4">
                  {keys.map((key, i) => (
                    <div key={key.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#F8F9FA] rounded-[24px] hover:bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-transparent hover:border-gray-100 transition-all gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[16px] bg-white border border-gray-100 text-accent flex items-center justify-center shrink-0 shadow-sm">
                          <Key size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-[16px] text-charcoal">{key.key_name || 'API Key'}</span>
                          <div className="text-[13px] text-gray-500 font-mono mt-1 tracking-tight bg-white px-3 py-1.5 rounded-[10px] border border-gray-100 inline-block shadow-sm">
                            {key.secret_key ? `${key.secret_key.slice(0, 16)}••••••••${key.secret_key.slice(-4)}` : `${key.public_key?.slice(0, 16)}...`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-5 shrink-0 ml-auto">
                        <div className="text-right hidden sm:block">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${
                            key.environment === 'production' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {key.environment || 'production'}
                          </span>
                          <div className="text-[11px] text-gray-400 font-medium mt-2">
                            Created {key.created_at ? new Date(key.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                          <button 
                            onClick={() => handleCopyKey(key.secret_key || key.public_key, key.id)}
                            className="p-2 text-gray-500 hover:text-charcoal hover:bg-gray-100 rounded-full transition-colors"
                            title="Copy API key"
                          >
                            {copiedKeyId === key.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                          </button>
                          <button 
                            onClick={async () => {
                              if (window.confirm("Permanently revoke this API key? This cannot be undone.")) {
                                try {
                                  await authAPI.deleteKey(key.id);
                                  toast.success("API key revoked");
                                  refetchKeys();
                                } catch(e) { toast.error(e.message); }
                              }
                            }}
                            className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                            title="Revoke key"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-16 bg-[#F8F9FA] rounded-[32px] border border-dashed border-gray-200 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-[20px] bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4">
                     <Key size={24} className="text-gray-300" />
                  </div>
                  <h3 className="font-display font-bold text-[20px] text-charcoal mb-2">No API keys found</h3>
                  <p className="text-[14px] text-gray-500 max-w-sm mx-auto leading-relaxed">Generate a credentials pair to authenticate your developer platform calls securely.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-8 sm:p-10 space-y-8">
              <h2 className="text-[20px] font-display font-bold text-charcoal flex items-center gap-3 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center"><Bell size={18} /></div> Notifications
              </h2>
              <div className="divide-y divide-gray-100 bg-[#F8F9FA] rounded-[24px] p-2">
                {[
                  { id: "new_candidate", label: "New Candidate Applications", desc: "Get notified when a candidate successfully joins a session.", defaultVal: true },
                  { id: "weekly_digest", label: "Weekly Account Digest", desc: "A summary of activity and stats across all your recruitment sessions.", defaultVal: false },
                ].map((it, i) => (
                  <div key={i} className="flex items-center justify-between gap-6 p-6 hover:bg-white rounded-[20px] transition-colors">
                    <div>
                      <div className="font-bold text-[15px] text-charcoal">{it.label}</div>
                      <div className="text-[13px] text-gray-500 mt-1">{it.desc}</div>
                    </div>
                    <ToggleSwitch 
                      storageKey={`workly_notif_${it.id}`} 
                      defaultOn={it.defaultVal} 
                      label={it.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-8 sm:p-10 space-y-8">
              <h2 className="text-[20px] font-display font-bold text-charcoal flex items-center gap-3 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center"><User size={18} /></div> Account Preferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Admin Full Name</label>
                  <input type="text" className="w-full p-4 bg-[#F8F9FA] border-none rounded-[20px] text-[15px] font-bold text-charcoal focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all outline-none" defaultValue={company?.name ? `${company.name} Administrator` : "Admin"} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Email</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-[15px] text-gray-400 font-medium outline-none" defaultValue={company?.email || "admin@company.com"} readOnly />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Role</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-[15px] text-gray-400 font-medium outline-none" defaultValue="Owner / Admin" readOnly />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Language</label>
                  <input type="text" className="w-full p-4 bg-[#F8F9FA] border-none rounded-[20px] text-[15px] font-bold text-charcoal focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all outline-none" defaultValue="English (US)" />
                </div>
              </div>
              <div className="border border-red-100 bg-red-50/30 rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-8">
                <div>
                  <div className="font-bold text-[16px] text-charcoal">Sign Out of Workspace</div>
                  <div className="text-[13px] text-gray-500 mt-1">You'll need to re-authenticate to access the dashboard.</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-8 py-3.5 rounded-full bg-white border border-red-200 text-[14px] font-bold text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow transition-all shrink-0 w-full sm:w-auto"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="p-8 sm:p-10 space-y-8">
              <h2 className="text-[20px] font-display font-bold text-charcoal flex items-center gap-3 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center"><CreditCard size={18} /></div> Subscription & Billing
              </h2>

              {/* Current plan card */}
              <div className="bg-[#F8F9FA] border border-gray-100 rounded-[28px] p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 relative overflow-hidden group hover:bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all">
                <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
                <div className="flex flex-col gap-3 pl-2">
                  <span className="text-gray-400 text-[11px] font-black uppercase tracking-widest pl-0.5">Current Active Plan</span>
                  <div className="flex items-center gap-5">
                    <h2 className="text-[28px] font-display font-black text-charcoal flex items-center gap-3">
                      <CreditCard size={28} className="text-accent" /> {plans.find(p=>p.id===activePlan)?.name || (activePlan.charAt(0).toUpperCase() + activePlan.slice(1)) + " Plan"}
                    </h2>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-sm">● {currentSub?.status || "Active"}</span>
                  </div>
                  {activePlan !== "free" && (
                    <p className="text-gray-500 font-medium text-[14px] mt-1">₹{plans.find(p=>p.id===activePlan)?.price.toLocaleString()}/month. Status is currently active.</p>
                  )}
                </div>
                {activePlan !== "free" && (
                  <button onClick={() => setCancelModal(true)} className="px-6 py-3 text-[14px] font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100 bg-white shadow-sm">Cancel Plan</button>
                )}
              </div>

              {/* Comparison grid */}
              <div className="pt-4">
                <h3 className="font-display font-bold text-[22px] text-charcoal mb-6">Available Plans</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map(p => {
                    const isActive = activePlan === p.id;
                    return (
                      <div key={p.id} className={`flex flex-col border rounded-[32px] p-8 transition-all duration-300 relative overflow-hidden bg-white ${isActive ? "border-accent shadow-[0_8px_30px_rgba(37,99,235,0.12)]" : "border-gray-100 shadow-sm hover:shadow-md"}`}>
                        {isActive && <div className="absolute top-0 left-0 w-full h-2 bg-accent"></div>}
                        
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-[18px] font-bold text-charcoal">{p.name}</h3>
                          {isActive && <span className="bg-blue-50 text-accent text-[10px] font-black uppercase px-3 py-1 rounded-full border border-blue-100">Current</span>}
                        </div>
                        
                        <div className="mb-6 pb-6 border-b border-gray-100">
                           <span className="text-[36px] font-display font-black text-charcoal">₹{p.price}</span>
                           <span className="text-gray-500 font-medium text-[14px]">/mo</span>
                        </div>
                        
                        <ul className="flex flex-col gap-4 font-medium text-[13px] text-gray-600 mb-8 flex-1">
                          {p.features.map(f => (
                            <li key={f} className="flex gap-3 items-start">
                              <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> 
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        {!isActive && (
                          <button 
                            disabled={loadingPlan === p.id}
                            onClick={() => handleUpgrade(p.id)} 
                            className="w-full py-4 rounded-full font-bold text-[14px] bg-charcoal text-white hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
                          >
                            {loadingPlan === p.id ? "Processing..." : `Upgrade to ${p.name.split(" ")[0]}`}
                          </button>
                        )}
                        {isActive && (
                          <div className="w-full py-4 rounded-full font-bold text-[14px] bg-[#F8F9FA] text-gray-400 text-center cursor-default border border-gray-100">
                            Currently Active
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cancel Modal */}
              {cancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
                  <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative p-8 space-y-6">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[20px] flex items-center justify-center border border-red-100 shadow-sm"><AlertTriangle size={32}/></div>
                    <div>
                      <h2 className="text-[24px] font-display font-black text-charcoal leading-tight">Cancel Subscription?</h2>
                      <p className="text-gray-500 font-medium text-[15px] leading-relaxed mt-2">
                        Downgrading will revert your account to the Starter Plan tier. You will lose access to premium active sessions and increased resume capacity.
                      </p>
                    </div>
                    <div className="flex gap-4 pt-2">
                      <button onClick={()=>setCancelModal(false)} className="flex-1 py-4 bg-[#F8F9FA] text-gray-600 font-bold rounded-full hover:bg-gray-100 text-[14px] transition-colors border border-gray-200">Keep Plan</button>
                      <button onClick={handleCancel} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 text-[14px] transition-colors shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-lg">Yes, Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NEW API KEY GENERATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[22px] font-display font-bold text-charcoal">Create API Key</h3>
                <p className="text-[14px] text-gray-500 mt-1">Generate credentials for external API integration.</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-charcoal transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-6 pt-2">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Key Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Production Client"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full p-4 bg-[#F8F9FA] border-none rounded-[20px] text-[15px] font-bold text-charcoal focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Environment</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv('production')}
                    className={`py-3.5 px-4 rounded-[20px] text-[14px] font-bold transition-all border ${
                      newKeyEnv === 'production' 
                        ? 'border-accent bg-blue-50/50 text-accent shadow-sm' 
                        : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Production
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv('test')}
                    className={`py-3.5 px-4 rounded-[20px] text-[14px] font-bold transition-all border ${
                      newKeyEnv === 'test' 
                        ? 'border-accent bg-blue-50/50 text-accent shadow-sm' 
                        : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Sandbox / Test
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-3.5 px-6 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-[14px] font-bold text-gray-600 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3.5 px-8 bg-accent hover:bg-blue-700 text-white rounded-full text-[14px] font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-lg transition-all"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>

      {verifyTarget && (
        <VerificationModal
          isOpen={true}
          onClose={() => setVerifyTarget(null)}
          type={verifyTarget.type}
          value={verifyTarget.value}
          role="recruiter"
          userEmail={company?.email}
          onSuccess={() => {
            setAuth({
              ...company,
              [verifyTarget.type === 'email' ? 'email_verified' : 'phone_verified']: true
            });
            toast.success(`${verifyTarget.type === 'email' ? 'Email' : 'Phone'} verified successfully!`);
          }}
        />
      )}
    </>
  );
}

function ToggleSwitch({ storageKey, defaultOn, label }) {
  const [on, setOn] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) return saved === 'true';
    }
    return !!defaultOn;
  });

  const handleToggle = () => {
    const nextState = !on;
    setOn(nextState);
    if (storageKey) {
      localStorage.setItem(storageKey, String(nextState));
    }
    toast.success(`${label || 'Notification setting'} ${nextState ? 'enabled' : 'disabled'}`);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`w-12 h-7 rounded-full p-0.5 transition shrink-0 cursor-pointer ${on ? "bg-blue-600" : "bg-gray-200 border border-gray-300"}`}
    >
      <span className={`block w-6 h-6 bg-white rounded-full shadow-md transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

