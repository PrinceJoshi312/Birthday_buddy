import { Person } from '../types';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch {
    return getNotificationPermission();
  }
}

/**
 * Checks upcoming birthdays against each person's reminder preferences
 * and sends browser notifications if due and not already notified today.
 */
export async function checkAndSendBirthdayReminders(people: Person[]): Promise<number> {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    return 0;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `bb_notified_${todayStr}`;

  let notifiedSet = new Set<string>();
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      notifiedSet = new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore localStorage parse errors
  }

  let notificationsSent = 0;

  for (const person of people) {
    const days = person.days_remaining ?? person.days_until ?? 999;
    const triggers = (person.reminder_days || 'on_day,1_day_before').split(',').map((s) => s.trim());

    let dueTrigger: string | null = null;
    let notifTitle = '';
    let notifBody = '';

    if (days === 0 && triggers.includes('on_day')) {
      dueTrigger = 'today';
      notifTitle = `🎂 It's ${person.name}'s Birthday!`;
      notifBody = `Don't forget to send ${person.name} a birthday wish 🎉`;
    } else if (days === 1 && triggers.includes('1_day_before')) {
      dueTrigger = '1day';
      notifTitle = `🎂 ${person.name}'s birthday is tomorrow!`;
      notifBody = `Get your wish ready so you don't forget 🎁`;
    } else if (days === 3 && triggers.includes('3_days_before')) {
      dueTrigger = '3days';
      notifTitle = `⏰ ${person.name}'s birthday is in 3 days!`;
      notifBody = `Coming up this week! Prepare a wish or gift 🎈`;
    } else if (days === 7 && triggers.includes('7_days_before')) {
      dueTrigger = '7days';
      notifTitle = `📅 ${person.name}'s birthday is in 1 week!`;
      notifBody = `Mark your calendar for ${person.name}'s celebration ✨`;
    }

    if (dueTrigger && notifTitle) {
      const dedupeKey = `${person.id}_${dueTrigger}_${todayStr}`;
      if (!notifiedSet.has(dedupeKey)) {
        try {
          // Attempt service worker notification first, fallback to Notification API
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification(notifTitle, {
              body: notifBody,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: dedupeKey,
            });
          } else {
            new Notification(notifTitle, {
              body: notifBody,
              icon: '/favicon.svg',
              tag: dedupeKey,
            });
          }

          notifiedSet.add(dedupeKey);
          notificationsSent++;
        } catch {
          // Ignore notification display failures
        }
      }
    }
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(notifiedSet)));
  } catch {
    // Ignore localStorage quota errors
  }

  return notificationsSent;
}

/**
 * Sends a test notification to verify browser notification delivery
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    return false;
  }
  try {
    const title = "🎂 Birthday Buddy Test";
    const body = "Notifications are active and working on your device! 🎉";
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body,
        icon: '/favicon.svg',
        tag: 'test_notification',
      });
    } else {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        tag: 'test_notification',
      });
    }
    return true;
  } catch {
    return false;
  }
}
