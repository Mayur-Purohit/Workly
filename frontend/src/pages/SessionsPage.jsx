import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Building, Search, Plus, MoreVertical, Archive, Trash2, FolderOpen, ArrowUpDown, Layers } from 'lucide-react';
import { sessionsAPI } from '../lib/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function SessionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null && q !== undefined) {
      setSearchTerm(q);
    }
  }, [location.search]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortFilter, setSortFilter] = useState("Newest");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Click outside to close dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsAPI.list()
  });

  const getFilteredSessions = () => {
    if (!sessions) return [];
    let result = [...sessions];

    if (searchTerm) {
      result = result.filter(s => 
        (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.job_title || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "All") {
      result = result.filter(s => (s.status || "Active").toLowerCase() === statusFilter.toLowerCase());
    }

    if (sortFilter === "Newest") {
      result.sort((a, b) => new Date(b.created_at || new Date()) - new Date(a.created_at || new Date()));
    } else if (sortFilter === "Most Candidates") {
      result.sort((a, b) => (b.total_candidates || 0) - (a.total_candidates || 0));
    }

    return result;
  };

  const filteredSessions = getFilteredSessions();

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { dot: 'bg-blue-500', text: 'text-blue-700 bg-blue-50 border-blue-100', label: 'Completed' };
      case 'draft':
        return { dot: 'bg-gray-400', text: 'text-gray-600 bg-gray-50 border-gray-200', label: 'Draft' };
      default:
        return { dot: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50 border-emerald-100', label: 'Active' };
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-32 relative">
      {/* PAGE HEADER - Material 3 Style */}
      <header className="mb-10 pt-4">
        <h1 className="font-display text-[32px] sm:text-[36px] font-bold text-charcoal tracking-tight leading-tight">
          Recruitment Sessions
        </h1>
        <p className="text-gray-500 text-[15px] mt-1.5 max-w-2xl">
          Manage all your hiring rounds, candidate pipelines, and automated assessments in one unified workspace.
        </p>
      </header>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col xl:flex-row gap-5 xl:items-center justify-between bg-white p-4 rounded-[28px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100">
        {/* Search */}
        <div className="relative w-full xl:max-w-md shrink-0 z-20">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search sessions or roles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-12 pr-5 py-3.5 border-none bg-[#F8F9FA] hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-accent/20 rounded-full text-[15px] text-charcoal font-medium transition-all outline-none"
          />
          {showSuggestions && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 max-h-56 overflow-y-auto py-2">
              {(() => {
                const filteredList = Array.from(new Set(
                  (sessions || [])
                    .filter(s => 
                      !searchTerm || 
                      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (s.job_title || "").toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .flatMap(s => [s.job_title, s.name])
                    .filter(Boolean)
                )).slice(0, 5);
                return filteredList.length > 0 ? (
                  filteredList.map((sug, idx) => (
                    <button
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchTerm(sug);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-5 py-2.5 text-[14px] font-semibold hover:bg-[#F8F9FA] text-gray-700 transition-colors truncate"
                    >
                      {sug}
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-3 text-[14px] text-gray-400">No matching suggestions</div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Tab Segments & Sort */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto xl:justify-end">
          <div className="flex p-1 bg-[#F8F9FA] rounded-full">
            {['All', 'Active', 'Completed', 'Draft'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-300 ${
                  statusFilter === tab 
                    ? 'bg-white text-charcoal shadow-sm' 
                    : 'text-gray-500 hover:text-charcoal'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="appearance-none pl-5 pr-10 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-full text-[13px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer"
            >
              <option value="Newest">Newest first</option>
              <option value="Most Candidates">Most candidates</option>
            </select>
            <ArrowUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* SESSIONS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[220px]">
              <div className="flex items-start gap-4">
                <LoadingSkeleton width="48px" height="48px" borderRadius="16px" className="shrink-0" />
                <div className="space-y-2.5 flex-1 mt-1">
                  <LoadingSkeleton width="85%" height="16px" />
                  <LoadingSkeleton width="60%" height="12px" />
                </div>
              </div>
              <LoadingSkeleton width="70px" height="20px" borderRadius="9999px" className="mt-4" />
              <div className="grid grid-cols-3 gap-2 mt-5">
                <LoadingSkeleton width="100%" height="40px" borderRadius="12px" />
                <LoadingSkeleton width="100%" height="40px" borderRadius="12px" />
                <LoadingSkeleton width="100%" height="40px" borderRadius="12px" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSessions.map((session) => {
            const style = getStatusStyle(session.status);
            return (
              <div 
                key={session.id} 
                className="group bg-white border border-gray-100 hover:border-blue-100 rounded-[28px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition-all duration-300 flex flex-col justify-between h-[220px] cursor-pointer relative hover:-translate-y-1"
                onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
              >
                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-300">
                      <Building size={20} className="transform group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="text-[16px] font-bold text-charcoal leading-tight truncate" title={session.job_title || 'Untitled Role'}>
                        {session.job_title || 'Untitled Role'}
                      </h3>
                      <p className="text-[13px] text-gray-400 font-medium truncate mt-1" title={session.name || 'Q4 hiring • 3 rounds'}>
                        {session.name || 'Q4 hiring • 3 rounds'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === session.id ? null : session.id)}
                      className="p-1.5 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenuId === session.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden py-1.5"
                      >
                        <button 
                          onClick={() => {
                            setActiveMenuId(null);
                            navigate(`/dashboard/sessions/${session.id}`);
                          }}
                          className="w-full px-5 py-2.5 text-left text-[14px] font-bold text-gray-700 hover:text-accent hover:bg-blue-50 flex items-center gap-3 transition-colors"
                        >
                          <FolderOpen size={16} />
                          Open Session
                        </button>
                        <button 
                          onClick={async () => {
                            setActiveMenuId(null);
                            if (window.confirm(`Archive session "${session.job_title || session.name}"?`)) {
                              try {
                                await sessionsAPI.delete(session.id, { delete_candidates: false });
                                queryClient.invalidateQueries({ queryKey: ['sessions'] });
                                toast.success('Session archived');
                              } catch(e) { toast.error(e.message); }
                            }
                          }}
                          className="w-full px-5 py-2.5 text-left text-[14px] font-bold text-gray-700 hover:text-amber-600 hover:bg-amber-50 flex items-center gap-3 transition-colors"
                        >
                          <Archive size={16} />
                          Archive
                        </button>
                        <button 
                          onClick={async () => {
                            setActiveMenuId(null);
                            if (window.confirm(`Permanently delete session "${session.job_title || session.name}"? This will delete all candidates.`)) {
                              try {
                                await sessionsAPI.delete(session.id, { delete_candidates: true, hard_delete: true });
                                queryClient.invalidateQueries({ queryKey: ['sessions'] });
                                toast.success('Session deleted');
                              } catch(e) { toast.error(e.message); }
                            }
                          }}
                          className="w-full px-5 py-2.5 text-left text-[14px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${style.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
                    {style.label}
                  </span>
                </div>

                {/* BOTTOM STATS ROW */}
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <div className="bg-[#F8F9FA] group-hover:bg-white group-hover:border-gray-200 border border-transparent rounded-[16px] py-2.5 px-1 text-center transition-colors">
                    <div className="text-[18px] font-extrabold text-charcoal leading-none">{session.total_candidates || 0}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">Total</div>
                  </div>
                  <div className="bg-emerald-50/50 group-hover:bg-emerald-50 border border-transparent group-hover:border-emerald-100/50 rounded-[16px] py-2.5 px-1 text-center transition-colors">
                    <div className="text-[18px] font-extrabold text-emerald-600 leading-none">{session.hired || 0}</div>
                    <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mt-1.5">Hired</div>
                  </div>
                  <div className="bg-rose-50/50 group-hover:bg-rose-50 border border-transparent group-hover:border-rose-100/50 rounded-[16px] py-2.5 px-1 text-center transition-colors">
                    <div className="text-[18px] font-extrabold text-rose-500 leading-none">{session.rejected || 0}</div>
                    <div className="text-[10px] font-bold text-rose-500/70 uppercase tracking-wider mt-1.5">Rejected</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[32px] shadow-[0_2px_24px_rgba(0,0,0,0.02)] border border-gray-100 min-h-[400px]">
          <div className="w-20 h-20 rounded-[24px] bg-gray-50 flex items-center justify-center mb-6 text-gray-300">
            <Layers size={36} />
          </div>
          <h2 className="text-[24px] font-display font-bold text-charcoal mb-2 tracking-tight">No sessions yet</h2>
          <p className="text-[15px] text-gray-500 mb-8 text-center max-w-md leading-relaxed">
            Create your first recruitment drive to start collecting applications and parsing resumes intelligently.
          </p>
          <button 
            onClick={() => navigate('/dashboard/sessions/new')}
            className="bg-accent hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
          >
            Create your first session
          </button>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => navigate('/dashboard/sessions/new')}
        className="fixed bottom-10 right-10 z-50 bg-accent hover:bg-blue-700 text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.5)] hover:-translate-y-1 transition-all duration-300 rounded-[24px] px-6 py-4 flex items-center gap-2.5 font-bold text-[15px] group"
      >
        <Plus size={22} className="transform group-hover:rotate-90 transition-transform duration-300" />
        <span>Create Session</span>
      </button>
    </div>
  );
}
