import React from 'react';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-[#111114] border border-white/[0.12] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#15151A]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5B7CFF]/15 border border-[#5B7CFF]/30 flex items-center justify-center text-[#5B7CFF]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white tracking-tight">Terms of Service</h2>
              <p className="text-xs font-mono text-[#9CA3AF]">Contril Operating License & Agreement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-sm leading-relaxed text-neutral-300 font-light">
          
          <div className="p-4 rounded-2xl bg-[#17171B] border border-[#5B7CFF]/30 text-xs text-[#5B7CFF] font-mono flex items-center justify-between">
            <span>Master Service Terms • Version 2.6</span>
            <span className="text-white">Last Updated: August 1, 2026</span>
          </div>

          {/* Section 1: Acceptance */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">01</span>
              Acceptance of Terms
            </h3>
            <p>
              By accessing or utilizing the Contril AI Operating System ("Service"), you signify your binding agreement to these Terms of Service. If you do not agree with any provision set forth herein, you must immediately cease accessing the platform.
            </p>
          </section>

          {/* Section 2: Accounts */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">02</span>
              User Accounts
            </h3>
            <p>
              You are responsible for safeguarding your authentication credentials (email OTP tokens, password credentials, OAuth sessions). You agree to provide accurate registration information and accept full liability for all activities conducted under your enclave session.
            </p>
          </section>

          {/* Section 3: Subscriptions */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">03</span>
              Subscriptions & Billing
            </h3>
            <p>
              Contril offers Free Tier, Pro Executive, and Enterprise Enclave tiers. Paid subscriptions auto-renew according to your chosen billing cycle (monthly or annual). You may modify or cancel your subscription at any time via Account Settings.
            </p>
          </section>

          {/* Section 4: Privacy */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">04</span>
              Privacy & Zero-Knowledge Security
            </h3>
            <p>
              Our handling of personal data and encrypted local state is governed strictly by our Privacy Policy. Contril does not mine, sell, or analyze your private documents or AI outputs for advertising purposes.
            </p>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">05</span>
              Intellectual Property Rights
            </h3>
            <p>
              All patents, trademarks, software code, UI designs, and autonomous agent algorithms comprising Contril remain the exclusive property of Contril Inc. All AI-generated outputs created by you remain 100% your property.
            </p>
          </section>

          {/* Section 6: Termination */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">06</span>
              Termination
            </h3>
            <p>
              We reserve the right to suspend or terminate access to the Service in cases of severe abuse, malicious security probing, or violation of applicable laws. You may delete your account and local enclave data at any time.
            </p>
          </section>

          {/* Section 7: Disclaimer */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">07</span>
              Disclaimer of Warranties
            </h3>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for maximum uptime and reliability, Contril makes no express warranties regarding uninterrupted operation or error-free AI completions.
            </p>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">08</span>
              Limitation of Liability
            </h3>
            <p>
              To the maximum extent permitted by law, Contril Inc. shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform.
            </p>
          </section>

          {/* Section 9: Changes */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">09</span>
              Changes to Terms
            </h3>
            <p>
              We may update these terms periodically. Material modifications will be communicated via in-app notification prior to taking effect. Continued usage after changes constitutes acceptance.
            </p>
          </section>

          {/* Section 10: Contact */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#5B7CFF]">10</span>
              Contact Information
            </h3>
            <p>
              Questions regarding these Terms of Service should be directed to <span className="text-white font-mono underline">legal@contril.os</span>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#15151A] flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Contril License Agreement</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            I Agree & Close
          </button>
        </div>

      </div>
    </div>
  );
};
