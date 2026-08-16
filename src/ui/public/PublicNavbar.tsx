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
  themePreference: ThemePreference;
  onSelectThemePreference: (pref: ThemePreference) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onNavigate,
  currentRoute,
  isAuthenticated,
  themePreference,
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
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 sm:h-24 flex items-center justify-between">
        
        {/* Canonical Contril Brand Mark */}
        <div 
          onClick={() => onNavigate('/')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <ContrilLogo size="sm" strokeColor="#2563EB" />
          <span className="font-semibold text-sm tracking-wider text-[#0B1220] dark:text-white font-mono">
            CONTRIL
          </span>
        </div>

        {/* Center Navigation Links (Spacious, Normal Case) */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => onNavigate(link.route)}
              className={`text-sm font-normal transition-colors cursor-pointer ${
                currentRoute === link.route 
                  ? 'text-[#0B1220] dark:text-white font-medium' 
                  : 'text-[#52627A] dark:text-[#94A3B8] hover:text-[#0B1220] dark:hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right CTA & Theme Controls */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* Theme Selector */}
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
              title="System Preference"
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
                  ? 'text-[#38BDF8] font-medium'
                  : 'hover:text-[#0B1220] dark:hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigate(isAuthenticated ? 'app' : 'login')}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white text-xs font-medium transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] cursor-pointer flex items-center gap-1.5"
          >
            <span>{isAuthenticated ? 'Open Contril' : 'Open Contril'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => onSelectThemePreference(themePreference === 'light' ? 'dark' : 'light')}
            className="p-2 text-[#52627A] dark:text-[#94A3B8]"
          >
            {themePreference === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

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
        <div className="md:hidden border-t border-[#E5E7EB] dark:border-neutral-800 bg-[#F6F9FF]/95 dark:bg-[#060914]/95 backdrop-blur-xl px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.route);
                }}
                className="text-left text-sm py-2 text-[#52627A] dark:text-[#94A3B8]"
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
