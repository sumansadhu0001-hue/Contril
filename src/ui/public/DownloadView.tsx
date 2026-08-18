import React, { useState } from 'react';
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
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { CONTRIL_APK_CONFIG } from '../../config/apkConfig';
import { DeviceInfo } from '../../lib/deviceDetection';

interface DownloadViewProps {
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
  deviceInfo?: DeviceInfo;
}

export const DownloadView: React.FC<DownloadViewProps> = ({ 
  onNavigate, 
  isAuthenticated 
}) => {
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  const handleOpenContril = () => {
    onNavigate(isAuthenticated ? 'app' : 'login');
  };

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(CONTRIL_APK_CONFIG.sha256Checksum);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2500);
  };

  const isPlayStoreMode = CONTRIL_APK_CONFIG.distributionMode === 'PLAY_STORE';

  return (
    <div className="w-full text-left font-sans text-[#0B1220] dark:text-[#F8FAFC]">
      <div className="w-full overflow-hidden">
        
        {/* =========================================================================
            1. DOWNLOAD HERO SECTION (Mobile-Optimized & High-Contrast)
            ========================================================================= */}
        <section className="pt-6 pb-8 sm:pt-16 sm:pb-16 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-4 sm:space-y-6">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8] tracking-wider uppercase select-none">
            <ContrilLogo size="xs" strokeColor="#2563EB" />
            <span>GET CONTRIL</span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-[#0B1220] dark:text-white leading-[1.04] sm:leading-[1.0] max-w-4xl mx-auto">
            Your AI chief of staff, <br className="hidden sm:inline" />
            <span className="text-[#2563EB] dark:text-[#38BDF8]">
              wherever you work.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-lg text-[#52627A] dark:text-[#94A3B8] font-normal leading-relaxed max-w-[360px] sm:max-w-xl mx-auto">
            Use Contril instantly on the web or install the native Android app for an autonomous mobile executive experience.
          </p>

          {/* Dual Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[340px] sm:max-w-none mx-auto w-full">
            <button
              onClick={handleOpenContril}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Open Contril' : 'Open Contril →'}</span>
            </button>

            {isPlayStoreMode ? (
              <a
                href={CONTRIL_APK_CONFIG.playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-[#38BDF8]" />
                <span>Get it on Google Play</span>
              </a>
            ) : (
              <a
                href={CONTRIL_APK_CONFIG.downloadUrl}
                download="contril-android.apk"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/90 dark:bg-[#0D1322]/90 hover:bg-white dark:hover:bg-[#151D33] backdrop-blur-md border border-[#E5E7EB]/80 dark:border-white/10 hover:border-[#BFDBFE] text-xs font-semibold text-[#0B1220] dark:text-[#E2E8F0] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                <span>Download Android (v{CONTRIL_APK_CONFIG.version} · {CONTRIL_APK_CONFIG.fileSize}) ↓</span>
              </a>
            )}
          </div>

          {/* Version & Technical Metadata Badge */}
          <div className="pt-1 font-mono text-[11px] sm:text-xs text-[#52627A] dark:text-[#94A3B8] flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded font-semibold">
              v{CONTRIL_APK_CONFIG.version}
            </span>
            <span>•</span>
            <span>{CONTRIL_APK_CONFIG.fileSize}</span>
            <span>•</span>
            <span>Released {CONTRIL_APK_CONFIG.releaseDate}</span>
            <span>•</span>
            <span>Signed Production Release</span>
          </div>

          {/* Sideload / Install Security Advisory Banner */}
          {!isPlayStoreMode && (
            <div className="max-w-xl mx-auto mt-4 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-[#38BDF8] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#1E3A8A] dark:text-[#93C5FD]">
                  Direct APK Installation Notice
                </div>
                <p className="text-[11px] text-[#3B82F6] dark:text-[#BFDBFE] leading-relaxed">
                  {CONTRIL_APK_CONFIG.installNotice}
                </p>
              </div>
            </div>
          )}

          {/* File Integrity SHA-256 Checksum Drawer */}
          {!isPlayStoreMode && (
            <div className="max-w-xl mx-auto pt-1">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0B101B] border border-neutral-200 dark:border-white/10 text-left flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
                    SHA-256 Checksum (Integrity Verification)
                  </div>
                  <div className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 truncate select-all">
                    {CONTRIL_APK_CONFIG.sha256Checksum}
                  </div>
                </div>
                <button
                  onClick={handleCopyChecksum}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#151D33] border border-neutral-200 dark:border-white/10 hover:border-blue-400 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  {copiedChecksum ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </section>

        {/* =========================================================================
            2. PLATFORM OPTIONS (Two Contril Native Experience Cards)
            ========================================================================= */}
        <section className="px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto pb-16 sm:pb-24">
          
          <div className="text-center space-y-1.5 sm:space-y-2 mb-8 sm:mb-12">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
              PLATFORM OPTIONS
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              One workspace. Everywhere you work.
            </h2>
            <p className="text-xs sm:text-base text-[#52627A] dark:text-[#94A3B8] max-w-md mx-auto">
              Choose the experience that fits how you work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-xl md:max-w-none mx-auto">
            
            {/* PANEL 1: Contril for Web */}
            <div className="rounded-2xl bg-white/85 dark:bg-[#0D121D]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm sm:shadow-[0_30px_80px_rgba(37,99,235,0.12)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.7)] p-6 sm:p-8 flex flex-col justify-between space-y-6 sm:space-y-8 transition-all hover:border-[#BFDBFE] dark:hover:border-blue-500/40">
              <div className="space-y-4 sm:space-y-5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B1220] dark:text-white">
                    Contril for Web
                  </h3>
                  <p className="text-xs sm:text-sm text-[#52627A] dark:text-[#94A3B8] leading-relaxed">
                    Use Contril instantly from your browser. Zero setup required on desktop and mobile browsers.
                  </p>
                </div>

                <ul className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2 text-left text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Instant access on any modern browser</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Always updated to the latest build</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Cross-platform intelligence sync</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleOpenContril}
                  className="w-full py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Open Contril →</span>
                </button>
              </div>
            </div>

            {/* PANEL 2: Contril for Android */}
            <div className="rounded-2xl bg-white/85 dark:bg-[#0D121D]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm sm:shadow-[0_30px_80px_rgba(37,99,235,0.12)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.7)] p-6 sm:p-8 flex flex-col justify-between space-y-6 sm:space-y-8 transition-all hover:border-[#BFDBFE] dark:hover:border-blue-500/40">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-blue-500/10 text-[#2563EB] dark:text-[#38BDF8] border border-[#BFDBFE] dark:border-blue-800">
                    NATIVE APP
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B1220] dark:text-white">
                    Contril for Android
                  </h3>
                  <p className="text-xs sm:text-sm text-[#52627A] dark:text-[#94A3B8] leading-relaxed">
                    Install the native Android application built with Kotlin and Jetpack Compose for a dedicated mobile experience.
                  </p>
                </div>

                <ul className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2 text-left text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Pure Jetpack Compose UI (0% WebView)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Autonomous overnight triage & notifications</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Real-time offline caching with last-synced time</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                {isPlayStoreMode ? (
                  <a
                    href={CONTRIL_APK_CONFIG.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-all shadow-[0_8px_24px_rgba(15,23,42,0.25)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.35)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-[#38BDF8]" />
                    <span>Get on Google Play</span>
                  </a>
                ) : (
                  <a
                    href={CONTRIL_APK_CONFIG.downloadUrl}
                    download="contril-android.apk"
                    className="w-full py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Android App (v{CONTRIL_APK_CONFIG.version}) ↓</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. WHAT YOU GET (Product Value Breakdown)
            ========================================================================= */}
        <section className="py-14 sm:py-20 bg-transparent border-t border-[#E5E7EB]/60 dark:border-white/10 max-w-full">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-8 sm:space-y-10 text-left">
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
                WHAT YOU GET
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
                Everything in one place.
              </h2>
              <p className="text-xs sm:text-base text-[#52627A] dark:text-[#94A3B8] max-w-xl">
                Contril coordinates your workflow so you can focus on making high-leverage decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {[
                { title: 'One workspace', desc: 'Bring your email, calendar, documents, and code into one unified view.' },
                { title: 'Understand', desc: 'Contril continuously indexes context across your connected tools.' },
                { title: 'Act', desc: 'Turn instructions into useful, verified drafts, summaries, and actions.' },
                { title: 'Stay ahead', desc: 'Get important briefings and context before you even ask.' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-white/70 dark:bg-[#0D121D]/70 backdrop-blur-md border border-[#E5E7EB]/70 dark:border-white/10 space-y-2"
                >
                  <div className="text-xs font-mono font-bold text-[#2563EB] dark:text-[#38BDF8]">
                    0{idx + 1}
                  </div>
                  <div className="font-semibold text-sm text-[#0B1220] dark:text-white">
                    {item.title}
                  </div>
                  <p className="text-xs text-[#52627A] dark:text-[#94A3B8] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. FINAL CTA (Contril, wherever you work)
            ========================================================================= */}
        <section className="py-14 sm:py-20 bg-transparent border-t border-[#E5E7EB]/60 dark:border-white/10 px-4 sm:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold text-[#0B1220] dark:text-white tracking-tight">
              Contril, wherever you work.
            </h2>
            <p className="text-xs sm:text-base text-[#52627A] dark:text-[#94A3B8] leading-relaxed max-w-lg mx-auto">
              Use it instantly in your browser, or install the Android application on your phone.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[340px] sm:max-w-none mx-auto w-full">
              <button
                onClick={handleOpenContril}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Open Contril' : 'Open Contril →'}</span>
              </button>

              {isPlayStoreMode ? (
                <a
                  href={CONTRIL_APK_CONFIG.playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <span>Get on Google Play</span>
                </a>
              ) : (
                <a
                  href={CONTRIL_APK_CONFIG.downloadUrl}
                  download="contril-android.apk"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/85 dark:bg-[#0D121D]/85 backdrop-blur-md border border-[#E5E7EB]/80 dark:border-white/10 text-xs font-semibold text-[#0B1220] dark:text-[#E2E8F0] hover:bg-white dark:hover:bg-[#172033] hover:border-[#BFDBFE] transition-all cursor-pointer shadow-xs"
                >
                  <span>Download Android APK (v{CONTRIL_APK_CONFIG.version})</span>
                </a>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
