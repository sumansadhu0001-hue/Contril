import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Search, 
  Sparkles, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { MemoryItem } from '../types';
import { ServiceLogo } from './ServiceLogo';
import { ContrilApiClient } from '../lib/apiClient';

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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalItems(memoryItems);
  }, [memoryItems]);

  const saveToStorage = (updatedItems: MemoryItem[]) => {
    try {
      localStorage.setItem('contril_user_memory_bank_v1', JSON.stringify(updatedItems));
    } catch (e) {
      console.error('Failed to save memory items to storage', e);
    }
  };

  const handleForget = (itemId: string) => {
    const updated = localItems.filter(item => item.id !== itemId);
    setLocalItems(updated);
    saveToStorage(updated);
  };

  const handleStartEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditingContent(item.content || item.snippet || item.title);
  };

  const handleSaveEdit = (itemId: string) => {
    const updated = localItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          content: editingContent,
          snippet: editingContent.substring(0, 150),
        };
      }
      return item;
    });
    setLocalItems(updated);
    saveToStorage(updated);
    setEditingId(null);
  };

  const handleView = (itemId: string) => {
    const next = new Set(expandedIds);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setExpandedIds(next);
  };

  const handleNaturalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setIsSearching(true);
    try {
      const data = await ContrilApiClient.postAiMemorySearch(naturalQuery, localItems);
      setAiAnswer({
        answer: data.answer || 'Found relevant memory entries.',
        sources: data.sources || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!localItems || localItems.length === 0) {
    return (
      <div className="w-full min-h-[60vh] md:min-h-[80vh] flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 font-sans bg-[#070709]">
        <div className="max-w-xl w-full p-6 sm:p-10 md:p-14 border border-white/[0.08] text-center space-y-8 bg-[#070709]">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 border border-white/[0.08] flex items-center justify-center">
              <ServiceLogo id="notion" size={24} />
            </div>
            <div className="w-12 h-12 border border-white/[0.08] flex items-center justify-center">
              <ServiceLogo id="linear" size={24} />
            </div>
            <div className="w-12 h-12 border border-white/[0.08] flex items-center justify-center">
              <ServiceLogo id="slack" size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00BFA6] font-mono">
              Indexed Knowledge
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
              No Workspace Memory Saved
            </h2>
            <p className="text-sm text-neutral-400 font-normal leading-relaxed max-w-sm mx-auto">
              Your memory bank indexes key decisions, user preferences, and project context across your connected tools automatically.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onOpenSettings}
              className="h-11 px-5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Connect Services in Settings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const memoryCategories = [
    { id: 'all', label: 'All Knowledge' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'people', label: 'Key Contacts' },
    { id: 'projects', label: 'Projects' },
    { id: 'history', label: 'History' }
  ];

  const getCategoryCount = (catId: string) => {
    if (catId === 'all' || catId === 'history') return localItems.length;
    return localItems.filter(item => {
      if (catId === 'preferences') {
        return item.category?.toLowerCase() === 'preferences' || 
               item.tags.some(t => t.toLowerCase().includes('pref') || t.toLowerCase().includes('setting')) ||
               item.type === 'travel';
      }
      if (catId === 'people') {
        return item.category?.toLowerCase() === 'people' ||
               item.tags.some(t => t.toLowerCase().includes('contact') || t.toLowerCase().includes('people') || t.toLowerCase().includes('user'));
      }
      if (catId === 'projects') {
        return item.category?.toLowerCase() === 'projects' ||
               item.tags.some(t => t.toLowerCase().includes('project') || t.toLowerCase().includes('work') || t.toLowerCase().includes('milestone'));
      }
      return false;
    }).length;
  };

  const filteredItems = localItems.filter(item => {
    if (activeCategory === 'all' || activeCategory === 'history') return true;
    if (activeCategory === 'preferences') {
      return item.category?.toLowerCase() === 'preferences' || 
             item.tags.some(t => t.toLowerCase().includes('pref') || t.toLowerCase().includes('setting')) ||
             item.type === 'travel';
    }
    if (activeCategory === 'people') {
      return item.category?.toLowerCase() === 'people' ||
             item.tags.some(t => t.toLowerCase().includes('contact') || t.toLowerCase().includes('people') || t.toLowerCase().includes('user'));
    }
    if (activeCategory === 'projects') {
      return item.category?.toLowerCase() === 'projects' ||
             item.tags.some(t => t.toLowerCase().includes('project') || t.toLowerCase().includes('work') || t.toLowerCase().includes('milestone'));
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white font-sans py-4 sm:py-10 md:py-16">
      {/* Centered Content Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-10 space-y-8 sm:space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
              Memory
            </h1>
            <p className="text-sm text-neutral-400 font-normal leading-relaxed">
              Your indexed workspace knowledge, partner decisions, and executive context in one place.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#00BFA6] bg-[#00BFA6]/5 px-3 py-1.5 border border-[#00BFA6]/10">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>{localItems.length} Entries Indexed</span>
          </div>
        </div>

        {/* AI Natural Language Memory Query */}
        <div className="py-6 border-b border-white/[0.08] space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
              Query Memory
            </h2>
            <p className="text-xs text-neutral-400">
              Ask natural language questions across all indexed notes, board emails, and project records.
            </p>
          </div>

          <form onSubmit={handleNaturalSearch} className="flex flex-col sm:flex-row items-stretch gap-2 max-w-3xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={naturalQuery}
                onChange={e => setNaturalQuery(e.target.value)}
                placeholder="e.g. What were the key terms agreed for Tokyo office lease?"
                className="w-full h-11 pl-11 pr-4 bg-white/[0.02] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#00BFA6] transition-colors font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || !naturalQuery.trim()}
              className="h-11 px-5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Ask AI</span>
            </button>
          </form>

          {aiAnswer && (
            <div className="mt-4 p-4 border-l-2 border-[#00BFA6] bg-white/[0.01] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00BFA6] font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Memory Response</span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">{aiAnswer.answer}</p>
            </div>
          )}
        </div>

        {/* Category Filters & Items */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-y-2 border-b border-white/[0.08] pb-2 text-xs font-mono tracking-wider uppercase">
            {memoryCategories.map((cat, idx) => (
              <React.Fragment key={cat.id}>
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className={`pb-2 relative transition-colors cursor-pointer ${
                    activeCategory === cat.id ? 'text-[#00BFA6]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>{cat.label} ({getCategoryCount(cat.id)})</span>
                  {activeCategory === cat.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#00BFA6]" />
                  )}
                </button>
                {idx < memoryCategories.length - 1 && (
                  <span className="mx-4 text-white/[0.12] pb-2 select-none">/</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Memory Items List */}
          <div className="divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="py-5 flex flex-col md:flex-row md:items-start justify-between gap-4 group transition-colors hover:bg-white/[0.01] px-2"
              >
                <div className="flex-1 space-y-2">
                  {editingId === item.id ? (
                    <div className="w-full space-y-3 py-1">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-3 bg-white/[0.02] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#00BFA6] font-sans"
                        rows={3}
                      />
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-1.5 text-xs bg-white hover:bg-neutral-200 text-black transition-colors font-medium cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-200 leading-relaxed font-normal">
                        {item.content || item.snippet || item.title}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 font-mono">
                        <span className="text-neutral-400 uppercase tracking-wider">{item.type}</span>
                        <span>•</span>
                        <span>Source: {item.source || item.type}</span>
                        <span>•</span>
                        <span>Indexed {item.timestamp}</span>
                      </div>
                    </>
                  )}

                  {expandedIds.has(item.id) && !editingId && (
                    <div className="mt-3 p-4 bg-white/[0.01] border border-white/[0.04] text-xs text-neutral-300 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-neutral-500 uppercase tracking-wider font-mono">
                        <span>Detailed Context</span>
                        <span>ID: {item.id}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">
                        {item.content || item.snippet || item.title}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-mono text-[#00BFA6] bg-[#00BFA6]/5 px-2 py-0.5 border border-[#00BFA6]/10">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Column */}
                {!editingId && (
                  <div className="flex items-center gap-4 text-xs font-mono md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity self-end md:self-start">
                    <button
                      onClick={() => handleView(item.id)}
                      className="min-h-[36px] px-2 text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center"
                    >
                      {expandedIds.has(item.id) ? 'Collapse' : 'View'}
                    </button>
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="min-h-[36px] px-2 text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleForget(item.id)}
                      className="min-h-[36px] px-2 text-neutral-400 hover:text-[#00BFA6] transition-colors cursor-pointer flex items-center"
                    >
                      Forget
                    </button>
                  </div>
                )}
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-neutral-500 font-sans">No matching entries found in this category.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
