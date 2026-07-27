import React, { useState } from 'react';
import { NotificationSetting } from '../types';
import { requestNotificationPermission, sendReadingReminderNotification, playReminderSound } from '../utils/notifications';
import { X, Bell, Volume2, CheckCircle2, Sparkles } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSetting;
  onSaveSettings: (newSettings: NotificationSetting) => void;
}

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);
  const [selectedDays, setSelectedDays] = useState<number[]>(settings.daysOfWeek);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [permGranted, setPermGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setFeedbackMsg(null);
    const granted = await requestNotificationPermission();
    setPermGranted(granted);
    sendReadingReminderNotification(
      'Pengingat Membaca Aktif! 📚',
      'Kami akan mengingatkanmu membaca setiap hari sesuai jadwal.'
    );
    if (soundEnabled) playReminderSound();
    setFeedbackMsg('✅ Notifikasi berhasil diizinkan dan diaktifkan!');
  };

  const handleToggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      enabled,
      reminderTime,
      daysOfWeek: selectedDays,
      soundEnabled,
    });
    onClose();
  };

  const handleTestNotification = () => {
    setFeedbackMsg(null);
    sendReadingReminderNotification(
      'Uji Coba Notifikasi 📖',
      '15 menit membaca hari ini dapat menyelesaikan 1 bab buku.'
    );
    if (soundEnabled) playReminderSound();
    setFeedbackMsg('🔔 Notifikasi uji coba telah dikirimkan!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-all my-auto animate-fadeIn relative">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-emerald-100 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/90 shrink-0 rounded-t-3xl backdrop-blur-md z-10">
          <h3 className="font-semibold text-base text-stone-900 dark:text-emerald-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            Pengingat Harian Membaca
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            title="Tutup (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Permission Alert */}
          {!permGranted ? (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Izin Notifikasi Browser
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Aktifkan agar pengingat muncul di layar HP atau browser.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs active:scale-95 transition-all"
              >
                Izinkan
              </button>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Izin Notifikasi Aktif</span>
            </div>
          )}

          {feedbackMsg && (
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-medium rounded-xl animate-fadeIn">
              {feedbackMsg}
            </div>
          )}

          {/* Enable Switch */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-stone-900 dark:text-amber-50">
                Pengingat Membaca
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Jaga streak konsisten membaca setiap hari
              </p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
            />
          </div>

          {/* Reminder Time Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Jam Alarm / Pengingat
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-amber-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Days selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Hari Pengingat
            </label>
            <div className="flex justify-between gap-1">
              {DAYS.map((day, idx) => {
                const isSelected = selectedDays.includes(idx);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-amber-100 dark:border-stone-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>Suara Nada Alarm</span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
          </div>

          {/* Test Button & Save */}
          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={handleTestNotification}
              className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Uji Notifikasi Sekarang
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
