import React from 'react';
import { 
  Download, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Github, 
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
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
          ATMOSPHERIC LIGHTING CANVAS (Multi-Layer Radial Light Architecture)
          ========================================================================= */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10"
        style={{
          background: 'linear-gradient(180deg, #DCEAFF 0%, #EEF5FF 50%, #F7FAFF 100%)'
        }}
      >
        {/* Layer 1: Top-Left Soft Indigo/Blue Glow */}
        <div 
          className="absolute -top-[140px] -left-[120px] w-[950px] sm:w-[1250px] h-[850px] sm:h-[1100px] rounded-full blur-[100px] sm:blur-[130px] opacity-90 animate-ambient-float"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(120, 145, 255, 0.45) 0%, rgba(145, 170, 255, 0.22) 40%, transparent 72%)'
          }}
        />

        {/* Layer 2: Top-Right Soft Cyan/Sky-Blue Glow */}
        <div 
          className="absolute -top-[120px] -right-[120px] w-[950px] sm:w-[1250px] h-[850px] sm:h-[1100px] rounded-full blur-[100px] sm:blur-[130px] opacity-90 animate-ambient-float-reverse"
          style={{
            background: 'radial-gradient(circle at 65% 35%, rgba(72, 190, 255, 0.42) 0%, rgba(110, 210, 255, 0.20) 40%, transparent 72%)'
          }}
        />

        {/* Layer 3: Center Hero Halo (Very clean near-white glow behind typography) */}
        <div 
          className="absolute top-[60px] sm:top-[100px] left-1/2 -translate-x-1/2 w-[750px] sm:w-[1100px] h-[480px] sm:h-[580px] rounded-full blur-[50px] sm:blur-[70px] opacity-95"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.98) 0%, rgba(240, 247, 255, 0.75) 45%, transparent 75%)'
          }}
        />

        {/* Layer 4: Left-Mid Flank Atmospheric Field */}
        <div 
          className="absolute top-[480px] -left-[150px] w-[750px] h-[750px] rounded-full blur-[110px] opacity-60"
          style={{
            background: 'radial-gradient(circle at center, rgba(125, 155, 255, 0.30) 0%, transparent 70%)'
          }}
        />

        {/* Layer 5: Right-Mid Flank Atmospheric Field */}
        <div 
          className="absolute top-[520px] -right-[150px] w-[750px] h-[750px] rounded-full blur-[110px] opacity-60"
          style={{
            background: 'radial-gradient(circle at center, rgba(65, 185, 255, 0.28) 0%, transparent 70%)'
          }}
        />

        {/* Layer 6: Lower Fade */}
        <div className="absolute inset-x-0 bottom-0 h-[360px] bg-gradient-to-b from-transparent via-[#EEF5FF]/50 to-[#F7FAFF]" />
      </div>

      {/* =========================================================================
          PAGE CONTENT (Z-10 relative)
          ========================================================================= */}
      <div className="relative w-full z-10">
        
        {/* =========================================================================
            1. HERO SECTION
            ========================================================================= */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-20 px-5 sm:px-8 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-[#2563EB] tracking-widest uppercase select-none shadow-2xs backdrop-blur-xs">
            <ContrilLogo size="xs" strokeColor="#2563EB" />
            <span>GET CONTRIL</span>
          </div>

          {/* Headline */}
          <div className="max-w-[390px] sm:max-w-3xl mx-auto">
            <h1 className="text-[42px] sm:text-6xl md:text-7xl font-bold tracking-tight text-[#07152F] leading-[1.05] sm:leading-[1.08]">
              Your AI chief of staff, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
                wherever you work.
              </span>
            </h1>
          </div>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed max-w-[650px] mx-auto">
            Use Contril instantly on the web or install the native Android app for a dedicated mobile workspace.
          </p>

          {/* Dual Action CTA Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-[360px] sm:max-w-md mx-auto w-full">
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

          {/* Technical Monospace Metadata */}
          <div className="pt-1 font-mono text-xs text-[#64748B] font-medium tracking-wide">
            Instant Browser Access • Native Android (Kotlin & Jetpack Compose) • {CONTRIL_APK_CONFIG.fileSize}
          </div>
        </section>

        {/* =========================================================================
            2. SECONDARY SECTION (One Workspace. Two Ways to Use Contril.)
            Generous breathing room (~100px) after hero
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-5xl mx-auto pt-16 sm:pt-24 pb-20 sm:pb-28">
          
          <div className="text-center space-y-3 mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#07152F]">
              One workspace. <br className="hidden sm:inline" />
              Two ways to use Contril.
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
                    Use Contril instantly from any modern desktop or mobile browser. Zero installation required.
                  </p>
                </div>

                <ul className="space-y-3.5 pt-2 text-left text-sm text-[#334155]">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Instant access on desktop & mobile browsers</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Always updated to the latest features</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Cross-platform state and context sync</span>
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
                    <span>High-priority Android notification channels</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Edge-to-edge system navigation & offline fallback</span>
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
            3. NATIVE ANDROID SHOWCASE (Realistic Jetpack Compose UI Visual)
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 sm:pb-28">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#2563EB] uppercase tracking-wider">
              <span>NATIVE ANDROID EXPERIENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#07152F]">
              Built for speed and clarity.
            </h2>
            <p className="text-sm sm:text-base text-[#475569] max-w-xl mx-auto">
              Fluid animations, edge-to-edge system integration, and responsive intelligence designed specifically for Android.
            </p>
          </div>

          {/* Smartphone Mockup Frame */}
          <div className="max-w-[340px] sm:max-w-sm mx-auto rounded-[40px] p-3 sm:p-4 bg-[#0F172A] border-4 border-[#334155]/60 shadow-[0_30px_90px_rgba(37,99,235,0.20)]">
            
            <div className="rounded-[30px] bg-[#F7FAFF] border border-black/5 overflow-hidden text-left p-5 space-y-4 font-sans">
              
              {/* Status Header */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pb-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>5G</span>
                </div>
              </div>

              {/* Contril Brand Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <ContrilLogo size="xs" strokeColor="#2563EB" />
                  <div>
                    <div className="text-xs font-bold font-mono tracking-wide text-[#07152F]">
                      CONTRIL
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      AI CHIEF OF STAFF
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-medium">
                  Active
                </span>
              </div>

              {/* Greeting */}
              <div className="space-y-0.5 pt-1">
                <div className="text-lg font-bold text-[#07152F]">
                  Good morning.
                </div>
                <div className="text-xs text-[#52627A]">
                  3 things need your attention
                </div>
              </div>

              {/* Section 1: Email */}
              <div className="p-3 rounded-xl bg-white border border-black/5 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#07152F]">
                    <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Email</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    Gmail
                  </span>
                </div>
                <div className="text-xs text-[#52627A]">
                  12 unread • 2 important
                </div>
              </div>

              {/* Section 2: Calendar */}
              <div className="p-3 rounded-xl bg-white border border-black/5 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#07152F]">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Calendar</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    10:30 AM
                  </span>
                </div>
                <div className="text-xs text-[#52627A]">
                  Team meeting • 10:30 AM
                </div>
              </div>

              {/* Section 3: Tasks */}
              <div className="p-3 rounded-xl bg-white border border-black/5 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#07152F]">
                    <CheckSquare className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    Due Today
                  </span>
                </div>
                <div className="text-xs text-[#52627A]">
                  3 due today
                </div>
              </div>

              {/* Section 4: Documents */}
              <div className="p-3 rounded-xl bg-white border border-black/5 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#07152F]">
                    <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Documents</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    Drive
                  </span>
                </div>
                <div className="text-xs text-[#52627A]">
                  Latest project brief
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            4. INTEGRATIONS SECTION
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 sm:pb-28 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#07152F]">
              Everything connected.
            </h2>
            <p className="text-base text-[#475569] max-w-xl mx-auto leading-relaxed">
              Contril unifies context from your active tools into a single intelligence stream.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 max-w-2xl mx-auto">
            {[
              { name: 'Gmail', icon: Mail, tag: 'Email' },
              { name: 'Outlook', icon: Mail, tag: 'Mail & Calendar' },
              { name: 'Google Calendar', icon: Calendar, tag: 'Schedule' },
              { name: 'Google Drive', icon: FileText, tag: 'Documents' },
              { name: 'GitHub', icon: Github, tag: 'Code & PRs' },
              { name: 'Google Search', icon: Search, tag: 'Live Web' },
            ].map((tool) => (
              <div 
                key={tool.name}
                className="p-5 rounded-2xl bg-white/95 border border-white/80 shadow-[0_10px_30px_rgba(37,99,235,0.05)] flex flex-col items-center text-center space-y-2.5 transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                  <tool.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#07152F]">{tool.name}</div>
                  <div className="text-[11px] text-[#64748B]">{tool.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. FINAL CTA SECTION
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
