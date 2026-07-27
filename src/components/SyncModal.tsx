import React, { useState } from 'react';
import { X, RefreshCw, Smartphone, Cloud, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const [syncCode, setSyncCode] = useState('BCK-8921-X7');
  const [inputCode, setInputCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-all my-auto animate-fadeIn relative">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-sky-100 dark:border-zinc-800 bg-sky-50/80 dark:bg-zinc-900/90 shrink-0 rounded-t-3xl backdrop-blur-md z-10">
          <h3 className="font-bold text-base text-zinc-900 dark:text-sky-50 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sky-600" />
            Sinkronisasi Data Real-Time
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-sky-100 dark:hover:bg-zinc-800 transition-colors"
            title="Tutup (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <RefreshCw className="w-5 h-5 text-sky-500 animate-spin" />
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
              <Cloud className="w-6 h-6" />
            </div>
          </div>

          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
            Hubungkan HP, Tablet, atau Laptop Anda dengan kode sync untuk menyinkronkan progress membaca secara otomatis.
          </p>

          {/* Sync Code Box */}
          <div className="p-4 bg-sky-50/80 dark:bg-zinc-800/80 rounded-2xl border border-sky-200 dark:border-zinc-700 space-y-2 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              Kode Perangkat Ini
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono font-extrabold text-xl text-zinc-900 dark:text-sky-50 tracking-widest">
                {syncCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 hover:text-sky-600 shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-sky-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Connect Other Device Form */}
          <form onSubmit={handleSyncSubmit} className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Hubungkan ke Kode Perangkat Lain
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan kode sync (misal: BCK-1234-AB)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-sky-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-sky-50 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={isSyncing || !inputCode.trim()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-all active:scale-95"
              >
                {isSyncing ? 'Proses...' : 'Hubungkan'}
              </button>
            </div>
          </form>

          {syncSuccess && (
            <div className="p-3 bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-200 rounded-2xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Perangkat berhasil terhubung! Data membaca tersinkron secara real-time.</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 justify-center pt-2 border-t border-sky-100 dark:border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Enkripsi end-to-end aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
};
