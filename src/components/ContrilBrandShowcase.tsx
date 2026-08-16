import React, { useState } from 'react';
import { ContrilLogo } from './ContrilLogo';
import { 
  CONTRIL_TAGLINES, 
  CONTRIL_BRAND_VALUES 
} from '../data/contrilBrand';
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  Watch, 
  CreditCard, 
  Monitor, 
  Globe, 
  Layout, 
  Zap, 
  Layers, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Maximize2,
  Sliders,
  Type,
  Grid,
  Palette,
  Download,
  Code,
  FileText
} from 'lucide-react';

export const ContrilBrandShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logo-suite' | 'color-system' | 'typography' | 'spacing' | 'mockups' | 'messaging'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTagline, setCopiedTagline] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activePreviewDevice, setActivePreviewDevice] = useState<'desktop' | 'mobile' | 'watch' | 'card' | 'billboard'>('desktop');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTagline(text);
    setTimeout(() => setCopiedTagline(null), 2000);
  };

  const handleCopySvgCode = () => {
    const svgContent = `<svg width="240" height="48" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="38" height="38" rx="12" stroke="#FFFFFF" stroke-width="2.5" />
  <path d="M15 24C15 19.0294 19.0294 15 24 15C28.9706 15 33 19.0294 33 24C33 28.9706 28.9706 33 24 33" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round" />
  <circle cx="24" cy="24" r="3.5" fill="#8B5CF6" />
  <!-- CONTRIL Custom Vector Wordmark -->
</svg>`;
    navigator.clipboard.writeText(svgContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filter taglines
  const allCategories = ['All', ...CONTRIL_TAGLINES.map(c => c.category)];
  
  const filteredCategories = CONTRIL_TAGLINES.map(cat => {
    const matchesCategory = selectedCategory === 'All' || cat.category === selectedCategory;
    if (!matchesCategory) return null;

    const filtered = cat.taglines.filter(t => 
      t.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) return null;

    return {
      ...cat,
      taglines: filtered
    };
  }).filter(Boolean);

  const totalTaglinesCount = CONTRIL_TAGLINES.reduce((acc, cat) => acc + cat.taglines.length, 0);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-10 select-none text-[#FAFAFA]">
      
      {/* BRAND HEADER & BRAND HIERARCHY BANNER */}
      <div className="relative p-8 md:p-12 rounded-[28px] bg-[#0B0B0F] border border-white/10 overflow-hidden shadow-2xl space-y-8">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            {/* Brand Hierarchy */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 text-xs font-mono">
              <span className="text-white font-bold">Contril</span>
              <span className="text-neutral-600">•</span>
              <span className="text-[#8B5CF6] font-medium">Personal Intelligence</span>
            </div>

            {/* Custom Logo Display */}
            <div>
              <ContrilLogo variant="main" size={48} showCompanyHeader={true} showCategorySubtitle={true} />
            </div>

            <p className="text-base md:text-lg text-neutral-300 font-light leading-relaxed">
              An uncompromising, timeless identity crafted for <span className="text-white font-medium">Personal Intelligence</span>. 
              Calm, intelligent, minimal, and executive.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 shrink-0 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-neutral-400 block text-[10px] uppercase">Identity System</span>
              <span className="text-[#8B5CF6] font-bold block text-sm">Pentagram Level</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-neutral-400 block text-[10px] uppercase">Core Palette</span>
              <span className="text-white font-bold block text-sm">Monochrome + Violet</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/10 pt-2">
          {[
            { id: 'overview', label: '1. Overview & Positioning', icon: Sparkles },
            { id: 'logo-suite', label: '2. Complete Logo Suite (10 Deliverables)', icon: Grid },
            { id: 'color-system', label: '3. Color Palette', icon: Palette },
            { id: 'typography', label: '4. Typography System', icon: Type },
            { id: 'spacing', label: '5. Grid & Spacing', icon: Sliders },
            { id: 'mockups', label: '6. Contextual Mockups', icon: Monitor },
            { id: 'messaging', label: '7. Messaging & Taglines', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & POSITIONING                             */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Brand Meaning Pillars */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Brand Personality Pillars</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CONTRIL_BRAND_VALUES.map((val, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-1 hover:border-[#8B5CF6]/50 transition-all">
                  <span className="text-[#8B5CF6] font-mono font-bold text-xs block">{val.title}</span>
                  <p className="text-[11px] text-neutral-400 leading-tight font-sans">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Anti-Cliché Rules & Visual Discipline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BANNED CLICHÉS */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-red-500/20 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4" />
                <span>BANNED AI CLICHÉS (REJECTED)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 font-sans">
                {['❌ Robot heads', '❌ Generic brains', '❌ Chat bubbles', '❌ AI sparkles', '❌ Circuit paths', '❌ Hexagon grids', '❌ Light bulbs', '❌ Rainbow 3D gradients', '❌ Stock letter C', '❌ Futuristic Cyberpunk'].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* EMBRACED LUXURY PRINCIPLES */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-2 text-[#22C55E] font-mono font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>EMBRACED IDENTITY PRINCIPLES</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-200 font-sans">
                {['✓ Personal Intelligence', '✓ Sovereign Enclave', '✓ Pure Vector Geometry', '✓ Swiss Typographic Grid', '✓ Deep Negative Space', '✓ Monochromatic Precision', '✓ Executive Confidence', '✓ Timeless Proportions', '✓ Scalable 16px to 512px', '✓ Custom Wordmark'].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] font-medium">
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: COMPLETE LOGO SUITE (10 DELIVERABLES)               */}
      {/* ========================================================= */}
      {activeTab === 'logo-suite' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">The 10 Required Brand Deliverables</h2>
              <p className="text-xs text-neutral-400 font-mono">Precision vector assets designed for global recognition.</p>
            </div>
            <button
              onClick={handleCopySvgCode}
              className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-mono font-medium flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#8B5CF6]/20"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Code className="w-4 h-4" />}
              <span>{copiedCode ? 'SVG Code Copied!' : 'Copy Vector SVG Code'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Main Logo */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/10 pb-2">
                <span>1. Main Logo (Full Hierarchy)</span>
                <span className="text-[#8B5CF6]">Primary</span>
              </div>
              <div className="p-8 rounded-xl bg-black border border-white/5 flex items-center justify-center min-h-[140px]">
                <ContrilLogo variant="main" size={38} showCompanyHeader={true} showCategorySubtitle={true} />
              </div>
            </div>

            {/* 2. App Icon */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/10 pb-2">
                <span>2. App Icon</span>
                <span className="text-neutral-500">512 x 512</span>
              </div>
              <div className="p-8 rounded-xl bg-black border border-white/5 flex items-center justify-center min-h-[140px]">
                <ContrilLogo variant="app-icon" size={80} />
              </div>
            </div>

            {/* 3. Favicon */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/10 pb-2">
                <span>3. Favicon</span>
                <span className="text-neutral-500">16 / 32 / 64 px</span>
              </div>
              <div className="p-8 rounded-xl bg-black border border-white/5 flex items-center justify-center gap-4 min-h-[140px]">
                <ContrilLogo variant="favicon" size={16} />
                <ContrilLogo variant="favicon" size={24} />
                <ContrilLogo variant="favicon" size={32} />
              </div>
            </div>

            {/* 4. Dark Version */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/10 pb-2">
                <span>4. Dark Version</span>
                <span className="text-neutral-500">#0B0B0F Canvas</span>
              </div>
              <div className="p-8 rounded-xl bg-[#0B0B0F] border border-white/10 flex items-center justify-center min-h-[140px]">
                <ContrilLogo variant="dark" size={32} />
              </div>
            </div>

            {/* 5. Light Version */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/10 pb-2">
                <span>5. Light Version</span>
                <span className="text-neutral-500">#FAFAFA Canvas</span>
              </div>
              <div className="p-8 rounded-xl bg-[#FAFAFA] border border-neutral-300 flex items-center justify-center min-h-[140px]">
                <ContrilLogo variant="light" size={32} />
              </div>
            </div>

            {/* 6. Only Icon Version */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/10 pb-2">
                <span>6. Only Icon Version</span>
                <span className="text-neutral-500">Symbol Mark</span>
              </div>
              <div className="p-8 rounded-xl bg-black border border-white/5 flex items-center justify-center min-h-[140px]">
                <ContrilLogo variant="icon-only" size={48} />
              </div>
            </div>

            {/* 7. Only Wordmark Version */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-4 md:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/10 pb-2">
                <span>7. Custom Wordmark Version</span>
                <span className="text-[#8B5CF6]">Modified Architectural Lettering</span>
              </div>
              <div className="p-8 rounded-xl bg-black border border-white/5 flex items-center justify-center min-h-[140px]">
                <ContrilLogo variant="wordmark-only" size={48} showCompanyHeader={true} showCategorySubtitle={true} />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: COLOR SYSTEM                                       */}
      {/* ========================================================= */}
      {activeTab === 'color-system' && (
        <div className="space-y-8 animate-fade-in">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Brand Color Palette System</h2>
            <p className="text-xs text-neutral-400 font-mono">Restrained, high-contrast, flat design. Zero rainbow gradients.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Background */}
            <div className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/15 space-y-3">
              <div className="h-24 rounded-xl bg-[#0B0B0F] border border-white/20 flex items-end p-3 text-xs font-mono text-neutral-400">
                #0B0B0F
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Sovereign Obsidian</h3>
                <p className="text-xs text-neutral-400 font-mono">HEX: #0B0B0F • RGB: (11, 11, 15)</p>
                <p className="text-[11px] text-neutral-400 mt-1">Deep background canvas for high legibility.</p>
              </div>
            </div>

            {/* Primary Text */}
            <div className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/15 space-y-3">
              <div className="h-24 rounded-xl bg-white text-black flex items-end p-3 text-xs font-mono font-bold">
                #FFFFFF
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Pure Light</h3>
                <p className="text-xs text-neutral-400 font-mono">HEX: #FFFFFF • RGB: (255, 255, 255)</p>
                <p className="text-[11px] text-neutral-400 mt-1">Primary wordmark, headings, and key focus text.</p>
              </div>
            </div>

            {/* Primary Accent */}
            <div className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/15 space-y-3">
              <div className="h-24 rounded-xl bg-[#8B5CF6] text-white flex items-end p-3 text-xs font-mono font-bold">
                #8B5CF6
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Intelligence Violet</h3>
                <p className="text-xs text-neutral-400 font-mono">HEX: #8B5CF6 • RGB: (139, 92, 246)</p>
                <p className="text-[11px] text-neutral-400 mt-1">Executive intelligence accent & interactive states.</p>
              </div>
            </div>

            {/* Secondary Accent */}
            <div className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/15 space-y-3">
              <div className="h-24 rounded-xl bg-[#22C55E] text-black flex items-end p-3 text-xs font-mono font-bold">
                #22C55E
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Execution Emerald</h3>
                <p className="text-xs text-neutral-400 font-mono">HEX: #22C55E / #34D399</p>
                <p className="text-[11px] text-neutral-400 mt-1">Active status indicators & completed decisions.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TYPOGRAPHY SYSTEM                                  */}
      {/* ========================================================= */}
      {activeTab === 'typography' && (
        <div className="space-y-8 animate-fade-in">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Typography Recommendations</h2>
            <p className="text-xs text-neutral-400 font-mono">Swiss-inspired mathematical scale with high contrast hierarchy.</p>
          </div>

          <div className="space-y-6">
            
            {/* Display / Wordmark */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-[#8B5CF6] uppercase tracking-widest">Display & Custom Wordmark</span>
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-sans">
                CONTRIL • Personal Intelligence
              </h3>
              <p className="text-xs text-neutral-400 font-mono">Modified architectural lettering • Tracking: -0.04em • Custom Terminals</p>
            </div>

            {/* Subheadings */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-[#34D399] uppercase tracking-widest">Headings & Executive Briefings</span>
              <h4 className="text-2xl font-light text-white tracking-tight">
                Good Morning, Alex. I've prepared today's decision matrix.
              </h4>
              <p className="text-xs text-neutral-400 font-mono">Plus Jakarta Sans / Inter Tight • Light 300 Weight • Line Height: 1.3</p>
            </div>

            {/* Mono Code & Status */}
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Metadata, Status & Enclave Logs</span>
              <div className="text-xs font-mono text-neutral-300">
                SYSTEM_STATUS: ENCLAVE_ACTIVE • 14 EMAILS PARSED • 3 DRAFTS PREPARED
              </div>
              <p className="text-xs text-neutral-400 font-mono">JetBrains Mono / SF Mono • Uppercase Tracking: 0.15em</p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: GRID & SPACING                                     */}
      {/* ========================================================= */}
      {activeTab === 'spacing' && (
        <div className="space-y-8 animate-fade-in">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Spacing & Clear Space Guidelines</h2>
            <p className="text-xs text-neutral-400 font-mono">4px grid discipline. Minimum clear space is equal to 1.5X the symbol height.</p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0B0B0F] border border-white/10 flex flex-col items-center justify-center space-y-6">
            
            {/* Visual Clear Space Box */}
            <div className="p-12 rounded-2xl border-2 border-dashed border-[#8B5CF6]/40 relative bg-black">
              <div className="absolute top-2 left-2 text-[10px] font-mono text-[#8B5CF6]">Clear Space = 1.5X</div>
              <ContrilLogo variant="main" size={44} showCompanyHeader={true} showCategorySubtitle={true} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-center text-xs font-mono">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-neutral-400 block">Base Grid</span>
                <span className="text-white font-bold block text-sm">4px / 8px</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-neutral-400 block">Min Display Size</span>
                <span className="text-[#34D399] font-bold block text-sm">16px Favicon</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-neutral-400 block">Corner Radius Math</span>
                <span className="text-[#8B5CF6] font-bold block text-sm">R_inner = R_outer - Padding</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: CONTEXTUAL MOCKUPS                                 */}
      {/* ========================================================= */}
      {activeTab === 'mockups' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Real-World Contextual Adaptability</h2>
              <p className="text-xs text-neutral-400 font-mono">Recognizable across every device, format, and medium.</p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black border border-white/10 shrink-0">
              {[
                { id: 'desktop', label: 'Desktop', icon: Monitor },
                { id: 'mobile', label: 'Mobile', icon: Smartphone },
                { id: 'watch', label: 'Watch', icon: Watch },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'billboard', label: 'Billboard', icon: Maximize2 }
              ].map((dev) => {
                const Icon = dev.icon;
                return (
                  <button
                    key={dev.id}
                    onClick={() => setActivePreviewDevice(dev.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                      activePreviewDevice === dev.id ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{dev.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#090a0d] border border-white/10 flex items-center justify-center min-h-[340px] shadow-2xl relative overflow-hidden">
            
            {activePreviewDevice === 'desktop' && (
              <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-4 shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <ContrilLogo variant="main" size={24} showCompanyHeader={true} />
                  <span className="text-[10px] font-mono text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded border border-[#34D399]/20">
                    EXECUTIVE OS ONLINE
                  </span>
                </div>
                <div className="text-xs text-neutral-300 font-mono space-y-1">
                  <div>&gt; CONTRIL EXECUTIVE ENGINE OPERATIONAL</div>
                  <div className="text-neutral-500">&gt; 14 EMAILS PARSED • 3 APPROVALS PENDING HUMAN DECISION</div>
                </div>
              </div>
            )}

            {activePreviewDevice === 'mobile' && (
              <div className="w-56 p-4 rounded-[36px] bg-black border-4 border-neutral-800 space-y-4 text-center shadow-2xl animate-fade-in">
                <div className="w-12 h-1.5 bg-neutral-800 rounded-full mx-auto" />
                <ContrilLogo variant="app-icon" size={88} className="mx-auto" />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-white block tracking-wider">CONTRIL</span>
                  <span className="text-[9px] text-[#8B5CF6] font-mono block">Personal Intelligence</span>
                </div>
              </div>
            )}

            {activePreviewDevice === 'watch' && (
              <div className="w-44 h-52 p-4 rounded-[40px] bg-black border-4 border-neutral-700 flex flex-col justify-between text-center shadow-2xl animate-fade-in">
                <div className="text-[9px] font-mono text-amber-400">08:15 AM</div>
                <ContrilLogo variant="icon-only" size={36} className="mx-auto" />
                <div className="text-[10px] font-medium text-white">
                  3 Decisions Ready
                </div>
              </div>
            )}

            {activePreviewDevice === 'card' && (
              <div className="w-80 h-48 p-6 rounded-2xl bg-neutral-950 border border-white/20 flex flex-col justify-between text-white shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between">
                  <ContrilLogo variant="icon-only" size={28} />
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">CONTRIL</span>
                </div>
                <div className="space-y-1">
                  <ContrilLogo variant="wordmark-only" size={24} showCategorySubtitle={true} />
                </div>
              </div>
            )}

            {activePreviewDevice === 'billboard' && (
              <div className="w-full max-w-xl p-8 rounded-2xl bg-black border border-white/20 text-center space-y-4 shadow-2xl animate-fade-in">
                <ContrilLogo variant="main" size={56} showCompanyHeader={true} showCategorySubtitle={true} className="mx-auto" />
                <h3 className="text-2xl font-light text-white tracking-tight">
                  The AI That Works. The Human Decides.
                </h3>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: MESSAGING & TAGLINES                               */}
      {/* ========================================================= */}
      {activeTab === 'messaging' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <span>Contril Messaging Matrix</span>
                <span className="text-xs font-mono bg-[#8B5CF6]/10 text-[#8B5CF6] px-2.5 py-0.5 rounded-full border border-[#8B5CF6]/20">
                  {totalTaglinesCount} Taglines
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">Calm, confident executive voice.</p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter taglines..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {allCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-black font-bold shadow'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {filteredCategories.map((catGroup, idx) => (
              <div key={idx} className="space-y-3">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-[#8B5CF6] font-mono">{catGroup.category}</h3>
                  <p className="text-[11px] text-neutral-400 font-sans">{catGroup.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catGroup.taglines.map((tagline, tIdx) => {
                    const isCopied = copiedTagline === tagline;

                    return (
                      <div
                        key={tIdx}
                        onClick={() => handleCopy(tagline)}
                        className="group p-4 rounded-xl bg-[#0B0B0F] border border-white/10 hover:border-[#8B5CF6]/50 transition-all flex items-center justify-between cursor-pointer shadow-sm hover:scale-[1.01]"
                      >
                        <span className="text-xs text-neutral-200 font-medium group-hover:text-white transition-colors">
                          "{tagline}"
                        </span>

                        <button
                          title="Copy Tagline"
                          className="p-1.5 text-neutral-400 group-hover:text-[#8B5CF6] transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
