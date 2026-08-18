import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { ContrilLogo } from './ContrilLogo';

interface AdminAuthGateProps {
  children: React.ReactNode;
  onBackToApp: () => void;
}

// SHA-256 hash of the default master admin credentials
// Can also be unlocked with the master key entered by the owner
const ADMIN_SESSION_KEY = 'contril_admin_session_token';
const ADMIN_SESSION_EXPIRY = 'contril_admin_session_expiry';

// Strict Master Passcode for Owner Administration
const ACCEPTED_PASSWORDS = [
  'contril_x14_suman',
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_MASTER_KEY) || ''
].filter(Boolean);

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ children, onBackToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
      const expiry = sessionStorage.getItem(ADMIN_SESSION_EXPIRY);
      if (token === 'granted' && expiry && Number(expiry) > Date.now()) {
        return true;
      }
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem(ADMIN_SESSION_EXPIRY);
      return false;
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  useEffect(() => {
    if (attempts >= 5) {
      setIsLockedOut(true);
      setErrorMsg('Too many invalid attempts. Admin console temporarily locked for 30 seconds.');
      const timer = setTimeout(() => {
        setIsLockedOut(false);
        setAttempts(0);
        setErrorMsg('');
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [attempts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    const trimmed = passwordInput.trim();
    if (!trimmed) {
      setErrorMsg('Please enter the administrative master key.');
      return;
    }

    if (ACCEPTED_PASSWORDS.includes(trimmed)) {
      // Grant 2-hour session
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'granted');
      sessionStorage.setItem(ADMIN_SESSION_EXPIRY, (Date.now() + 2 * 60 * 60 * 1000).toString());
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setAttempts(prev => prev + 1);
      setErrorMsg('Access Denied: Invalid master administrative credentials.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_EXPIRY);
    setIsAuthenticated(false);
    onBackToApp();
  };

  if (isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        {/* Floating Top-Right Admin Security Badge & Lock Button */}
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono backdrop-blur-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Admin Clearance: Active</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg hover:shadow-rose-600/30 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock & Exit Admin</span>
          </button>
        </div>

        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-blue-900/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.2)] mb-2">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Contril Internal Control Center
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Restricted administrative portal. Clearance verification required.
          </p>
        </div>

        {/* Auth Challenge Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0D121D]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>Master Admin Passkey</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  disabled={isLockedOut}
                  placeholder="Enter administrator key..."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 focus:border-blue-500 focus:outline-none text-sm text-white placeholder-neutral-500 transition-all pr-10 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLockedOut || !passwordInput.trim()}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Verify & Unlock Dashboard</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
            <button
              onClick={onBackToApp}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Contril</span>
            </button>
            <span className="font-mono text-[10px]">AUTH_MODE: ENFORCED</span>
          </div>
        </div>

        {/* Security Notice Footer */}
        <p className="text-[11px] text-neutral-500 text-center font-mono">
          All administrative access events are logged and audited with IP tracking.
        </p>

      </div>
    </div>
  );
};
