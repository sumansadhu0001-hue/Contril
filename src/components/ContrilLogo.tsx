import React from 'react';

export interface ContrilLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  variant?: 'main' | 'app-icon' | 'favicon' | 'icon-only' | 'wordmark-only' | 'dark' | 'light' | string;
  className?: string;
  showWordmark?: boolean;
  showCategorySubtitle?: boolean;
  showCompanyHeader?: boolean;
  subtitle?: string;
  strokeColor?: string;
  accentColor?: string;
  strokeWidth?: number;
  animated?: boolean;
  style?: React.CSSProperties;
}

/**
 * Canonical Contril Brand Mark
 * Exact same geometry used for the favicon, sidebar, headers, auth, and mobile.
 * Composition: Perfect circle containing a centered diamond (rotated square).
 */
export const ContrilLogo: React.FC<ContrilLogoProps> = ({
  size = 'md',
  variant,
  className = '',
  showWordmark = false,
  showCategorySubtitle = false,
  showCompanyHeader = false,
  subtitle,
  strokeColor = '#2563EB',
  accentColor,
  strokeWidth = 2.5,
  animated = false,
  style
}) => {
  let dimensionPx = 28;
  if (typeof size === 'number') {
    dimensionPx = size;
  } else {
    switch (size) {
      case 'xs': dimensionPx = 16; break;
      case 'sm': dimensionPx = 20; break;
      case 'md': dimensionPx = 28; break;
      case 'lg': dimensionPx = 36; break;
      case 'xl': dimensionPx = 48; break;
      case '2xl': dimensionPx = 64; break;
    }
  }

  const effectiveColor = accentColor || strokeColor || '#2563EB';

  const mark = (
    <svg
      width={dimensionPx}
      height={dimensionPx}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${animated ? 'animate-spin-slow' : ''} ${className}`}
      style={style}
    >
      {/* Outer Circle */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke={effectiveColor}
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Centered Diamond (Rotated Square) */}
      <path
        d="M 24 13.5 L 34.5 24 L 24 34.5 L 13.5 24 Z"
        stroke={effectiveColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        fill="none"
      />
    </svg>
  );

  const displaySubtitle = subtitle || (showCategorySubtitle ? 'AI Chief of Staff' : undefined);

  if (!showWordmark && !showCompanyHeader && variant !== 'main') {
    return mark;
  }

  return (
    <div className="inline-flex items-center gap-3 select-none text-left">
      {mark}
      <div>
        <div className="font-bold text-sm tracking-wider text-[#0F172A] dark:text-white font-mono leading-tight">
          CONTRIL
        </div>
        {displaySubtitle && (
          <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono uppercase tracking-wider leading-tight">
            {displaySubtitle}
          </div>
        )}
      </div>
    </div>
  );
};
