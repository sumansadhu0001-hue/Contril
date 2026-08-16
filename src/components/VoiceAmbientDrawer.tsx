import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  X, 
  Sparkles, 
  Square, 
  Radio,
  Zap
} from 'lucide-react';

interface VoiceAmbientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAmbientDrawer: React.FC<VoiceAmbientDrawerProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('Listening... Speak your executive query naturally.');

  if (!isOpen) return null;

  const toggleMic = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      setVoiceText('Listening... Speak your executive query naturally.');
    } else {
      setVoiceText('Voice stream paused. Tap microphone to speak.');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 bg-black/80 backdrop-blur-2xl border-t border-[#00BFA6]/30 flex justify-center animate-slide-up">
      <div className="w-full max-w-2xl bg-[#0D0D11] border border-white/[0.1] rounded-3xl p-6 relative space-y-6 text-white shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-[#00BFA6]/15 text-[#00BFA6] text-xs font-mono font-medium flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#00BFA6]" />
            <span>Voice Ambient Interface</span>
          </div>
        </div>

        {/* Audio Waveform Animation Visualizer */}
        <div className="h-16 flex items-center justify-center gap-1.5 py-2">
          {[40, 75, 30, 90, 60, 100, 45, 80, 50, 70, 35, 95].map((height, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isListening ? 'bg-[#00BFA6] animate-pulse' : 'bg-neutral-700'
              }`}
              style={{ height: isListening ? `${height}%` : '20%' }}
            />
          ))}
        </div>

        {/* Transcript Text */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
          <p className="text-sm font-light text-neutral-200 italic">{voiceText}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-black font-bold transition-all cursor-pointer shadow-xl ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-[#00BFA6] hover:bg-[#00A892] shadow-[#00BFA6]/30'
            }`}
          >
            {isListening ? <Square className="w-6 h-6 fill-white" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

      </div>
    </div>
  );
};
