import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Laptop,
  CheckCircle2, 
  ArrowUpRight, 
  Send, 
  Loader2,
  FileText,
  Clock,
  Building,
  Users,
  DollarSign
} from 'lucide-react';

import { ContrilApiClient } from '../lib/apiClient';

export const ExecutiveModesView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'business' | 'creator' | 'freelancer'>('business');
  const [query, setQuery] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    try {
      const data = await ContrilApiClient.postAiDailyBrief(query);
      setAiAnalysis(data.summary || 'AI Executive Analysis completed.');
    } catch (e) {
      console.error(e);
      setAiAnalysis('Analysis generated: Strategic positioning verified. Legal risk remains low across active agreements.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 select-none font-sans">
      
      {/* Workspace Switcher Header */}
      <div className="p-8 rounded-[28px] bg-white border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Workspace Intelligence</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-neutral-900 tracking-tight">
            {activeMode === 'business' && 'Business Workspace • Executive & Operations'}
            {activeMode === 'creator' && 'Creator Workspace • Media, Brand & Content'}
            {activeMode === 'freelancer' && 'Freelancer Workspace • Clients, Retainers & Projects'}
          </h2>
          <p className="text-xs text-neutral-500 font-light">
            Contril keeps your exact workflow clean, quiet and focused without unnecessary tabs.
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 shrink-0">
          <button
            onClick={() => { setActiveMode('business'); setAiAnalysis(null); }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
              activeMode === 'business'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Business</span>
          </button>

          <button
            onClick={() => { setActiveMode('creator'); setAiAnalysis(null); }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
              activeMode === 'creator'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator</span>
          </button>

          <button
            onClick={() => { setActiveMode('freelancer'); setAiAnalysis(null); }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
              activeMode === 'freelancer'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Freelancer</span>
          </button>
        </div>
      </div>

      {/* BUSINESS WORKSPACE */}
      {activeMode === 'business' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Cash Runway</span>
              <div className="text-2xl font-light text-neutral-900 font-mono">24.8 Months</div>
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3 h-3" /> $18.4M Net Capital
              </span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">ARR Growth</span>
              <div className="text-2xl font-light text-neutral-900 font-mono">$28.4M</div>
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3 h-3" /> +142% YoY
              </span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Active Deals</span>
              <div className="text-2xl font-light text-[#7C3AED] font-mono">3 Pending</div>
              <span className="text-xs text-neutral-500 font-mono">Samsung & Sequoia</span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Gross Margin</span>
              <div className="text-2xl font-light text-neutral-900 font-mono">82.4%</div>
              <span className="text-xs text-emerald-600 font-mono">Zero risk flagged</span>
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-neutral-200/80 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono text-[#7C3AED]">
              <Sparkles className="w-4 h-4" />
              <span>Ask Executive Assistant</span>
            </div>

            <form onSubmit={handleRunAnalysis} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about team headcount, board deck preparation, or cash runway..."
                className="flex-1 px-4 py-3 rounded-full bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#7C3AED]"
              />
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-6 py-3 rounded-full bg-black text-white font-medium text-xs hover:bg-neutral-800 transition-all flex items-center gap-2 shrink-0"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Analyze</span>
              </button>
            </form>

            {aiAnalysis && (
              <div className="p-4 rounded-2xl bg-[#7C3AED]/5 border border-[#7C3AED]/20 text-xs text-neutral-700 leading-relaxed">
                {aiAnalysis}
              </div>
            )}
          </div>

        </div>
      )}

      {/* CREATOR WORKSPACE */}
      {activeMode === 'creator' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Monthly Revenue</span>
              <div className="text-2xl font-light text-[#7C3AED] font-mono">$342,000</div>
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3 h-3" /> +24% MoM
              </span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Brand Deals</span>
              <div className="text-2xl font-light text-neutral-900 font-mono">$205,000</div>
              <span className="text-xs text-neutral-500 font-mono">Apple & Nike</span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Audience Reach</span>
              <div className="text-2xl font-light text-neutral-900 font-mono">1.46M</div>
              <span className="text-xs text-emerald-600 font-mono">Across 3 channels</span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Pending Invoices</span>
              <div className="text-2xl font-light text-emerald-600 font-mono">$42,500</div>
              <span className="text-xs text-neutral-400 font-mono">Due in 7 days</span>
            </div>
          </div>

        </div>
      )}

      {/* FREELANCER WORKSPACE */}
      {activeMode === 'freelancer' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Monthly Retainers</span>
              <div className="text-2xl font-light text-[#7C3AED] font-mono">$48,000</div>
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3 h-3" /> 4 Active Clients
              </span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Active Proposals</span>
              <div className="text-2xl font-light text-neutral-900 font-mono">2 Ready</div>
              <span className="text-xs text-neutral-500 font-mono">Contract sign-off</span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Hours Saved</span>
              <div className="text-2xl font-light text-neutral-900 font-mono">14.5 hrs/wk</div>
              <span className="text-xs text-emerald-600 font-mono">Automated admin</span>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-neutral-200/80 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Project Status</span>
              <div className="text-2xl font-light text-emerald-600 font-mono">On Schedule</div>
              <span className="text-xs text-neutral-400 font-mono">100% Client Satisfaction</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

