// Contril Dual Theme System Architecture
// Default preference: 'system' (respects OS / prefers-color-scheme)
// Explicit options: 'light' | 'dark' | 'system'

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'contril-theme';

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('contril_theme_mode_v3');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    console.error('Failed to read theme preference from storage', e);
  }
  // Default is SYSTEM
  return 'system';
}

export function saveThemePreference(theme: ThemePreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme preference to storage', e);
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}

export function applyTheme(preference: ThemePreference): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';

  const resolved = resolveTheme(preference);
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  return resolved;
}

export function subscribeToSystemThemeChanges(onThemeChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => {
    onThemeChange();
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener);
  } else {
    mediaQuery.addListener(listener);
  }

  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', listener);
    } else {
      mediaQuery.removeListener(listener);
    }
  };
}
