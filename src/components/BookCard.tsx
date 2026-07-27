import React from 'react';
import { Book } from '../types';
import { Plus, CheckCircle2, Bookmark, BookOpen, Share2, Edit3, Trash2, Sparkles, Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onSelectBook: (book: Book) => void;
  onUpdatePages: (bookId: string, addPages: number) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onShareBook: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelectBook,
  onUpdatePages,
  onEditBook,
  onDeleteBook,
  onShareBook,
}) => {
  const percentage = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100)) || 0;
  const isCompleted = book.status === 'completed' || book.currentPage >= book.totalPages;

  const getStatusBadge = () => {
    switch (book.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      case 'reading':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 border border-teal-200/50">
            <BookOpen className="w-3 h-3" /> Membaca
          </span>
        );
      case 'plan_to_read':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/50">
            <Bookmark className="w-3 h-3" /> Rencana
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            Ditunda
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 shadow-xs hover:shadow-md rounded-2xl p-3.5 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Cover & Main Info */}
        <div className="flex gap-3.5 items-start">
          {/* Cover Container */}
          <div
            onClick={() => onSelectBook(book)}
            className="relative w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-emerald-100 dark:bg-emerald-950 shadow-md cursor-pointer group-hover:scale-[1.02] transition-transform"
          >
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Fallback image placeholder */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800 via-teal-700 to-emerald-900 flex flex-col items-center justify-center p-1 text-white text-center -z-10">
              <BookOpen className="w-6 h-6 mb-1 opacity-80" />
              <span className="text-[10px] font-bold line-clamp-2">{book.title}</span>
            </div>

            {/* Percentage Badge on Cover */}
            <div className="absolute bottom-1 right-1 bg-stone-900/85 backdrop-blur-sm text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              {percentage}%
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                {book.genre || 'Buku'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareBook(book);
                  }}
                  title="Bagikan ke Medsos / WA Status"
                  className="p-1 rounded-lg text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditBook(book);
                  }}
                  title="Edit Detail Buku"
                  className="p-1 rounded-lg text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBook(book);
                  }}
                  title="Hapus Buku"
                  className="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3
              onClick={() => onSelectBook(book)}
              className="font-bold text-stone-900 dark:text-emerald-100 text-base leading-snug line-clamp-1 cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {book.title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium line-clamp-1 mb-2">
              {book.author}
            </p>

            <div className="flex items-center justify-between gap-1 mb-2">
              {getStatusBadge()}
              {book.rating ? (
                <div className="flex items-center gap-0.5 text-amber-500" title={`Rating: ${book.rating}/5 bintang`}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= book.rating! ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'}`}
                    />
                  ))}
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 ml-0.5">
                    {book.rating}.0
                  </span>
                </div>
              ) : isCompleted ? (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold italic bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  ★ Belum dirating
                </span>
              ) : null}
            </div>

            {/* Page Stats */}
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span>
                Hal {book.currentPage}{' '}
                <span className="text-stone-400 font-normal">/ {book.totalPages}</span>
              </span>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                Sisa {Math.max(0, book.totalPages - book.currentPage)} hal
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-emerald-100/70 dark:bg-emerald-950 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCompleted
                ? 'bg-emerald-600'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Fast Progress Increment Stepper & Chapter Button */}
      <div className="mt-3.5 pt-2.5 border-t border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-stone-400 font-medium mr-1">Tambah:</span>
          {[1, 5, 10].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onUpdatePages(book.id, step)}
              disabled={isCompleted}
              className="px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              +{step}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectBook(book)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-xs transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Detail & Bab
        </button>
      </div>
    </div>
  );
};
