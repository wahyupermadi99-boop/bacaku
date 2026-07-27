import React from 'react';
import { BookMarked, Moon, Sun, Flame, Bell } from 'lucide-react';
import { UserStats } from '../types';

interface HeaderNavProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userStats: UserStats;
  onOpenReminderModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  darkMode,
  onToggleDarkMode,
  userStats,
  onOpenReminderModal,
}) => {
  return (
    <header className="shrink-0 z-20 backdrop-blur-xl bg-white/90 dark:bg-emerald-950/90 border-b border-emerald-100/80 dark:border-emerald-900/50 px-4 md:px-8 py-3 transition-colors shadow-xs">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight tracking-tight text-stone-900 dark:text-emerald-100 flex items-center">
              <span className="text-emerald-600 font-black">.</span>bacaku
            </h1>
          </div>
        </div>

        {/* Right Actions & Streak */}
        <div className="flex items-center gap-2">
          {/* Reading Streak Pill */}
          <div
            title="Streak Membaca Harian"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold"
          >
            <Flame className="w-4 h-4 fill-emerald-600 text-emerald-600 animate-pulse" />
            <span>{userStats.currentStreak} Hari</span>
          </div>

          {/* Daily Reminder Bell */}
          <button
            type="button"
            onClick={onOpenReminderModal}
            title="Pengingat Harian"
            className="p-2 rounded-xl text-stone-600 dark:text-emerald-200 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Mode Terang' : 'Mode Gelap (Comfort Reading)'}
            className="p-2 rounded-xl text-stone-600 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4 text-emerald-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

