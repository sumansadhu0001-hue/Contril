import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { ContrilLogo } from './ContrilLogo';

interface PreparationSequenceOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  userProfile?: UserProfile;
}

export const PreparationSequenceOverlay: React.FC<PreparationSequenceOverlayProps> = ({
  isVisible,
  onComplete,
  userProfile
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const rawName = userProfile?.name?.trim() || '';
  const firstName = rawName && !rawName.includes('Demo') ? rawName.split(' ')[0] : '';

  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting(firstName ? `Good morning, ${firstName}.` : `Good morning.`);
    else if (hour >= 12 && hour < 17) setGreeting(firstName ? `Good afternoon, ${firstName}.` : `Good afternoon.`);
    else if (hour >= 17 && hour < 22) setGreeting(firstName ? `Good evening, ${firstName}.` : `Good evening.`);
    else setGreeting(firstName ? `Working late, ${firstName}?` : `Working late?`);
  }, [firstName]);

  const prepSteps = [
    'Reading calendar',
    'Reviewing emails',
    'Checking deadlines',
    'Finding priorities'
  ];

  useEffect(() => {
    if (!isVisible) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= prepSteps.length) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] flex flex-col items-center justify-center p-6 font-sans select-none animate-fade-in">
      {/* Background ambient radial aura */}
      <div className="absolute w-[500px] h-[500px] bg-[#00BFA6]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 text-center relative z-10">
        
        {/* Contril Symbol */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#00BFA6]/10 border border-[#00BFA6]/30 shadow-[0_0_30px_rgba(0,191,166,0.25)]">
          <ContrilLogo variant="icon-only" size={40} animated={true} />
        </div>

        {/* Dynamic Greeting */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight">
            {greeting}, <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#00BFA6]">{firstName}.</span>
          </h2>
          <p className="text-sm font-mono text-neutral-400">Preparing your day...</p>
        </div>

        {/* Checklist Steps */}
        <div className="p-6 rounded-3xl bg-[#111114]/80 border border-white/[0.08] shadow-2xl space-y-3 text-left">
          {prepSteps.map((step, index) => {
            const isDone = index < stepIndex;
            const isCurrent = index === stepIndex;

            return (
              <div
                key={step}
                className={`flex items-center justify-between text-xs font-mono py-1.5 px-3 rounded-xl transition-all duration-300 ${
                  isDone
                    ? 'text-white bg-white/[0.04]'
                    : isCurrent
                    ? 'text-[#00BFA6] bg-[#00BFA6]/10 border border-[#00BFA6]/30'
                    : 'text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isDone ? 'text-[#34D399]' : isCurrent ? 'text-[#00BFA6]' : 'text-neutral-700'
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[#00BFA6] animate-ping" />
                    ) : (
                      <span>○</span>
                    )}
                  </div>
                  <span className="font-sans">{step}</span>
                </div>

                <span className="text-[10px]">
                  {isDone ? '✓ Done' : isCurrent ? 'Analyzing...' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {stepIndex >= prepSteps.length && (
          <div className="text-xs font-mono text-[#34D399] animate-bounce">
            Done. Entering workspace...
          </div>
        )}

      </div>
    </div>
  );
};
