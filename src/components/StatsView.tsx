import React, { useState } from 'react';
import { DailyReadingLog, MonthlyTarget, Book, Badge, UserStats } from '../types';
import {
  Target,
  BookOpen,
  Clock,
  TrendingUp,
  Edit2,
  CheckCircle2,
  Copy,
  Check,
  Database,
  Upload,
  FileJson,
  AlertCircle,
  Download,
} from 'lucide-react';
import { triggerInAppToast } from '../utils/notifications';

interface StatsViewProps {
  logs: DailyReadingLog[];
  monthlyTarget: MonthlyTarget;
  onUpdateTarget: (newTarget: MonthlyTarget) => void;
  books: Book[];
  badges?: Badge[];
  userStats?: UserStats;
  onRestoreData?: (data: {
    books?: Book[];
    logs?: DailyReadingLog[];
    monthlyTarget?: MonthlyTarget;
    badges?: Badge[];
    userStats?: UserStats;
  }) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  logs,
  monthlyTarget,
  onUpdateTarget,
  books,
  badges = [],
  userStats,
  onRestoreData,
}) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetBooksInput, setTargetBooksInput] = useState(monthlyTarget.targetBooks);
  const [targetPagesInput, setTargetPagesInput] = useState(monthlyTarget.targetPages);

  // Backup & Restore states
  const [isCopied, setIsCopied] = useState(false);
  const [restoreInput, setRestoreInput] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Calculate current month's totals
  const currentMonthLogs = logs.filter((log) => {
    const d = new Date(log.date);
    return d.getMonth() + 1 === monthlyTarget.month && d.getFullYear() === monthlyTarget.year;
  });

  const totalPagesThisMonth = currentMonthLogs.reduce((sum, log) => sum + log.pagesRead, 0);
  const totalMinutesThisMonth = currentMonthLogs.reduce((sum, log) => sum + log.minutesSpent, 0);
  const completedBooksThisMonth = books.filter((b) => b.status === 'completed').length;

  const pagesPercentage = Math.min(100, Math.round((totalPagesThisMonth / monthlyTarget.targetPages) * 100)) || 0;
  const booksPercentage = Math.min(100, Math.round((completedBooksThisMonth / monthlyTarget.targetBooks) * 100)) || 0;

  const handleSaveTarget = () => {
    onUpdateTarget({
      ...monthlyTarget,
      targetBooks: Number(targetBooksInput) || 1,
      targetPages: Number(targetPagesInput) || 100,
    });
    setIsEditingTarget(false);
  };

  // Generate backup JSON payload
  const backupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    books,
    logs,
    monthlyTarget,
    badges,
    userStats,
  };
  const backupJsonString = JSON.stringify(backupData, null, 2);

  const handleCopyBackup = () => {
    try {
      navigator.clipboard.writeText(backupJsonString);
      setIsCopied(true);
      triggerInAppToast('Backup Disalin!', 'Data JSON backup berhasil disalin ke clipboard.');
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      triggerInAppToast('Backup Siap', 'Silakan pilih dan salin teks JSON dari kotak di atas.');
    }
  };

  const handleDownloadBackup = () => {
    try {
      const blob = new Blob([backupJsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bacaku-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerInAppToast('Unduh Berhasil!', 'File JSON backup telah diunduh.');
    } catch (err) {
      triggerInAppToast('Gagal Mengunduh', 'Silakan gunakan tombol Salin JSON Backup.');
    }
  };

  const handleExecuteRestore = () => {
    if (!restoreInput.trim()) {
      setRestoreError('Silakan tempelkan kode JSON backup terlebih dahulu.');
      return;
    }

    try {
      const parsed = JSON.parse(restoreInput.trim());

      let restoredBooks: Book[] | undefined;
      let restoredLogs: DailyReadingLog[] | undefined;
      let restoredTarget: MonthlyTarget | undefined;
      let restoredBadges: Badge[] | undefined;
      let restoredUserStats: UserStats | undefined;

      if (Array.isArray(parsed)) {
        restoredBooks = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed.books)) restoredBooks = parsed.books;
        if (Array.isArray(parsed.logs)) restoredLogs = parsed.logs;
        if (parsed.monthlyTarget) restoredTarget = parsed.monthlyTarget;
        if (Array.isArray(parsed.badges)) restoredBadges = parsed.badges;
        if (parsed.userStats) restoredUserStats = parsed.userStats;
      } else {
        throw new Error('Format JSON tidak valid');
      }

      if (!restoredBooks && !restoredLogs && !restoredTarget && !restoredBadges && !restoredUserStats) {
        setRestoreError('Format JSON tidak memiliki data buku atau statistik yang valid.');
        return;
      }

      if (onRestoreData) {
        onRestoreData({
          books: restoredBooks,
          logs: restoredLogs,
          monthlyTarget: restoredTarget,
          badges: restoredBadges,
          userStats: restoredUserStats,
        });
      }

      setRestoreError(null);
      setRestoreInput('');
      triggerInAppToast('Restore Berhasil! 🎉', 'Data membaca Anda telah berhasil dipulihkan.');
    } catch (err) {
      setRestoreError('Format JSON tidak valid. Pastikan Anda menempelkan struktur JSON yang benar.');
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-emerald-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          Statistik & Backup Data
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Pantau capaian target membaca bulanan dan kelola backup data Anda
        </p>
      </div>

      {/* Monthly Target Card */}
      <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-emerald-100">
                Target Bulan Ini
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {totalPagesThisMonth} dari {monthlyTarget.targetPages} halaman tercapai
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className="p-2 rounded-xl text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Edit Target Inline Modal */}
        {isEditingTarget && (
          <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/80 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-3 animate-slideDown">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              Ubah Target Bulanan
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Target Halaman
                </label>
                <input
                  type="number"
                  min="10"
                  value={targetPagesInput}
                  onChange={(e) => setTargetPagesInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Target Buku Selesai
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetBooksInput}
                  onChange={(e) => setTargetBooksInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingTarget(false)}
                className="px-3 py-1 text-xs text-stone-500"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTarget}
                className="px-3.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
              >
                Simpan Target
              </button>
            </div>
          </div>
        )}

        {/* Target Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-700 dark:text-stone-300">Capaian Halaman</span>
              <span className="text-emerald-800 dark:text-emerald-300">{pagesPercentage}%</span>
            </div>
            <div className="w-full bg-emerald-100 dark:bg-emerald-950 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${pagesPercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-700 dark:text-stone-300">Buku Selesai Dibaca</span>
              <span className="text-teal-700 dark:text-teal-400">
                {completedBooksThisMonth} / {monthlyTarget.targetBooks} Buku ({booksPercentage}%)
              </span>
            </div>
            <div className="w-full bg-teal-100 dark:bg-teal-950 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${booksPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-3.5 flex flex-col justify-between">
          <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mb-1" />
          <div>
            <span className="text-2xl font-extrabold text-stone-900 dark:text-emerald-100">
              {totalPagesThisMonth}
            </span>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Halaman Dibaca
            </p>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-3.5 flex flex-col justify-between">
          <Clock className="w-5 h-5 text-teal-600 mb-1" />
          <div>
            <span className="text-2xl font-extrabold text-stone-900 dark:text-emerald-100">
              {totalMinutesThisMonth}{' '}
              <span className="text-xs font-normal text-stone-400">menit</span>
            </span>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Total Waktu Membaca
            </p>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
          <div>
            <span className="text-2xl font-extrabold text-stone-900 dark:text-emerald-100">
              {completedBooksThisMonth}
            </span>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Buku Selesai
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-emerald-100">
              Backup & Restore Data
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Salin data backup atau pulihkan dari teks JSON
            </p>
          </div>
        </div>

        {/* Backup Sub-card */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/50 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-stone-800 dark:text-emerald-200">
                Backup Data (Salin JSON)
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
              {books.length} Buku
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300">
            Salin kode JSON di bawah ini untuk disimpan sebagai cadangan data membaca Anda.
          </p>

          <div className="relative">
            <textarea
              readOnly
              rows={4}
              value={backupJsonString}
              className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white/90 dark:bg-emerald-950 text-[10px] font-mono text-stone-700 dark:text-stone-300 focus:outline-none resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyBackup}
              className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin JSON Backup</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadBackup}
              className="py-2 px-3 bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 active:scale-95 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Unduh File .json</span>
            </button>
          </div>
        </div>

        {/* Restore Sub-card */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-stone-800 dark:text-amber-200">
              Restore Data (Tempel JSON)
            </h4>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300">
            Tempelkan kode JSON backup yang telah disalin sebelumnya untuk memulihkan data.
          </p>

          <textarea
            rows={4}
            placeholder="Tempel (paste) kode JSON backup di sini..."
            value={restoreInput}
            onChange={(e) => {
              setRestoreInput(e.target.value);
              setRestoreError(null);
            }}
            className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/90 dark:bg-stone-900 text-[10px] font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/80 resize-none"
          />

          {restoreError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-xl border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleExecuteRestore}
            className="w-full py-2.5 px-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 active:scale-95 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Restore / Pulihkan Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

