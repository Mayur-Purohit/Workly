import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, MessageSquareText, ChevronDown, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { sessionsAPI } from '../lib/api';
import ChatPanel from '../components/ChatPanel';

export default function AiRecruiterPage() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions-list'],
    queryFn: () => sessionsAPI.list(),
  });

  const sessionList = Array.isArray(sessions) ? sessions : (sessions?.sessions || []);

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-8">
      {/* Header - Material 3 Style */}
      <header className="mb-10 pt-4">
        <h1 className="font-display text-[32px] sm:text-[36px] font-bold text-charcoal tracking-tight leading-tight">
          AI Recruiter
        </h1>
        <p className="text-gray-500 text-[15px] mt-1.5 max-w-2xl">
          Chat with your intelligent assistant to query, filter, and deeply analyze candidates within any of your active recruitment sessions.
        </p>
      </header>

      {/* Session Selector - Elevated Tonal Surface */}
      <div className="mb-8 relative z-10">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 block ml-1">Select Session context</label>
        <div className="relative max-w-[480px]">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className={`w-full flex items-center justify-between gap-4 px-5 py-4 bg-white rounded-[20px] transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 ${dropdownOpen ? 'ring-2 ring-accent/20 border-accent/30' : 'hover:border-gray-200'}`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center transition-colors ${selectedSession ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                <Layers size={18} />
              </div>
              <span className={`text-[15px] font-bold transition-colors ${selectedSession ? 'text-charcoal' : 'text-gray-400'}`}>
                {selectedSession ? (selectedSession.title || selectedSession.job_title || 'Untitled Session') : 'Choose a session to begin...'}
              </span>
            </div>
            <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-accent' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 max-h-[320px] overflow-y-auto p-2">
              {isLoading ? (
                <div className="px-5 py-4 text-[14px] font-medium text-gray-400 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-accent animate-spin"></div> Loading...
                </div>
              ) : sessionList.length === 0 ? (
                <div className="px-5 py-4 text-[14px] font-medium text-gray-400 text-center">No sessions found. Please create one in the Dashboard.</div>
              ) : (
                sessionList.map(s => {
                  const isSelected = selectedSession?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSession(s); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3.5 rounded-[16px] transition-all duration-200 flex items-center gap-4 ${isSelected ? 'bg-indigo-50/70 text-indigo-700' : 'hover:bg-[#F8F9FA] text-gray-700'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Layers size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block truncate text-[14px] ${isSelected ? 'font-bold' : 'font-semibold'}`}>
                          {s.title || s.job_title || 'Untitled'}
                        </span>
                        {s.job_title && s.title !== s.job_title && (
                          <span className={`text-[12px] block truncate mt-0.5 ${isSelected ? 'text-indigo-500/80' : 'text-gray-400'}`}>
                            {s.job_title}
                          </span>
                        )}
                      </div>
                      {isSelected && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area - Filled Elevated Container */}
      {selectedSession ? (
        <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-[0_2px_24px_rgba(0,0,0,0.04)] flex flex-col" style={{ height: 'calc(100vh - 360px)', minHeight: '500px' }}>
          <div className="bg-[#F8F9FA] px-6 py-4 border-b border-gray-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
               <Sparkles size={14} />
             </div>
             <div>
               <div className="text-[13px] font-bold text-charcoal">AI Assistant Active</div>
               <div className="text-[11px] font-medium text-gray-500">Context: {selectedSession.job_title}</div>
             </div>
          </div>
          <div className="flex-1 relative w-full h-full min-h-0">
            <ChatPanel sessionId={selectedSession.id} fullWidth={true} />
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-[32px] p-20 text-center shadow-[0_2px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-[88px] h-[88px] rounded-[24px] bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-8 relative">
            <Bot size={40} className="text-indigo-600" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <h3 className="font-display font-bold text-[24px] text-charcoal mb-3 tracking-tight">AI Ready to Assist</h3>
          <p className="text-gray-500 text-[15px] max-w-[420px] mx-auto leading-relaxed">
            Please select a recruitment session from the dropdown above to provide context for the AI. You can ask complex questions about your candidates, compare their skills, and make data-driven hiring decisions.
          </p>
        </div>
      )}
    </div>
  );
}
