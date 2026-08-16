/**
 * Centralized Android APK Distribution Configuration
 * Update these values when releasing new APK test builds.
 */

export interface AndroidApkReleaseInfo {
  version: string;
  releaseDate: string;
  fileSize: string;
  minAndroidSdk: string;
  minAndroidVersion: string;
  downloadUrl: string;
  channel: 'preview' | 'beta' | 'stable';
  changelog: string[];
}

export const CONTRIL_ANDROID_APK_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CONTRIL_APK_URL) ||
  '/release/contril-release.apk';

export const CONTRIL_APK_CONFIG: AndroidApkReleaseInfo = {
  version: '0.1.0-preview',
  releaseDate: 'August 2026',
  fileSize: '18.4 MB',
  minAndroidSdk: 'API 26',
  minAndroidVersion: 'Android 8.0 (Oreo) or higher',
  downloadUrl: CONTRIL_ANDROID_APK_URL,
  channel: 'preview',
  changelog: [
    'Experimental test build for early testers',
    'Voice & text command center integration',
    'Google Workspace (Gmail & Calendar) live sync',
    'Action approval permission model',
    'Unified account authentication with Web'
  ]
};
