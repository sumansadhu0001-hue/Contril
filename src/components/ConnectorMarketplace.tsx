import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Globe, 
  ShoppingBag, 
  UtensilsCrossed, 
  Plane, 
  FileText, 
  Terminal, 
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { connectorRegistry } from '../backend/connectors/ConnectorRegistry';

export interface MarketplaceConnector {
  id: string;
  name: string;
  category: 'workspace' | 'shopping' | 'food' | 'travel' | 'developer' | 'finance' | 'future';
  description: string;
  status: 'connected' | 'disconnected' | 'degraded';
  capabilities: string[];
  lastSync?: string;
  latencyMs?: number;
  providerUrl?: string;
}

interface ConnectorMarketplaceProps {
  onBack?: () => void;
}

export const ConnectorMarketplace: React.FC<ConnectorMarketplaceProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [connectors, setConnectors] = useState<MarketplaceConnector[]>([
    // Workspace
    { id: 'gmail', name: 'Gmail', category: 'workspace', description: 'Read, summarize, and draft executive emails automatically.', status: 'connected', capabilities: ['search', 'sync', 'execute', 'notifications'], lastSync: '10 mins ago', latencyMs: 120 },
    { id: 'gcal', name: 'Google Calendar', category: 'workspace', description: 'Schedule meetings, prepare briefings, and check availability.', status: 'connected', capabilities: ['search', 'sync', 'execute'], lastSync: '5 mins ago', latencyMs: 95 },
    { id: 'gdrive', name: 'Google Drive', category: 'workspace', description: 'Search contracts, proposals, and vectorized document memory.', status: 'connected', capabilities: ['search', 'open', 'sync'], lastSync: '1 hour ago', latencyMs: 180 },
    { id: 'gdocs', name: 'Google Docs', category: 'workspace', description: 'Draft, summarize, and extract key clauses from documents.', status: 'connected', capabilities: ['search', 'execute'], lastSync: '2 hours ago', latencyMs: 140 },
    { id: 'slack', name: 'Slack', category: 'workspace', description: 'Send channel updates, draft messages, and digest team chats.', status: 'disconnected', capabilities: ['search', 'execute', 'notifications'], lastSync: 'Never', latencyMs: 0 },
    { id: 'github', name: 'GitHub', category: 'workspace', description: 'Track pull requests, issues, commits, and code repositories.', status: 'disconnected', capabilities: ['search', 'sync', 'execute'], lastSync: 'Never', latencyMs: 0 },

    // Shopping
    { id: 'amazon', name: 'Amazon India', category: 'shopping', description: 'Search products, compare prices, and track order deliveries.', status: 'connected', capabilities: ['search', 'compare', 'watch_price'], lastSync: '30 mins ago', latencyMs: 210 },
    { id: 'flipkart', name: 'Flipkart', category: 'shopping', description: 'Compare electronic prices, offers, and delivery times.', status: 'connected', capabilities: ['search', 'compare'], lastSync: '1 hour ago', latencyMs: 240 },
    { id: 'myntra', name: 'Myntra', category: 'shopping', description: 'Search apparel, fashion catalog, and price drops.', status: 'disconnected', capabilities: ['search', 'compare'], lastSync: 'Never', latencyMs: 0 },

    // Food
    { id: 'swiggy', name: 'Swiggy', category: 'food', description: 'Discover restaurants, compare food delivery ETAs, and reorder.', status: 'connected', capabilities: ['search', 'order', 'status'], lastSync: '15 mins ago', latencyMs: 150 },
    { id: 'zomato', name: 'Zomato', category: 'food', description: 'Explore restaurant menus, ratings, and dining reservations.', status: 'connected', capabilities: ['search', 'compare'], lastSync: '45 mins ago', latencyMs: 160 },
    { id: 'bigbasket', name: 'BigBasket', category: 'food', description: 'Automate grocery reorders and stock availability alerts.', status: 'disconnected', capabilities: ['search', 'sync'], lastSync: 'Never', latencyMs: 0 },

    // Travel
    { id: 'makemytrip', name: 'MakeMyTrip', category: 'travel', description: 'Compare flights, hotel rooms, and price drop notifications.', status: 'connected', capabilities: ['search', 'compare', 'book'], lastSync: '2 hours ago', latencyMs: 310 },
    { id: 'airbnb', name: 'Airbnb', category: 'travel', description: 'Search executive stays, apartments, and location proximity.', status: 'disconnected', capabilities: ['search', 'compare'], lastSync: 'Never', latencyMs: 0 },
    { id: 'oyo', name: 'OYO', category: 'travel', description: 'Search budget hotel rooms and instant bookings.', status: 'disconnected', capabilities: ['search'], lastSync: 'Never', latencyMs: 0 },

    // Future Expansion Framework
    { id: 'finance_bank', name: 'Universal Banking Protocol', category: 'future', description: 'Future domain connector for expense tracking & invoice reconciliation.', status: 'disconnected', capabilities: ['sync', 'status'], lastSync: 'Coming Soon', latencyMs: 0 },
    { id: 'smart_home', name: 'Smart Home Control Hub', category: 'future', description: 'Future domain connector for IoT, climate, and office automation.', status: 'disconnected', capabilities: ['execute', 'status'], lastSync: 'Coming Soon', latencyMs: 0 }
  ]);

  const categories = [
    { id: 'all', label: 'All Connectors' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'food', label: 'Food' },
    { id: 'travel', label: 'Travel' },
    { id: 'future', label: 'Future Expansion' }
  ];

  const filteredConnectors = connectors.filter(c => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleConnect = (id: string) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'connected' ? 'disconnected' : 'connected';
        return { ...c, status: nextStatus, lastSync: nextStatus === 'connected' ? 'Just now' : 'Disconnected' };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div>
          {onBack && (
            <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
              ← Back to Settings
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-[#00BFA6]" />
            <span>Universal Connector Marketplace</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Connect workspace, shopping, food, travel, and future platform APIs into Contril AI OS.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search connectors..."
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
                ? 'bg-[#00BFA6] text-black font-semibold shadow-lg shadow-[#00BFA6]/20'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 border border-white/[0.06]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Connectors Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => {
          const isConnected = connector.status === 'connected';
          return (
            <div
              key={connector.id}
              className={`rounded-2xl p-5 bg-[#0D0D11] border transition-all flex flex-col justify-between space-y-4 ${
                isConnected
                  ? 'border-[#00BFA6]/40 shadow-[0_0_20px_rgba(0,191,166,0.08)]'
                  : 'border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/[0.04] text-neutral-300 border border-white/[0.08]">
                      {connector.category}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase flex items-center gap-1 ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/20'
                  }`}>
                    {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{connector.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">{connector.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1 min-h-[36px] font-light leading-relaxed">{connector.description}</p>
                </div>

                {/* Capabilities Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {connector.capabilities.map((cap, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.04] text-[9px] font-mono text-neutral-400">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status & Action */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="text-[10px] font-mono text-neutral-500">
                  <span>Sync: {connector.lastSync}</span>
                  {connector.latencyMs ? <span className="ml-2">({connector.latencyMs}ms)</span> : null}
                </div>

                <button
                  onClick={() => toggleConnect(connector.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isConnected
                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                      : 'bg-[#00BFA6] hover:bg-[#00A892] text-black shadow-md'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
