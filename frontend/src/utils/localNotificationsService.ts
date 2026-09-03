import { LocalNotifications, ScheduleOptions, PermissionStatus } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Person } from '../types';
import { parseBirthday } from './dateUtils';

export type NotificationStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Checks if notification permission is currently granted
 */
export async function checkNotificationPermission(): Promise<NotificationStatus> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status: PermissionStatus = await LocalNotifications.checkPermissions();
      return status.display as NotificationStatus;
    } catch {
      return 'prompt';
    }
  }

  // Web Browser fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const perm = Notification.permission;
    if (perm === 'granted') return 'granted';
    if (perm === 'denied') return 'denied';
    return 'prompt';
  }

  return 'unsupported';
}

/**
 * Requests notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display as NotificationStatus;
    } catch (err) {
      console.warn('Error requesting local notification permission:', err);
      return 'denied';
    }
  }

  // Web Browser fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const res = await Notification.requestPermission();
      return (res === 'granted' ? 'granted' : res === 'denied' ? 'denied' : 'prompt');
    } catch {
      return 'denied';
    }
  }

  return 'unsupported';
}

/**
 * Generates a deterministic positive integer notification ID from person ID and offset days.
 * This guarantees we can cancel/update reminders without creating duplicates.
 */
function getNotificationId(personId: number, offsetDays: number): number {
  return (personId * 10) + (offsetDays >= 0 ? offsetDays : 0);
}

/**
 * Schedules local birthday reminders for a given person based on their reminder preferences.
 * Updates any previously scheduled reminders for this person to prevent duplicates.
 */
export async function schedulePersonBirthdayReminders(person: Person): Promise<number> {
  if (!person || !person.id || !person.birthday) return 0;

  if (!Capacitor.isNativePlatform()) {
    // In web mode, reminders are checked upon app load via notificationService.ts
    return 0;
  }

  const perm = await checkNotificationPermission();
  if (perm !== 'granted') return 0;

  try {
    // 1. Cancel previous notifications for this person to avoid duplicates
    const offsets = [0, 1, 3, 7];
    const idsToCancel = offsets.map((d) => ({ id: getNotificationId(person.id, d) }));
    await LocalNotifications.cancel({ notifications: idsToCancel });

    // 2. Parse reminder configuration
    const reminderDays = (person.reminder_days || 'on_day,1_day_before').split(',').map((s) => s.trim());
    const [hoursStr, minutesStr] = (person.reminder_time || '09:00').split(':');
    const targetHour = parseInt(hoursStr, 10) || 9;
    const targetMinute = parseInt(minutesStr, 10) || 0;

    const parsed = parseBirthday(person.birthday);
    if (!parsed) return 0;
    const { month, day } = parsed;
    const today = new Date();
    const currentYear = today.getFullYear();

    // Determine upcoming birthday date
    let bdayDate = new Date(currentYear, month - 1, day, targetHour, targetMinute, 0);
    if (bdayDate.getTime() < today.getTime()) {
      bdayDate = new Date(currentYear + 1, month - 1, day, targetHour, targetMinute, 0);
    }

    const notificationsToSchedule: any[] = [];

    // Schedule each requested trigger
    for (const trigger of reminderDays) {
      let offsetDays = 0;
      let title = '';
      let body = '';

      if (trigger === 'on_day') {
        offsetDays = 0;
        title = `🎂 It's ${person.name}'s Birthday!`;
        body = `Don't forget to send ${person.name} your birthday wish today 🎉`;
      } else if (trigger === '1_day_before') {
        offsetDays = 1;
        title = `🎂 ${person.name}'s Birthday is Tomorrow!`;
        body = `Get your birthday wish ready for ${person.name} 🎁`;
      } else if (trigger === '3_days_before') {
        offsetDays = 3;
        title = `⏰ ${person.name}'s Birthday in 3 Days!`;
        body = `Coming up this week! Prepare a wish or gift for ${person.name} 🎈`;
      } else if (trigger === '7_days_before') {
        offsetDays = 7;
        title = `📅 ${person.name}'s Birthday in 1 Week!`;
        body = `Mark your calendar for ${person.name}'s celebration ✨`;
      } else {
        continue;
      }

      const scheduleTime = new Date(bdayDate.getTime() - offsetDays * 24 * 60 * 60 * 1000);

      // Only schedule if the date/time is in the future
      if (scheduleTime.getTime() > Date.now()) {
        notificationsToSchedule.push({
          id: getNotificationId(person.id, offsetDays),
          title,
          body,
          schedule: { at: scheduleTime },
          sound: undefined,
          actionTypeId: '',
          extra: { personId: person.id },
        });
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }

    return notificationsToSchedule.length;
  } catch (err) {
    console.warn('Could not schedule local notifications:', err);
    return 0;
  }
}
