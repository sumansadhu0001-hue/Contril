import React from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Info,
  Sparkles,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import { CONTRIL_APK_CONFIG } from '../../config/apkConfig';
import { ContrilLogo } from '../../components/ContrilLogo';

interface AndroidDownloadViewProps {
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
}

export const AndroidDownloadView: React.FC<AndroidDownloadViewProps> = ({ onNavigate, isAuthenticated }) => {
  const handleDownload = () => {
    window.location.href = CONTRIL_APK_CONFIG.downloadUrl;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 text-left bg-white dark:bg-[#0A0A0A] text-[#0F172A] dark:text-[#F5F5F5] transition-colors">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs text-[#64748B] hover:text-[#0F172A] dark:text-[#A1A1AA] dark:hover:text-white transition-colors cursor-pointer"
        >
          ← Back to overview
        </button>

        <span className="text-[11px] font-mono text-[#64748B] dark:text-[#A1A1AA]">
          Preview Build 0.1.0
        </span>
      </div>

      {/* Hero Section */}
      <div className="space-y-4">
        <ContrilLogo size="lg" strokeColor="#2563EB" />

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0F172A] dark:text-white">
            Contril for Android
          </h1>
          <p className="text-base text-[#475569] dark:text-[#A1A1AA] max-w-lg leading-relaxed">
            Your AI Chief of Staff, now on your phone.
          </p>
        </div>
      </div>

      {/* Download Action Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FAFAFA] dark:bg-[#121212] border border-[#E5E7EB] dark:border-neutral-800 space-y-5 text-left">
        
        <div className="space-y-1">
          <div className="text-sm font-medium text-[#0F172A] dark:text-white">
            Direct APK Package
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
            Get the standalone Android build for early evaluation.
          </p>
        </div>

        <div>
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Contril APK ({CONTRIL_APK_CONFIG.fileSize})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#64748B] dark:text-[#A1A1AA] pt-1">
          <span>Version: <strong>{CONTRIL_APK_CONFIG.version}</strong></span>
          <span>•</span>
          <span>Size: <strong>{CONTRIL_APK_CONFIG.fileSize}</strong></span>
          <span>•</span>
          <span>Requires: <strong>Android 8.0+</strong></span>
        </div>

      </div>

      {/* What You'll Get */}
      <div className="space-y-4">
        <div className="text-xs font-medium uppercase tracking-wider text-[#64748B] dark:text-[#A1A1AA]">
          What's Included
        </div>

        <div className="space-y-3">
          {[
            { title: 'Ask Contril anything', desc: 'Natural voice dictation and typed commands on your mobile device.' },
            { title: 'Manage connected services', desc: 'Coordinated workflows across Gmail, Google Calendar, and Drive.' },
            { title: 'Check email and calendar', desc: 'Automated executive briefs and 1-click email response drafting.' },
            { title: 'Search information', desc: 'Comparative research with verified pricing, ETAs, and sources.' },
            { title: 'Access your Contril workspace', desc: 'Synchronized memory and settings across Web and Android.' }
          ].map((item, idx) => (
            <div key={idx} className="py-2 border-b border-[#E5E7EB] dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div className="text-xs font-medium text-[#0F172A] dark:text-white">{item.title}</div>
              <div className="text-xs text-[#64748B] dark:text-[#A1A1AA]">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Installation Guide */}
      <div className="space-y-4">
        <div className="text-xs font-medium uppercase tracking-wider text-[#64748B] dark:text-[#A1A1AA]">
          Installation
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { step: '1', title: 'Download the APK', desc: 'Tap the download button above to save the package.' },
            { step: '2', title: 'Open the file', desc: 'Tap the notification or find it in your Downloads folder.' },
            { step: '3', title: 'Allow installation', desc: 'If prompted, enable "Install unknown apps" for your browser.' },
            { step: '4', title: 'Install & open', desc: 'Complete setup and open Contril from your app drawer.' },
            { step: '5', title: 'Sign in', desc: 'Log in with your existing account. Everything syncs immediately.' }
          ].map((item) => (
            <div
              key={item.step}
              className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-neutral-800 space-y-1"
            >
              <div className="font-medium text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <span className="text-[#2563EB] font-mono">{item.step}.</span> {item.title}
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#121212] border border-[#E5E7EB] dark:border-neutral-800 text-xs text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
        <strong>Experimental Preview Notice:</strong> Contril is distributed directly for rapid testing and feedback. This is a standalone build not hosted on the Google Play Store.
      </div>

    </div>
  );
};
