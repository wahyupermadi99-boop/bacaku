import { Book, Badge, DailyReadingLog, MonthlyTarget, NotificationSetting, UserStats } from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_BADGES,
  INITIAL_READING_LOGS,
  INITIAL_MONTHLY_TARGET,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_USER_STATS,
} from '../data/initialData';

const STORAGE_KEYS = {
  BOOKS: 'bacaku_books_v1',
  BADGES: 'bacaku_badges_v1',
  LOGS: 'bacaku_logs_v1',
  TARGET: 'bacaku_target_v1',
  NOTIFICATIONS: 'bacaku_notifications_v1',
  STATS: 'bacaku_stats_v1',
  SYNC_CODE: 'bacaku_sync_code_v1',
  DARK_MODE: 'bacaku_dark_mode_v1',
};

export function getStoredBooks(): Book[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return data ? JSON.parse(data) : INITIAL_BOOKS;
  } catch (e) {
    return INITIAL_BOOKS;
  }
}

export function saveStoredBooks(books: Book[]): void {
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
}

export function getStoredBadges(): Badge[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BADGES);
    return data ? JSON.parse(data) : INITIAL_BADGES;
  } catch (e) {
    return INITIAL_BADGES;
  }
}

export function saveStoredBadges(badges: Badge[]): void {
  localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
}

export function getStoredLogs(): DailyReadingLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : INITIAL_READING_LOGS;
  } catch (e) {
    return INITIAL_READING_LOGS;
  }
}

export function saveStoredLogs(logs: DailyReadingLog[]): void {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

export function getStoredTarget(): MonthlyTarget {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TARGET);
    return data ? JSON.parse(data) : INITIAL_MONTHLY_TARGET;
  } catch (e) {
    return INITIAL_MONTHLY_TARGET;
  }
}

export function saveStoredTarget(target: MonthlyTarget): void {
  localStorage.setItem(STORAGE_KEYS.TARGET, JSON.stringify(target));
}

export function getStoredNotifications(): NotificationSetting {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : INITIAL_NOTIFICATION_SETTINGS;
  } catch (e) {
    return INITIAL_NOTIFICATION_SETTINGS;
  }
}

export function saveStoredNotifications(notifs: NotificationSetting): void {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
}

export function getStoredStats(): UserStats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    return data ? JSON.parse(data) : INITIAL_USER_STATS;
  } catch (e) {
    return INITIAL_USER_STATS;
  }
}

export function saveStoredStats(stats: UserStats): void {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

export function getStoredSyncCode(): string | null {
  return localStorage.getItem(STORAGE_KEYS.SYNC_CODE);
}

export function saveStoredSyncCode(code: string): void {
  localStorage.setItem(STORAGE_KEYS.SYNC_CODE, code);
}

export function getStoredDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (stored !== null) return JSON.parse(stored);
    return false;
  } catch (e) {
    return false;
  }
}

export function saveStoredDarkMode(isDark: boolean): void {
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDark));
}
