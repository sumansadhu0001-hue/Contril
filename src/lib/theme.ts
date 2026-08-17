// Contril Unified Signature Theme Architecture
// The signature Contril light atmospheric aesthetic is permanently enforced across the app.

export type ThemePreference = 'light';
export type ResolvedTheme = 'light';

export const THEME_STORAGE_KEY = 'contril-theme';

export function getStoredThemePreference(): ThemePreference {
  return 'light';
}

export function saveThemePreference(theme: ThemePreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  } catch (e) {
    console.error('Failed to save theme preference to storage', e);
  }
}

export function getSystemTheme(): ResolvedTheme {
  return 'light';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return 'light';
}

export function applyTheme(preference?: ThemePreference): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';

  const root = document.documentElement;
  root.classList.add('light');
  root.classList.remove('dark');
  root.setAttribute('data-theme', 'light');
  root.style.colorScheme = 'light';

  return 'light';
}

export function subscribeToSystemThemeChanges(onThemeChange: () => void): () => void {
  return () => {};
}
