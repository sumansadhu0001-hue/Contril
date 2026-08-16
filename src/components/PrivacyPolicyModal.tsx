import React from 'react';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-[#111114] border border-white/[0.12] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#15151A]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00BFA6]/15 border border-[#00BFA6]/30 flex items-center justify-center text-[#00BFA6]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white tracking-tight">Privacy Policy</h2>
              <p className="text-xs font-mono text-[#9CA3AF]">Contril Zero-Knowledge Data Enclave</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-sm leading-relaxed text-neutral-300 font-light">
          
          <div className="p-4 rounded-2xl bg-[#17171B] border border-[#00BFA6]/30 text-xs text-[#00BFA6] font-mono flex items-center justify-between">
            <span>Official Legal Document • Version 2.6</span>
            <span className="text-white">Last Updated: August 1, 2026</span>
          </div>

          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">01</span>
              Introduction
            </h3>
            <p>
              Welcome to Contril ("we", "our", or "us"). We are committed to maintaining the highest standard of user privacy, digital security, and client-side data sovereignty. This Privacy Policy outlines how your information is collected, processed, encrypted, and protected when you use the Contril AI Operating System.
            </p>
          </section>

          {/* Section 2: Data Collection */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">02</span>
              Data Collection
            </h3>
            <p>
              Contril operates under a Zero-Knowledge design philosophy. We collect minimal account identifiers (such as verified email or OAuth profiles via Supabase Auth) necessary to authenticate your enclave session.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-neutral-400 pl-2">
              <li>Authentication metadata (email address, OAuth tokens).</li>
              <li>Workspace profile preferences (User identity type, workspace name, role).</li>
              <li>Local telemetry logs stored exclusively on your device.</li>
            </ul>
          </section>

          {/* Section 3: Storage */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">03</span>
              Storage
            </h3>
            <p>
              Your notes, documents, executive decisions, email drafts, and memory items reside inside your local indexed enclave state and encrypted device memory. We do not transmit or store unencrypted files on central servers.
            </p>
          </section>

          {/* Section 4: Encryption */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">04</span>
              Encryption
            </h3>
            <p>
              All stored sensitive assets utilize AES-256 client-side encryption. Communication channels between client apps and authenticated APIs utilize TLS 1.3 transport security with cryptographic key verification.
            </p>
          </section>

          {/* Section 5: Cookies & Local Enclaves */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">05</span>
              Cookies & Local State
            </h3>
            <p>
              Contril uses essential session tokens and strict HTTP-only cookies to preserve your authenticated state across page refreshes. We do not deploy third-party advertising cookies, cross-site trackers, or marketing pixels.
            </p>
          </section>

          {/* Section 6: Third-party Services */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">06</span>
              Third-Party Services
            </h3>
            <p>
              Authentication providers (Google, GitHub, Microsoft, Apple, Supabase) process OAuth tokens solely to verify your identity. When using external model endpoints, prompts are handled transiently without retaining model training logs.
            </p>
          </section>

          {/* Section 7: Security */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">07</span>
              Security Infrastructure
            </h3>
            <p>
              We enforce strict rate-limiting, short-lived 6-digit OTP tokens expiring after 5 minutes, brute-force mitigation, and isolated session enclaves to safeguard against unauthorized access attempts.
            </p>
          </section>

          {/* Section 8: User Rights */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">08</span>
              User Rights
            </h3>
            <p>
              You maintain total ownership of your personal data. You possess the right to export your complete workspace memory, purge all local state, or terminate your authenticated enclave session at any given time.
            </p>
          </section>

          {/* Section 9: Contact Information */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#00BFA6]">09</span>
              Contact Us
            </h3>
            <p>
              For privacy inquiries, audit request validations, or security reports, please contact our Data Enclave Office at <span className="text-white font-mono underline">privacy@contril.os</span>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#15151A] flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Protected by Contril Security Enclave</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Accept & Close
          </button>
        </div>

      </div>
    </div>
  );
};
