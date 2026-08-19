/**
 * Centralized Android Distribution & Play Store Configuration
 * Single source of truth for app version, checksum, and distribution mode.
 */

export type DistributionMode = 'DIRECT_APK' | 'PLAY_STORE';

export interface AndroidReleaseInfo {
  version: string;
  releaseDate: string;
  fileSize: string;
  minAndroidSdk: string;
  minAndroidVersion: string;
  downloadUrl: string;
  playStoreUrl: string;
  distributionMode: DistributionMode;
  sha256Checksum: string;
  channel: 'preview' | 'beta' | 'stable';
  installNotice: string;
  changelog: string[];
}

export const CONTRIL_ANDROID_APK_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CONTRIL_APK_URL) ||
  '/downloads/contril-android.apk';

export const CONTRIL_PLAY_STORE_URL = 
  'https://play.google.com/store/apps/details?id=com.contril.app';

export const CONTRIL_APK_CONFIG: AndroidReleaseInfo = {
  version: '0.2.0-native',
  releaseDate: 'August 18, 2026',
  fileSize: '13.0 MB',
  minAndroidSdk: 'API 26',
  minAndroidVersion: 'Android 8.0 (Oreo) or higher',
  downloadUrl: CONTRIL_ANDROID_APK_URL,
  playStoreUrl: CONTRIL_PLAY_STORE_URL,
  // Set to 'PLAY_STORE' once approved on Google Play Console for a 1-line switchover
  distributionMode: 'DIRECT_APK',
  sha256Checksum: '75f1c0fcec0977f6ccb07e4f8cd7d9be00bd13233aa20a1a7f1a61092aa417db',
  channel: 'stable',
  installNotice: 'Currently available as a direct download while we complete Play Store review — you may see a standard Android security prompt during install; this is expected and safe.',
  changelog: [
    'Signed with fresh production release keystore',
    'Native Jetpack Compose mobile Chief of Staff UI',
    'Gmail send, triage & safe trash cleaning (OAuth 2.0)',
    'Real-time offline caching and last-synced indicators',
    'Overnight autonomy service with 30-day auto-purge',
    'Cultural & festive calendar executive briefings',
    'Full Razorpay executive tier upgrades'
  ]
};
