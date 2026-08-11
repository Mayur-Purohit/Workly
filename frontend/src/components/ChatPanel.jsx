"use client";

import { useState, useEffect, useRef } from 'react';
import { Trash2, ChevronRight, Sparkles, MessageSquareText } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useCandidateStore } from '../stores/candidateStore';
import { chatAPI } from '../lib/api';
import { AIInputWithLoading } from './ui/ai-input-with-loading';

export default function ChatPanel({ sessionId, fullWidth = false }) {
  const { isOpen, toggleChat, history, addMessage, setHistory, clearHistory } = useChatStore();
  const { setHighlightedIdsWithTimeout } = useCandidateStore();
  
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;
    chatAPI.getHistory(sessionId)
      .then(h => {
        if(h && Array.isArray(h)) {
          setHistory(h.map(m => ({
            role: m.role,
            content: m.content,
            referenced: m.referenced_candidate_ids || []
          })));
        }
      })
      .catch(err => console.error("Could not load chat history:", err));
  }, [sessionId, setHistory]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, loading, isOpen]);

  const handleSend = async (msgText) => {
    if (!msgText || !msgText.trim() || loading) return;
    
    const msg = msgText.trim();
    addMessage({ role: "user", content: msg, referenced: [] });
    setLoading(true);
    
    try {
      const payloadHistory = history.slice(-10).map(h => ({ role: h.role, content: h.content }));
      const data = await chatAPI.send(sessionId, {
        message: msg,
        history: payloadHistory
      });
      
      const referenced = data.referenced_candidates || [];
      addMessage({ role: "assistant", content: data.reply, referenced });
      
      if (referenced.length > 0) {
        setHighlightedIdsWithTimeout(referenced, 5000);
      }
    } catch (e) {
      addMessage({ role: "assistant", content: "Sorry, I had trouble processing that. Try again.", referenced: [] });
    } finally {
      setLoading(false);
    }
  };

  const formatMessageText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      let formattedLine = line;
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (formattedLine.trim().startsWith('- ')) {
        formattedLine = `<li class="ml-4 list-disc">${formattedLine.slice(2)}</li>`;
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} className={formattedLine.includes('<li') ? 'block' : 'block min-h-[0.5em]'} />;
    });
  };

  const clearChat = async () => {
    if(window.confirm("Clear chat history?")) {
      try {
        await chatAPI.clear(sessionId);
        clearHistory();
      } catch(e) {
        clearHistory();
      }
    }
  };

  if (!isOpen && !fullWidth) {
    return (
      <div 
        onClick={toggleChat}
        className="w-16 h-full bg-white border-l border-gray-200 shadow-sm flex flex-col items-center py-6 cursor-pointer hover:bg-slate-50 flex-shrink-0 transition-all group z-50"
      >
        <div className="w-10 h-10 rounded-full bg-[var(--google-blue)] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform google-shadow">
          <Sparkles size={18} />
        </div>
        <div className="flex-1 relative w-full flex justify-center">
          <div className="absolute top-1/3 -rotate-90 text-[13px] font-bold tracking-widest uppercase text-slate-400 whitespace-nowrap group-hover:text-[var(--google-blue)] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
            AI Assistant
          </div>
        </div>
        <div className="w-1.5 h-12 rounded-full bg-slate-200 mt-auto group-hover:bg-[var(--google-blue)] transition-colors"></div>
      </div>
    );
  }

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-[380px] border-l border-gray-200 google-shadow-lg'} h-full bg-[#f8f9fa] flex flex-col flex-shrink-0 transition-all duration-300 z-50 relative`}>
      
      {/* HEADER - Google Material Design */}
      <div className="px-5 py-4 bg-white flex justify-between items-center z-10 shrink-0 border-b border-gray-100 google-shadow">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[var(--google-blue)]">
            <Sparkles size={18} className="fill-blue-100" />
          </div>
          <span className="font-bold tracking-tight text-[17px] text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>
            AI Recruiter
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <button onClick={clearChat} className="p-2 rounded-full hover:text-[var(--google-red)] hover:bg-red-50 transition-colors" title="Clear History">
            <Trash2 size={18} />
          </button>
          {!fullWidth && (
            <button onClick={toggleChat} className="p-2 rounded-full hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Collapse">
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#f8f9fa]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-white google-shadow flex items-center justify-center mb-6">
              <Sparkles size={32} className="text-[var(--google-blue)] fill-blue-50" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-xl" style={{ fontFamily: 'var(--font-display)' }}>How can I help?</h3>
            <p className="text-slate-500 text-[14px] max-w-[250px] leading-relaxed">Ask me to filter candidates, find specific skills, or summarize profiles.</p>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {history.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] text-[14.5px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[var(--google-blue)] text-white px-5 py-3 rounded-2xl rounded-br-sm' 
                    : 'bg-white border border-gray-100 text-slate-800 px-5 py-3 rounded-2xl rounded-bl-sm google-shadow'
                }`}>
                  {formatMessageText(msg.content)}
                </div>
                {msg.role === 'assistant' && msg.referenced?.length > 0 && (
                  <button 
                    onClick={() => setHighlightedIdsWithTimeout(msg.referenced, 5000)}
                    className="mt-2.5 ml-2 rounded-full bg-blue-50/80 border border-blue-100 text-[var(--google-blue)] px-3.5 py-1.5 text-[12px] font-semibold hover:bg-blue-100 hover:border-blue-200 transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--google-blue)]"></span>
                    Highlighting {msg.referenced.length} candidate{msg.referenced.length !== 1 && 's'}
                  </button>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-bl-sm google-shadow flex items-center gap-1.5 h-[44px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" style={{animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "0ms"}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" style={{animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "150ms"}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" style={{animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "300ms"}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <AIInputWithLoading 
          onSubmit={handleSend}
          placeholder="Message AI Recruiter..."
          minHeight={48}
          maxHeight={140}
          loadingDuration={500}
        />
      </div>
    </div>
  );
}
