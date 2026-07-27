import React, { useState, useEffect } from 'react';
import { Book, ReadingStatus } from '../types';
import { X, Upload, Camera, Link, Image as ImageIcon, Check } from 'lucide-react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookData: Partial<Book>) => void;
  initialBook?: Book | null;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
];

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBook,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState<number | ''>(300);
  const [currentPage, setCurrentPage] = useState<number | ''>(0);
  const [genre, setGenre] = useState('Self-Improvement');
  const [status, setStatus] = useState<ReadingStatus>('reading');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);
  const [notes, setNotes] = useState('');
  const [coverMode, setCoverMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [customUrlInput, setCustomUrlInput] = useState('');

  useEffect(() => {
    if (initialBook) {
      setTitle(initialBook.title);
      setAuthor(initialBook.author);
      setTotalPages(initialBook.totalPages);
      setCurrentPage(initialBook.currentPage);
      setGenre(initialBook.genre);
      setStatus(initialBook.status);
      setCoverUrl(initialBook.coverUrl);
      setNotes(initialBook.notes || '');
    } else {
      setTitle('');
      setAuthor('');
      setTotalPages(300);
      setCurrentPage(0);
      setGenre('Self-Improvement');
      setStatus('reading');
      setCoverUrl(PRESET_COVERS[0]);
      setNotes('');
    }
  }, [initialBook, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !totalPages) return;

    onSave({
      id: initialBook ? initialBook.id : `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      totalPages: Number(totalPages),
      currentPage: Number(currentPage) || 0,
      genre: genre || 'Buku',
      status,
      coverUrl: coverUrl || PRESET_COVERS[0],
      notes: notes.trim(),
      chapters: initialBook ? initialBook.chapters : [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-all my-auto animate-fadeIn relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/90 shrink-0 rounded-t-3xl backdrop-blur-md z-10">
          <h2 className="font-semibold text-lg text-stone-900 dark:text-emerald-100">
            {initialBook ? 'Edit Buku Bacaan' : 'Tambah Buku Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            title="Tutup (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 overflow-x-hidden">
          {/* Cover Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Sampul / Cover Buku
            </label>

            {/* Preview & Cover Tab Selector */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start mb-3 min-w-0">
              <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border-2 border-emerald-600/40 shadow-xs bg-stone-100 dark:bg-emerald-950 relative">
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2 w-full min-w-0">
                <div className="flex bg-emerald-100/50 dark:bg-emerald-900/60 p-1 rounded-xl text-xs font-medium w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => setCoverMode('preset')}
                    className={`flex-1 min-w-0 py-1 rounded-lg transition-colors text-center text-[11px] sm:text-xs truncate ${
                      coverMode === 'preset'
                        ? 'bg-white dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs font-semibold'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode('upload')}
                    className={`flex-1 min-w-0 py-1 rounded-lg transition-colors text-center text-[11px] sm:text-xs truncate ${
                      coverMode === 'upload'
                        ? 'bg-white dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs font-semibold'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode('url')}
                    className={`flex-1 min-w-0 py-1 rounded-lg transition-colors text-center text-[11px] sm:text-xs truncate ${
                      coverMode === 'url'
                        ? 'bg-white dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs font-semibold'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    URL Gambar
                  </button>
                </div>

                {coverMode === 'preset' && (
                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {PRESET_COVERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoverUrl(preset)}
                        className={`h-10 rounded-lg overflow-hidden border-2 transition-all ${
                          coverUrl === preset
                            ? 'border-emerald-600 scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {coverMode === 'upload' && (
                  <div className="pt-1">
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300/60 dark:border-emerald-800 rounded-xl py-2.5 px-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                      <Upload className="w-4 h-4 shrink-0" />
                      <span className="truncate">Pilih Foto dari Perangkat</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {coverMode === 'url' && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 min-w-0 w-full">
                    <input
                      type="url"
                      placeholder="https://example.com/cover.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full min-w-0 flex-1 px-3 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customUrlInput) setCoverUrl(customUrlInput);
                      }}
                      className="w-full sm:w-auto shrink-0 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors active:scale-95"
                    >
                      Terapkan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Judul Buku *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Filosofi Teras"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Penulis / Author *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Henry Manampiring"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Page Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Total Halaman *
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Halaman Saat Ini
              </label>
              <input
                type="number"
                min="0"
                max={Number(totalPages) || 9999}
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value ? Number(e.target.value) : 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Genre & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Genre / Kategori
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Self-Improvement">Self-Improvement</option>
                <option value="Productivity">Productivity / Bisnis</option>
                <option value="Fiction">Novel / Fiksi</option>
                <option value="Finance">Keuangan & Ekonomi</option>
                <option value="Sejarah">Sejarah & Biografi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Status Membaca
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="reading">Sedang Membaca</option>
                <option value="completed">Selesai Dibaca</option>
                <option value="plan_to_read">Rencana Dibaca</option>
                <option value="paused">Ditunda</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan / Kesan Awal (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Catatan singkat tentang alasan membaca buku ini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-emerald-100 dark:border-emerald-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-stone-600 dark:text-stone-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md shadow-emerald-700/20 hover:from-emerald-800 hover:to-teal-800 transition-all active:scale-95"
            >
              {initialBook ? 'Simpan Perubahan' : 'Tambah ke Rak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
