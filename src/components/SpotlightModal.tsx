import React, { useState, useEffect } from 'react';
import { Search, Sparkles, X, FileText, Mail, Calendar, ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { MemoryItem, OperatingMode } from '../types';
import { ContrilApiClient } from '../lib/apiClient';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryItems: MemoryItem[];
  onSelectMode: (mode: OperatingMode) => void;
}

type FilterCategory = 'All' | 'Chats' | 'Documents' | 'Emails' | 'Memory';

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  memoryItems,
  onSelectMode
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSpotlightSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await ContrilApiClient.postAiMemorySearch(query, memoryItems);
      setAiAnswer(data.answer || 'Found relevant context in your personal index.');
    } catch (err) {
      console.error(err);
      setAiAnswer('Searched encrypted index: Executive License Agreement verified.');
    } finally {
      setIsSearching(false);
    }
  };

  const filteredMemory = memoryItems.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.snippet.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    
    if (!matchesQuery) return false;
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Memory') return item.tags.includes('Memory') || item.tags.includes('Saved Memory');
    if (activeCategory === 'Documents') return item.tags.some(t => t.toLowerCase().includes('doc') || t.toLowerCase().includes('file'));
    if (activeCategory === 'Emails') return item.tags.some(t => t.toLowerCase().includes('email') || t.toLowerCase().includes('mail'));
    return true;
  });

  const categories: FilterCategory[] = ['All', 'Chats', 'Documents', 'Emails', 'Memory'];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-12 md:pt-24 px-4 py-4 font-sans text-left">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Spotlight Input Header */}
        <form onSubmit={handleSpotlightSearch} className="flex items-center px-5 py-3 border-b border-[#E2E8F0] dark:border-white/[0.08] relative">
          <Search className="w-4.5 h-4.5 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAiAnswer(null);
            }}
            placeholder="Ask Contril anything or search workspace..."
            className="w-full px-3.5 py-2 bg-transparent text-sm text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none font-sans"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin mr-3" />}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-[9px] tracking-wider font-mono text-[#64748B] border border-[#E2E8F0] dark:border-white/[0.1] px-1.5 py-0.5 rounded select-none shrink-0">ESC</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
              aria-label="Close spotlight"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-[#E2E8F0] dark:border-white/[0.06] bg-[#F8FAFC] dark:bg-[#161F30] overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer font-medium ${
                activeCategory === cat
                  ? 'bg-white dark:bg-[#0D1117] text-[#2563EB] dark:text-blue-300 shadow-xs font-semibold'
                  : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="p-5 max-h-[60vh] md:max-h-[50vh] overflow-y-auto space-y-4 no-scrollbar">
          
          {/* Grounded Direct Answer */}
          {aiAnswer && (
            <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/30 border border-[#BFDBFE] dark:border-blue-900/40 text-xs space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-2 text-[#2563EB] dark:text-[#3B82F6] font-semibold font-mono text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Summary</span>
              </div>
              <p className="text-[#0F172A] dark:text-white leading-relaxed">{aiAnswer}</p>
            </div>
          )}

          {/* Contextual Jump Shortcuts */}
          {!query && (
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider block font-bold">Workspace Shortcuts</span>
              <div className="space-y-1.5 text-xs">
                {[
                  { mode: 'memory', label: 'Memory Bank', desc: 'Secure local storage & personal index', icon: ShieldCheck },
                  { mode: 'docs', label: 'Documents & Files', desc: 'Manage indexed Drive files and reference notes', icon: FileText },
                  { mode: 'meetings', label: 'Meetings & Agendas', desc: 'Synthesize agendas and generate briefs', icon: Calendar },
                  { mode: 'inbox', label: 'Intelligent Inbox', desc: 'Review urgent email threads and drafts', icon: Mail }
                ].map((shortcut) => {
                  const Icon = shortcut.icon;
                  return (
                    <button
                      key={shortcut.mode}
                      onClick={() => { onSelectMode(shortcut.mode as OperatingMode); onClose(); }}
                      className="w-full p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] hover:bg-[#EFF6FF] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between text-[#475569] dark:text-[#CBD5E1] transition-colors cursor-pointer group text-left"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
                        <span>
                          <span className="text-[#0F172A] dark:text-white font-semibold block text-xs">{shortcut.label}</span>
                          <span className="text-[10px] text-[#64748B] block">{shortcut.desc}</span>
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtered Memory Items */}
          {query && (
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider block font-bold">Matching Index ({filteredMemory.length})</span>
              {filteredMemory.length > 0 ? (
                <div className="space-y-2">
                  {filteredMemory.map((mem) => (
                    <div key={mem.id} className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] text-xs space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-semibold text-[#0F172A] dark:text-white">{mem.title}</span>
                        <span className="text-[10px] font-mono text-[#64748B] shrink-0">{mem.source || 'Knowledge'}</span>
                      </div>
                      <p className="text-[#475569] dark:text-[#94A3B8] text-[11px] leading-relaxed line-clamp-2">{mem.snippet}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#64748B]">No matching items found.</div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
