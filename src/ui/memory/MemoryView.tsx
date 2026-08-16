import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Search, 
  Sparkles, 
  Loader2, 
  Trash2, 
  Edit3, 
  PauseCircle, 
  PlayCircle,
  User, 
  Settings2, 
  Briefcase
} from 'lucide-react';
import { MemoryItem } from '../../types';
import { ContrilApiClient } from '../../lib/apiClient';

interface MemoryViewProps {
  memoryItems: MemoryItem[];
  onOpenSettings?: () => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({ memoryItems, onOpenSettings }) => {
  const [localItems, setLocalItems] = useState<MemoryItem[]>(memoryItems);
  const [naturalQuery, setNaturalQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{ answer: string; sources: string[] } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [isMemoryPaused, setIsMemoryPaused] = useState(false);

  useEffect(() => {
    setLocalItems(memoryItems);
  }, [memoryItems]);

  const saveToStorage = (updated: MemoryItem[]) => {
    try {
      localStorage.setItem('contril_user_memory_bank_v1', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleForget = (id: string) => {
    const updated = localItems.filter(item => item.id !== id);
    setLocalItems(updated);
    saveToStorage(updated);
  };

  const handleClearMemory = () => {
    if (window.confirm('Are you sure you want to clear all indexed memories? This cannot be undone.')) {
      setLocalItems([]);
      saveToStorage([]);
    }
  };

  const handleStartEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditingContent(item.content || item.snippet || item.title);
  };

  const handleSaveEdit = (id: string) => {
    const updated = localItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          content: editingContent,
          snippet: editingContent.substring(0, 150)
        };
      }
      return item;
    });
    setLocalItems(updated);
    saveToStorage(updated);
    setEditingId(null);
  };

  const handleNaturalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setIsSearching(true);
    try {
      const data = await ContrilApiClient.postAiMemorySearch(naturalQuery, localItems);
      setAiAnswer({
        answer: data.answer || 'Found relevant memory context.',
        sources: data.sources || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const memoryCategories = [
    { id: 'all', label: 'All Knowledge', icon: BrainCircuit },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
    { id: 'people', label: 'Key Contacts', icon: User },
    { id: 'projects', label: 'Projects', icon: Briefcase }
  ];

  const filteredItems = localItems.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'preferences') {
      return item.category?.toLowerCase() === 'preferences' || 
             item.tags.some(t => t.toLowerCase().includes('pref') || t.toLowerCase().includes('setting'));
    }
    if (activeCategory === 'people') {
      return item.category?.toLowerCase() === 'people' ||
             item.tags.some(t => t.toLowerCase().includes('contact') || t.toLowerCase().includes('user'));
    }
    if (activeCategory === 'projects') {
      return item.category?.toLowerCase() === 'projects' ||
             item.tags.some(t => t.toLowerCase().includes('project') || t.toLowerCase().includes('work'));
    }
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8 text-left bg-[#F7FAFF] dark:bg-[#070A0F]">
      
      {/* Top Header & Global Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-white/[0.08] pb-6">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            LONG-TERM KNOWLEDGE
          </div>
          <h1 className="text-3xl font-light text-[#0F172A] dark:text-white tracking-tight">
            What Contril Remembers
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Personal preferences, key relationships, executive decisions, and context.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMemoryPaused(!isMemoryPaused)}
            className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
              isMemoryPaused
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-[#0D1117] border-[#E2E8F0] dark:border-white/[0.08] text-[#0F172A] dark:text-[#F8FAFC]'
            }`}
          >
            {isMemoryPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
            <span>{isMemoryPaused ? 'Resume Memory' : 'Pause Memory'}</span>
          </button>

          <button
            onClick={handleClearMemory}
            className="h-9 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Memory</span>
          </button>
        </div>
      </div>

      {/* AI Natural Language Query */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Query Memory Bank</span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Ask questions in plain English across all indexed decisions and context.
          </p>
        </div>

        <form onSubmit={handleNaturalSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              placeholder="e.g. What are my preferences for morning meetings?"
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.06] text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !naturalQuery.trim()}
            className="px-6 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Ask Contril</span>
          </button>
        </form>

        {aiAnswer && (
          <div className="p-4 rounded-2xl bg-[#F0F6FF] dark:bg-blue-950/30 border border-[#E2E8F0] dark:border-blue-900/40 text-xs text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed animate-fade-in space-y-2">
            <div className="font-semibold text-[#2563EB] dark:text-[#3B82F6] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Synthesized Memory Answer</span>
            </div>
            <p>{aiAnswer.answer}</p>
          </div>
        )}
      </div>

      {/* Memory Category Filters & Entries */}
      <div className="space-y-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {memoryCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.06] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F0F6FF] dark:hover:bg-[#161F30]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Entries List */}
        <div className="bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none divide-y divide-[#E2E8F0] dark:divide-white/[0.04]">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
              <div className="space-y-1.5 flex-1">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 border text-xs rounded-lg text-[#64748B]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#F8FAFC] font-normal leading-relaxed">
                      {item.content || item.snippet || item.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      <span className="uppercase text-[#2563EB] dark:text-[#3B82F6] font-semibold">{item.type}</span>
                      <span>•</span>
                      <span>Source: {item.source || 'Contril Ingestion'}</span>
                      <span>•</span>
                      <span>Indexed {item.timestamp || 'Recently'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              {editingId !== item.id && (
                <div className="flex items-center gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F0F6FF] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Edit Knowledge"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleForget(item.id)}
                    className="p-2 rounded-xl text-[#64748B] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Forget Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No memory entries saved in this category.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
