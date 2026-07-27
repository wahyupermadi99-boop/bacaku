import React, { useState } from 'react';
import { Book, ChapterLog } from '../types';
import { Sparkles, ArrowLeft, Plus, CheckCircle2, BookOpen, Quote, ChevronDown, ChevronUp, Share2, Edit3, Trash2, Check, X, Star } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface BookDetailViewProps {
  book: Book;
  onBack: () => void;
  onUpdateBookPages: (bookId: string, newPage: number) => void;
  onUpdateRating: (bookId: string, rating: number) => void;
  onAddChapter: (bookId: string, newChapter: Omit<ChapterLog, 'id' | 'createdAt'>) => void;
  onEditChapter: (bookId: string, chapterId: string, updatedChapter: Partial<ChapterLog>) => void;
  onDeleteChapter: (bookId: string, chapterId: string) => void;
  onShareBook: (book: Book) => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  onBack,
  onUpdateBookPages,
  onUpdateRating,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onShareBook,
}) => {
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const [chapterNum, setChapterNum] = useState<number>(book.chapters.length + 1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [startPage, setStartPage] = useState<number>(book.currentPage || 1);
  const [endPage, setEndPage] = useState<number>(Math.min(book.totalPages, (book.currentPage || 0) + 20));
  const [rawNotes, setRawNotes] = useState('');

  // Summary generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [generatedTakeaways, setGeneratedTakeaways] = useState<string[]>([]);
  const [generatedQuote, setGeneratedQuote] = useState('');
  const [genError, setGenError] = useState('');

  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(
    book.chapters.length > 0 ? book.chapters[book.chapters.length - 1].id : null
  );

  // Chapter delete confirmation modal state
  const [chapterToDelete, setChapterToDelete] = useState<ChapterLog | null>(null);

  const percentage = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100)) || 0;

  // Open Form for Editing an Existing Chapter
  const handleStartEditChapter = (chap: ChapterLog) => {
    setEditingChapterId(chap.id);
    setChapterNum(chap.chapterNumber);
    setChapterTitle(chap.title);
    setStartPage(chap.startPage);
    setEndPage(chap.endPage);
    setRawNotes(chap.summary || '');
    setGeneratedSummary(chap.summary || '');
    setGeneratedTakeaways(chap.keyTakeaways || []);
    setGeneratedQuote(chap.quote || '');
    setShowAddChapter(true);
    setGenError('');
  };

  // Open Form for Adding New Chapter
  const handleStartAddChapter = () => {
    setEditingChapterId(null);
    setChapterNum(book.chapters.length + 1);
    setChapterTitle('');
    setStartPage(book.currentPage || 1);
    setEndPage(Math.min(book.totalPages, (book.currentPage || 0) + 20));
    setRawNotes('');
    setGeneratedSummary('');
    setGeneratedTakeaways([]);
    setGeneratedQuote('');
    setShowAddChapter(true);
    setGenError('');
  };

  // Helper for generating smart local chapter summary when API server is unreachable (e.g. mobile APK)
  const generateLocalChapterSummary = (params: {
    bookTitle: string;
    author: string;
    chapterNumber: number;
    chapterTitle: string;
    rawNotes: string;
  }) => {
    const { bookTitle, author, chapterNumber, chapterTitle, rawNotes } = params;
    const cleanTitle = chapterTitle.trim() || `Bab ${chapterNumber}`;
    const notesText = rawNotes.trim();

    let summaryText = `Dalam ${cleanTitle} dari buku "${bookTitle}" karya ${author}, pembahasan berfokus pada inti pemikiran dan esensi utama bab ini. `;

    if (notesText) {
      summaryText += `Berdasarkan poin-poin yang dicatat: "${notesText}". Bab ini memberikan wawasan mendalam dan relevan yang memperkaya pemahaman materi secara menyeluruh.`;
    } else {
      summaryText += `Bab ini menguraikan gagasan-gagasan krusial yang saling terhubung untuk membangun fondasi pemahaman bagi pembaca.`;
    }

    let takeaways: string[] = [];
    if (notesText) {
      const parts = notesText.split(/[\n\.\;\!]+/).map((s) => s.trim()).filter((s) => s.length > 3);
      if (parts.length > 0) {
        takeaways = parts.slice(0, 3);
      }
    }

    if (takeaways.length === 0) {
      takeaways = [
        `Memahami pesan utama dalam ${cleanTitle}`,
        `Menghubungkan topik bab ini dengan konteks materi "${bookTitle}"`,
        `Mengambil wawasan esensial untuk penerapan pengetahuan`,
      ];
    }

    const defaultQuotes = [
      `"Membaca adalah alat terbaik untuk memperluas cakrawala pemikiran."`,
      `"Setiap halaman memberikan perspektif baru yang memperkaya jiwa."`,
      `"Pengetahuan yang dicatat dari ${cleanTitle} adalah jejak pembelajaran yang berharga."`,
    ];
    const selectedQuote = defaultQuotes[(chapterNumber || 1) % defaultQuotes.length];

    return {
      summary: summaryText,
      keyTakeaways: takeaways,
      quote: selectedQuote,
    };
  };

  // Call Automatic Chapter Summarizer Endpoint
  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setGenError('');
    try {
      let dataFromApi: { summary: string; keyTakeaways: string[]; quote?: string } | null = null;

      const payload = {
        bookTitle: book.title,
        author: book.author,
        chapterNumber: chapterNum,
        chapterTitle: chapterTitle,
        rawNotes: rawNotes,
      };

      // Candidate API endpoints (Full Cloud backend for APK/WebView + Relative for Web)
      const endpoints = [
        'https://ais-dev-tf7bmihmnkf2ifxwxks3sn-878462060022.asia-east1.run.app/api/summarize-chapter',
        '/api/summarize-chapter',
      ];

      for (const ep of endpoints) {
        if (dataFromApi) break;
        try {
          const response = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const rawText = await response.text();
          if (response.ok && rawText.trim().startsWith('{')) {
            const resData = JSON.parse(rawText);
            if (resData.success && resData.data) {
              dataFromApi = resData.data;
            }
          }
        } catch (epErr) {
          console.warn(`Endpoint ${ep} failed:`, epErr);
        }
      }

      // If backend call wasn't available, check client-side Gemini API key
      if (!dataFromApi) {
        const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (clientApiKey) {
          try {
            const prompt = `Anda adalah asisten literasi cerdas "BacaKu". Buat ringkasan bab dalam Bahasa Indonesia.\nBuku: ${book.title}\nPenulis: ${book.author}\nBab ${chapterNum}: ${chapterTitle}\nCatatan: ${rawNotes}\nSajikan JSON valid:\n{"summary": "...", "keyTakeaways": ["point 1", "point 2"], "quote": "..."}`;
            const gRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clientApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { responseMimeType: 'application/json' },
                }),
              }
            );
            if (gRes.ok) {
              const gJson = await gRes.json();
              const gText = gJson.candidates?.[0]?.content?.parts?.[0]?.text;
              if (gText && gText.trim().startsWith('{')) {
                dataFromApi = JSON.parse(gText.trim());
              }
            }
          } catch (gErr) {
            console.warn('Direct Gemini client-side fetch error:', gErr);
          }
        }
      }

      if (dataFromApi) {
        setGeneratedSummary(dataFromApi.summary || 'Ringkasan bab berhasil dibuat.');
        setGeneratedTakeaways(dataFromApi.keyTakeaways || []);
        setGeneratedQuote(dataFromApi.quote || '');
      } else {
        // Fallback to smart local summary if completely offline
        const localRes = generateLocalChapterSummary({
          bookTitle: book.title,
          author: book.author,
          chapterNumber: chapterNum,
          chapterTitle: chapterTitle,
          rawNotes: rawNotes,
        });
        setGeneratedSummary(localRes.summary);
        setGeneratedTakeaways(localRes.keyTakeaways);
        setGeneratedQuote(localRes.quote);
      }
    } catch (err: any) {
      console.error('Summarize error:', err);
      setGenError(err.message || 'Terjadi kesalahan saat meringkas bab.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) return;

    if (editingChapterId) {
      // Edit mode
      onEditChapter(book.id, editingChapterId, {
        chapterNumber: Number(chapterNum),
        title: chapterTitle.trim(),
        startPage: Number(startPage),
        endPage: Number(endPage),
        summary: generatedSummary || rawNotes || 'Tidak ada ringkasan tertulis.',
        keyTakeaways: generatedTakeaways.length > 0 ? generatedTakeaways : ['Selesai dibaca.'],
        quote: generatedQuote || undefined,
        aiGenerated: !!generatedSummary,
      });
    } else {
      // Add mode
      onAddChapter(book.id, {
        bookId: book.id,
        chapterNumber: Number(chapterNum),
        title: chapterTitle.trim(),
        startPage: Number(startPage),
        endPage: Number(endPage),
        summary: generatedSummary || rawNotes || 'Tidak ada ringkasan tertulis.',
        keyTakeaways: generatedTakeaways.length > 0 ? generatedTakeaways : ['Selesai dibaca.'],
        quote: generatedQuote || undefined,
        aiGenerated: !!generatedSummary,
      });
    }

    // Update book current page if end page is higher
    if (endPage > book.currentPage) {
      onUpdateBookPages(book.id, endPage);
    }

    // Reset form
    setShowAddChapter(false);
    setEditingChapterId(null);
    setChapterNum((prev) => prev + 1);
    setChapterTitle('');
    setRawNotes('');
    setGeneratedSummary('');
    setGeneratedTakeaways([]);
    setGeneratedQuote('');
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Rak</span>
        </button>

        <button
          onClick={() => onShareBook(book)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Bagikan Progress</span>
        </button>
      </div>

      {/* Book Summary Card */}
      <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-32 h-44 md:w-40 md:h-56 rounded-2xl object-cover shadow-lg border border-emerald-200/50 dark:border-emerald-800 shrink-0"
          />

          <div className="flex-1 w-full text-center md:text-left">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-md mb-2">
              {book.genre}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-emerald-100 leading-tight">
              {book.title}
            </h2>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3">
              {book.author}
            </p>

            {/* Reading Progress Slider / Page Control */}
            <div className="space-y-3 bg-emerald-50/60 dark:bg-emerald-950/50 p-4 rounded-2xl border border-emerald-100/60 dark:border-emerald-900/50">
              <div className="flex justify-between items-center text-xs font-semibold text-stone-700 dark:text-stone-300">
                <span>Progress bacaku</span>
                <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                  {book.currentPage} / {book.totalPages} hal ({percentage}%)
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={book.totalPages}
                value={book.currentPage}
                onChange={(e) => onUpdateBookPages(book.id, Number(e.target.value))}
                onInput={(e) => onUpdateBookPages(book.id, Number((e.target as HTMLInputElement).value))}
                className="w-full accent-emerald-700 h-2.5 bg-emerald-200/70 dark:bg-emerald-950 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between items-center text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                <span className="font-bold text-emerald-900 dark:text-emerald-300">Halaman {book.currentPage}</span>
                <span>Tersisa {Math.max(0, book.totalPages - book.currentPage)} halaman</span>
                <span>Total {book.totalPages} Hal</span>
              </div>

              {/* Quick Page Increment Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-emerald-200/50 dark:border-emerald-900/50">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Tambah cepat:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 5, 10, 20].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => onUpdateBookPages(book.id, Math.min(book.totalPages, book.currentPage + step))}
                      disabled={book.currentPage >= book.totalPages}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 active:scale-95 transition-all disabled:opacity-40"
                    >
                      +{step} hal
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Star Rating Component */}
              <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    Rating Buku:
                  </span>
                  {percentage >= 100 && !book.rating && (
                    <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                      Beri Rating!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white/70 dark:bg-emerald-950/70 px-3 py-1 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onUpdateRating(book.id, star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform focus:outline-none"
                      title={`Beri rating ${star} dari 5 bintang`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (book.rating || 0)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-stone-300 dark:text-stone-600 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 ml-1.5">
                    {book.rating ? `${book.rating}/5` : 'Belum'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters & Automatic Summarizer Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-stone-900 dark:text-emerald-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              Catatan & Ringkasan Bab
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ringkasan otomatis per bab yang dapat diedit dan dikelola
            </p>
          </div>

          {!showAddChapter && (
            <button
              onClick={handleStartAddChapter}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 hover:from-emerald-800 hover:to-teal-800 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Bab Baru</span>
            </button>
          )}
        </div>

        {/* Add/Edit Chapter Form */}
        {showAddChapter && (
          <form
            onSubmit={handleSaveChapter}
            className="backdrop-blur-md bg-emerald-50/80 dark:bg-emerald-950/90 border-2 border-emerald-300/80 dark:border-emerald-800 rounded-3xl p-5 shadow-lg space-y-4 animate-slideDown"
          >
            <div className="flex justify-between items-center border-b border-emerald-200/60 dark:border-emerald-900/60 pb-3">
              <h4 className="font-bold text-stone-900 dark:text-emerald-100 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                {editingChapterId ? 'Edit Catatan & Ringkasan Bab' : 'Catat Bab & Buat Ringkasan Otomatis'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddChapter(false);
                  setEditingChapterId(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor Bab
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={chapterNum}
                  onChange={(e) => setChapterNum(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Judul Bab *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dikotomi Kendali dan Ketenangan Pikiran"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Halaman Awal Bab
                </label>
                <input
                  type="number"
                  value={startPage}
                  onChange={(e) => setStartPage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Halaman Akhir Bab
                </label>
                <input
                  type="number"
                  value={endPage}
                  onChange={(e) => setEndPage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Poin / Catatan Mentah
              </label>
              <textarea
                rows={2}
                placeholder="Tuliskan kata kunci, ide utama, atau pemikiranmu dari bab ini..."
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-emerald-950 text-stone-900 dark:text-emerald-100"
              />
            </div>

            {/* Summarizer Action Block */}
            <div className="bg-emerald-100/50 dark:bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    Ringkasan Otomatis Bab
                  </h5>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Satu klik untuk mengekstrak ringkasan, 3 poin kunci, dan kutipan favorit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating || !chapterTitle.trim()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95 shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Ringkas Otomatis
                    </>
                  )}
                </button>
              </div>

              {genError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/60 p-2 rounded-xl">
                  ⚠️ {genError}
                </p>
              )}

              {/* Generated Result Preview */}
              {generatedSummary && (
                <div className="p-3 bg-white dark:bg-emerald-950 rounded-xl space-y-2 border border-emerald-200/60 dark:border-emerald-900 text-xs text-stone-800 dark:text-stone-200 animate-fadeIn">
                  <p className="font-medium leading-relaxed">{generatedSummary}</p>
                  {generatedTakeaways.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300 block">
                        Poin Utama:
                      </span>
                      <ul className="space-y-1.5 font-medium text-stone-700 dark:text-stone-200 text-xs">
                        {generatedTakeaways.map((point, idx) => {
                          const cleanPoint = point.replace(/^[\s•\-\*\d\.\)\:]+/, '').trim();
                          if (!cleanPoint) return null;
                          return (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                              <span className="flex-1">{cleanPoint}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {generatedQuote && (
                    <p className="italic text-stone-500 dark:text-stone-400 border-l-2 border-emerald-500 pl-2">
                      "{generatedQuote}"
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddChapter(false);
                  setEditingChapterId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md transition-all active:scale-95 hover:from-emerald-800 hover:to-teal-800"
              >
                {editingChapterId ? 'Simpan Perubahan Bab' : 'Simpan Bab ke Catatan'}
              </button>
            </div>
          </form>
        )}

        {/* Existing Chapters List */}
        {book.chapters.length === 0 ? (
          <div className="text-center py-10 bg-white/60 dark:bg-emerald-950/30 rounded-3xl border border-dashed border-emerald-200 dark:border-emerald-900/50">
            <BookOpen className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
              Belum ada ringkasan bab
            </p>
            <p className="text-xs text-stone-400 mb-3">
              Klik "Tambah Bab Baru" untuk mencatat poin penting dan menghasilkan ringkasan otomatis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {book.chapters.map((chap) => {
              const isExpanded = expandedChapterId === chap.id;
              return (
                <div
                  key={chap.id}
                  className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-4 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => setExpandedChapterId(isExpanded ? null : chap.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {chap.chapterNumber}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-stone-900 dark:text-emerald-100 truncate">
                          {chap.title}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Halaman {chap.startPage} - {chap.endPage}
                        </p>
                      </div>
                    </div>

                    {/* Chapter Edit and Delete Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditChapter(chap);
                        }}
                        title="Edit Catatan Bab"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChapterToDelete(chap);
                        }}
                        title="Hapus Bab Ini"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedChapterId(isExpanded ? null : chap.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-emerald-100/60 dark:border-emerald-900/40 space-y-2 text-xs text-stone-700 dark:text-stone-300 animate-fadeIn">
                      <p className="leading-relaxed font-normal">{chap.summary}</p>

                      {chap.keyTakeaways && chap.keyTakeaways.length > 0 && (
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/40 space-y-1.5">
                          <span className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300 block">
                            Poin Utama:
                          </span>
                          <ul className="space-y-1.5 font-medium text-stone-700 dark:text-stone-200">
                            {chap.keyTakeaways.map((point, idx) => {
                              const cleanPoint = point.replace(/^[\s•\-\*\d\.\)\:]+/, '').trim();
                              if (!cleanPoint) return null;
                              return (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                  <span className="flex-1">{cleanPoint}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {chap.quote && (
                        <div className="flex gap-2 items-start bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-900/50 italic text-emerald-950 dark:text-emerald-200">
                          <Quote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p>"{chap.quote}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chapter Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!chapterToDelete}
        title="Hapus Ringkasan Bab?"
        itemName={chapterToDelete ? `Bab ${chapterToDelete.chapterNumber}: ${chapterToDelete.title}` : ''}
        onClose={() => setChapterToDelete(null)}
        onConfirm={() => {
          if (chapterToDelete) {
            onDeleteChapter(book.id, chapterToDelete.id);
            setChapterToDelete(null);
          }
        }}
      />
    </div>
  );
};
