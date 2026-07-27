import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transition-all animate-fadeIn">
        <div className="p-5 space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base text-stone-900 dark:text-amber-50">
              {title || 'Hapus dari Rak Buku?'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Apakah kamu yakin ingin menghapus <span className="font-bold text-stone-800 dark:text-stone-200">"{itemName}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
