import React, { useEffect, useState } from 'react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { Loader2, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react';

interface OAuthCallbackViewProps {
  onNavigate: (route: string) => void;
}

export const OAuthCallbackView: React.FC<OAuthCallbackViewProps> = ({ onNavigate }) => {
  const [nativeUrl, setNativeUrl] = useState<string>('contril://auth/callback');
  const [hasTokens, setHasTokens] = useState<boolean>(false);

  useEffect(() => {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      
      const containsAuthTokens = 
        hash.includes('access_token=') || 
        search.includes('access_token=') || 
        hash.includes('code=') || 
        search.includes('code=') ||
        hash.includes('provider_token=') ||
        search.includes('provider_token=');

      if (containsAuthTokens) {
        setHasTokens(true);
        const deepLink = 'contril://auth/callback' + hash + (search ? (hash ? '&' : '?') + search.substring(1) : '');
        setNativeUrl(deepLink);
        
        // Auto-redirect to Android deep link
        window.location.href = deepLink;
      }
    } catch (e) {
      console.error('[OAuthCallbackView] Error parsing auth tokens:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-[#0B1220] dark:text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
            <ContrilLogo size="lg" strokeColor="#2563EB" />
          </div>
        </div>

        {hasTokens ? (
          <>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authentication Successful</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Connecting to Contril
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Returning you securely to the Contril Android application.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 py-3 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Opening app...</span>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={nativeUrl}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Open in Contril App</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => onNavigate('/')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Website Homepage</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Contril Authentication
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                This endpoint is reserved for OAuth authorization callbacks from connected Google Workspace and Microsoft services.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onNavigate('/')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Homepage</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
