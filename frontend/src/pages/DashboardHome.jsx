import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Layers, 
  Users, 
  Activity, 
  CheckCircle2, 
  Sparkles, 
  Shield, 
  FileText, 
  ArrowUpRight, 
  Plus,
  Bot
} from 'lucide-react';
import { sessionsAPI } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { company } = useAuthStore();

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions-all'],
    queryFn: () => sessionsAPI.list()
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const sessions = sessionsData || [];
  const totalSessions = sessions.length;
  const totalCandidates = sessions.reduce((acc, s) => acc + (s.total_candidates || 0), 0);
  const activeSessions = sessions.filter(s => s.status === "active").length;
  const completedSessions = sessions.filter(s => s.status === "completed").length;

  // Dynamic trend computation
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const sessionsThisWeek = sessions.filter(s => s.created_at && new Date(s.created_at) >= oneWeekAgo).length;
  const candidatesToday = sessions
    .filter(s => s.created_at && new Date(s.created_at) >= oneDayAgo)
    .reduce((acc, s) => acc + (s.total_candidates || 0), 0);
  const endingSoon = sessions.filter(s => s.status === "active" && s.rounds?.length > 0).length;
  const hireRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const sessionsTrend = sessionsThisWeek > 0 ? `+${sessionsThisWeek} this week` : "No new this week";
  const candidatesTrend = candidatesToday > 0 ? `+${candidatesToday} today` : "No new today";
  const activeTrend = endingSoon > 0 ? `${endingSoon} in progress` : "None active";
  const completedTrend = `${hireRate}% completion rate`;

  if (sessionsLoading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto py-4">
        <div className="space-y-2">
          <LoadingSkeleton width="200px" height="32px" />
          <LoadingSkeleton width="300px" height="16px" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <LoadingSkeleton width="40px" height="40px" borderRadius="12px" className="shrink-0" />
                <LoadingSkeleton width="60px" height="12px" className="shrink-0" />
              </div>
              <div className="space-y-3 mt-4">
                <LoadingSkeleton width="90px" height="28px" />
                <LoadingSkeleton width="130px" height="14px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-8">
      {/* Header - Material 3 Style */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="font-display text-[32px] sm:text-[36px] font-bold text-charcoal tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-[15px] mt-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent/80 animate-pulse"></span>
            {getGreeting()}, <span className="font-semibold text-charcoal">{company?.name || 'Daksh'}</span>. Here's your overview.
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/sessions/new')}
          className="group inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full bg-accent hover:bg-blue-700 text-white font-bold text-[15px] shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
          New session
        </button>
      </header>

      {/* Stat cards - Elevated Tonal Surface */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Layers} label="Total sessions" value={totalSessions} trend={sessionsTrend} tone="primary" />
        <StatCard icon={Users} label="Total candidates" value={totalCandidates} trend={candidatesTrend} tone="success" />
        <StatCard icon={Activity} label="Active sessions" value={activeSessions} trend={activeTrend} tone="warning" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedSessions} trend={completedTrend} tone="muted" />
      </section>

      {/* Quick actions - Filled Cards */}
      <section>
        <h2 className="font-display text-[20px] font-bold text-charcoal mb-4 px-1">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <QuickAction
            to="/dashboard/smart-analyzer"
            icon={Sparkles}
            title="Smart Analyzer"
            desc="Rank resumes against a job description with AI."
            tone="blue"
          />
          <QuickAction
            to="/dashboard/ai-recruiter"
            icon={Bot}
            title="AI Recruiter"
            desc="Automated resume screening and AI interviewing."
            tone="indigo"
          />
          <QuickAction
            to="/dashboard/sessions"
            icon={Layers}
            title="Sessions"
            desc="Manage hiring rounds and candidate pipelines."
            tone="purple"
          />
        </div>
      </section>

      {/* Recent activity - Unified Elevated List */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-display text-[20px] font-bold text-charcoal">Recent activity</h2>
          <Link to="/dashboard/sessions" className="text-accent text-sm font-bold hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)] rounded-[28px] overflow-hidden p-2">
          {sessions.slice(0, 5).map((session, i) => (
            <div
              key={session.id || i}
              onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
              className="group flex items-center gap-5 px-5 py-4 hover:bg-[#F8F9FA] rounded-[20px] transition-all duration-300 cursor-pointer"
            >
              <div className="w-[46px] h-[46px] rounded-2xl bg-gray-50/80 border border-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-accent group-hover:border-blue-100 flex items-center justify-center transition-colors">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[16px] font-bold text-charcoal truncate group-hover:text-accent transition-colors">{session.job_title || 'Untitled Session'}</div>
                <div className="text-[13px] font-medium text-gray-500 mt-0.5 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{session.total_candidates || 0} candidates</span> 
                  <span className="text-gray-300">•</span>
                  <span>{session.rounds?.length || 3} rounds</span>
                </div>
              </div>
              <div className="text-[13px] font-medium text-gray-400 hidden sm:block bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                {session.created_at ? 'Updated recently' : 'Updated yesterday'}
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all text-gray-400 group-hover:text-accent">
                <ArrowUpRight size={18} className="transform group-hover:scale-110 transition-transform" />
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
                <Layers size={28} />
              </div>
              <h3 className="font-display text-lg font-bold text-charcoal mb-1">No sessions yet</h3>
              <p className="text-gray-500 text-sm max-w-xs mb-6">Create your first hiring session to start evaluating candidates with AI.</p>
              <button 
                onClick={() => navigate('/dashboard/sessions/new')}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gray-900 text-white font-medium text-sm hover:bg-charcoal transition"
              >
                Create session
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, tone }) {
  const toneMap = {
    primary: "bg-blue-50/50 text-blue-600 border-blue-100/50",
    success: "bg-emerald-50/50 text-emerald-600 border-emerald-100/50",
    warning: "bg-amber-50/50 text-amber-600 border-amber-100/50",
    muted: "bg-gray-50/50 text-gray-600 border-gray-100/50",
  };
  const iconToneMap = {
    primary: "bg-blue-100/50 text-blue-700",
    success: "bg-emerald-100/50 text-emerald-700",
    warning: "bg-amber-100/50 text-amber-700",
    muted: "bg-gray-200/50 text-gray-700",
  };

  return (
    <div className={`rounded-[28px] p-6 border ${toneMap[tone]} hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center ${iconToneMap[tone]} transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
        <span className="text-[13px] font-bold px-3 py-1.5 rounded-full bg-white/60 shadow-sm backdrop-blur-sm">{trend}</span>
      </div>
      <div>
        <div className="font-display text-[40px] font-extrabold leading-none text-charcoal tracking-tight mb-1">{value}</div>
        <div className="text-[14px] font-bold text-gray-600/80 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, desc, tone }) {
  const SafeIcon = Icon || Sparkles;
  
  const bgTones = {
    blue: "hover:bg-blue-50/50 hover:border-blue-200/60",
    indigo: "hover:bg-indigo-50/50 hover:border-indigo-200/60",
    purple: "hover:bg-purple-50/50 hover:border-purple-200/60",
  };

  const iconBgTones = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
  };

  return (
    <Link
      to={to}
      className={`group bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-lg ${bgTones[tone]} transition-all duration-300 flex items-start gap-4 hover:-translate-y-1`}
    >
      <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 transition-colors duration-300 ${iconBgTones[tone]}`}>
        <SafeIcon size={24} className="transform group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="flex-1 pt-1">
        <div className="font-display text-[17px] font-bold text-charcoal transition-colors">{title}</div>
        <div className="text-[14px] font-medium text-gray-500 mt-1 leading-relaxed">{desc}</div>
      </div>
    </Link>
  );
}
