import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'bb_theme_preference';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch {
    // Ignore storage read error
  }
  return 'system';
}

export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore storage write error
  }
  applyTheme(mode);
}

export function isDarkActive(mode?: ThemeMode): boolean {
  const current = mode ?? getStoredTheme();
  if (current === 'dark') return true;
  if (current === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

export async function applyTheme(mode?: ThemeMode): Promise<void> {
  const current = mode ?? getStoredTheme();
  const shouldBeDark = isDarkActive(current);

  if (typeof document !== 'undefined') {
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Update meta theme-color for browser chrome
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', shouldBeDark ? '#0f172a' : '#FAF8F5');
    }
  }

  // Capacitor Android status bar integration
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      if (shouldBeDark) {
        await StatusBar.setBackgroundColor({ color: '#0f172a' });
        // In Capacitor: Style.Dark means dark status bar with light icons
        await StatusBar.setStyle({ style: Style.Dark });
      } else {
        await StatusBar.setBackgroundColor({ color: '#FAF8F5' });
        // Style.Light means light status bar with dark icons
        await StatusBar.setStyle({ style: Style.Light });
      }
    } catch (err) {
      console.warn('Status bar theme update notice:', err);
    }
  }
}

/**
 * Initializes theme listener on app startup.
 * Returns an unbind function.
 */
export function initTheme(): () => void {
  applyTheme();

  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => {
    const current = getStoredTheme();
    if (current === 'system') {
      applyTheme('system');
    }
  };

  mediaQuery.addEventListener('change', listener);
  return () => mediaQuery.removeEventListener('change', listener);
}
