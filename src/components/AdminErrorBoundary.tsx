import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  onBackToApp?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Enclave Render Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md bg-[#0D0D11] border border-white/[0.08] rounded-3xl p-8 space-y-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#00BFA6]/10 border border-[#00BFA6]/20 flex items-center justify-center text-[#00BFA6] mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-white">Admin Enclave Operational Recovered</h1>
              <p className="text-xs text-neutral-400 font-mono">An isolated rendering error occurred inside the Admin Enclave framework.</p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-neutral-400 text-left overflow-x-auto">
                {this.state.error.message || 'Render Exception caught'}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs font-mono cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Retry Enclave
              </button>

              {this.props.onBackToApp && (
                <button
                  onClick={this.props.onBackToApp}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs font-mono cursor-pointer transition-colors"
                >
                  Return to App
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
