import React from 'react';

export const AtmosphericBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#F7FAFF] dark:bg-[#050812] transition-colors duration-300">
      
      {/* =========================================================================
          ATMOSPHERIC LIGHT FIELDS (Optimized for 60 FPS mobile performance)
          ========================================================================= */}
      
      {/* Central Soft Luminous Zone (Guarantees crisp headline readability) */}
      <div 
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[900px] sm:w-[1300px] h-[500px] sm:h-[750px] rounded-full opacity-90 dark:opacity-40 blur-[80px] sm:blur-[130px]"
        style={{
          background: 'radial-gradient(ellipse, #FFFFFF 0%, #F8FBFF 40%, rgba(220, 235, 255, 0.6) 70%, transparent 85%)'
        }}
      />

      {/* Top-Left Deep Royal Blue Ambient Bloom */}
      <div 
        className="absolute -top-[20%] -left-[15%] w-[800px] sm:w-[1300px] h-[700px] sm:h-[900px] rounded-full opacity-35 dark:opacity-30 blur-[90px] sm:blur-[170px] sm:animate-ambient-float"
        style={{
          background: 'radial-gradient(circle, #2563EB 0%, #1D4ED8 40%, transparent 75%)'
        }}
      />

      {/* Top-Right Electric Blue & Sky-Blue Ambient Bloom */}
      <div 
        className="absolute -top-[22%] -right-[15%] w-[850px] sm:w-[1400px] h-[750px] sm:h-[950px] rounded-full opacity-35 dark:opacity-28 blur-[90px] sm:blur-[180px] sm:animate-ambient-float-reverse"
        style={{
          background: 'radial-gradient(circle, #3B82F6 0%, #60A5FA 35%, #93C5FD 60%, transparent 80%)'
        }}
      />

      {/* Mid-Left Soft Blue Haze (Desktop only for GPU efficiency) */}
      <div 
        className="hidden sm:block absolute top-[32%] -left-[20%] w-[950px] h-[800px] rounded-full opacity-25 dark:opacity-20 blur-[160px] animate-ambient-float-slow"
        style={{
          background: 'radial-gradient(ellipse, #60A5FA 0%, #3B82F6 45%, transparent 75%)'
        }}
      />

      {/* Mid-Right Soft Cyan Atmospheric Illumination (Desktop only) */}
      <div 
        className="hidden sm:block absolute top-[38%] -right-[20%] w-[1050px] h-[850px] rounded-full opacity-25 dark:opacity-20 blur-[165px] animate-ambient-float"
        style={{
          background: 'radial-gradient(ellipse, #38BDF8 0%, #2563EB 40%, transparent 75%)'
        }}
      />

      {/* Lower Ambient Illumination (Desktop only) */}
      <div 
        className="hidden sm:block absolute bottom-[-15%] left-[15%] w-[1100px] h-[750px] rounded-full opacity-25 dark:opacity-20 blur-[180px] animate-ambient-float-reverse"
        style={{
          background: 'radial-gradient(circle, #3B82F6 0%, #2563EB 50%, transparent 75%)'
        }}
      />

      {/* Subtle Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Bottom Gentle Canvas Fade */}
      <div className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-b from-transparent via-[#F7FAFF]/50 to-[#F7FAFF] dark:via-[#050812]/60 dark:to-[#050812]" />
    </div>
  );
};
