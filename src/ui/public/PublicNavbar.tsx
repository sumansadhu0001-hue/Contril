import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Sun, 
  Moon, 
  Monitor 
} from 'lucide-react';
import { ThemePreference } from '../../lib/theme';
import { ContrilLogo } from '../../components/ContrilLogo';

interface PublicNavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  isAuthenticated: boolean;
  themePreference?: ThemePreference;
  onSelectThemePreference?: (pref: ThemePreference) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onNavigate,
  currentRoute,
  isAuthenticated,
  themePreference = 'light',
  onSelectThemePreference
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDownloadPage = currentRoute === 'download' || currentRoute === 'download/android';

  const navLinks = [
    { label: 'About', route: 'about' },
    { label: 'How it works', route: 'how-it-works' },
    { label: 'Download', route: 'download' }
  ];

  return (
    <header className="w-full bg-transparent z-50 relative px-4 sm:px-6">
      <div className={`mx-auto transition-all ${
        isDownloadPage 
          ? 'max-w-[1180px] mt-4 sm:mt-5 h-[58px] px-5 sm:px-6 rounded-[18px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(37,99,235,0.06)] flex items-center justify-between'
          : 'max-w-6xl h-20 sm:h-24 flex items-center justify-between'
      }`}>
        
        {/* Canonical Contril Brand Mark */}
        <div 
          onClick={() => onNavigate('/')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <ContrilLogo size="sm" strokeColor="#2563EB" />
          <span className={`font-bold text-sm tracking-wider font-mono ${
            isDownloadPage ? 'text-[#07152F]' : 'text-[#07152F] dark:text-white'
          }`}>
            CONTRIL
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => onNavigate(link.route)}
                className={`text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#2563EB] font-semibold px-3 py-1 rounded-full bg-blue-500/10' 
                    : isDownloadPage 
                      ? 'text-[#475569] hover:text-[#07152F] px-2 py-1' 
                      : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#07152F] dark:hover:text-white px-2 py-1'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-5">
          
          {/* Theme Selector */}
          {onSelectThemePreference && (
            <div className={`flex items-center gap-1 text-xs ${
              isDownloadPage ? 'text-[#475569]' : 'text-[#475569] dark:text-[#94A3B8]'
            }`}>
              <button
                onClick={() => onSelectThemePreference('light')}
                title="Light Mode"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  themePreference === 'light'
                    ? 'text-[#2563EB] font-medium'
                    : isDownloadPage ? 'hover:text-[#07152F]' : 'hover:text-[#07152F] dark:hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectThemePreference('system')}
                title="System Preference"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  themePreference === 'system'
                    ? 'text-[#2563EB] font-medium'
                    : isDownloadPage ? 'hover:text-[#07152F]' : 'hover:text-[#07152F] dark:hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectThemePreference('dark')}
                title="Dark Mode"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  themePreference === 'dark'
                    ? 'text-[#2563EB] font-medium'
                    : isDownloadPage ? 'hover:text-[#07152F]' : 'hover:text-[#07152F] dark:hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigate(isAuthenticated ? 'app' : 'login')}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white text-xs font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
          >
            <span>{isAuthenticated ? 'Open Contril' : 'Open Contril'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 ${isDownloadPage ? 'text-[#07152F]' : 'text-[#07152F] dark:text-white'}`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-[1180px] mx-auto border border-white/80 bg-white/95 backdrop-blur-xl rounded-2xl px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.route);
                }}
                className={`text-left text-sm py-2 ${
                  currentRoute === link.route ? 'text-[#2563EB] font-semibold' : 'text-[#475569] hover:text-[#07152F]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate(isAuthenticated ? 'app' : 'login');
              }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white text-xs font-semibold shadow-xs"
            >
              Open Contril →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
