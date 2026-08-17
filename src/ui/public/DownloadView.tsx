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
    <div className="relative w-full min-h-screen text-left font-sans bg-[#DDECFB] text-[#091024] overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* =========================================================================
          SIGNATURE ATMOSPHERIC BLUE LIGHTING CANVAS (Matches Screenshot Exactly)
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        
        {/* Base smooth vertical gradient */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(180deg, #D5E7FA 0%, #DFEEFD 35%, #EAF3FD 65%, #F4F8FD 100%)'
          }}
        />

        {/* Left atmospheric periwinkle-blue ambient glow */}
        <div 
          className="absolute top-0 -left-[100px] w-[750px] h-[750px] opacity-90"
          style={{
            background: 'radial-gradient(circle 750px at 20% 30%, #C3DAFA 0%, rgba(195, 218, 250, 0.6) 45%, transparent 75%)'
          }}
        />

        {/* Right atmospheric sky-cyan ambient glow */}
        <div 
          className="absolute top-0 -right-[100px] w-[750px] h-[750px] opacity-90"
          style={{
            background: 'radial-gradient(circle 750px at 80% 30%, #BFE2FD 0%, rgba(191, 226, 253, 0.6) 45%, transparent 75%)'
          }}
        />

        {/* Center luminous illumination behind the composition */}
        <div 
          className="absolute top-[30px] left-1/2 -translate-x-1/2 w-[1100px] h-[600px] opacity-95"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 35%, #EDF5FE 0%, rgba(237, 245, 254, 0.7) 45%, transparent 80%)'
          }}
        />

        {/* Lower atmospheric field for the platform section */}
        <div 
          className="absolute top-[650px] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] opacity-70"
          style={{
            background: 'radial-gradient(ellipse 90% 60% at 50% 40%, #E2EFFD 0%, rgba(240, 247, 254, 0.5) 50%, transparent 80%)'
          }}
        />
      </div>

      <div className="w-full">
        
        {/* =========================================================================
            1. HERO SECTION
            ========================================================================= */}
        <section className="relative pt-12 pb-12 sm:pt-20 sm:pb-16 px-5 sm:px-8 max-w-4xl mx-auto text-center">
          
          <div className="space-y-5 sm:space-y-6">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D7E7FA]/80 border border-[#BFDBFE] text-[11px] sm:text-xs font-semibold text-[#2563EB] tracking-wider uppercase select-none shadow-2xs backdrop-blur-xs">
              <ContrilLogo size="xs" strokeColor="#2563EB" />
              <span>GET CONTRIL</span>
            </div>

            {/* Main Headline */}
            <div className="max-w-[390px] sm:max-w-3xl mx-auto">
              <h1 className="text-[40px] sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.04] sm:leading-[1.08]">
                <span className="text-[#091024]">
                  Your AI chief of staff,
                </span>
                <br className="hidden sm:inline" />
                {' '}
                <span className="bg-gradient-to-r from-[#2563EB] to-[#38BDF8] bg-clip-text text-transparent">
                  wherever you work.
                </span>
              </h1>
            </div>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed max-w-2xl mx-auto">
              Use Contril instantly on the web or install the native Android app for a dedicated mobile experience.
            </p>

            {/* Dual Action CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-[360px] sm:max-w-md mx-auto w-full">
              <button
                onClick={handleOpenContril}
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(37,99,235,0.30)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <span>{isAuthenticated ? 'OPEN CONTRIL' : 'OPEN CONTRIL →'}</span>
              </button>

              <a
                href={CONTRIL_APK_CONFIG.downloadUrl}
                download="contril-android.apk"
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-white/85 hover:bg-white text-[#091024] border border-white/90 text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0 backdrop-blur-xs"
              >
                <Download className="w-4 h-4 text-[#2563EB]" />
                <span>DOWNLOAD ANDROID APP ↓</span>
              </a>
            </div>

            {/* Small supporting metadata */}
            <div className="pt-1 font-mono text-[11px] text-[#64748B] font-medium tracking-wide">
              Instant Browser Access • Native Android (Kotlin & Jetpack Compose • {CONTRIL_APK_CONFIG.fileSize})
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. PLATFORM SECTION (Two Premium Option Panels)
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-5xl mx-auto pt-6 pb-16 sm:pb-24">
          
          {/* Section Heading */}
          <div className="text-center space-y-2.5 mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#091024]">
              One workspace. <br className="hidden sm:inline" />
              Two ways to use Contril.
            </h2>
            <p className="text-sm sm:text-base text-[#475569] max-w-lg mx-auto">
              Choose the experience that fits how you work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* PANEL 1: Contril for Web */}
            <div className="rounded-3xl p-7 sm:p-9 bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(37,99,235,0.07)] flex flex-col justify-between space-y-8 transition-all hover:border-[#2563EB]/40">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                  <Globe className="w-6 h-6" />
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#091024]">
                    Contril for Web
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Use Contril instantly from any modern browser. Zero installation required.
                  </p>
                </div>

                <ul className="space-y-3 pt-2 text-left text-sm text-[#334155]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Instant access on desktop and mobile browsers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Always updated to the latest version</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
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
            <div className="rounded-3xl p-7 sm:p-9 bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(37,99,235,0.07)] flex flex-col justify-between space-y-8 transition-all hover:border-[#2563EB]/40">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                    NATIVE APP
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#091024]">
                    Contril for Android
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Dedicated native application built with Kotlin and Jetpack Compose.
                  </p>
                </div>

                <ul className="space-y-3 pt-2 text-left text-sm text-[#334155]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Pure Jetpack Compose UI (0% WebView)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Native system notifications for priority alerts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
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
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#2563EB] uppercase tracking-wider">
              <span>NATIVE ANDROID EXPERIENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#091024]">
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
                    <div className="text-xs font-bold font-mono tracking-wide text-[#091024]">
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
                <div className="text-lg font-bold text-[#091024]">
                  Good morning.
                </div>
                <div className="text-xs text-[#52627A]">
                  3 things need your attention
                </div>
              </div>

              {/* Section 1: Email */}
              <div className="p-3 rounded-xl bg-white border border-black/5 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#091024]">
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
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#091024]">
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
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#091024]">
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
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#091024]">
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
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-16 sm:pb-24 text-center space-y-7">
          <div className="space-y-2.5">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#091024]">
              Everything connected.
            </h2>
            <p className="text-sm sm:text-base text-[#475569] max-w-xl mx-auto leading-relaxed">
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
                className="p-4 rounded-2xl bg-white/90 border border-white/80 flex flex-col items-center text-center space-y-2 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                  <tool.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#091024]">{tool.name}</div>
                  <div className="text-[10px] text-[#64748B]">{tool.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. FINAL CTA
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 sm:pb-28 text-center">
          <div className="rounded-3xl p-8 sm:p-12 bg-white/90 border border-white/80 shadow-[0_20px_60px_rgba(37,99,235,0.08)] space-y-6">
            
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#091024]">
              Your work, <br className="hidden sm:inline" />
              under control.
            </h2>

            <p className="text-sm sm:text-base text-[#475569] max-w-lg mx-auto">
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
                className="w-full sm:w-auto px-8 h-[52px] sm:h-13 rounded-xl bg-white/80 hover:bg-white border border-white/80 text-[#091024] text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
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
