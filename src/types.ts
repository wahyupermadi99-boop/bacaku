export type ReadingStatus = 'reading' | 'completed' | 'plan_to_read' | 'paused';

export interface ChapterLog {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  startPage: number;
  endPage: number;
  summary: string;
  keyTakeaways: string[];
  quote?: string;
  createdAt: string;
  aiGenerated?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  coverUrl: string;
  genre: string;
  rating?: number;
  status: ReadingStatus;
  createdAt: string;
  updatedAt: string;
  targetDate?: string;
  notes?: string;
  chapters: ChapterLog[];
}

export interface DailyReadingLog {
  id: string;
  date: string; // YYYY-MM-DD
  pagesRead: number;
  minutesSpent: number;
  bookId: string;
  bookTitle?: string;
}

export interface MonthlyTarget {
  year: number;
  month: number; // 1-12
  targetBooks: number;
  targetPages: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'progress' | 'streak' | 'summary' | 'library' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface NotificationSetting {
  enabled: boolean;
  reminderTime: string; // "20:00"
  daysOfWeek: number[]; // 0=Sun, 1=Mon...
  soundEnabled: boolean;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  lastReadDate?: string; // YYYY-MM-DD
  totalPagesRead: number;
  totalBooksCompleted: number;
  totalChaptersSummarized: number;
  totalReadingMinutes: number;
  xpPoints: number;
  level: number;
}
