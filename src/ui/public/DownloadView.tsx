import React from 'react';
import { 
  Download, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Github, 
  Search, 
  ShieldCheck, 
  Zap,
  Sparkles,
  Lock
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
    <div className="w-full text-left font-sans text-[#0B1220] dark:text-[#F8FAFC]">
      <div className="w-full overflow-hidden">
        
        {/* =========================================================================
            1. HERO SECTION
            ========================================================================= */}
        <section className="relative pt-8 pb-12 sm:pt-20 sm:pb-16 px-5 sm:px-8 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Subtle Mobile Readability Atmosphere Glow */}
          <div 
            className="absolute inset-0 -top-10 -bottom-10 pointer-events-none -z-10 opacity-80 sm:opacity-60"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.75) 0%, rgba(235,243,255,0.5) 38%, transparent 72%)'
            }}
          />

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 text-[11px] sm:text-xs font-bold text-[#1764E8] dark:text-[#38BDF8] tracking-widest uppercase select-none shadow-sm">
            <ContrilLogo size="xs" strokeColor="#1764E8" />
            <span>GET CONTRIL</span>
          </div>

          {/* Headline with High Contrast & Cyan Accent */}
          <div className="max-w-[390px] sm:max-w-3xl mx-auto">
            <h1 className="text-[40px] sm:text-6xl md:text-7xl font-bold tracking-tight text-[#07152F] dark:text-white leading-[1.02] sm:leading-[1.08] mx-auto">
              Your AI chief of staff, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#1764E8] to-[#168FD8] dark:from-[#38BDF8] dark:to-[#60A5FA] bg-clip-text text-transparent">
                wherever you work.
              </span>
            </h1>
          </div>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-[#334A68] dark:text-[#94A3B8] font-medium leading-relaxed max-w-2xl mx-auto">
            Use Contril instantly on the web or install the native Android app for a dedicated mobile experience.
          </p>

          {/* Hero CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-[360px] sm:max-w-md mx-auto w-full">
            <button
              onClick={handleOpenContril}
              className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'OPEN CONTRIL' : 'OPEN CONTRIL →'}</span>
            </button>

            <a
              href={CONTRIL_APK_CONFIG.downloadUrl}
              download="contril-android.apk"
              className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-white/90 dark:bg-[#0E1526]/80 hover:bg-white dark:hover:bg-[#151F38] border border-[#CBD5E1] dark:border-white/15 text-[#07152F] dark:text-white text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-[#1764E8] dark:text-[#38BDF8]" />
              <span>DOWNLOAD ANDROID APP ↓</span>
            </a>
          </div>

          <div className="font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
            Instant Browser Access • Native Android (Kotlin & Jetpack Compose)
          </div>
        </section>

        {/* =========================================================================
            2. PLATFORM SECTION (Two Premium Option Panels)
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-5xl mx-auto pb-16 sm:pb-24">
          <div className="text-center space-y-3 mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              One workspace. <br className="hidden sm:inline" />
              Two ways to use Contril.
            </h2>
            <p className="text-sm sm:text-base text-[#52627A] dark:text-[#94A3B8] max-w-lg mx-auto">
              Choose the experience that fits how you work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* PANEL 1: Contril for Web */}
            <div className="rounded-2xl p-7 sm:p-9 bg-white/80 dark:bg-[#0B1222]/85 backdrop-blur-xl border border-[#E2E8F0] dark:border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-8 transition-all hover:border-[#2563EB]/40">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                  <Globe className="w-6 h-6" />
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#0B1220] dark:text-white">
                    Contril for Web
                  </h3>
                  <p className="text-sm text-[#52627A] dark:text-[#94A3B8] leading-relaxed">
                    Use Contril instantly from any modern browser. Nothing to install.
                  </p>
                </div>

                <ul className="space-y-3 pt-2 text-left text-sm text-[#334155] dark:text-[#CBD5E1]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Browser access</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Desktop + mobile</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Instant access</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleOpenContril}
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Open Contril →</span>
                </button>
              </div>
            </div>

            {/* PANEL 2: Contril for Android */}
            <div className="rounded-2xl p-7 sm:p-9 bg-white/80 dark:bg-[#0B1222]/85 backdrop-blur-xl border border-[#E2E8F0] dark:border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-8 transition-all hover:border-[#2563EB]/40">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-[10px] font-mono font-bold text-[#2563EB] dark:text-[#38BDF8] uppercase tracking-wider">
                    NATIVE APP
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#0B1220] dark:text-white">
                    Contril for Android
                  </h3>
                  <p className="text-sm text-[#52627A] dark:text-[#94A3B8] leading-relaxed">
                    Use Contril as a dedicated native Android application.
                  </p>
                </div>

                <ul className="space-y-3 pt-2 text-left text-sm text-[#334155] dark:text-[#CBD5E1]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Native Android experience</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Android notifications</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Dedicated mobile workspace</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <a
                  href={CONTRIL_APK_CONFIG.downloadUrl}
                  download="contril-android.apk"
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Android App ↓</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. NATIVE ANDROID SHOWCASE (Realistic Jetpack Compose UI Visual)
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 sm:pb-28">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#2563EB] dark:text-[#38BDF8] uppercase tracking-wider">
              <span>NATIVE ANDROID EXPERIENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              Built for speed and clarity.
            </h2>
            <p className="text-sm sm:text-base text-[#52627A] dark:text-[#94A3B8] max-w-xl mx-auto">
              Fluid animations, edge-to-edge system integration, and responsive intelligence designed specifically for Android.
            </p>
          </div>

          {/* Mobile Smartphone Mockup Frame */}
          <div className="max-w-[340px] sm:max-w-sm mx-auto rounded-[40px] p-3 sm:p-4 bg-[#0F172A] dark:bg-[#030712] border-4 border-[#334155]/60 dark:border-white/10 shadow-[0_30px_90px_rgba(37,99,235,0.20)]">
            
            <div className="rounded-[30px] bg-[#F7FAFF] dark:bg-[#070C18] border border-black/5 dark:border-white/5 overflow-hidden text-left p-5 space-y-4 font-sans">
              
              {/* Status Header */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] pb-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>5G</span>
                </div>
              </div>

              {/* Contril Brand Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <ContrilLogo size="xs" strokeColor="#2563EB" />
                  <div>
                    <div className="text-xs font-bold font-mono tracking-wide text-[#0B1220] dark:text-white">
                      CONTRIL
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      AI CHIEF OF STAFF
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-medium">
                  Active
                </span>
              </div>

              {/* Greeting */}
              <div className="space-y-0.5 pt-1">
                <div className="text-lg font-bold text-[#0B1220] dark:text-white">
                  Good morning.
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#94A3B8]">
                  3 things need your attention
                </div>
              </div>

              {/* Section 1: Email */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B1220] dark:text-white">
                    <Mail className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                    <span>Email</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    Gmail
                  </span>
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#CBD5E1]">
                  12 unread • 2 important
                </div>
              </div>

              {/* Section 2: Calendar */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B1220] dark:text-white">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                    <span>Calendar</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    10:30 AM
                  </span>
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#CBD5E1]">
                  Team meeting • 10:30 AM
                </div>
              </div>

              {/* Section 3: Tasks */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B1220] dark:text-white">
                    <CheckSquare className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                    <span>Tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    Due Today
                  </span>
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#CBD5E1]">
                  3 due today
                </div>
              </div>

              {/* Section 4: Documents */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B1220] dark:text-white">
                    <FileText className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                    <span>Documents</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    Drive
                  </span>
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#CBD5E1]">
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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              Everything connected.
            </h2>
            <p className="text-base text-[#52627A] dark:text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
              Contril unifies context from your active tools into a single intelligence stream.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-2xl mx-auto">
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
                className="p-4 rounded-xl bg-white/70 dark:bg-[#0B1222]/70 border border-[#E2E8F0] dark:border-white/10 flex flex-col items-center text-center space-y-2 shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                  <tool.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B1220] dark:text-white">{tool.name}</div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{tool.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. FINAL CTA
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-24 sm:pb-32 text-center">
          <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-b from-white/90 to-blue-50/50 dark:from-[#0D1527]/90 dark:to-[#080E1C]/90 border border-blue-500/20 shadow-[0_20px_60px_rgba(37,99,235,0.12)] space-y-6">
            
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              Your work, <br className="hidden sm:inline" />
              under control.
            </h2>

            <p className="text-base sm:text-lg text-[#52627A] dark:text-[#94A3B8] max-w-lg mx-auto">
              Open Contril on the web or install the native Android app.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto w-full">
              <button
                onClick={handleOpenContril}
                className="w-full sm:w-auto px-8 h-13 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Open Contril →</span>
              </button>

              <a
                href={CONTRIL_APK_CONFIG.downloadUrl}
                download="contril-android.apk"
                className="w-full sm:w-auto px-8 h-13 rounded-xl bg-white dark:bg-[#121B30] hover:bg-slate-50 dark:hover:bg-[#18233F] border border-[#E2E8F0] dark:border-white/15 text-[#0B1220] dark:text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
                <span>Download Android App ↓</span>
              </a>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
