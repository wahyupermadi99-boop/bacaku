import React, { useEffect, useState } from 'react';
import { subscribeToToasts, ToastNotification } from '../utils/notifications';
import { Bell, X, CheckCircle2 } from 'lucide-react';

export const ToastBanner: React.FC = () => {
  const [toast, setToast] = useState<ToastNotification | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((newToast) => {
      setToast(newToast);
      const timer = setTimeout(() => {
        setToast((current) => (current?.id === newToast.id ? null : current));
      }, 4500);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm animate-slideDown">
      <div className="bg-stone-900/95 dark:bg-amber-950/95 text-white backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md mt-0.5">
          <Bell className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            {toast.title}
          </h4>
          <p className="text-[11px] text-stone-200 mt-0.5 leading-snug">
            {toast.body}
          </p>
        </div>

        <button
          onClick={() => setToast(null)}
          className="text-stone-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
