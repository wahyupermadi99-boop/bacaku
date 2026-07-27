/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, ChapterLog, DailyReadingLog, MonthlyTarget, NotificationSetting, UserStats } from './types';
import {
  getStoredBooks,
  saveStoredBooks,
  getStoredBadges,
  saveStoredBadges,
  getStoredLogs,
  saveStoredLogs,
  getStoredTarget,
  saveStoredTarget,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredStats,
  saveStoredStats,
  getStoredDarkMode,
  saveStoredDarkMode,
} from './utils/storage';

import { HeaderNav } from './components/HeaderNav';
import { BottomNav, TabType } from './components/BottomNav';
import { BookCard } from './components/BookCard';
import { AddBookModal } from './components/AddBookModal';
import { BookDetailView } from './components/BookDetailView';
import { StatsView } from './components/StatsView';
import { GamificationView } from './components/GamificationView';
import { ShareCardModal } from './components/ShareCardModal';
import { ReminderModal } from './components/ReminderModal';
import { SyncModal } from './components/SyncModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastBanner } from './components/ToastBanner';

import { Plus, Search, BookOpen, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // State
  const [books, setBooks] = useState<Book[]>(getStoredBooks);
  const [badges, setBadges] = useState(getStoredBadges);
  const [logs, setLogs] = useState<DailyReadingLog[]>(getStoredLogs);
  const [monthlyTarget, setMonthlyTarget] = useState<MonthlyTarget>(getStoredTarget);
  const [notifications, setNotifications] = useState<NotificationSetting>(getStoredNotifications);
  const [userStats, setUserStats] = useState<UserStats>(getStoredStats);
  const [darkMode, setDarkMode] = useState<boolean>(getStoredDarkMode);

  // Active view tab & modals
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shareBook, setShareBook] = useState<Book | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Book Delete Modal State
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reading' | 'completed' | 'plan_to_read'>('all');

  // Persist state updates
  useEffect(() => saveStoredBooks(books), [books]);
  useEffect(() => saveStoredBadges(badges), [badges]);
  useEffect(() => saveStoredLogs(logs), [logs]);
  useEffect(() => saveStoredTarget(monthlyTarget), [monthlyTarget]);
  useEffect(() => saveStoredNotifications(notifications), [notifications]);
  useEffect(() => saveStoredStats(userStats), [userStats]);
  useEffect(() => saveStoredDarkMode(darkMode), [darkMode]);

  // Handle Dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check and update streak logic
  const recordReadingLog = (bookId: string, pagesAdded: number) => {
    const today = new Date().toISOString().split('T')[0];
    const existingLogIdx = logs.findIndex((l) => l.date === today && l.bookId === bookId);

    let updatedLogs = [...logs];
    if (existingLogIdx >= 0) {
      updatedLogs[existingLogIdx].pagesRead += pagesAdded;
      updatedLogs[existingLogIdx].minutesSpent += Math.max(1, Math.round(pagesAdded * 1.5));
    } else {
      const bookObj = books.find((b) => b.id === bookId);
      updatedLogs.push({
        id: `log-${Date.now()}`,
        date: today,
        pagesRead: pagesAdded,
        minutesSpent: Math.max(1, Math.round(pagesAdded * 1.5)),
        bookId,
        bookTitle: bookObj?.title,
      });
    }
    setLogs(updatedLogs);

    // Update User Stats
    const isNewDay = userStats.lastReadDate !== today;
    let newStreak = userStats.currentStreak;
    if (isNewDay) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (userStats.lastReadDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const newTotalPages = userStats.totalPagesRead + pagesAdded;
    const newXp = userStats.xpPoints + pagesAdded * 5;
    const newLevel = Math.floor(newXp / 100) + 1;

    setUserStats((prev) => ({
      ...prev,
      lastReadDate: today,
      currentStreak: newStreak,
      longestStreak: Math.max(prev.longestStreak, newStreak),
      totalPagesRead: newTotalPages,
      xpPoints: newXp,
      level: newLevel,
    }));

    checkBadges(newTotalPages, newStreak, books);
  };

  // Badge Check System
  const checkBadges = (totalPages: number, streak: number, bookList: Book[]) => {
    const completedBooksCount = bookList.filter((b) => b.status === 'completed' || b.currentPage >= b.totalPages).length;

    let newlyUnlocked = false;
    const updatedBadges = badges.map((badge) => {
      let newProgress = badge.progress;
      let isUnlocked = badge.unlocked;

      if (badge.id === 'badge-2') {
        newProgress = completedBooksCount;
        if (newProgress >= badge.maxProgress && !isUnlocked) isUnlocked = true;
      } else if (badge.id === 'badge-3') {
        newProgress = streak;
        if (newProgress >= badge.maxProgress && !isUnlocked) isUnlocked = true;
      } else if (badge.id === 'badge-5') {
        newProgress = bookList.length;
        if (newProgress >= badge.maxProgress && !isUnlocked) isUnlocked = true;
      } else if (badge.id === 'badge-6') {
        newProgress = totalPages;
        if (newProgress >= monthlyTarget.targetPages && !isUnlocked) isUnlocked = true;
      }

      if (isUnlocked && !badge.unlocked) {
        newlyUnlocked = true;
      }

      return {
        ...badge,
        progress: newProgress,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked && !badge.unlocked ? new Date().toISOString() : badge.unlockedAt,
      };
    });

    if (newlyUnlocked) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
    setBadges(updatedBadges);
  };

  // Fast Update Pages from Book Card Stepper
  const handleUpdatePages = (bookId: string, addPages: number) => {
    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        if (b.id === bookId) {
          const newCurrent = Math.min(b.totalPages, b.currentPage + addPages);
          const newStatus = newCurrent >= b.totalPages ? 'completed' : 'reading';
          return {
            ...b,
            currentPage: newCurrent,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    recordReadingLog(bookId, addPages);
  };

  // Direct set page number from detail view
  const handleSetExactPage = (bookId: string, newPage: number) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    const pageDiff = Math.max(0, newPage - targetBook.currentPage);

    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        if (b.id === bookId) {
          const clampedPage = Math.min(b.totalPages, Math.max(0, newPage));
          const newStatus = clampedPage >= b.totalPages ? 'completed' : 'reading';
          return {
            ...b,
            currentPage: clampedPage,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook((prev) => (prev ? { ...prev, currentPage: newPage } : null));
    }

    if (pageDiff > 0) {
      recordReadingLog(bookId, pageDiff);
    }
  };

  // Update Book Rating
  const handleUpdateRating = (bookId: string, rating: number) => {
    setBooks((prevBooks) =>
      prevBooks.map((b) => (b.id === bookId ? { ...b, rating, updatedAt: new Date().toISOString() } : b))
    );
    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook((prev) => (prev ? { ...prev, rating } : null));
    }
  };

  // Add Chapter Log
  const handleAddChapter = (bookId: string, newChapterData: Omit<ChapterLog, 'id' | 'createdAt'>) => {
    const newChap: ChapterLog = {
      ...newChapterData,
      id: `chap-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            chapters: [...b.chapters, newChap],
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook((prev) => (prev ? { ...prev, chapters: [...prev.chapters, newChap] } : null));
    }

    setUserStats((prev) => ({
      ...prev,
      totalChaptersSummarized: prev.totalChaptersSummarized + 1,
      xpPoints: prev.xpPoints + 30,
    }));
  };

  // Edit Chapter Log
  const handleEditChapter = (bookId: string, chapterId: string, updatedFields: Partial<ChapterLog>) => {
    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        if (b.id === bookId) {
          const updatedChaps = b.chapters.map((chap) =>
            chap.id === chapterId ? { ...chap, ...updatedFields } : chap
          );
          return {
            ...b,
            chapters: updatedChaps,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.map((chap) =>
                chap.id === chapterId ? { ...chap, ...updatedFields } : chap
              ),
            }
          : null
      );
    }
  };

  // Delete Chapter Log
  const handleDeleteChapter = (bookId: string, chapterId: string) => {
    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            chapters: b.chapters.filter((chap) => chap.id !== chapterId),
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.filter((chap) => chap.id !== chapterId),
            }
          : null
      );
    }
  };

  // Save / Edit Book
  const handleSaveBook = (bookData: Partial<Book>) => {
    if (editingBook) {
      setBooks((prev) =>
        prev.map((b) => (b.id === editingBook.id ? ({ ...b, ...bookData } as Book) : b))
      );
    } else {
      const newBook: Book = {
        id: bookData.id || `book-${Date.now()}`,
        title: bookData.title || 'Buku Baru',
        author: bookData.author || 'Penulis',
        totalPages: bookData.totalPages || 300,
        currentPage: bookData.currentPage || 0,
        coverUrl: bookData.coverUrl || '',
        genre: bookData.genre || 'Self-Improvement',
        status: bookData.status || 'reading',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: bookData.notes || '',
        chapters: [],
      };
      setBooks((prev) => [newBook, ...prev]);
    }
    setEditingBook(null);
  };

  // Prompt delete book modal
  const handleConfirmDeleteBook = (book: Book) => {
    setBookToDelete(book);
  };

  const handleExecuteDeleteBook = () => {
    if (bookToDelete) {
      setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
      if (selectedBook?.id === bookToDelete.id) setSelectedBook(null);
      setBookToDelete(null);
    }
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && b.status === statusFilter;
  });

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#eff3f0] dark:bg-[#131a15] text-stone-900 dark:text-stone-100 font-sans transition-colors antialiased">
      {/* Toast Notification Banner */}
      <ToastBanner />

      {/* App Layout Frame Container - Responsive Full-Width on Tablet and Desktop */}
      <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col justify-between relative shadow-2xl bg-[#eff3f0] dark:bg-[#131a15] border-x border-emerald-100/40 dark:border-emerald-900/30 overflow-x-hidden">
        
        {/* Top App Header */}
        <HeaderNav
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          userStats={userStats}
          onOpenReminderModal={() => setIsReminderModalOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
        />

        {/* Main View Area */}
        <main className="flex-1 px-4 md:px-8 pt-4 pb-28 overflow-y-auto overflow-x-hidden">
          {/* Detail View if a book is selected */}
          {selectedBook ? (
            <BookDetailView
              book={selectedBook}
              onBack={() => setSelectedBook(null)}
              onUpdateBookPages={handleSetExactPage}
              onUpdateRating={handleUpdateRating}
              onAddChapter={handleAddChapter}
              onEditChapter={handleEditChapter}
              onDeleteChapter={handleDeleteChapter}
              onShareBook={(b) => setShareBook(b)}
            />
          ) : (
            <>
              {/* TAB 1: LIBRARY (RAK BUKU) */}
              {activeTab === 'library' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Banner / Welcome */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white shadow-md relative overflow-hidden flex justify-between items-center">
                    <div className="space-y-1 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-emerald-100">
                        Semangat Membaca 📖
                      </span>
                      <h2 className="text-lg font-bold leading-tight">
                        Koleksi Perpustakaan
                      </h2>
                      <p className="text-xs text-emerald-100/90 font-medium">
                        {books.filter((b) => b.status === 'reading').length} buku sedang aktif dibaca
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingBook(null);
                        setIsAddModalOpen(true);
                      }}
                      className="z-10 p-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-lg flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4 text-emerald-700" />
                      <span>Tambah</span>
                    </button>

                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  </div>

                  {/* Search Bar & Status Filter Pills */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Cari judul buku, penulis, genre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 bg-white/80 dark:bg-emerald-950/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/70 backdrop-blur-md shadow-xs"
                      />
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
                      {[
                        { id: 'all', label: `Semua (${books.length})` },
                        { id: 'reading', label: 'Membaca' },
                        { id: 'completed', label: 'Selesai' },
                        { id: 'plan_to_read', label: 'Rencana' },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setStatusFilter(filter.id as any)}
                          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                            statusFilter === filter.id
                              ? 'bg-emerald-800 text-white shadow-xs font-bold'
                              : 'bg-white/70 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/40 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Books Collection List / Cards */}
                  {filteredBooks.length === 0 ? (
                    <div className="text-center py-12 bg-white/60 dark:bg-emerald-950/30 rounded-3xl border border-dashed border-emerald-200 dark:border-emerald-900/50 p-6">
                      <BookOpen className="w-12 h-12 text-emerald-600/50 mx-auto mb-2" />
                      <p className="font-semibold text-sm text-stone-700 dark:text-stone-300">
                        Tidak ada buku ditemukan
                      </p>
                      <p className="text-xs text-stone-400 mb-4">
                        Coba kata kunci pencarian lain atau tambahkan buku baru ke rakmu.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBook(null);
                          setIsAddModalOpen(true);
                        }}
                        className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:bg-emerald-800"
                      >
                        + Tambah Buku Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredBooks.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onSelectBook={(b) => setSelectedBook(b)}
                          onUpdatePages={handleUpdatePages}
                          onEditBook={(b) => {
                            setEditingBook(b);
                            setIsAddModalOpen(true);
                          }}
                          onDeleteBook={handleConfirmDeleteBook}
                          onShareBook={(b) => setShareBook(b)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PROGRESS & BAB */}
              {activeTab === 'chapters' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-emerald-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                      Ringkasan Bab & Progress
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Pilih buku di bawah untuk membuka detail dan pembuat ringkasan bab
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBook(b)}
                        className="backdrop-blur-md bg-white/80 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="w-12 h-16 rounded-xl object-cover shrink-0 shadow-xs"
                          />
                          <div>
                            <h3 className="font-bold text-sm text-stone-900 dark:text-emerald-100">
                              {b.title}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                              {b.author}
                            </p>
                            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                              {b.chapters.length} Bab Teringkas
                            </span>
                          </div>
                        </div>

                        <span className="px-3 py-1 bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-emerald-800">
                          Buka Bab &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: STATS & TARGET */}
              {activeTab === 'stats' && (
                <StatsView
                  logs={logs}
                  monthlyTarget={monthlyTarget}
                  onUpdateTarget={(newT) => setMonthlyTarget(newT)}
                  books={books}
                  badges={badges}
                  userStats={userStats}
                  onRestoreData={(data) => {
                    if (data.books && Array.isArray(data.books)) setBooks(data.books);
                    if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
                    if (data.monthlyTarget) setMonthlyTarget(data.monthlyTarget);
                    if (data.badges && Array.isArray(data.badges)) setBadges(data.badges);
                    if (data.userStats) setUserStats(data.userStats);
                  }}
                />
              )}

              {/* TAB 4: BADGES & GAMIFICATION */}
              {activeTab === 'badges' && (
                <GamificationView badges={badges} userStats={userStats} />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(t) => {
            setSelectedBook(null);
            setActiveTab(t);
          }}
          unlockedBadgeCount={badges.filter((b) => b.unlocked).length}
        />

        {/* Modals */}
        <AddBookModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
          initialBook={editingBook}
        />

        <ShareCardModal
          isOpen={!!shareBook}
          onClose={() => setShareBook(null)}
          book={shareBook}
        />

        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          settings={notifications}
          onSaveSettings={(newSet) => setNotifications(newSet)}
        />

        <SyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
        />

        <DeleteConfirmModal
          isOpen={!!bookToDelete}
          title="Hapus dari Rak Buku?"
          itemName={bookToDelete?.title || ''}
          onClose={() => setBookToDelete(null)}
          onConfirm={handleExecuteDeleteBook}
        />
      </div>
    </div>
  );
}
