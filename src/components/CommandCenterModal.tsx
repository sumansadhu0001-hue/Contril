import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Command, 
  Sparkles, 
  X, 
  ArrowRight, 
  FileText, 
  Mail, 
  Video, 
  BrainCircuit, 
  Loader2 
} from 'lucide-react';
import { NavigationTab } from '../types';
import { ContrilApiClient } from '../lib/apiClient';

interface CommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const CommandCenterModal: React.FC<CommandCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    resultText: string;
    quickLinks: Array<{ label: string; module: NavigationTab }>;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const data = await ContrilApiClient.postAiCommand(query);
      setSearchResult({
        resultText: data.resultText || `Found executive context matching "${query}".`,
        quickLinks: data.quickLinks || [
          { label: 'View in Memory Bank', module: 'memory' },
          { label: 'View in Document Brain', module: 'document_brain' }
        ]
      });
    } catch (err) {
      console.error(err);
      setSearchResult({
        resultText: `Searching Contril vault for "${query}"...`,
        quickLinks: [{ label: 'Open Memory Bank', module: 'memory' }]
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-[#121418] border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Search Header */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center px-4 h-14 border-b border-white/10">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search emails, contracts, meetings, flights..."
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-neutral-500 font-sans"
            autoFocus
          />
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin ml-2" />
          ) : (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10px] text-neutral-500 font-mono">ESC to exit</span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>

        {/* Dynamic Search Results or Quick Actions */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {searchResult ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-neutral-300 leading-relaxed">
                <div className="flex items-center gap-2 font-medium text-amber-400 mb-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Contril Intelligence Synthesis</span>
                </div>
                <p>{searchResult.resultText}</p>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-neutral-400 mb-2">
                  Matching Context & Quick Navigation
                </div>
                <div className="space-y-1.5">
                  {searchResult.quickLinks?.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(link.module as NavigationTab);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] transition-all text-xs text-neutral-200 group"
                    >
                      <span className="font-medium group-hover:text-white">{link.label}</span>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-amber-400">
                        <span>Open module</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase text-neutral-400">
                Quick Executive Operations
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onNavigate('daily_brief'); onClose(); }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] text-xs text-left transition-all group"
                >
                  <Command className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="block font-medium text-white group-hover:text-amber-300">View Daily AI Brief</span>
                    <span className="text-[10px] text-neutral-400">3 meetings, 2 approvals</span>
                  </div>
                </button>

                <button
                  onClick={() => { onNavigate('inbox'); onClose(); }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] text-xs text-left transition-all group"
                >
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="block font-medium text-white group-hover:text-blue-300">AI Priority Inbox</span>
                    <span className="text-[10px] text-neutral-400">Pre-drafted executive replies</span>
                  </div>
                </button>

                <button
                  onClick={() => { onNavigate('meetings'); onClose(); }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] text-xs text-left transition-all group"
                >
                  <Video className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="block font-medium text-white group-hover:text-purple-300">Meeting Intelligence</span>
                    <span className="text-[10px] text-neutral-400">Transcripts & Decisions</span>
                  </div>
                </button>

                <button
                  onClick={() => { onNavigate('document_brain'); onClose(); }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] text-xs text-left transition-all group"
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block font-medium text-white group-hover:text-emerald-300">Document Brain</span>
                    <span className="text-[10px] text-neutral-400">Contract clause analysis</span>
                  </div>
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 text-[11px] text-neutral-500 flex justify-between items-center">
                <span>Tip: Search "Samsung" or "Board Review" for instant grounding</span>
                <span className="font-mono">Contril OS v3.0 Executive</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
