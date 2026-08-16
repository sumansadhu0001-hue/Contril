import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  ShieldCheck, 
  Trash2, 
  Pin, 
  Download, 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Lock, 
  Plus, 
  CheckCircle2, 
  Tag, 
  Clock,
  Sparkles,
  Edit3
} from 'lucide-react';
import { MemoryEngine } from '../backend/memory/MemoryEngine';
import { ContextBuilder, MemoryCategorySettings } from '../backend/memory/ContextBuilder';
import { MemoryItem } from '../types';

interface MemoryVaultViewProps {
  onBack?: () => void;
}

export const MemoryVaultView: React.FC<MemoryVaultViewProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: 'mem-101',
      type: 'travel',
      title: 'Executive Flight Preference',
      snippet: 'Prefers IndiGo morning non-stop flights for domestic travel.',
      category: 'travel',
      pinned: true,
      timestamp: '2 days ago',
      tags: ['travel', 'flight', 'indigo']
    },
    {
      id: 'mem-102',
      type: 'travel',
      title: 'Hotel Proximity Preference',
      snippet: 'Selects 4-star or 5-star hotel stays within 2 km of meeting venue.',
      category: 'travel',
      pinned: true,
      timestamp: '1 week ago',
      tags: ['travel', 'hotel', 'proximity']
    },
    {
      id: 'mem-103',
      type: 'note',
      title: 'Laptop Comparison Target',
      snippet: 'MacBook Air M3 16GB RAM threshold target: ₹50,000.',
      category: 'shopping',
      pinned: false,
      timestamp: '3 weeks ago',
      tags: ['shopping', 'laptop', 'amazon']
    },
    {
      id: 'mem-104',
      type: 'note',
      title: 'Office Dining Preference',
      snippet: 'Prefers healthy salads and clean delivery from Swiggy / Social.',
      category: 'food',
      pinned: false,
      timestamp: '1 month ago',
      tags: ['food', 'swiggy', 'dining']
    }
  ]);

  const [privacySettings, setPrivacySettings] = useState<MemoryCategorySettings>({
    conversationEnabled: true,
    workspaceEnabled: true,
    shoppingEnabled: true,
    foodEnabled: true,
    travelEnabled: true,
    automationEnabled: true
  });

  const categories = [
    { id: 'all', label: 'All Memories' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'travel', label: 'Travel' },
    { id: 'food', label: 'Food' },
    { id: 'conversation', label: 'Conversation' },
    { id: 'automation', label: 'Automation' }
  ];

  const filteredMemories = memories.filter(m => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleCategoryPrivacy = (catKey: keyof MemoryCategorySettings) => {
    setPrivacySettings(prev => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const togglePin = (id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };

  const exportMemories = () => {
    const jsonStr = JSON.stringify(memories, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contril-memory-vault-export-${Date.now()}.json`;
    a.click();
  };

  const deleteAllMemories = () => {
    if (confirm('Are you sure you want to permanently delete all stored AI memories? This action cannot be undone.')) {
      setMemories([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div>
          {onBack && (
            <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
              ← Back to Overview
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[#00BFA6]" />
            <span>Personal Intelligence & Memory Vault</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Transparent, user-controlled long-term memory graph with category privacy controls.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportMemories}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Export Memories</span>
          </button>

          <button
            onClick={deleteAllMemories}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All</span>
          </button>
        </div>
      </div>

      {/* Category Privacy Controls Bar */}
      <div className="max-w-7xl mx-auto p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00BFA6]" />
            <h3 className="text-sm font-semibold text-white">Memory Category Privacy Controls</h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">100% User Revocable</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          {[
            { key: 'workspaceEnabled', label: 'Workspace' },
            { key: 'shoppingEnabled', label: 'Shopping' },
            { key: 'travelEnabled', label: 'Travel' },
            { key: 'foodEnabled', label: 'Food' },
            { key: 'conversationEnabled', label: 'Conversation' },
            { key: 'automationEnabled', label: 'Automation' }
          ].map((item) => {
            const isEnabled = privacySettings[item.key as keyof MemoryCategorySettings];
            return (
              <button
                key={item.key}
                onClick={() => toggleCategoryPrivacy(item.key as keyof MemoryCategorySettings)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/[0.02] border-white/[0.06] text-neutral-500'
                }`}
              >
                <span>{item.label}</span>
                {isEnabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-neutral-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#00BFA6] text-black font-semibold shadow-md'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 border border-white/[0.06]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search memory vault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6]/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Memories Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            className={`rounded-2xl p-5 bg-[#0D0D11] border transition-all flex flex-col justify-between space-y-4 ${
              mem.pinned
                ? 'border-[#00BFA6]/40 shadow-[0_0_20px_rgba(0,191,166,0.08)]'
                : 'border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/[0.04] text-neutral-300 border border-white/[0.08]">
                  {mem.category}
                </span>

                <button
                  onClick={() => togglePin(mem.id)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    mem.pinned
                      ? 'bg-[#00BFA6]/15 text-[#00BFA6] border-[#00BFA6]/30'
                      : 'bg-white/[0.02] text-neutral-500 border-white/[0.04] hover:text-white'
                  }`}
                  title={mem.pinned ? 'Unpin Memory' : 'Pin Memory'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">{mem.title}</h3>
                <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">{mem.snippet}</p>
              </div>

              {mem.tags && mem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {mem.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.04] text-[9px] font-mono text-neutral-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-500">
              <span>{mem.timestamp}</span>

              <button
                onClick={() => deleteMemory(mem.id)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete Memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
