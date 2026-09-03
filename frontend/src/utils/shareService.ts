import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export interface ShareOptions {
  title?: string;
  text: string;
  dialogTitle?: string;
}

/**
 * Native Android & Web Share Service
 * Opens the native Android share sheet (WhatsApp, Telegram, Gmail, Messages, etc.)
 * using @capacitor/share, with graceful fallback to navigator.share or clipboard.
 */
export async function shareBirthdayWish(options: ShareOptions): Promise<{ shared: boolean; method: 'native' | 'web-share' | 'clipboard' }> {
  const { title = 'Birthday Wish', text, dialogTitle = 'Share Birthday Wish' } = options;

  // 1. Capacitor Native Share on Android/iOS
  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({
        title,
        text,
        dialogTitle,
      });
      return { shared: true, method: 'native' };
    } catch (err: any) {
      // User dismissed share dialog or system cancelled
      if (err?.message?.includes('canceled') || err?.message?.includes('cancelled')) {
        return { shared: false, method: 'native' };
      }
      console.warn('Native share failed, attempting fallback:', err);
    }
  }

  // 2. Web Share API (Mobile browsers supporting navigator.share)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return { shared: true, method: 'web-share' };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { shared: false, method: 'web-share' };
      }
    }
  }

  // 3. Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return { shared: true, method: 'clipboard' };
  } catch (err) {
    console.error('Clipboard copy fallback failed:', err);
    return { shared: false, method: 'clipboard' };
  }
}
