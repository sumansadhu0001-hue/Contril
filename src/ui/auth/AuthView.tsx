import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { 
  signInWithPassword, 
  signUpWithPassword, 
  signInWithOAuth, 
  sendPasswordResetEmail, 
  AuthUser 
} from '../../lib/auth';

interface AuthViewProps {
  onAuthComplete: (user: AuthUser) => void;
  onBackToHome?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthComplete, onBackToHome }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithPassword(email, password);
        if (!res.success) {
          throw new Error(res.message || 'Invalid email or password.');
        }
        if (res.user) onAuthComplete(res.user);
      } else if (mode === 'signup') {
        const res = await signUpWithPassword(email, password, name);
        if (!res.success) {
          throw new Error(res.message || 'Account registration failed.');
        }
        if (res.user) {
          if (res.needsVerification) {
            setSuccessMessage('Registration successful! Please check your email for verification.');
          } else {
            onAuthComplete(res.user);
          }
        }
      } else if (mode === 'forgot') {
        const res = await sendPasswordResetEmail(email);
        if (!res.success) {
          throw new Error(res.message || 'Failed to send reset email.');
        }
        setSuccessMessage('Password reset link sent to your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'apple') => {
    try {
      await signInWithOAuth(provider);
    } catch (err: any) {
      setErrorMessage(err.message || 'OAuth initiation failed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7FAFF] dark:bg-[#070A0F] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden transition-colors duration-200">
      
      {/* Back to website button */}
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="absolute top-6 left-6 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 cursor-pointer z-20"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to overview</span>
        </button>
      )}

      {/* Atmospheric Soft Blue Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.08)] dark:shadow-none p-6 sm:p-10 space-y-8 relative z-10 text-left">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <ContrilLogo size="xl" strokeColor="#2563EB" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white font-mono">
              CONTRIL
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              {mode === 'signin' && 'Sign in to access your universal AI Chief of Staff'}
              {mode === 'signup' && 'Create your personal Chief of Staff account'}
              {mode === 'forgot' && 'Reset your password'}
            </p>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-[#64748B]">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] font-sans"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-[#64748B]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@workplace.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] font-sans"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase text-[#64748B]">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#64748B] hover:text-[#0F172A] absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* OAuth Divider */}
        {mode !== 'forgot' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E2E8F0] dark:border-white/[0.06]" />
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Or continue with</span>
              <div className="flex-1 h-px bg-[#E2E8F0] dark:border-white/[0.06]" />
            </div>

            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full h-11 rounded-xl border border-[#E2E8F0] dark:border-white/[0.08] hover:bg-[#F8FAFC] dark:hover:bg-[#161F30] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google Workspace</span>
            </button>
          </div>
        )}

        {/* Footer switch */}
        <div className="text-center text-xs text-[#64748B]">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
