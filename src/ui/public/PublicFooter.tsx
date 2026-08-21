import React from 'react';
import { ContrilLogo } from '../../components/ContrilLogo';

interface PublicFooterProps {
  onNavigate: (route: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-transparent border-t border-[#E5E7EB]/60 dark:border-white/10 py-12 px-6 sm:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#52627A] dark:text-[#94A3B8]">
        
        {/* Brand & Purpose */}
        <div className="flex items-center gap-3 select-none">
          <ContrilLogo size="xs" strokeColor="#2563EB" />
          <span className="font-semibold text-sm tracking-wider text-[#0B1220] dark:text-white font-mono">
            CONTRIL
          </span>
          <span className="text-[#94A3B8] dark:text-[#64748B]">•</span>
          <span>Your universal AI Chief of Staff.</span>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-6">
          <a 
            href="/"
            onClick={(e) => { e.preventDefault(); onNavigate('/'); }} 
            className="hover:text-[#0B1220] dark:hover:text-white transition-colors cursor-pointer"
          >
            Home
          </a>
          <a 
            href="/#about"
            onClick={(e) => { e.preventDefault(); onNavigate('about'); }} 
            className="hover:text-[#0B1220] dark:hover:text-white transition-colors cursor-pointer"
          >
            About
          </a>
          <a 
            href="/#how-it-works"
            onClick={(e) => { e.preventDefault(); onNavigate('how-it-works'); }} 
            className="hover:text-[#0B1220] dark:hover:text-white transition-colors cursor-pointer"
          >
            How it works
          </a>
          <a 
            href="/#download"
            onClick={(e) => { e.preventDefault(); onNavigate('download'); }} 
            className="hover:text-[#0B1220] dark:hover:text-white transition-colors cursor-pointer"
          >
            Download
          </a>
          <a 
            href="/#privacy"
            onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} 
            className="hover:text-[#0B1220] dark:hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </a>
          <a 
            href="/#terms"
            onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} 
            className="hover:text-[#0B1220] dark:hover:text-white transition-colors cursor-pointer"
          >
            Terms of Service
          </a>
        </nav>

        {/* Experimental Preview Notice */}
        <div className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          Experimental Preview © 2026
        </div>

      </div>
    </footer>
  );
};
