import React from 'react';
import { 
  Download, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  AlertTriangle,
  Mail,
  Calendar,
  FileText,
  Github,
  Search,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { CONTRIL_APK_CONFIG } from '../../config/apkConfig';
import { detectDevice, getDeviceType, DeviceInfo } from '../../lib/deviceDetection';

interface DownloadViewProps {
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
  deviceInfo?: DeviceInfo;
}

export const DownloadView: React.FC<DownloadViewProps> = ({ 
  onNavigate, 
  isAuthenticated,
  deviceInfo = detectDevice()
}) => {
  const deviceType = getDeviceType();
  const isApkAvailable = Boolean(CONTRIL_APK_CONFIG.downloadUrl && CONTRIL_APK_CONFIG.downloadUrl.trim().length > 0);

  const handleOpenContril = () => {
    onNavigate(isAuthenticated ? 'app' : 'login');
  };

  return (
    <div className="w-full text-left font-sans text-[#0B1220] dark:text-[#F8FAFC]">
      <div className="w-full overflow-hidden">
        
        {/* =========================================================================
            1. HERO SECTION (Automatic Device Detection & Dynamic Primary CTA)
            ========================================================================= */}
        <section className="pt-8 pb-10 sm:pt-16 sm:pb-14 px-5 sm:px-8 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8] tracking-wider uppercase select-none">
            <ContrilLogo size="xs" strokeColor="#2563EB" />
            <span>GET CONTRIL</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#0B1220] dark:text-white leading-[1.04]">
            Use Contril <br className="hidden sm:inline" />
            <span className="text-[#2563EB] dark:text-[#38BDF8]">
              wherever you work.
            </span>
          </h1>

          {/* Short Description */}
          <p className="text-base sm:text-lg text-[#52627A] dark:text-[#94A3B8] font-normal leading-relaxed max-w-xl mx-auto">
            Your AI Chief of Staff, available instantly in your browser and on Android.
          </p>

          {/* Subtle Inline Device Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#0D121D]/80 backdrop-blur-md border border-[#E5E7EB]/80 dark:border-white/10 text-xs font-mono font-medium text-[#52627A] dark:text-[#CBD5E1]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {deviceType === 'android' && 'ANDROID DEVICE DETECTED'}
              {deviceType === 'ios' && 'IPHONE / IPAD DETECTED'}
              {deviceType === 'desktop' && 'DESKTOP DETECTED'}
            </span>
          </div>

          {/* =========================================================================
              DYNAMIC SINGLE-INTELLIGENT CTA BLOCK (Based on Detected Device)
              ========================================================================= */}
          <div className="pt-2 max-w-[440px] mx-auto w-full space-y-3">
            
            {/* ANDROID VISITOR EXPERIENCE */}
            {deviceType === 'android' && (
              <div className="space-y-3">
                <div className="text-xs text-[#52627A] dark:text-[#94A3B8]">
                  Download the Android preview directly to your device.
                </div>

                {isApkAvailable ? (
                  <a
                    href={CONTRIL_APK_CONFIG.downloadUrl}
                    download="contril-release.apk"
                    className="w-full h-14 rounded-[14px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Download Android APK →</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full h-14 rounded-[14px] bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-500 text-xs font-semibold cursor-not-allowed flex items-center justify-center"
                  >
                    Android download is temporarily unavailable.
                  </button>
                )}

                <div className="pt-1">
                  <button
                    onClick={handleOpenContril}
                    className="text-xs text-[#52627A] dark:text-[#94A3B8] hover:text-[#0B1220] dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 font-medium"
                  >
                    <span>Use in browser instead →</span>
                  </button>
                </div>

                <div className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Android 8.0+ • APK • Experimental Preview
                </div>
              </div>
            )}

            {/* iOS / IPAD VISITOR EXPERIENCE */}
            {deviceType === 'ios' && (
              <div className="space-y-3">
                <div className="text-xs text-[#52627A] dark:text-[#94A3B8]">
                  Contril works instantly in your browser on iOS.
                </div>

                <button
                  onClick={handleOpenContril}
                  className="w-full h-14 rounded-[14px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isAuthenticated ? 'Open Contril' : 'Open Contril →'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-1">
                  <span className="text-xs text-[#52627A] dark:text-[#94A3B8]">
                    Android installation is available separately.
                  </span>
                </div>

                <div className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Works in modern Safari & WebKit • No installation required
                </div>
              </div>
            )}

            {/* DESKTOP VISITOR EXPERIENCE (Windows / macOS / Linux) */}
            {deviceType === 'desktop' && (
              <div className="space-y-3">
                <div className="text-xs text-[#52627A] dark:text-[#94A3B8]">
                  Use Contril instantly in your browser.
                </div>

                <button
                  onClick={handleOpenContril}
                  className="w-full h-14 rounded-[14px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isAuthenticated ? 'Open Contril' : 'Open Contril →'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-1">
                  {isApkAvailable ? (
                    <a
                      href={CONTRIL_APK_CONFIG.downloadUrl}
                      download="contril-release.apk"
                      className="text-xs text-[#52627A] dark:text-[#94A3B8] hover:text-[#0B1220] dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                      <span>Or download the Android preview APK ({CONTRIL_APK_CONFIG.fileSize}) →</span>
                    </a>
                  ) : (
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      Android preview download is being updated.
                    </span>
                  )}
                </div>

                <div className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Works in modern browsers • No installation required
                </div>
              </div>
            )}

          </div>

        </section>

        {/* =========================================================================
            2. REFINED PRODUCT WORKSPACE PREVIEW
            ========================================================= */}
        <section className="px-4 sm:px-8 max-w-4xl mx-auto pb-16 sm:pb-20">
          <div className="w-full rounded-2xl bg-white/85 dark:bg-[#0D121D]/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_30px_80px_rgba(37,99,235,0.10),0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden text-left transition-all">
            
            {/* Header Bar */}
            <div className="px-5 py-3 border-b border-[#E5E7EB]/70 dark:border-neutral-800/80 bg-white/60 dark:bg-[#131A29]/80 backdrop-blur-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <ContrilLogo size="xs" strokeColor="#2563EB" />
                <span className="font-semibold text-[#0B1220] dark:text-white font-mono text-[11px]">
                  CONTRIL
                </span>
                <span className="text-[#52627A] dark:text-[#94A3B8] text-[11px] hidden sm:inline">
                  • AI Chief of Staff
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-8 space-y-5">
              
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono text-[#52627A] dark:text-[#94A3B8] uppercase tracking-wider">
                  WORKSPACE
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#0B1220] dark:text-white">
                  Good afternoon, Alex.
                </h3>
              </div>

              {/* Priorities Card */}
              <div className="p-4 sm:p-5 rounded-xl border border-[#2563EB]/25 dark:border-blue-500/30 bg-white/90 dark:bg-[#111827]/90 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-[#2563EB] dark:text-[#38BDF8]">
                    TODAY'S PRIORITIES
                  </span>
                  <span className="text-[10px] font-mono text-[#52627A] dark:text-[#CBD5E1]">
                    3 actions ready for review
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#141B2B] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="font-medium text-[#0B1220] dark:text-white truncate">Client follow-up</span>
                      <span className="text-[#64748B] dark:text-[#94A3B8] hidden sm:inline">— Email ready to send</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-[#52627A] dark:text-[#CBD5E1]">Gmail</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#141B2B] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="font-medium text-[#0B1220] dark:text-white truncate">Team strategy sync</span>
                      <span className="text-[#64748B] dark:text-[#94A3B8] hidden sm:inline">— Schedule conflict resolved</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-[#52627A] dark:text-[#CBD5E1]">Calendar</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#141B2B] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="font-medium text-[#0B1220] dark:text-white truncate">Project review brief</span>
                      <span className="text-[#64748B] dark:text-[#94A3B8] hidden sm:inline">— Drafted from Google Drive</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-[#52627A] dark:text-[#CBD5E1]">Drive</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-[#52627A] dark:text-[#94A3B8]">Ready to execute actions</span>
                  <span className="text-[#2563EB] dark:text-[#38BDF8] font-semibold cursor-pointer" onClick={handleOpenContril}>
                    Review actions →
                  </span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            3. INTEGRATIONS STRIP (Works with the tools you already use)
            ========================================================================= */}
        <section className="py-12 border-t border-[#E5E7EB]/60 dark:border-white/10 max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            WORKS WITH THE TOOLS YOU ALREADY USE
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#52627A] dark:text-[#CBD5E1]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="font-medium">Gmail</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="font-medium">Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="font-medium">Drive</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="font-medium">Outlook</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="font-medium">GitHub</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="font-medium">Google</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="font-medium">Web Search</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. INSTALLING THE PREVIEW (Compact 5-Step Guide)
            ========================================================================= */}
        <section className="py-14 sm:py-16 border-t border-[#E5E7EB]/60 dark:border-white/10 max-w-4xl mx-auto px-5 sm:px-8 space-y-8">
          
          <div className="space-y-1.5 text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
              INSTALLATION GUIDE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              Installing the Android preview APK.
            </h2>
            <p className="text-xs sm:text-sm text-[#52627A] dark:text-[#94A3B8]">
              Follow these simple steps on your Android device:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            {[
              { step: '01', title: 'Download', desc: 'Tap Download Android APK.' },
              { step: '02', title: 'Open File', desc: 'Open the completed .apk.' },
              { step: '03', title: 'Allow Source', desc: 'Enable unknown app install if asked.' },
              { step: '04', title: 'Install', desc: 'Confirm installation on phone.' },
              { step: '05', title: 'Launch', desc: 'Sign in to access your chief of staff.' }
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/70 dark:bg-[#0D121D]/70 backdrop-blur-md border border-[#E5E7EB]/70 dark:border-white/10 space-y-1.5 text-left">
                <div className="font-mono text-xs font-bold text-[#2563EB] dark:text-[#38BDF8]">{s.step}</div>
                <div className="text-sm font-bold text-[#0B1220] dark:text-white">{s.title}</div>
                <p className="text-xs text-[#52627A] dark:text-[#94A3B8] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Security & Experimental Notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Experimental Preview Notice:</strong> This build is distributed directly as an APK for preview testing without Google Play Store indexing. Only install APK packages from verified Contril releases.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
};
