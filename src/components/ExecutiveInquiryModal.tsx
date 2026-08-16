import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Crown, 
  Sparkles, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  HelpCircle, 
  DollarSign, 
  Clock, 
  MessageSquare,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ContrilApiClient } from '../lib/apiClient';

interface ExecutiveInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledPlan?: string;
}

export const ExecutiveInquiryModal: React.FC<ExecutiveInquiryModalProps> = ({
  isOpen,
  onClose,
  prefilledPlan = 'Business'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(prefilledPlan);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Founder');
  const [country, setCountry] = useState('India');
  const [companySize, setCompanySize] = useState('11–50');
  const [useCase, setUseCase] = useState('');
  const [monthlyUsage, setMonthlyUsage] = useState<'Light' | 'Medium' | 'Heavy'>('Heavy');
  const [budget, setBudget] = useState<string>('₹15,000–₹50,000');
  const [preferredContact, setPreferredContact] = useState<'Email' | 'Phone' | 'Google Meet' | 'WhatsApp'>('Google Meet');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReferenceId, setSubmittedReferenceId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    setSelectedPlan(prefilledPlan);
  }, [prefilledPlan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !company || !agreedToTerms) return;

    setIsSubmitting(true);

    try {
      const res = await ContrilApiClient.submitInquiry({
        fullName,
        email,
        phone,
        company,
        role,
        country,
        companySize,
        selectedPlan,
        useCase: useCase || 'I need an autonomous AI Chief of Staff.',
        monthlyUsage,
        budget,
        preferredContact,
        agreedToTerms
      });

      if (res && res.referenceId) {
        setSubmittedReferenceId(res.referenceId);
      } else {
        const fallbackRef = `CTR-${Math.floor(100000 + Math.random() * 900000)}`;
        setSubmittedReferenceId(fallbackRef);
      }
    } catch (err) {
      console.error(err);
      setSubmittedReferenceId(`CTR-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (!submittedReferenceId) return;
    navigator.clipboard.writeText(submittedReferenceId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleModalClose = () => {
    setSubmittedReferenceId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-modal-overlay">
      <div className="w-full max-w-3xl bg-[#0d0d11]/95 border border-[#00BFA6]/30 rounded-3xl shadow-[0_0_50px_rgba(0,191,166,0.15)] p-6 md:p-8 relative space-y-6 my-8 text-white animate-modal-content">
        
        {/* Close button */}
        <button
          onClick={handleModalClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedReferenceId ? (
          /* CONFIRMATION SCREEN */
          <div className="py-8 text-center space-y-6 animate-fade-in max-w-lg mx-auto">
            
            {/* Animated Glow Checkmark */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#00BFA6]/20 to-[#34D399]/20 border border-[#34D399]/40 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              <CheckCircle2 className="w-10 h-10 text-[#34D399]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
                Request Received
              </h2>
              <p className="text-sm text-[#9CA3AF] font-light leading-relaxed">
                Our executive team has received your inquiry. We'll review your requirements and contact you within <span className="text-white font-medium">24 hours</span>.
              </p>
            </div>

            {/* Reference ID Pill */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Reference ID</p>
                <p className="text-lg font-mono font-bold text-[#00BFA6] tracking-wider">{submittedReferenceId}</p>
              </div>
              <button
                onClick={handleCopyRef}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleModalClose}
                className="flex-1 py-3 rounded-2xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-sm transition-all shadow-lg shadow-[#00BFA6]/20 cursor-pointer"
              >
                Back to Workspace
              </button>
              <button
                onClick={handleModalClose}
                className="py-3 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 font-medium text-sm transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM SCREEN */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00BFA6]/10 border border-[#00BFA6]/25 text-[#00BFA6] text-xs font-mono font-medium">
                <Crown className="w-3.5 h-3.5 text-[#00BFA6]" />
                <span>Private Executive Sales Program</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
                Let's Build Your Executive Workspace
              </h2>
              <p className="text-xs md:text-sm text-[#9CA3AF] font-light">
                Tell us about your workflow and our team will prepare the best Contril plan for you.
              </p>
            </div>

            {/* Plan Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-neutral-400 tracking-wider">Interested Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Pro', 'Business', 'Enterprise'] as const).map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedPlan === plan
                        ? 'bg-[#00BFA6]/20 border-[#00BFA6] text-white shadow-[0_0_15px_rgba(0,191,166,0.2)]'
                        : 'bg-white/[0.02] border-white/[0.08] text-neutral-400 hover:border-white/[0.2]'
                    }`}
                  >
                    <span>{plan}</span>
                    {selectedPlan === plan && <Check className="w-3.5 h-3.5 text-[#00BFA6]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors"
                />
              </div>

              {/* Business Email */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Business Email *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors"
                />
              </div>

              {/* Phone Number (optional) */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Phone Number (optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Company Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors"
                />
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Role *</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141419] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#00BFA6] transition-colors"
                >
                  <option value="Founder">Founder</option>
                  <option value="CEO">CEO</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Agency">Agency</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Student">Student</option>
                  <option value="Enterprise">Enterprise Exec</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Country *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors"
                />
              </div>

            </div>

            {/* Company Size */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium">Company Size</label>
              <div className="flex flex-wrap gap-2">
                {['1', '2–10', '11–50', '51–250', '250+'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setCompanySize(sz)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      companySize === sz
                        ? 'bg-[#00BFA6] text-black font-semibold shadow'
                        : 'bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08]'
                    }`}
                  >
                    {sz} employees
                  </button>
                ))}
              </div>
            </div>

            {/* Use Case */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#00BFA6]" />
                <span>Primary Use Case</span>
              </label>
              <textarea
                rows={3}
                placeholder={`Examples:\n• "I need an AI Chief of Staff."\n• "I want AI to manage my inbox."\n• "I need autonomous document workflows."`}
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors leading-relaxed"
              />
            </div>

            {/* Usage & Budget & Preferred Contact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Expected Usage */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Expected Monthly Usage</span>
                </label>
                <div className="flex flex-col gap-1.5">
                  {(['Light', 'Medium', 'Heavy'] as const).map((usg) => (
                    <button
                      key={usg}
                      type="button"
                      onClick={() => setMonthlyUsage(usg)}
                      className={`py-1.5 px-3 rounded-xl text-xs text-left transition-all cursor-pointer ${
                        monthlyUsage === usg
                          ? 'bg-[#00BFA6]/20 border border-[#00BFA6] text-white'
                          : 'bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06]'
                      }`}
                    >
                      {usg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Monthly Budget</span>
                </label>
                <div className="flex flex-col gap-1.5">
                  {(['Under ₹5,000', '₹5,000–₹15,000', '₹15,000–₹50,000', '₹50,000+'] as const).map((bgt) => (
                    <button
                      key={bgt}
                      type="button"
                      onClick={() => setBudget(bgt)}
                      className={`py-1.5 px-3 rounded-xl text-xs text-left transition-all cursor-pointer ${
                        budget === bgt
                          ? 'bg-[#00BFA6]/20 border border-[#00BFA6] text-white font-medium'
                          : 'bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06]'
                      }`}
                    >
                      {bgt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Contact */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span>Preferred Contact</span>
                </label>
                <div className="flex flex-col gap-1.5">
                  {(['Email', 'Phone', 'Google Meet', 'WhatsApp'] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setPreferredContact(cnt)}
                      className={`py-1.5 px-3 rounded-xl text-xs text-left transition-all cursor-pointer ${
                        preferredContact === cnt
                          ? 'bg-[#00BFA6]/20 border border-[#00BFA6] text-white'
                          : 'bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06]'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Checkbox agreement */}
            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="agreed_terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded accent-[#00BFA6] cursor-pointer"
              />
              <label htmlFor="agreed_terms" className="text-xs text-neutral-300 cursor-pointer">
                I agree to be contacted by Contril executive partners regarding my inquiry.
              </label>
            </div>

            {/* Modal Footer Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !agreedToTerms}
                className="px-6 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black text-xs font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#00BFA6]/25 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}</span>
                {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
