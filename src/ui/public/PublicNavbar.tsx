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

  const navLinks = [
    { label: 'About', route: 'about' },
    { label: 'How it works', route: 'how-it-works' },
    { label: 'Download', route: 'download' }
  ];

  return (
    <header className="w-full bg-transparent transition-colors z-50 relative">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 h-20 sm:h-24 flex items-center justify-between">
        
        {/* Canonical Contril Brand Mark */}
        <div 
          onClick={() => onNavigate('/')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <ContrilLogo size="sm" strokeColor="#2563EB" />
          <span className="font-semibold text-sm tracking-wider font-mono text-[#0B1220] dark:text-white">
            CONTRIL
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route || (link.route === 'download' && currentRoute === 'download/android');
            return (
              <a
                key={link.route}
                href={`/#${link.route}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.route);
                }}
                className={`text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#2563EB] dark:text-[#38BDF8] font-semibold'
                    : 'text-[#52627A] dark:text-[#94A3B8] hover:text-[#0B1220] dark:hover:text-white'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* Theme Selector */}
          {onSelectThemePreference && (
            <div className="flex items-center gap-1 text-xs text-[#52627A] dark:text-[#94A3B8]">
              <button
                onClick={() => onSelectThemePreference('light')}
                title="Light Mode"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  themePreference === 'light'
                    ? 'text-[#2563EB] font-medium'
                    : 'hover:text-[#0B1220] dark:hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectThemePreference('system')}
                title="System Theme"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  themePreference === 'system'
                    ? 'text-[#2563EB] font-medium'
                    : 'hover:text-[#0B1220] dark:hover:text-white'
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
                    : 'hover:text-[#0B1220] dark:hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Primary Action Button - Direct Android APK Download */}
          <a
            href="/#download"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('download');
            }}
            className="px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
          >
            <span>Download APK</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0B1220] dark:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB]/70 dark:border-neutral-800 bg-white/95 dark:bg-[#0D121D]/95 backdrop-blur-xl px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.route);
                }}
                className={`text-left text-sm py-2 ${
                  currentRoute === link.route ? 'text-[#2563EB] dark:text-[#38BDF8] font-semibold' : 'text-[#52627A] dark:text-[#94A3B8]'
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
                onNavigate('download');
              }}
              className="w-full py-3 rounded-full bg-[#2563EB] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
            >
              <span>Download Android APK ↓</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
