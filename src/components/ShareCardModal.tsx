import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { X, Share2, Copy, Check, BookOpen, Download, Sparkles, Star } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ isOpen, onClose, book }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [coverDataUrl, setCoverDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const convertCoverToBase64 = async (url: string) => {
      if (!url) {
        if (isMounted) setCoverDataUrl('');
        return;
      }
      if (url.startsWith('data:')) {
        if (isMounted) setCoverDataUrl(url);
        return;
      }

      // 1. Try direct fetch
      try {
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          const data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
          });
          if (data && isMounted) {
            setCoverDataUrl(data);
            return;
          }
        }
      } catch {
        // fetch failed (CORS or network)
      }

      // 2. Try proxy via images.weserv.nl for external http/https URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const blob = await res.blob();
            const data = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => resolve('');
              reader.readAsDataURL(blob);
            });
            if (data && isMounted) {
              setCoverDataUrl(data);
              return;
            }
          }
        } catch {
          // proxy failed
        }
      }

      if (isMounted) {
        setCoverDataUrl(url);
      }
    };

    if (book?.coverUrl) {
      convertCoverToBase64(book.coverUrl);
    } else {
      setCoverDataUrl('');
    }

    return () => {
      isMounted = false;
    };
  }, [book?.coverUrl]);

  if (!isOpen || !book) return null;

  const percentage = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100)) || 0;
  const lastChapter = book.chapters.length > 0 ? book.chapters[book.chapters.length - 1] : null;

  const shareText = `📚 Progress Membaca: "${book.title}" oleh ${book.author}\n\n` +
    `📖 Progress: Hal ${book.currentPage} / ${book.totalPages} (${percentage}% selesai)\n` +
    (lastChapter ? `💡 Bab Terakhir: Bab ${lastChapter.chapterNumber} - ${lastChapter.title}\n` : '') +
    `✨ Catatan: "${lastChapter?.summary?.slice(0, 120) || book.notes || 'Sedang asyik membaca!'}"\n\n` +
    `Lacak membaca di aplikasi .bacaku 📱`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const drawCanvasFallback = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    // Golden Ratio Canvas Dimensions (800 x 1050)
    const width = 800;
    const height = 1050;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const PHI = 1.618;
    const paddingX = 52; // Golden proportion margin
    const paddingY = 52;

    // Pure White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Outer Frame
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(26, 26, width - 52, height - 52);

    // Header & Brand Watermark
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText('📖 ', paddingX, paddingY + 36);

    const iconWidth = ctx.measureText('📖 ').width;
    ctx.fillStyle = '#0d9488';
    ctx.font = '900 42px system-ui, sans-serif';
    ctx.fillText('.', paddingX + iconWidth, paddingY + 34);

    const dotWidth = ctx.measureText('.').width;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.fillText('bacaku', paddingX + iconWidth + dotWidth, paddingY + 36);

    // Golden Ratio Badge (% Selesai)
    const badgeStr = `${percentage}% Selesai`;
    ctx.font = 'bold 18px system-ui, sans-serif';
    const badgeTextWidth = ctx.measureText(badgeStr).width;
    const badgeWidth = badgeTextWidth + 34; // Golden padding
    const badgeHeight = Math.round(18 * PHI); // ~30px -> 34px
    const badgeX = width - paddingX - badgeWidth;
    const badgeY = paddingY + 36 - badgeHeight / 2;

    ctx.fillStyle = '#d1fae5';
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
    } else {
      ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.fillText(badgeStr, badgeX + 17, paddingY + 36);

    // Golden Divider Line
    const dividerY = paddingY + 72;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingX, dividerY);
    ctx.lineTo(width - paddingX, dividerY);
    ctx.stroke();

    // Canvas Text Wrapping Helper with Golden Ratio Line Heights
    const wrapCanvasText = (
      text: string,
      x: number,
      startY: number,
      maxWidth: number,
      fontSize: number,
      maxLines = 3
    ): number => {
      const lineHeight = Math.round(fontSize * 1.38); // Golden scale line-height
      const words = text.split(' ');
      let line = '';
      let currentY = startY;
      let lineCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lineCount++;
          if (lineCount >= maxLines) {
            ctx.fillText(line.trim() + '...', x, currentY);
            return currentY + lineHeight;
          }
          ctx.fillText(line.trim(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, currentY);
      return currentY + lineHeight;
    };

    // Cover Image in Golden Aspect Ratio (210px x 325px -> ratio ≈ Phi = 1.55)
    const coverX = paddingX;
    const coverY = dividerY + 36;
    const coverW = 210;
    const coverH = Math.round(coverW * 1.55); // 325px

    let coverLoaded = false;
    if (coverDataUrl) {
      try {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = coverDataUrl;
        });
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, coverX, coverY, coverW, coverH);
          coverLoaded = true;
        }
      } catch {
        // ignore
      }
    }

    if (!coverLoaded) {
      ctx.fillStyle = '#047857';
      ctx.fillRect(coverX, coverY, coverW, coverH);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      wrapCanvasText(book.title, coverX + 20, coverY + 110, coverW - 40, 22, 3);
    }

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(coverX, coverY, coverW, coverH);

    // Side Text Metadata (Golden Scale Typography)
    const textX = coverX + coverW + 36;
    const maxSideWidth = width - paddingX - textX;
    let textY = coverY + 28;

    // Genre Tag
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = '#065f46';
    ctx.fillText(book.genre.toUpperCase(), textX, textY);

    textY += 36;

    // Title (Golden Scale ~ 34px)
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.fillStyle = '#0f172a';
    textY = wrapCanvasText(book.title, textX, textY, maxSideWidth, 34, 3);

    textY += 12;

    // Author Name (Golden Scale ~ 22px)
    ctx.font = '500 22px system-ui, sans-serif';
    ctx.fillStyle = '#475569';
    textY = wrapCanvasText(`oleh ${book.author}`, textX, textY, maxSideWidth, 22, 2);

    textY += 18;

    // Progress Bar (Rounded Pill Ends)
    const barW = maxSideWidth;
    const barH = 16;
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(textX, textY, barW, barH, barH / 2);
    } else {
      ctx.rect(textX, textY, barW, barH);
    }
    ctx.fill();

    const fillW = Math.max(0, Math.min(barW, (barW * percentage) / 100));
    if (fillW > 0) {
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(textX, textY, fillW, barH, fillW, barH / 2);
      } else {
        ctx.rect(textX, textY, fillW, barH);
      }
      ctx.fill();
    }

    textY += 42;
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`Halaman ${book.currentPage} dari ${book.totalPages}`, textX, textY);

    if (book.rating) {
      const starStr = '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating);
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillStyle = '#d97706';
      ctx.fillText(`Rating: ${starStr} (${book.rating}/5)`, textX, textY + 32);
    }

    // Summary Box (Golden Ratio Proportioned Card)
    const boxY = coverY + coverH + 36;
    const boxW = width - paddingX * 2; // 800 - 104 = 696px
    const boxH = 330;

    ctx.fillStyle = '#ecfdf5';
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(paddingX, boxY, boxW, boxH, 20);
    } else {
      ctx.rect(paddingX, boxY, boxW, boxH);
    }
    ctx.fill();
    ctx.stroke();

    const boxPaddingX = paddingX + 32; // 84px
    const boxInnerWidth = boxW - 64; // 632px
    let boxContentY = boxY + 44;

    if (lastChapter) {
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillStyle = '#064e3b';
      boxContentY = wrapCanvasText(`Bab ${lastChapter.chapterNumber}: ${lastChapter.title}`, boxPaddingX, boxContentY, boxInnerWidth, 22, 1);

      boxContentY += 12;
      ctx.font = 'italic 18px serif';
      ctx.fillStyle = '#334155';
      boxContentY = wrapCanvasText(`"${lastChapter.summary}"`, boxPaddingX, boxContentY, boxInnerWidth, 18, 2);

      if (lastChapter.keyTakeaways && lastChapter.keyTakeaways.length > 0) {
        boxContentY += 16;
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillStyle = '#065f46';
        ctx.fillText('Poin Utama:', boxPaddingX, boxContentY);

        boxContentY += 28;
        lastChapter.keyTakeaways.slice(0, 3).forEach((pt) => {
          const cleanPt = pt.replace(/^[\s•\-\*\d\.\)\:]+/, '').trim();
          if (!cleanPt) return;
          ctx.beginPath();
          ctx.arc(boxPaddingX + 6, boxContentY - 5, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#047857';
          ctx.fill();

          ctx.font = '400 17px system-ui, sans-serif';
          ctx.fillStyle = '#334155';
          boxContentY = wrapCanvasText(cleanPt, boxPaddingX + 22, boxContentY, boxInnerWidth - 22, 17, 1);
        });
      }
    } else {
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillStyle = '#064e3b';
      ctx.fillText('Catatan Membaca', boxPaddingX, boxContentY);

      boxContentY += 36;
      ctx.font = 'italic 18px serif';
      ctx.fillStyle = '#334155';
      wrapCanvasText(`"${book.notes || 'Membaca adalah petualangan pikiran.'}"`, boxPaddingX, boxContentY, boxInnerWidth, 18, 4);
    }

    // Footer Line
    const footerLineY = height - 56;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingX, footerLineY);
    ctx.lineTo(width - paddingX, footerLineY);
    ctx.stroke();

    ctx.font = '500 15px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Dibuat dengan Bacaku • Jurnal Bacaan Digital', paddingX, footerLineY + 28);

    return canvas.toDataURL('image/png');
  };

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    let downloadedUrl = '';

    try {
      if (cardRef.current) {
        const node = cardRef.current;
        const rect = node.getBoundingClientRect();
        const width = Math.round(rect.width || node.offsetWidth || 340);
        const height = Math.round(rect.height || node.offsetHeight || 480);

        downloadedUrl = await toPng(node, {
          quality: 0.98,
          pixelRatio: 3,
          width,
          height,
          cacheBust: true,
          style: {
            transform: 'none',
            margin: '0',
            borderRadius: '24px',
            maxWidth: 'none',
            maxHeight: 'none',
          },
          filter: (domNode) => {
            if (domNode instanceof HTMLElement && domNode.tagName === 'SCRIPT') {
              return false;
            }
            return true;
          },
        });
      }
    } catch (error) {
      console.warn('html-to-image failed, using canvas fallback:', error);
    }

    if (!downloadedUrl) {
      try {
        downloadedUrl = await drawCanvasFallback();
      } catch (fallbackError) {
        console.error('Canvas fallback error:', fallbackError);
      }
    }

    if (downloadedUrl) {
      const link = document.createElement('a');
      link.download = `bacaku-${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = downloadedUrl;
      link.click();
    }

    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-all my-auto animate-fadeIn relative">
        {/* Header - Fixed at top with Close (X) button always visible */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-emerald-100 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/90 shrink-0 rounded-t-3xl backdrop-blur-md z-10">
          <h3 className="font-bold text-base text-stone-900 dark:text-emerald-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            Bagikan Progress Bacaan
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

        {/* Body & Visual Card Preview - Scrollable inside modal */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Preview kartu visual status membaca untuk diunduh dan dibagikan:
          </p>

          {/* Card Visual Artifact Preview directly matching the downloaded card */}
          <div
            ref={cardRef}
            className="w-full max-w-[340px] mx-auto bg-white text-stone-900 rounded-3xl p-5 shadow-2xl border-2 border-stone-200 relative overflow-hidden flex flex-col justify-between space-y-4"
          >
            {/* Subtle Accent Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

            {/* App Watermark Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5 min-w-0 gap-2">
              <span className="flex items-center gap-1.5 text-stone-900 font-extrabold text-xs shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  <span className="text-teal-600 font-black text-xs">.</span>bacaku
                </span>
              </span>
              <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[11px] px-3 py-1 rounded-full border border-emerald-300/80 whitespace-nowrap shrink-0 inline-flex items-center justify-center leading-none tracking-tight">
                {percentage}% Selesai
              </span>
            </div>

            {/* Main Content Area */}
            <div className="space-y-3.5">
              {/* Book Content Grid */}
              <div className="flex gap-3 items-center">
                {coverDataUrl ? (
                  <img
                    src={coverDataUrl}
                    alt={book.title}
                    className="w-16 h-24 rounded-xl object-cover shadow-md border border-stone-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold p-1 text-center shrink-0 border border-stone-200">
                    {book.title.slice(0, 10)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 mb-1">
                    {book.genre}
                  </span>
                  <h4 className="font-extrabold text-sm leading-snug line-clamp-2 text-stone-900">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 font-semibold mb-1.5">{book.author}</p>

                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-1 text-[9px] font-semibold text-stone-600">
                    <span className="shrink-0 text-stone-700 font-bold">Hal {book.currentPage} dari {book.totalPages}</span>
                    {book.rating ? (
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[9px] shrink-0" title={`Rating: ${book.rating}/5`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-2.5 h-2.5 ${s <= book.rating! ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                          />
                        ))}
                        <span className="text-stone-900 font-extrabold ml-0.5">{book.rating}/5</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Last Chapter Log Quote/Summary & Points */}
              {lastChapter ? (
                <div className="bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-200/90 space-y-1.5">
                  <p className="text-xs font-extrabold text-emerald-950 truncate">
                    Bab {lastChapter.chapterNumber}: {lastChapter.title}
                  </p>
                  <p className="text-[10px] text-stone-700 italic line-clamp-2 leading-relaxed font-normal">
                    "{lastChapter.summary}"
                  </p>
                  {lastChapter.keyTakeaways && lastChapter.keyTakeaways.length > 0 && (
                    <div className="pt-1.5 border-t border-emerald-200/70 space-y-1">
                      <p className="text-[9.5px] font-bold text-emerald-900">Poin Utama:</p>
                      <ul className="space-y-0.5 text-[9.5px] font-normal text-stone-700">
                        {lastChapter.keyTakeaways.slice(0, 3).map((pt, idx) => {
                          const cleanPt = pt.replace(/^[\s•\-\*\d\.\)\:]+/, '').trim();
                          if (!cleanPt) return null;
                          return (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0 mt-1" />
                              <span className="flex-1 line-clamp-1">{cleanPt}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-200/90 space-y-1">
                  <p className="text-xs font-extrabold text-emerald-950">Catatan Membaca</p>
                  <p className="text-[10px] text-stone-700 italic line-clamp-3 leading-relaxed font-normal">
                    "{book.notes || 'Membaca adalah petualangan pikiran yang membuka wawasan baru.'}"
                  </p>
                </div>
              )}
            </div>

            {/* Card Bottom Divider Line */}
            <div className="border-t border-stone-200 pt-1" />
          </div>

          {/* Generated PNG Image Output for Mobile APK & Web */}
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-4 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-600" />
                  <span>Salin Teks Status</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Mengunduh...' : 'Unduh Gambar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



