import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Star, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  Zap, 
  Layers, 
  Palette, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { ExtensionItem, MarketplaceCategory } from '../backend/marketplace/MarketplaceService';
import { ExtensionDetailModal } from './ExtensionDetailModal';

interface MarketplaceViewProps {
  onBack?: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExtension, setSelectedExtension] = useState<ExtensionItem | null>(null);

  const [extensions, setExtensions] = useState<ExtensionItem[]>([
    {
      id: 'ext-101',
      name: 'Executive Legal & Contract Agent',
      category: 'ai_agents',
      type: 'agent',
      version: '1.2.0',
      developerName: 'Contril Labs',
      description: 'Specialist AI agent for analyzing contract risks, NDA clause extraction, and regulatory compliance.',
      permissions: ['Workspace Access', 'Memory Access', 'AI Access'],
      capabilities: ['file_analysis', 'clause_extraction'],
      downloadsCount: 14200,
      rating: 4.9,
      isFeatured: true,
      isVerified: true,
      isEnterprisePrivate: false,
      status: 'published'
    },
    {
      id: 'ext-102',
      name: 'Google Workspace Power Connector',
      category: 'workspace',
      type: 'connector',
      version: '2.1.0',
      developerName: 'Google Partner Network',
      description: 'Direct bi-directional sync for Gmail, Google Calendar, Drive, Docs, and Google Meet briefings.',
      permissions: ['Workspace Access', 'Notifications', 'Background Tasks'],
      capabilities: ['search', 'sync', 'execute'],
      downloadsCount: 89000,
      rating: 5.0,
      isFeatured: true,
      isVerified: true,
      isEnterprisePrivate: false,
      status: 'published'
    },
    {
      id: 'ext-103',
      name: 'Amazon & Flipkart Price Drop Automation Pack',
      category: 'shopping',
      type: 'workflow',
      version: '1.0.4',
      developerName: 'E-Commerce Intelligence',
      description: 'Automated background watchers for electronics, laptops, and fashion price drops with instant notifications.',
      permissions: ['Shopping Access', 'Notifications', 'Background Tasks'],
      capabilities: ['price_watch', 'compare'],
      downloadsCount: 32400,
      rating: 4.8,
      isFeatured: false,
      isVerified: true,
      isEnterprisePrivate: false,
      status: 'published'
    },
    {
      id: 'ext-104',
      name: 'Ultra-Dark Glassmorphism Theme Pack',
      category: 'themes',
      type: 'theme',
      version: '3.0.0',
      developerName: 'Contril Design Team',
      description: 'Signature teal accent colors, glassmorphism overlays, custom typography, and dynamic animations.',
      permissions: ['Storage'],
      capabilities: ['theme_styling'],
      downloadsCount: 54100,
      rating: 4.95,
      isFeatured: false,
      isVerified: true,
      isEnterprisePrivate: false,
      status: 'published'
    }
  ]);

  const categories = [
    { id: 'all', label: 'All Extensions' },
    { id: 'ai_agents', label: 'AI Agents' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'food', label: 'Food' },
    { id: 'travel', label: 'Travel' },
    { id: 'finance', label: 'Finance' },
    { id: 'automations', label: 'Automations' },
    { id: 'themes', label: 'Themes' }
  ];

  const filteredExtensions = extensions.filter(e => {
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
            <ShoppingBag className="w-6 h-6 text-[#00BFA6]" />
            <span>Contril Marketplace & Ecosystem</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Discover, install, and extend AI agents, connectors, automations, and themes safely.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0D11] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6]/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-[#00BFA6] text-black font-semibold shadow-md'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 border border-white/[0.06]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Extensions Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExtensions.map((ext) => (
          <div
            key={ext.id}
            onClick={() => setSelectedExtension(ext)}
            className="rounded-2xl p-5 bg-[#0D0D11] border border-white/[0.06] hover:border-[#00BFA6]/40 transition-all flex flex-col justify-between space-y-4 cursor-pointer group hover:shadow-[0_0_20px_rgba(0,191,166,0.08)]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/[0.04] text-neutral-300 border border-white/[0.08]">
                  {ext.category}
                </span>

                {ext.isVerified && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#00BFA6]/15 text-[#00BFA6] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-[#00BFA6] transition-colors">{ext.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 min-h-[36px] font-light leading-relaxed">{ext.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{ext.rating.toFixed(1)}</span>
                <span className="text-neutral-500 ml-1">({ext.downloadsCount.toLocaleString()})</span>
              </div>

              <button className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-[#00BFA6] hover:text-black text-white text-xs transition-colors cursor-pointer">
                View & Install
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Extension Detail Modal */}
      {selectedExtension && (
        <ExtensionDetailModal
          isOpen={!!selectedExtension}
          onClose={() => setSelectedExtension(null)}
          extension={selectedExtension}
          onInstall={(ext) => alert(`Installed ${ext.name} with approved permissions.`)}
        />
      )}

    </div>
  );
};
