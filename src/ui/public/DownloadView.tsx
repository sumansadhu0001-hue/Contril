import React from 'react';
import { 
  Download, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  FileText, 
  Github, 
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  Check
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { CONTRIL_APK_CONFIG } from '../../config/apkConfig';

interface DownloadViewProps {
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
  deviceInfo?: any;
}

export const DownloadView: React.FC<DownloadViewProps> = ({ 
  onNavigate, 
  isAuthenticated 
}) => {
  const handleOpenContril = () => {
    onNavigate(isAuthenticated ? 'app' : 'login');
  };

  return (
    <div className="relative w-full min-h-screen text-left font-sans text-[#07152F] overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* =========================================================================
          1. FULL-PAGE ATMOSPHERIC BACKGROUND SYSTEM
          ========================================================================= */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10"
        style={{
          background: 'linear-gradient(180deg, #DCEAFF 0%, #EEF5FF 45%, #F7FAFF 100%)'
        }}
      >
        {/* Top Left: Large Soft Indigo/Blue Glow */}
        <div 
          className="absolute -top-[160px] -left-[140px] w-[1000px] sm:w-[1350px] h-[900px] sm:h-[1150px] rounded-full blur-[120px] sm:blur-[150px] opacity-85 animate-ambient-float"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(120, 145, 255, 0.42) 0%, rgba(145, 170, 255, 0.20) 42%, transparent 72%)'
          }}
        />

        {/* Top Right: Large Soft Cyan Glow */}
        <div 
          className="absolute -top-[140px] -right-[140px] w-[1000px] sm:w-[1350px] h-[900px] sm:h-[1150px] rounded-full blur-[120px] sm:blur-[150px] opacity-85 animate-ambient-float-reverse"
          style={{
            background: 'radial-gradient(circle at 65% 35%, rgba(72, 190, 255, 0.40) 0%, rgba(110, 210, 255, 0.18) 42%, transparent 72%)'
          }}
        />

        {/* Center: Huge White Light Source Behind Hero (Guarantees crisp typography) */}
        <div 
          className="absolute top-[60px] sm:top-[90px] left-1/2 -translate-x-1/2 w-[800px] sm:w-[1150px] h-[520px] sm:h-[620px] rounded-full blur-[50px] sm:blur-[70px] opacity-98"
          style={{
            background: 'radial-gradient(ellipse at 50% 38%, rgba(255, 255, 255, 0.98) 0%, rgba(240, 248, 255, 0.85) 45%, transparent 75%)'
          }}
        />

        {/* Lower Left: Subtle Lavender Ambient Glow */}
        <div 
          className="absolute top-[850px] -left-[180px] w-[850px] h-[850px] rounded-full blur-[160px] opacity-55"
          style={{
            background: 'radial-gradient(circle at center, rgba(135, 160, 255, 0.28) 0%, transparent 70%)'
          }}
        />

        {/* Lower Right: Subtle Cyan Ambient Glow */}
        <div 
          className="absolute top-[900px] -right-[180px] w-[850px] h-[850px] rounded-full blur-[160px] opacity-55"
          style={{
            background: 'radial-gradient(circle at center, rgba(65, 185, 255, 0.26) 0%, transparent 70%)'
          }}
        />

        {/* Lower Fade */}
        <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-b from-transparent via-[#F4F8FE]/60 to-[#F8FAFC]" />
      </div>

      {/* =========================================================================
          PAGE CONTENT (Z-10 relative)
          ========================================================================= */}
      <div className="relative w-full z-10">
        
        {/* =========================================================================
            2. HERO SECTION WITH NEW VISUAL COMPOSITION
            ========================================================================= */}
        <section className="relative pt-12 pb-14 sm:pt-20 sm:pb-18 px-5 sm:px-8 max-w-4xl mx-auto text-center space-y-6 sm:space-y-7">
          
          {/* Eyebrow badge with circular logo mark */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-[#2563EB] tracking-widest uppercase select-none shadow-2xs backdrop-blur-xs">
            <ContrilLogo size="xs" strokeColor="#2563EB" />
            <span>GET CONTRIL</span>
          </div>

          {/* Statement Headline */}
          <div className="max-w-[390px] sm:max-w-3xl mx-auto">
            <h1 className="text-[44px] sm:text-7xl md:text-8xl font-bold tracking-tight text-[#07152F] leading-[0.98] sm:leading-[0.96]">
              Your AI <br />
              chief of staff. <br />
              <span className="bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
                Wherever you work.
              </span>
            </h1>
          </div>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg md:text-xl text-[#475569] font-normal leading-relaxed max-w-[650px] mx-auto">
            Contril unifies your emails, calendar, tasks, and tools into a single autonomous executive stream.
          </p>

          {/* Dual Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-[360px] sm:max-w-md mx-auto w-full">
            <button
              onClick={handleOpenContril}
              className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.30)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.40)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>{isAuthenticated ? 'OPEN CONTRIL' : 'OPEN CONTRIL →'}</span>
            </button>

            <a
              href={CONTRIL_APK_CONFIG.downloadUrl}
              download="contril-android.apk"
              className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-white/95 hover:bg-white text-[#07152F] border border-blue-200/80 hover:border-blue-300 text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.08)] shrink-0 backdrop-blur-xs"
            >
              <Download className="w-4 h-4 text-[#2563EB]" />
              <span>DOWNLOAD ANDROID APP ↓</span>
            </a>
          </div>

          {/* Technical Metadata */}
          <div className="pt-1 font-mono text-xs text-[#64748B] font-medium tracking-wide">
            Instant Browser Access • Native Android (Kotlin & Jetpack Compose) • {CONTRIL_APK_CONFIG.fileSize}
          </div>
        </section>

        {/* =========================================================================
            3. HERO PRODUCT VISUAL — LARGE FLOATING CONTRIL WORKSPACE MOCKUP
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-5xl mx-auto pb-16 sm:pb-24">
          <div className="rounded-[24px] sm:rounded-[32px] p-4 sm:p-7 bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_30px_90px_rgba(37,99,235,0.14)] text-left space-y-5">
            
            {/* Window Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]/80" />
                <span className="ml-3 text-xs font-mono font-bold text-[#07152F] tracking-wide">
                  CONTRIL WORKSPACE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Active
                </span>
              </div>
            </div>

            {/* Mockup Chief of Staff View */}
            <div className="space-y-4">
              
              {/* Header Greeting */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[11px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                    CHIEF OF STAFF
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#07152F]">
                    Good morning, Alex.
                  </div>
                </div>
                <div className="text-xs text-[#64748B] font-mono">
                  3 items prioritized for today
                </div>
              </div>

              {/* Large Interactive Command Bar */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3 text-sm text-[#07152F] font-medium">
                  <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>"Plan my day and summarize anything important."</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded-md text-[#64748B] border border-blue-200 shadow-2xs shrink-0">
                  ⌘K
                </span>
              </div>

              {/* Autonomous Execution Pipeline Status */}
              <div className="flex items-center gap-2 text-xs font-medium text-[#2563EB] pt-1">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Understood</span>
                </span>
                <span className="text-[#CBD5E1]">→</span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Checking your workspace</span>
                </span>
                <span className="text-[#CBD5E1]">→</span>
                <span className="text-[#07152F] font-semibold">Preparing recommendations</span>
              </div>

              {/* Realistic Productivity Result Rows */}
              <div className="space-y-2.5 pt-1">
                
                {/* Result 1: Gmail */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#07152F]">Summarized 3 unread client threads</div>
                      <div className="text-[11px] text-[#64748B]">Gmail • Ready for draft review</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer shrink-0">
                    Review Draft →
                  </span>
                </div>

                {/* Result 2: Calendar */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#07152F]">Prepared briefing for Partner Sync at 10:30 AM</div>
                      <div className="text-[11px] text-[#64748B]">Google Calendar • Agenda items extracted</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer shrink-0">
                    Open Brief →
                  </span>
                </div>

                {/* Result 3: GitHub */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#07152F]">Extracted 2 blocking PR reviews on release branch</div>
                      <div className="text-[11px] text-[#64748B]">GitHub • 1 approval pending</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer shrink-0">
                    Inspect PRs →
                  </span>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            4. SMALL INTEGRATION STRIP
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 sm:pb-28 text-center space-y-6">
          <div className="text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider">
            Works with the tools you already use
          </div>

          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 max-w-2xl mx-auto">
            {[
              { name: 'Gmail', icon: Mail },
              { name: 'Google Calendar', icon: Calendar },
              { name: 'Google Drive', icon: FileText },
              { name: 'GitHub', icon: Github },
              { name: 'Outlook', icon: Mail },
              { name: 'Slack', icon: Layers },
            ].map((tool) => (
              <div 
                key={tool.name}
                className="px-4 py-2.5 rounded-xl bg-white/90 border border-white/90 shadow-2xs flex items-center gap-2 text-xs font-semibold text-[#07152F]"
              >
                <tool.icon className="w-4 h-4 text-[#2563EB]" />
                <span>{tool.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. STORYTELLING FEATURE SECTION ("Everything in one place. Your work, connected.")
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-5xl mx-auto pb-20 sm:pb-28">
          
          <div className="text-center space-y-3 mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#07152F]">
              Everything in one place. <br className="hidden sm:inline" />
              Your work, connected.
            </h2>
            <p className="text-base text-[#475569] max-w-lg mx-auto">
              Autonomous context synthesis across your digital ecosystem.
            </p>
          </div>

          {/* 3 Horizontal Feature Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Block 01 */}
            <div className="rounded-[24px] p-7 sm:p-8 bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_16px_40px_rgba(37,99,235,0.06)] space-y-4 text-left">
              <div className="text-3xl font-mono font-bold text-[#2563EB]">01</div>
              <h3 className="text-xl font-bold text-[#07152F]">Understand</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Contril understands what matters across your connected tools by continuously indexing high-signal items.
              </p>
            </div>

            {/* Block 02 */}
            <div className="rounded-[24px] p-7 sm:p-8 bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_16px_40px_rgba(37,99,235,0.06)] space-y-4 text-left">
              <div className="text-3xl font-mono font-bold text-[#2563EB]">02</div>
              <h3 className="text-xl font-bold text-[#07152F]">Act</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Turn a simple instruction into useful work. Contril drafts replies, prepares agendas, and queues actions safely.
              </p>
            </div>

            {/* Block 03 */}
            <div className="rounded-[24px] p-7 sm:p-8 bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_16px_40px_rgba(37,99,235,0.06)] space-y-4 text-left">
              <div className="text-3xl font-mono font-bold text-[#2563EB]">03</div>
              <h3 className="text-xl font-bold text-[#07152F]">Stay ahead</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Get the information and intelligence you need before you even ask, delivered cleanly to your web or Android workspace.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================================
            6. WEB + ANDROID PLATFORM PANELS ("One workspace. Everywhere you work.")
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-5xl mx-auto pb-24 sm:pb-32">
          
          <div className="text-center space-y-3 mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#07152F]">
              One workspace. <br className="hidden sm:inline" />
              Everywhere you work.
            </h2>
            <p className="text-base text-[#475569] max-w-lg mx-auto">
              Choose the experience that fits how you work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* PANEL 1: Contril for Web */}
            <div className="rounded-[24px] p-8 sm:p-10 bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(37,99,235,0.08)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.14)] hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50/90 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                  <Globe className="w-7 h-7" />
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#07152F]">
                    Contril for Web
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Use Contril directly in your browser. Instant access on desktop and mobile with zero setup.
                  </p>
                </div>

                <ul className="space-y-3.5 pt-2 text-left text-sm text-[#334155]">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Instant access on any modern browser</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Always updated to the latest build</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Cross-platform cloud intelligence sync</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleOpenContril}
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Open in Browser →</span>
                </button>
              </div>
            </div>

            {/* PANEL 2: Contril for Android */}
            <div className="rounded-[24px] p-8 sm:p-10 bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(37,99,235,0.08)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.14)] hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50/90 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                    NATIVE APP
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#07152F]">
                    Contril for Android
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Dedicated native application built with pure Kotlin and Jetpack Compose.
                  </p>
                </div>

                <ul className="space-y-3.5 pt-2 text-left text-sm text-[#334155]">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Pure Jetpack Compose UI (0% WebView)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>High-priority Android notifications</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Offline-first local intelligence fallback</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <a
                  href={CONTRIL_APK_CONFIG.downloadUrl}
                  download="contril-android.apk"
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Android APK ↓</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            7. FINAL CTA BANNER
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-24 sm:pb-32 text-center">
          <div className="rounded-[32px] p-10 sm:p-14 bg-white/95 border border-white/80 shadow-[0_25px_70px_rgba(37,99,235,0.10)] space-y-6">
            
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#07152F]">
              Your work, <br className="hidden sm:inline" />
              under control.
            </h2>

            <p className="text-base sm:text-lg text-[#475569] max-w-lg mx-auto">
              Open Contril on the web or install the native Android app.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-[360px] sm:max-w-md mx-auto w-full">
              <button
                onClick={handleOpenContril}
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(37,99,235,0.30)] hover:shadow-[0_8px_28px_rgba(37,99,235,0.40)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Open Contril →</span>
              </button>

              <a
                href={CONTRIL_APK_CONFIG.downloadUrl}
                download="contril-android.apk"
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-white hover:bg-slate-50 border border-blue-200/80 text-[#07152F] text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4 text-[#2563EB]" />
                <span>Download Android App ↓</span>
              </a>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
