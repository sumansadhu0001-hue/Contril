import React, { useState, useRef, useEffect } from 'react';
import { ContrilLogo } from './ContrilLogo';
import { Mail, Key, Sparkles, Shield, ArrowRight, Loader2, AlertCircle, RefreshCw, ArrowUpRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { signInWithPassword, signUpWithPassword, signInWithOAuth, sendPasswordResetEmail, verifySignupOtp, verifyRecoveryOtp, updateUserPassword, resendSignupOtp, AuthUser } from '../lib/auth';
import { ServiceLogo } from './ServiceLogo';

interface AuthScreenProps {
  onAuthComplete: (user: AuthUser) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'verify_signup' | 'verify_recovery' | 'reset_password' | 'success_signup' | 'success_reset';

interface PasswordValidationResult {
  minimumLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
  strength: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Excellent';
  isValid: boolean;
}

export function evaluatePassword(pass: string): PasswordValidationResult {
  const result = {
    minimumLength: pass.length >= 8,
    hasUppercase: /[A-Z]/.test(pass),
    hasLowercase: /[a-z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecialCharacter: /[^A-Za-z0-9]/.test(pass),
    strength: 'Weak' as PasswordValidationResult['strength'],
    isValid: false
  };

  let score = 0;
  if (result.minimumLength) score++;
  if (result.hasUppercase) score++;
  if (result.hasLowercase) score++;
  if (result.hasNumber) score++;
  if (result.hasSpecialCharacter) score++;

  if (score <= 1) {
    result.strength = 'Weak';
  } else if (score === 2) {
    result.strength = 'Fair';
  } else if (score === 3) {
    result.strength = 'Good';
  } else if (score === 4) {
    result.strength = 'Strong';
  } else if (score === 5) {
    result.strength = 'Excellent';
  }

  result.isValid = score === 5;
  return result;
}

const SecurityBadge: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => {
  return (
    <div className="relative group cursor-pointer">
      <span className="text-[10px] font-mono text-white opacity-80 group-hover:opacity-100 group-hover:text-[#17D7C7] uppercase tracking-wider bg-white/[0.02] border border-white/[0.06] group-hover:border-[#17D7C7]/30 px-3.5 py-1 rounded-full shadow-sm transition-all duration-[180ms] ease-out block">
        {label} <span className="inline-block opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[12px] overflow-hidden transition-all duration-[180ms] ease-out select-none text-[#17D7C7]">✓</span>
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded bg-[#0D0D11] border border-white/[0.08] text-[9px] font-sans text-neutral-300 whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 transition-all duration-[180ms] pointer-events-none shadow-xl z-20">
        {tooltip}
        <div className="w-1.5 h-1.5 bg-[#0D0D11] border-r border-b border-white/[0.08] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
};

const PasswordRequirements: React.FC<{ pass: string; confirmPass?: string; showConfirm?: boolean }> = ({ pass, confirmPass, showConfirm = false }) => {
  const check = evaluatePassword(pass);
  
  const requirements = [
    { label: 'At least 8 characters', met: check.minimumLength },
    { label: 'One uppercase letter (A–Z)', met: check.hasUppercase },
    { label: 'One lowercase letter (a–z)', met: check.hasLowercase },
    { label: 'One number (0–9)', met: check.hasNumber },
    { label: 'One special character (!@#$%^&* etc.)', met: check.hasSpecialCharacter }
  ];

  const strengthConfigs = {
    Weak: { width: '20%', color: 'bg-rose-500', label: 'Weak' },
    Fair: { width: '40%', color: 'bg-amber-500', label: 'Fair' },
    Good: { width: '60%', color: 'bg-yellow-500', label: 'Good' },
    Strong: { width: '80%', color: 'bg-emerald-400', label: 'Strong' },
    Excellent: { width: '100%', color: 'bg-[#17D7C7]', label: 'Excellent' }
  };

  const currentStrength = pass ? strengthConfigs[check.strength] : { width: '0%', color: 'bg-neutral-800', label: 'None' };

  return (
    <div className="space-y-3 pt-1">
      {pass && (
        <div className="space-y-1.5 transition-all duration-200">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            <span>Password Strength</span>
            <span className="font-semibold text-white">{currentStrength.label}</span>
          </div>
          <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${currentStrength.color} transition-all duration-[200ms] ease-out`}
              style={{ width: currentStrength.width }}
            />
          </div>
        </div>
      )}

      <ul className="space-y-1.5 text-[11px] font-sans" aria-label="Password requirements">
        {requirements.map((req, i) => (
          <li 
            key={i} 
            className={`flex items-center gap-2 transition-all duration-[180ms] ${req.met ? 'text-white' : 'text-neutral-500'}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all duration-[180ms] ${
              req.met 
                ? 'bg-[#17D7C7]/15 border-[#17D7C7] text-[#17D7C7]' 
                : 'border-neutral-700 bg-transparent text-transparent'
            }`}>
              {req.met && (
                <svg className="w-2.5 h-2.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span>{req.label}</span>
          </li>
        ))}

        {showConfirm && confirmPass !== undefined && (
          <li className={`flex items-center gap-2 transition-all duration-[180ms] ${pass && pass === confirmPass ? 'text-white' : 'text-neutral-500'}`}>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all duration-[180ms] ${
              pass && pass === confirmPass
                ? 'bg-[#17D7C7]/15 border-[#17D7C7] text-[#17D7C7]' 
                : confirmPass 
                  ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                  : 'border-neutral-700 bg-transparent text-transparent'
            }`}>
              {pass && pass === confirmPass ? (
                <svg className="w-2.5 h-2.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : confirmPass ? (
                <span className="text-[10px] font-bold">!</span>
              ) : null}
            </div>
            <span>
              {pass && pass === confirmPass 
                ? 'Passwords match' 
                : confirmPass 
                  ? 'Passwords do not match' 
                  : 'Confirm password match'}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthComplete }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [oauthLoadingMsg, setOauthLoadingMsg] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  
  // Card stage progression loader state
  const [authLoadingStage, setAuthLoadingStage] = useState<string | null>(null);

  // Alive Dashboard previews states
  const [unreadCount, setUnreadCount] = useState(29);

  // Periodically increment unread count occasionally
  useEffect(() => {
    const timer = setInterval(() => {
      setUnreadCount((prev) => (prev >= 37 ? 29 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) / 400; // 2-3px max
    const y = (clientY - window.innerHeight / 2) / 400;
    setMousePos({ x, y });
  };

  // Mount sequence logo loader
  const [showLogoEntrance, setShowLogoEntrance] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowLogoEntrance(false), 550);
    return () => clearTimeout(timer);
  }, []);

  // OTP inputs state
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(30);

  // Live Screen Reader Validation Announcements
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const mapAuthErrorToEnterprise = (err: any): string => {
    console.error('[Auth Failure Info]:', err);
    const msg = String(err?.message || err || '').toLowerCase();
    
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('connect')) {
      return "Unable to connect. Check your internet connection and try again.";
    }
    if (msg.includes('user_not_found') || msg.includes('not found') || msg.includes('no user')) {
      return "No account exists with this email address.";
    }
    if (msg.includes('incorrect_password') || msg.includes('invalid password') || msg.includes('credentials') || msg.includes('invalid_grant')) {
      return "Incorrect email or password. Please try again.";
    }
    if (msg.includes('permission') || msg.includes('denied') || msg.includes('access')) {
      return "Contril doesn't have permission to access this resource.";
    }
    if (msg.includes('expired') || msg.includes('session') || msg.includes('token')) {
      return "Your authentication session has expired. Please try signing in again.";
    }
    if (msg.includes('unavailable') || msg.includes('503') || msg.includes('502') || msg.includes('timeout')) {
      return "Authentication service is temporarily unavailable. Please try again.";
    }
    if (msg.includes('already exists') || msg.includes('already in use') || msg.includes('registered')) {
      return "An account with this email address already exists.";
    }
    
    return "Authentication failed. Please check your credentials and try again.";
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');
      const errName = searchParams.get('error') || hashParams.get('error');

      if (errorDesc) {
        setErrorMsg(mapAuthErrorToEnterprise(decodeURIComponent(errorDesc.replace(/\+/g, ' '))));
      } else if (errName) {
        setErrorMsg(mapAuthErrorToEnterprise(errName));
      }
    }
  }, []);

  // Countdown timer effect (Resend code in 30s)
  useEffect(() => {
    if (countdown > 0 && (mode === 'verify_signup' || mode === 'verify_recovery')) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, mode]);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleOAuth = async (provider: 'google' = 'google') => {
    console.info('[OAuth Debug] Google button clicked. Provider:', provider);
    clearMessages();
    setLoading(true);
    setOauthLoadingMsg('Redirecting...');

    try {
      console.info('[OAuth Debug] Calling signInWithOAuth...');
      const res = await signInWithOAuth(provider);
      console.info('[OAuth Debug] signInWithOAuth returned:', res);
      if (!res.success) {
        setErrorMsg(mapAuthErrorToEnterprise(res.message));
      } else {
        console.info('[OAuth Debug] OAuth success. Browser should redirect now...');
      }
    } catch (err: any) {
      setErrorMsg(mapAuthErrorToEnterprise(err));
    } finally {
      setLoading(false);
      setOauthLoadingMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email) {
      setErrorMsg('Email address is required.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        if (!password) {
          setErrorMsg('Password is required.');
          setLoading(false);
          return;
        }
        const res = await signInWithPassword(email, password);
        if (res.success && res.user) {
          setAuthLoadingStage('Initializing Workspace...');
          await new Promise(r => setTimeout(r, 140));
          setAuthLoadingStage('████████░░░░');
          await new Promise(r => setTimeout(r, 140));
          setAuthLoadingStage('Authenticating...');
          await new Promise(r => setTimeout(r, 140));
          setAuthLoadingStage('Loading AI Context...');
          await new Promise(r => setTimeout(r, 140));
          setAuthLoadingStage('Syncing Workspace...');
          await new Promise(r => setTimeout(r, 140));
          setAuthLoadingStage('Redirecting...');
          await new Promise(r => setTimeout(r, 140));
          onAuthComplete(res.user);
        } else {
          setErrorMsg(mapAuthErrorToEnterprise(res.message));
        }
      } else if (mode === 'signup') {
        const check = evaluatePassword(password);
        if (!check.isValid) {
          setErrorMsg('Please satisfy all password complexity rules.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setLoading(false);
          return;
        }
        
        setAuthLoadingStage('Sending secure verification...');
        const res = await signUpWithPassword(email, password, '');
        if (res.success) {
          setMode('verify_signup');
          setCountdown(30);
          setOtpValues(Array(6).fill(''));
        } else {
          setErrorMsg(mapAuthErrorToEnterprise(res.message));
        }
      } else if (mode === 'forgot') {
        setAuthLoadingStage('Sending Verification Code...');
        const res = await sendPasswordResetEmail(email);
        if (res.success) {
          setMode('verify_recovery');
          setCountdown(30);
          setOtpValues(Array(6).fill(''));
        } else {
          setErrorMsg(mapAuthErrorToEnterprise(res.message));
        }
      }
    } catch (err: any) {
      setErrorMsg(mapAuthErrorToEnterprise(err));
    } finally {
      setLoading(false);
      setAuthLoadingStage(null);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const newValues = [...otpValues];
      newValues[index] = '';
      setOtpValues(newValues);
      return;
    }
    
    const digit = cleanVal.slice(-1);
    const newValues = [...otpValues];
    newValues[index] = digit;
    setOtpValues(newValues);
    
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
        const newValues = [...otpValues];
        newValues[index - 1] = '';
        setOtpValues(newValues);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
    if (pasteData.length === 6) {
      const newValues = pasteData.split('');
      setOtpValues(newValues);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const code = otpValues.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'verify_signup') {
        setAuthLoadingStage('Verifying...');
        const res = await verifySignupOtp(email, code);
        if (res.success) {
          setAuthLoadingStage('Creating Workspace...');
          await new Promise(r => setTimeout(r, 600));
          setAuthLoadingStage('Redirecting to Login...');
          await new Promise(r => setTimeout(r, 600));
          setMode('signin');
          setSuccessMsg('Account successfully created.');
        } else {
          setErrorMsg(res.message || 'Incorrect verification code.');
        }
      } else if (mode === 'verify_recovery') {
        setAuthLoadingStage('Verifying Code...');
        const res = await verifyRecoveryOtp(email, code);
        if (res.success) {
          setRecoveryCode(code);
          setMode('reset_password');
        } else {
          setErrorMsg(res.message || 'Incorrect verification code.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during verification.');
    } finally {
      setLoading(false);
      setAuthLoadingStage(null);
    }
  };

  const handleResendCode = async () => {
    clearMessages();
    setCountdown(30);
    setOtpValues(Array(6).fill(''));
    try {
      if (mode === 'verify_signup') {
        const res = await resendSignupOtp(email, false);
        if (res.success) {
          setSuccessMsg('A new verification code has been dispatched.');
        } else {
          setErrorMsg(res.message || 'Failed to resend code.');
        }
      } else if (mode === 'verify_recovery') {
        const res = await resendSignupOtp(email, true);
        if (res.success) {
          setSuccessMsg('A new recovery code has been dispatched.');
        } else {
          setErrorMsg(res.message || 'Failed to resend recovery code.');
        }
      }
    } catch (err: any) {
      setErrorMsg('Failed to resend code.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const check = evaluatePassword(password);
    if (!check.isValid) {
      setErrorMsg('Please satisfy all password complexity rules.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      setAuthLoadingStage('Updating Password...');
      const res = await updateUserPassword(password, email, recoveryCode);
      if (res.success) {
        setAuthLoadingStage('Redirecting...');
        await new Promise(r => setTimeout(r, 600));
        setMode('signin');
        setSuccessMsg('Password updated successfully.');
      } else {
        setErrorMsg(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
      setAuthLoadingStage(null);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordCheck = evaluatePassword(password);
  const isPasswordValid = passwordCheck.isValid;
  const isConfirmPasswordValid = password && password === confirmPassword;
  const isSignupDisabled = !isEmailValid || !isPasswordValid || !isConfirmPasswordValid;

  useEffect(() => {
    if (password) {
      setSrAnnouncement(`Password strength: ${passwordCheck.strength}. Requirements met: ${
        Object.values(passwordCheck).filter(Boolean).length - 1
      } of 5.`);
    }
  }, [password]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-[#060608] text-[#FAFAFA] flex flex-col justify-between items-center p-4 sm:p-6 md:p-12 selection:bg-[#17D7C7] selection:text-black font-sans overflow-y-auto no-scrollbar animate-gradient-entrance"
      style={{
        background: `
          radial-gradient(circle at 15% 15%, rgba(23, 215, 199, 0.035) 0%, transparent 60%),
          radial-gradient(circle at 85% 85%, rgba(66, 133, 244, 0.025) 0%, transparent 60%),
          radial-gradient(rgba(23, 215, 199, 0.008) 1.2px, transparent 1.2px),
          #060608
        `,
        backgroundSize: '100% 100%, 100% 100%, 28px 28px, 100% 100%'
      }}
    >
      <div aria-live="polite" className="sr-only">{srAnnouncement}</div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes breatheGreen {
          0%, 100% {
            opacity: 0.004;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.007;
            transform: translate(-50%, -50%) scale(1.06);
          }
        }
        @keyframes breatheBlue {
          0%, 100% {
            opacity: 0.003;
            transform: scale(1);
          }
          50% {
            opacity: 0.005;
            transform: scale(1.08);
          }
        }
        @keyframes gridSlide {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 32px 32px;
          }
        }
        @keyframes livePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.4);
            opacity: 1;
          }
        }
        @keyframes drawGraph {
          0%, 100% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 12;
          }
        }
        @keyframes progressAnim {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes logoFadeScale {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; }
        }
        @keyframes leftCardFade {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes rightCardSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-logo-entrance {
          animation: logoFadeScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-gradient-entrance {
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.2s forwards, slowMoveGradient 25s ease-in-out 1s infinite;
        }
        .animate-left-entrance {
          opacity: 0;
          animation: leftCardFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards;
        }
        .animate-right-entrance {
          opacity: 0;
          animation: rightCardSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
        }
        .animate-header-logo-entrance {
          opacity: 0;
          animation: fadeIn 0.4s ease-out 0.1s forwards;
        }
        .animate-header-badge-entrance {
          opacity: 0;
          animation: fadeIn 0.4s ease-out 0.25s forwards;
        }
        .animate-footer-entrance {
          opacity: 0;
          animation: fadeIn 0.4s ease-out 0.6s forwards;
        }
        .animate-inputs-entrance {
          opacity: 0;
          animation: fadeIn 0.4s ease-out 0.6s forwards;
        }
        .animate-btn-entrance {
          opacity: 0;
          animation: fadeIn 0.4s ease-out 0.75s forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-breathe-green {
          animation: breatheGreen 12s ease-in-out infinite;
        }
        .animate-breathe-blue {
          animation: breatheBlue 16s ease-in-out infinite;
        }
        .bg-grid-slide {
          animation: gridSlide 20s linear infinite;
        }
        .animate-live-pulse {
          animation: livePulse 2s ease-in-out infinite;
        }
        @keyframes gentlePulse {
          0%, 100% { opacity: 0.65; }
          50% { opacity: 1; }
        }
        .animate-gentle-pulse {
          animation: gentlePulse 3.5s ease-in-out infinite;
        }
        .animate-graph-line {
          stroke-dasharray: 50;
          animation: drawGraph 4s ease-in-out infinite;
        }
        input:focus::placeholder {
          color: transparent;
        }
        input::placeholder {
          transition: color 180ms ease-out;
        }
        .premium-login-card {
          position: relative;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
          border: 1px solid transparent;
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
          background-image: 
            linear-gradient(180deg, rgba(16, 16, 20, 0.85) 0%, rgba(9, 9, 12, 0.94) 100%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.01) 100%);
          box-shadow: 
            0 24px 50px -15px rgba(66, 133, 244, 0.06);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-login-card:hover {
          background-image: 
            linear-gradient(180deg, rgba(16, 16, 20, 0.85) 0%, rgba(9, 9, 12, 0.94) 100%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.02) 100%);
          box-shadow: 
            0 32px 64px -12px rgba(66, 133, 244, 0.08);
        }
        .google-btn-premium {
          border: 1px solid rgba(255, 255, 255, 0.09) !important;
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .google-btn-premium:hover:not(:disabled) {
          border-color: #17D7C7 !important;
          background-color: rgba(255, 255, 255, 0.07) !important;
        }
        .google-btn-premium:hover img, .google-btn-premium:hover svg {
          transform: scale(1.03) !important;
        }
        @keyframes slowMoveGradient {
          0%, 100% {
            background-position: 0% 0%, 100% 100%, 0% 0%, 0% 0%;
          }
          50% {
            background-position: 10% 5%, 90% 95%, 0% 0%, 0% 0%;
          }
        }
        .animate-gradient-move {
          animation: slowMoveGradient 25s ease-in-out infinite;
        }
        .premium-hero-card {
          background-color: rgba(11, 11, 14, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 20px 40px -10px rgba(23, 215, 199, 0.03);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-hero-card:hover {
          border-color: rgba(23, 215, 199, 0.15);
          box-shadow: 0 28px 56px -12px rgba(23, 215, 199, 0.06);
          transform: translateY(-3px);
        }
        .btn-premium-glow {
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-premium-glow:hover:not(:disabled) {
          background-color: #23eedc !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 24px -4px rgba(23, 215, 199, 0.35) !important;
        }
        .btn-premium-glow:active:not(:disabled) {
          transform: translateY(0) !important;
        }
        .google-btn-premium {
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .google-btn-premium:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.04) !important;
          border-color: #17D7C7 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 20px -6px rgba(23, 215, 199, 0.15) !important;
        }
        .google-btn-premium:hover img,
        .google-btn-premium:hover svg {
          transform: scale(1.05);
        }
        .input-premium-focus {
          transition: border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .input-premium-focus:focus {
          border-color: #17D7C7 !important;
          box-shadow: 0 0 0 3px rgba(23, 215, 199, 0.12) !important;
          background-color: rgba(23, 215, 199, 0.01) !important;
        }
      `}</style>
      
      {/* Sliding background grid overlay */}
      <div className="fixed inset-0 bg-grid-slide opacity-[0.03] pointer-events-none" />



      {/* Top Header Navbar */}
      <div className="w-full max-w-[508px] flex items-center justify-between py-2 z-10 border-b border-white/[0.03] mb-6">
        <div className="flex flex-col items-start gap-1 transition-transform duration-300 hover:scale-[1.03] animate-header-logo-entrance">
          <ContrilLogo variant="main" size={26} />
          <span className="text-[8px] font-mono text-neutral-500 flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-[#17D7C7] animate-pulse" />
            Secure Authentication Service Online
          </span>
        </div>
        <span className="text-[10.5px] font-mono text-neutral-200 tracking-wider uppercase bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full animate-header-badge-entrance">
          Private Enterprise Workspace
        </span>
      </div>

      {/* Centered Login Card Container */}
      <div className="w-full max-w-[508px] my-auto py-8 z-10 animate-right-entrance">
        <div 
          style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)` }}
          className="premium-login-card w-full px-7 py-6 sm:px-9 sm:py-7 space-y-6 select-none relative"
        >
            
            {/* Full-card loader overlay for stage progression */}
            {authLoadingStage && (
              <div className="absolute inset-0 bg-[#0D0D11]/92 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center space-y-4 z-30 animate-fade-in p-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#17D7C7]" />
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest text-center animate-pulse">
                  {authLoadingStage}
                </span>
              </div>
            )}

            {/* SCREEN 1: SIGN IN */}
            {mode === 'signin' && (
              <>
                <div className="space-y-1.5 text-center">
                  <h2 className="text-3xl font-light text-white tracking-tight leading-tight">
                    Welcome Back
                    <span className="block text-sm text-neutral-400 font-light mt-0.5">Continue where your AI left off.</span>
                  </h2>
                </div>

                <div className="w-full space-y-2 animate-inputs-entrance">
                  <button
                    type="button"
                    onClick={() => handleOAuth('google')}
                    disabled={loading}
                    className="w-full h-[52px] rounded-xl bg-white/[0.02] active:scale-[0.99] border border-white/[0.06] text-xs font-semibold flex items-center justify-center gap-3 transition-all duration-[180ms] cursor-pointer text-white shadow-sm group google-btn-premium focus:outline-none focus:ring-1 focus:ring-[#17D7C7]/80"
                  >
                    {loading && oauthLoadingMsg ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#17D7C7]" />
                        <span className="text-[11px] font-medium font-mono text-neutral-300">{oauthLoadingMsg}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <ServiceLogo id="google" size={20} className="transition-transform duration-[180ms]" />
                        <span className="translate-y-[0.5px]">Continue with Google</span>
                      </div>
                    )}
                  </button>
                  <span className="text-[9px] text-neutral-500 font-sans block text-center leading-normal">
                    Your credentials never leave Google.
                  </span>
                </div>

                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-white/[0.04]"></div>
                  <span className="flex-shrink mx-3 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">or sign in with email</span>
                  <div className="flex-grow border-t border-white/[0.04]"></div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 animate-fade-in font-sans animate-inputs-entrance">
                    {errorMsg === 'USER_NOT_FOUND' ? (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <p className="font-medium">No Contril account was found for this email.</p>
                        <button
                          type="button"
                          onClick={() => { setMode('signup'); clearMessages(); }}
                          className="text-[#17D7C7] hover:underline font-semibold bg-transparent border-none p-0 cursor-pointer text-xs"
                        >
                          Create Account →
                        </button>
                      </div>
                    ) : errorMsg === 'INCORRECT_PASSWORD' ? (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <p className="font-medium">Incorrect password.</p>
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); clearMessages(); }}
                          className="text-[#17D7C7] hover:underline font-semibold bg-transparent border-none p-0 cursor-pointer text-xs"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{errorMsg}</p>
                      </div>
                    )}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-[#17D7C7]/10 border border-[#17D7C7]/20 flex items-start gap-2.5 text-xs text-[#17D7C7] animate-fade-in font-sans animate-inputs-entrance">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#17D7C7]" />
                    <p className="leading-relaxed">{successMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div className="space-y-4 animate-inputs-entrance">
                    <div className="space-y-1.5">
                      <label htmlFor="signin-email" className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">Work Email</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
                        <input
                          id="signin-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@northbridge.ai"
                          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.01] border border-white/[0.06] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#17D7C7] focus:bg-[#17D7C7]/[0.01] focus:ring-4 focus:ring-[#17D7C7]/[0.08] transition-all font-mono caret-[#17D7C7] input-premium-focus"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="signin-password" className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">Password</label>
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); clearMessages(); }}
                          className="text-[10px] text-[#17D7C7] hover:text-[#00BFA6] transition-colors bg-transparent border-none p-1.5 -mr-1.5 cursor-pointer font-sans font-medium"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
                        <input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 pl-10 pr-14 rounded-xl bg-white/[0.01] border border-white/[0.06] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#17D7C7] focus:bg-[#17D7C7]/[0.01] focus:ring-4 focus:ring-[#17D7C7]/[0.08] transition-all font-mono caret-[#17D7C7] input-premium-focus"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-neutral-500 hover:text-[#17D7C7] transition-colors focus:outline-none cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          <div className="relative w-4 h-4">
                            <span className={`absolute inset-0 transition-all duration-[150ms] ${showPassword ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                              <Eye className="w-4 h-4" />
                            </span>
                            <span className={`absolute inset-0 transition-all duration-[150ms] ${!showPassword ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                              <EyeOff className="w-4 h-4" />
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="animate-btn-entrance">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 mt-4 rounded-xl bg-[#17D7C7] hover:bg-[#00BFA6] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-semibold text-[13px] sm:text-sm tracking-wide transition-all duration-[200ms] flex items-center justify-center gap-2.5 cursor-pointer shadow-md active:scale-[0.98] hover:-translate-y-0.5 group btn-premium-glow"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Initializing Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>Enter Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[3px] transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center pt-2 text-xs text-neutral-400 font-light font-sans animate-inputs-entrance">
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); clearMessages(); }}
                      className="text-[#17D7C7] hover:text-[#00BFA6] font-semibold bg-transparent border-none p-0 cursor-pointer transition-all hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* SCREEN 2: SIGN UP */}
            {mode === 'signup' && (
              <>
                <div className="space-y-3.5 text-center">
                  <h2 className="text-3xl font-light text-white tracking-tight leading-tight">
                    Create Account
                    <span className="block text-sm text-neutral-400 font-light mt-1">Register your secure C-suite enclave</span>
                  </h2>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400 animate-fade-in font-sans">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-sans">{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label htmlFor="signup-email" className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">Work Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
                      <input
                        id="signup-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@northbridge.ai"
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.01] border border-white/[0.06] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#17D7C7] focus:bg-[#17D7C7]/[0.01] focus:ring-4 focus:ring-[#17D7C7]/[0.08] transition-all font-mono caret-[#17D7C7] input-premium-focus"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">Password</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-10 pr-14 rounded-xl bg-white/[0.01] border border-white/[0.06] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#17D7C7] focus:bg-[#17D7C7]/[0.01] focus:ring-4 focus:ring-[#17D7C7]/[0.08] transition-all font-mono caret-[#17D7C7] input-premium-focus"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-[#17D7C7] transition-colors focus:outline-none cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <div className="relative w-4 h-4">
                          <span className={`absolute inset-0 transition-all duration-200 transform ${showPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                            <Eye className="w-4 h-4" />
                          </span>
                          <span className={`absolute inset-0 transition-all duration-200 transform ${!showPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                            <EyeOff className="w-4 h-4" />
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-confirm" className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">Confirm Password</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
                      <input
                        id="signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-10 pr-14 rounded-xl bg-white/[0.01] border border-white/[0.06] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#17D7C7] focus:bg-[#17D7C7]/[0.01] focus:ring-4 focus:ring-[#17D7C7]/[0.08] transition-all font-mono caret-[#17D7C7] input-premium-focus"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-[#17D7C7] transition-colors focus:outline-none cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        <div className="relative w-4 h-4">
                          <span className={`absolute inset-0 transition-all duration-200 transform ${showConfirmPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                            <Eye className="w-4 h-4" />
                          </span>
                          <span className={`absolute inset-0 transition-all duration-200 transform ${!showConfirmPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                            <EyeOff className="w-4 h-4" />
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Live Password checklist & Strength validation */}
                  <PasswordRequirements pass={password} confirmPass={confirmPassword} showConfirm={true} />

                  <button
                    type="submit"
                    disabled={loading || isSignupDisabled}
                    className="w-full h-12 mt-4 rounded-xl bg-[#17D7C7] hover:bg-[#00BFA6] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-semibold text-[13px] sm:text-sm tracking-wide transition-all duration-[200ms] flex items-center justify-center gap-2.5 cursor-pointer shadow-md active:scale-[0.98] hover:-translate-y-0.5 group btn-premium-glow"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[3px] transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2 text-xs text-neutral-400 font-light font-sans">
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signin'); clearMessages(); }}
                      className="text-[#17D7C7] hover:text-[#00BFA6] font-semibold bg-transparent border-none p-0 cursor-pointer transition-colors hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* SCREEN 3: FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <>
                <div className="space-y-3.5 text-center">
                  <h2 className="text-3xl font-light text-white tracking-tight leading-tight">
                    Reset Secure Access
                    <span className="block text-sm text-neutral-400 font-light mt-1">Receive secure 6-digit verification code to reset password</span>
                  </h2>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 animate-fade-in font-sans">
                    {errorMsg === 'USER_NOT_FOUND' ? (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <p className="font-medium">No Contril account was found for this email.</p>
                        <button
                          type="button"
                          onClick={() => { setMode('signup'); clearMessages(); }}
                          className="text-[#17D7C7] hover:underline font-semibold bg-transparent border-none p-0 cursor-pointer text-xs"
                        >
                          Create Account →
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{errorMsg}</p>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label htmlFor="forgot-email" className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">Work Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@northbridge.ai"
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.01] border border-white/[0.06] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#17D7C7] focus:bg-[#17D7C7]/[0.01] focus:ring-4 focus:ring-[#17D7C7]/[0.08] transition-all font-mono caret-[#17D7C7] input-premium-focus"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-4 rounded-xl bg-[#17D7C7] hover:bg-[#00BFA6] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-semibold text-[13px] sm:text-sm tracking-wide transition-all duration-[200ms] flex items-center justify-center gap-2.5 cursor-pointer shadow-md active:scale-[0.98] hover:-translate-y-0.5 group btn-premium-glow"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Code</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[3px] transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2 text-xs text-neutral-400 font-light font-sans">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); clearMessages(); }}
                    className="text-[#17D7C7] hover:text-[#00BFA6] hover:underline font-semibold bg-transparent border-none p-0 cursor-pointer transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            )}

            {/* SCREEN 4 & 5: VERIFY OTP (SIGNUP or RECOVERY) */}
            {(mode === 'verify_signup' || mode === 'verify_recovery') && (
              <>
                <div className="space-y-3.5 text-center font-sans">
                  <h2 className="text-3xl font-light text-white tracking-tight leading-tight">
                    Verify your email
                    <span className="block text-sm text-neutral-400 font-light mt-1 font-sans">
                      We've sent a 6-digit verification code to <span className="text-[#17D7C7] font-medium">{email}</span>.
                    </span>
                  </h2>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400 animate-fade-in font-sans">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{errorMsg}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-[#17D7C7]/10 border border-[#17D7C7]/20 flex items-start gap-2.5 text-xs text-[#17D7C7] animate-fade-in font-sans">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#17D7C7]" />
                    <p className="leading-relaxed">{successMsg}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-between gap-2 max-w-xs mx-auto">
                    {Array(6).fill(0).map((_, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={otpValues[idx]}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-10 h-12 text-center rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-[#17D7C7] focus:bg-white/[0.04] text-lg font-semibold text-white focus:outline-none transition-all font-mono otp-box-active"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <div className="text-center text-xs text-neutral-500 font-mono">
                    {countdown > 0 ? (
                      <span>Resend code in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-[#17D7C7] hover:underline bg-transparent border-none p-0 cursor-pointer font-sans font-medium"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-[#17D7C7] hover:bg-[#00BFA6] text-black font-semibold text-[13px] sm:text-sm tracking-wide transition-all duration-[200ms] flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] btn-premium-glow"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify Email</span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => { setMode(mode === 'verify_signup' ? 'signup' : 'forgot'); clearMessages(); }}
                      className="w-full h-11 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/12 text-white font-semibold text-xs transition-all duration-[200ms] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {mode === 'verify_signup' ? 'Change Email' : 'Back'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* SCREEN 6: RESET PASSWORD */}
            {mode === 'reset_password' && (
              <>
                <div className="space-y-3.5 text-center">
                  <h2 className="text-3xl font-light text-white tracking-tight leading-tight">
                    Reset Password
                    <span className="block text-sm text-neutral-400 font-light mt-1">Enter your new secure password</span>
                  </h2>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400 animate-fade-in font-sans">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                  <PasswordInput
                    id="reset-pass"
                    label="New Password"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    showEye={showPassword}
                    onEyeToggle={() => setShowPassword(!showPassword)}
                  />

                  <PasswordInput
                    id="reset-confirm"
                    label="Confirm New Password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    showEye={showConfirmPassword}
                    onEyeToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  />

                  <PasswordRequirements pass={password} confirmPass={confirmPassword} showConfirm={true} />

                  <button
                    type="submit"
                    disabled={loading || !isPasswordValid || !isConfirmPasswordValid}
                    className="w-full h-12 mt-4 rounded-xl bg-[#17D7C7] hover:bg-[#00BFA6] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-semibold text-[13px] sm:text-sm tracking-wide transition-all duration-[200ms] flex items-center justify-center gap-2.5 cursor-pointer shadow-md active:scale-[0.98] btn-premium-glow"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* SCREEN 7 & 8: SUCCESS STATES */}
            {(mode === 'success_signup' || mode === 'success_reset') && (
              <div className="space-y-6 text-center py-4 font-sans">
                <div className="w-12 h-12 rounded-full bg-[#17D7C7]/10 border border-[#17D7C7]/25 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-6 h-6 text-[#17D7C7]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-light text-white tracking-tight leading-tight">
                    {mode === 'success_signup' ? 'Email verified successfully.' : 'Password updated successfully.'}
                  </h2>
                  <p className="text-xs text-neutral-400 font-light leading-normal">
                    {mode === 'success_signup' ? 'You can now sign in to Contril.' : 'Your security credentials have been updated.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setMode('signin'); clearMessages(); }}
                  className="w-full h-12 rounded-xl bg-[#17D7C7] hover:bg-[#00BFA6] text-black font-semibold text-[13px] sm:text-sm tracking-wide transition-all duration-[200ms] flex items-center justify-center gap-2 cursor-pointer shadow-lg btn-premium-glow"
                >
                  Continue to Sign In
                </button>
              </div>
            )}

            {/* Clickable Security Badges with Tooltips */}
            {mode !== 'success_signup' && mode !== 'success_reset' && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-white/[0.04]">
                <SecurityBadge label="OAuth 2.0" tooltip="Secure login delegation protocol" />
                <SecurityBadge label="AES-256" tooltip="Military-grade database encryption" />
                <SecurityBadge label="Zero-Knowledge" tooltip="Decrypted exclusively on client hardware" />
                <SecurityBadge label="SOC 2" tooltip="SOC 2 Type II compliance framework" />
                <SecurityBadge label="GDPR" tooltip="Regulated data privacy compliance" />
              </div>
            )}

        </div>
      </div>

      {/* Top Animated Progress Bar for Recovery Actions */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/[0.04] z-50 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#17D7C7] via-[#4285F4] to-[#17D7C7]"
            style={{
              width: '100%',
              animation: 'progressAnim 1.5s ease-in-out infinite'
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="w-full max-w-[508px] text-center text-[10px] font-mono text-[#FAFAFA] py-3 border-t border-white/[0.04] flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between z-10 mt-6 animate-footer-entrance">
        <div className="flex items-center gap-1.5 text-neutral-300 font-sans text-xs">
          <Shield className="w-3.5 h-3.5 text-[#17D7C7]" />
          <span className="text-[10px] font-medium text-neutral-300">Zero-Knowledge Private Enclave</span>
        </div>
        <div className="text-[9px] text-neutral-400 font-medium">
          Zero-Knowledge Architecture • Built in India • Trusted Worldwide
        </div>
      </div>

      {showLogoEntrance && (
        <div className="fixed inset-0 bg-[#060608] z-50 flex items-center justify-center pointer-events-none">
          <ContrilLogo variant="main" size={48} className="animate-logo-entrance" />
        </div>
      )}

    </div>
  );
};

const PasswordInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
  showEye: boolean;
  onEyeToggle: () => void;
  id: string;
}> = ({ value, onChange, placeholder, label, showEye, onEyeToggle, id }) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">{label}</label>
      <div className="relative">
        <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
        <input
          id={id}
          type={showEye ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-14 rounded-xl bg-white/[0.01] border border-white/[0.06] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#17D7C7] focus:bg-[#17D7C7]/[0.01] focus:ring-4 focus:ring-[#17D7C7]/[0.08] transition-all font-mono caret-[#17D7C7] input-premium-focus"
        />
        <button
          type="button"
          onClick={onEyeToggle}
          className="absolute right-3.5 top-3 text-neutral-500 hover:text-[#17D7C7] transition-colors focus:outline-none cursor-pointer"
          aria-label={showEye ? "Hide password" : "Show password"}
        >
          <div className="relative w-4 h-4">
            <span className={`absolute inset-0 transition-all duration-[150ms] ${showEye ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <Eye className="w-4 h-4" />
            </span>
            <span className={`absolute inset-0 transition-all duration-[150ms] ${!showEye ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <EyeOff className="w-4 h-4" />
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
