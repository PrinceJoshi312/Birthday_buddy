import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { applyTheme } from './themeService';

/**
 * Configures the Android status bar so it does not overlap application content
 * while maintaining the correct theme background and icon contrast.
 */
export async function initStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Ensure the webview does not slide behind the status bar
    await StatusBar.setOverlaysWebView({ overlay: false });
    // Apply status bar background & icon styling matching active theme
    await applyTheme();
  } catch (err) {
    console.warn('Status bar initialization notice:', err);
  }
}
