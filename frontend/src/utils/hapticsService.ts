import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type HapticFeedbackStyle = 'light' | 'medium' | 'heavy' | 'success' | 'celebrate';

/**
 * Universal safe haptic feedback utility
 * Works natively in Capacitor Android/iOS with graceful fallback to navigator.vibrate on web
 */
export async function triggerHaptic(style: HapticFeedbackStyle = 'light'): Promise<void> {
  try {
    if (style === 'celebrate') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setTimeout(async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {
          // Ignore
        }
      }, 100);
      return;
    }

    if (style === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
      return;
    }

    if (style === 'heavy') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      return;
    }

    if (style === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
      return;
    }

    // Default: light
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Fallback to web Vibration API if Capacitor native bridge is not available
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        if (style === 'celebrate') {
          navigator.vibrate([60, 40, 80]);
        } else if (style === 'heavy' || style === 'medium' || style === 'success') {
          navigator.vibrate(40);
        } else {
          navigator.vibrate(20);
        }
      }
    } catch {
      // Silently fail if vibration is blocked or unsupported
    }
  }
}
