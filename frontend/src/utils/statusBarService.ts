import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

/**
 * Configures the Android status bar so it does not overlap application content
 * while maintaining the correct theme color and dark icons on the light background.
 */
export async function initStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Ensure the webview does not slide behind the status bar
    await StatusBar.setOverlaysWebView({ overlay: false });
    // Set status bar background color to match Birthday Buddy canvas
    await StatusBar.setBackgroundColor({ color: '#FAF8F5' });
    // Use dark icons (clock, wifi, battery) on the light canvas
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (err) {
    console.warn('Status bar initialization notice:', err);
  }
}
