import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Ticket, 
  MessageCircle, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Mail, 
  Globe 
} from 'lucide-react';

export const SupportCenterView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  const faqs = [
    { q: 'How does Contril preserve memory privacy?', a: 'All memories are stored in your user-isolated RAG vector enclave with 100% real-time revocable permissions.' },
    { q: 'What is the difference between Pro and Business plans?', a: 'Pro (₹499/mo) includes personal RAG memory & Unlimited Chat. Business (₹1,799/mo) includes multi-tenant team workspaces, RBAC, and developer keys.' },
    { q: 'How do domain connectors work?', a: 'Connectors link your Google Workspace, Slack, and GitHub channels securely using OAuth2 tokens encrypted at rest.' }
  ];

  const filteredFaqs = faqs.filter(f => !searchQuery || f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="py-6 max-w-5xl mx-auto w-full space-y-8 font-sans text-white">
      
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-[#111114] border border-white/[0.08] space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono text-[#00BFA6]">Public Beta Support</span>
            <h1 className="text-3xl font-light text-white">Contril Support & Knowledge Enclave</h1>
            <p className="text-xs text-neutral-400 font-light">Search knowledge base articles, FAQs, or launch live chat with executive support engineers.</p>
          </div>

          <button
            onClick={() => setIsLiveChatOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs font-mono flex items-center gap-2 cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Launch Live Chat</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search FAQs, API docs, and knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#17171B] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6] font-mono"
          />
        </div>
      </div>

      {/* FAQs Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <BookOpen className="w-5 h-5 text-[#00BFA6]" />
          <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
              <h3 className="font-semibold text-white">{faq.q}</h3>
              <p className="text-neutral-400 font-light leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Chat Modal Simulation */}
      {isLiveChatOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 font-sans animate-modal-overlay">
          <div className="w-full max-w-md bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-6 relative space-y-4 text-white font-mono text-xs backdrop-blur-xl animate-modal-content">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Contril Support Engineer</h3>
              </div>
              <button onClick={() => setIsLiveChatOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <p className="text-neutral-300">Live agent connected. How can we assist your workspace today?</p>
          </div>
        </div>
      )}

    </div>
  );
};
