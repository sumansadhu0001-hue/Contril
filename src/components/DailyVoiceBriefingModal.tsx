import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, Play, Pause, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { ContrilLogo } from './ContrilLogo';
import { UserProfile } from '../types';

interface DailyVoiceBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
}

export const DailyVoiceBriefingModal: React.FC<DailyVoiceBriefingModalProps> = ({
  isOpen,
  onClose,
  userProfile
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const rawName = userProfile?.name?.trim() || '';
  const firstName = rawName && !rawName.includes('Demo') ? rawName.split(' ')[0] : 'Suman';
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17 && hour < 22) timeGreeting = 'Good evening';
  else if (hour >= 22 || hour < 5) timeGreeting = 'Working late';

  const scriptSteps = [
    { title: `${timeGreeting}, ${firstName}.`, text: "Here is your executive daily audio briefing." },
    { title: 'Pending Decisions', text: "You have 3 items awaiting your confirmation in your inbox and schedule." },
    { title: 'Schedule Overview', text: "Google Calendar synced: your next sync is at 2:30 PM with the Executive team." }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsPlaying(true);
      return;
    }

    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= scriptSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans select-none text-left">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <ContrilLogo size="sm" strokeColor="#2563EB" />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
                VOICE BRIEFING
              </span>
              <div className="text-xs font-semibold text-[#0F172A] dark:text-white">Contril Audio Digest</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Visualizer Waves */}
        <div className="p-6 rounded-2xl bg-[#F0F6FF] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] space-y-4 text-center">
          <div className="flex items-center justify-center gap-1 h-10">
            {[40, 75, 100, 60, 85, 45, 90, 70, 50, 80].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-[#2563EB] dark:bg-[#3B82F6] rounded-full transition-all duration-300"
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (Math.sin(Date.now() / 200 + i) + 1.2)) / 2.2)}%` : '15%'
                }}
              />
            ))}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
              {scriptSteps[currentStep].title}
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              {scriptSteps[currentStep].text}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-mono text-[#64748B]">
            Section {currentStep + 1} of {scriptSteps.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
