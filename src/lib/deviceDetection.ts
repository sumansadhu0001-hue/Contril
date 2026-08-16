/**
 * Canonical Device Detection Utility for Contril
 * Categorizes visitors into: 'android-phone' | 'android-tablet' | 'ios' | 'desktop' | 'tablet' | 'unknown'
 */

export type DeviceCategory = 
  | 'android-phone' 
  | 'android-tablet' 
  | 'ios' 
  | 'desktop' 
  | 'tablet' 
  | 'unknown';

export interface DeviceInfo {
  category: DeviceCategory;
  isAndroid: boolean;
  isAndroidPhone: boolean;
  isAndroidTablet: boolean;
  isIOS: boolean;
  isIPhone: boolean;
  isIPad: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  platformName: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      category: 'desktop',
      isAndroid: false,
      isAndroidPhone: false,
      isAndroidTablet: false,
      isIOS: false,
      isIPhone: false,
      isIPad: false,
      isDesktop: true,
      isMobile: false,
      platformName: 'desktop'
    };
  }

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const uaLower = ua.toLowerCase();

  const isAndroid = /android/i.test(uaLower);
  // Android phones include "mobile" in the UA string, while Android tablets omit "mobile"
  const isAndroidPhone = isAndroid && /mobile/i.test(uaLower);
  const isAndroidTablet = isAndroid && !isAndroidPhone;

  const isIPhone = /iphone|ipod/i.test(uaLower);
  const isIPad = /ipad/i.test(uaLower) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIOS = isIPhone || isIPad;

  const isMobile = isAndroidPhone || isIPhone;
  const isTablet = isAndroidTablet || isIPad;
  const isDesktop = !isAndroid && !isIOS && !(/mobile|android|iphone|ipad|ipod/i.test(uaLower));

  let category: DeviceCategory = 'desktop';
  if (isAndroidPhone) category = 'android-phone';
  else if (isAndroidTablet) category = 'android-tablet';
  else if (isIOS) category = 'ios';
  else if (isTablet) category = 'tablet';
  else if (isDesktop) category = 'desktop';
  else category = 'unknown';

  return {
    category,
    isAndroid,
    isAndroidPhone,
    isAndroidTablet,
    isIOS,
    isIPhone,
    isIPad,
    isDesktop,
    isMobile,
    platformName: category
  };
}

export function getDeviceType(): 'android' | 'ios' | 'desktop' {
  const info = detectDevice();
  if (info.isAndroid) return 'android';
  if (info.isIOS) return 'ios';
  return 'desktop';
}
