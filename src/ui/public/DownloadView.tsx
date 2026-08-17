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
  Search
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
    <div className="relative w-full min-h-screen text-left font-sans bg-[#EEF4FF] dark:bg-[#050B1A] text-[#061229] dark:text-[#F8FAFC] overflow-x-hidden transition-colors duration-300">
      
      {/* =========================================================================
          RICH MULTI-LAYER ATMOSPHERIC LIGHTING ENVIRONMENT
          Smooth blue/lavender atmospheric gradients with depth around hero
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        
        {/* LIGHT THEME ATMOSPHERIC LAYERS */}
        {/* Layer 1: Upper-center soft blue ambient sky glow */}
        <div 
          className="dark:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[1300px] h-[750px] opacity-80"
          style={{
            background: 'radial-gradient(ellipse 95% 75% at 50% -10%, rgba(186, 215, 255, 0.70) 0%, rgba(219, 234, 254, 0.45) 40%, transparent 80%)'
          }}
        />

        {/* Layer 2: Upper-left lavender / soft blue illumination */}
        <div 
          className="dark:hidden absolute top-[50px] -left-[150px] w-[650px] h-[650px] opacity-75"
          style={{
            background: 'radial-gradient(circle 650px at center, rgba(199, 210, 254, 0.50) 0%, rgba(224, 231, 255, 0.25) 45%, transparent 75%)'
          }}
        />

        {/* Layer 3: Upper-right cyan / sky blue atmospheric field */}
        <div 
          className="dark:hidden absolute top-[80px] -right-[150px] w-[650px] h-[650px] opacity-75"
          style={{
            background: 'radial-gradient(circle 650px at center, rgba(186, 230, 253, 0.55) 0%, rgba(224, 242, 254, 0.30) 50%, transparent 75%)'
          }}
        />

        {/* Layer 4: Continuous atmospheric bridge across One Workspace section */}
        <div 
          className="dark:hidden absolute top-[550px] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-50"
          style={{
            background: 'radial-gradient(ellipse 90% 55% at 50% 50%, rgba(219, 234, 254, 0.40) 0%, rgba(239, 246, 255, 0.20) 50%, transparent 80%)'
          }}
        />

        {/* Layer 5: Bottom atmospheric fade */}
        <div 
          className="dark:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-40"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 50% 100%, rgba(219, 234, 254, 0.35) 0%, transparent 70%)'
          }}
        />
        
        {/* DARK THEME ATMOSPHERIC LAYERS */}
        {/* Layer 1: Top atmospheric cosmic blue glow */}
        <div 
          className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] opacity-85"
          style={{
            background: 'radial-gradient(ellipse 75% 50% at 50% -15%, rgba(37,99,235,0.32) 0%, rgba(56,189,248,0.15) 40%, rgba(11,31,63,0.05) 65%, transparent 80%)'
          }}
        />

        {/* Layer 2: Side ambient cosmic fields */}
        <div 
          className="hidden dark:block absolute top-[400px] -left-[200px] w-[500px] h-[500px] opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)'
          }}
        />
        <div 
          className="hidden dark:block absolute top-[600px] -right-[200px] w-[500px] h-[500px] opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.20) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="w-full">
        
        {/* =========================================================================
            1. HERO SECTION (Compact, Intentional, High Contrast)
            ========================================================================= */}
        <section className="relative pt-10 pb-10 sm:pt-16 sm:pb-14 px-5 sm:px-8 max-w-4xl mx-auto text-center">
          
          {/* Subtle dark mode text protection scrim */}
          <div 
            className="hidden dark:block absolute inset-0 -top-6 -bottom-6 pointer-events-none -z-10 opacity-60"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(5,11,26,0.7) 0%, transparent 75%)'
            }}
          />

          <div className="space-y-5 sm:space-y-6">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 dark:bg-blue-500/15 border border-blue-600/25 dark:border-blue-500/25 text-[11px] sm:text-xs font-bold text-[#1D4ED8] dark:text-[#38BDF8] tracking-widest uppercase select-none shadow-xs">
              <ContrilLogo size="xs" strokeColor="#1D4ED8" />
              <span>GET CONTRIL</span>
            </div>

            {/* Main Headline */}
            <div className="max-w-[390px] sm:max-w-3xl mx-auto">
              <h1 className="text-[38px] sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.04] sm:leading-[1.08]">
                <span className="text-[#061229] dark:text-[#F8FAFC]">
                  Your AI chief of staff,
                </span>
                <br className="hidden sm:inline" />
                {' '}
                <span className="bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#0284C7] dark:from-[#38BDF8] dark:via-[#60A5FA] dark:to-[#93C5FD] bg-clip-text text-transparent">
                  wherever you work.
                </span>
              </h1>
            </div>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#1E293B] dark:text-[#CBD5E1] font-normal leading-relaxed max-w-2xl mx-auto">
              Use Contril instantly on the web or install the native Android app for a dedicated mobile workspace.
            </p>

            {/* Dual Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-[360px] sm:max-w-md mx-auto w-full">
              <button
                onClick={handleOpenContril}
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(37,99,235,0.30)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <span>{isAuthenticated ? 'OPEN CONTRIL' : 'OPEN CONTRIL →'}</span>
              </button>

              <a
                href={CONTRIL_APK_CONFIG.downloadUrl}
                download="contril-android.apk"
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-white/90 dark:bg-[#0C152B]/90 hover:bg-white dark:hover:bg-[#121E3D] border border-blue-200/80 dark:border-white/20 text-[#061229] dark:text-white text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
              >
                <Download className="w-4 h-4 text-[#1D4ED8] dark:text-[#38BDF8]" />
                <span>DOWNLOAD ANDROID APP ↓</span>
              </a>
            </div>

            {/* Small supporting metadata */}
            <div className="pt-1 font-mono text-[11px] text-[#334155] dark:text-[#94A3B8] font-medium tracking-wide">
              Instant Browser Access • Native Android (Kotlin & Jetpack Compose • {CONTRIL_APK_CONFIG.fileSize})
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. PLATFORM SECTION (Two Premium Option Panels)
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-5xl mx-auto pt-6 pb-16 sm:pb-22">
          
          {/* Section Heading */}
          <div className="text-center space-y-2.5 mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#061229] dark:text-[#F8FAFC]">
              One workspace. <br className="hidden sm:inline" />
              Two ways to use Contril.
            </h2>
            <p className="text-sm sm:text-base text-[#334155] dark:text-[#94A3B8] max-w-lg mx-auto">
              Choose the experience that fits how you work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
            
            {/* PANEL 1: Contril for Web */}
            <div className="rounded-2xl p-7 sm:p-9 bg-white/90 dark:bg-[#070F24]/90 backdrop-blur-xl border border-blue-100/90 dark:border-white/10 shadow-[0_16px_40px_rgba(37,99,235,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between space-y-8 transition-all hover:border-[#2563EB]/50">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                  <Globe className="w-6 h-6" />
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#061229] dark:text-white">
                    Contril for Web
                  </h3>
                  <p className="text-sm text-[#334155] dark:text-[#94A3B8] leading-relaxed">
                    Use Contril instantly from any modern browser. Zero installation required.
                  </p>
                </div>

                <ul className="space-y-3 pt-2 text-left text-sm text-[#1E293B] dark:text-[#CBD5E1]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Instant access on desktop and mobile browsers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Always updated to the latest version</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Cross-platform intelligence sync</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleOpenContril}
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Open Contril →</span>
                </button>
              </div>
            </div>

            {/* PANEL 2: Contril for Android */}
            <div className="rounded-2xl p-7 sm:p-9 bg-white/90 dark:bg-[#070F24]/90 backdrop-blur-xl border border-blue-100/90 dark:border-white/10 shadow-[0_16px_40px_rgba(37,99,235,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between space-y-8 transition-all hover:border-[#2563EB]/50">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-600/10 dark:bg-blue-500/20 border border-blue-600/20 dark:border-blue-500/30 text-[10px] font-mono font-bold text-[#1D4ED8] dark:text-[#38BDF8] uppercase tracking-wider">
                    NATIVE APP
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#061229] dark:text-white">
                    Contril for Android
                  </h3>
                  <p className="text-sm text-[#334155] dark:text-[#94A3B8] leading-relaxed">
                    Dedicated native application built with Kotlin and Jetpack Compose.
                  </p>
                </div>

                <ul className="space-y-3 pt-2 text-left text-sm text-[#1E293B] dark:text-[#CBD5E1]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Pure Jetpack Compose UI (0% WebView)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Native system notifications for priority alerts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Offline-first local intelligence fallback</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <a
                  href={CONTRIL_APK_CONFIG.downloadUrl}
                  download="contril-android.apk"
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.3)] cursor-pointer flex items-center justify-center gap-2"
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
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-16 sm:pb-24">
          <div className="text-center space-y-2.5 mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#1D4ED8] dark:text-[#38BDF8] uppercase tracking-wider">
              <span>NATIVE ANDROID EXPERIENCE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#061229] dark:text-[#F8FAFC]">
              Built for speed and clarity.
            </h2>
            <p className="text-sm sm:text-base text-[#334155] dark:text-[#94A3B8] max-w-xl mx-auto">
              Fluid animations, edge-to-edge system integration, and responsive intelligence designed specifically for Android.
            </p>
          </div>

          {/* Smartphone Mockup Frame */}
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
                    <div className="text-xs font-bold font-mono tracking-wide text-[#061229] dark:text-white">
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
                <div className="text-lg font-bold text-[#061229] dark:text-white">
                  Good morning.
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#94A3B8]">
                  3 things need your attention
                </div>
              </div>

              {/* Section 1: Email */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#061229] dark:text-white">
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
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#061229] dark:text-white">
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
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#061229] dark:text-white">
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
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#061229] dark:text-white">
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
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-16 sm:pb-24 text-center space-y-7">
          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#061229] dark:text-[#F8FAFC]">
              Everything connected.
            </h2>
            <p className="text-sm sm:text-base text-[#334155] dark:text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
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
                className="p-4 rounded-xl bg-white/90 dark:bg-[#070F24]/80 border border-blue-100/90 dark:border-white/10 flex flex-col items-center text-center space-y-2 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                  <tool.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#061229] dark:text-white">{tool.name}</div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{tool.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. FINAL CTA
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 sm:pb-28 text-center">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-white/95 to-blue-50/70 dark:from-[#091127]/90 dark:to-[#050B1A]/90 border border-blue-500/20 shadow-[0_20px_60px_rgba(37,99,235,0.10)] space-y-6">
            
            <h2 className="text-2xl sm:text-5xl font-bold tracking-tight text-[#061229] dark:text-white">
              Your work, <br className="hidden sm:inline" />
              under control.
            </h2>

            <p className="text-sm sm:text-base text-[#334155] dark:text-[#94A3B8] max-w-lg mx-auto">
              Open Contril on the web or install the native Android app.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-[360px] sm:max-w-md mx-auto w-full">
              <button
                onClick={handleOpenContril}
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(37,99,235,0.30)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.45)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Open Contril →</span>
              </button>

              <a
                href={CONTRIL_APK_CONFIG.downloadUrl}
                download="contril-android.apk"
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-white dark:bg-[#0C152B] hover:bg-slate-50 dark:hover:bg-[#121E3D] border border-blue-200/80 dark:border-white/20 text-[#061229] dark:text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4 text-[#1D4ED8] dark:text-[#38BDF8]" />
                <span>Download Android App ↓</span>
              </a>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
