import { Book, Badge, DailyReadingLog, MonthlyTarget, NotificationSetting, UserStats } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    totalPages: 346,
    currentPage: 184,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    genre: 'Self-Improvement',
    rating: 5,
    status: 'reading',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-25T19:30:00Z',
    notes: 'Buku stoisisme populer untuk mengendalikan emosi negatif dan fokus pada hal yang bisa kita kontrol.',
    chapters: [
      {
        id: 'chap-1-1',
        bookId: 'book-1',
        chapterNumber: 1,
        title: 'Survei Khawatir Nasional',
        startPage: 1,
        endPage: 45,
        summary: 'Bab ini membahas tingkat kecemasan masyarakat modern Indonesia terhadap masa depan, karir, dan hubungan sosial.',
        keyTakeaways: [
          'Kecemasan sering kali dipicu oleh ekspektasi yang tidak realistis',
          'Media sosial memperparah perasaan tidak puas dengan kehidupan sendiri',
          'Mengakui rasa khawatir adalah langkah awal untuk ketenangan mental'
        ],
        quote: 'Bukan hal-hal yang terjadi yang merusak ketenangan kita, melainkan persepsi kita tentang hal tersebut.',
        createdAt: '2026-07-05T14:20:00Z',
        aiGenerated: true
      },
      {
        id: 'chap-1-2',
        bookId: 'book-1',
        chapterNumber: 2,
        title: 'Dikotomi Kendali',
        startPage: 46,
        endPage: 90,
        summary: 'Puncak ajaran Stoisisme tentang memisahkan hal yang berada di bawah kendali kita (pikiran, tindakan) dan luar kendali (pendapat orang lain, cuaca).',
        keyTakeaways: [
          'Fokus 100% energi pada hal yang bisa kita kendalikan',
          'Pikiran orang lain tentang kita berada di luar kendali kita',
          'Kedamaian lahir saat kita berhenti mencoba mengontrol orang lain'
        ],
        quote: 'Kamu memiliki kendali atas pikiranmu, bukan atas peristiwa di luar sana.',
        createdAt: '2026-07-12T09:15:00Z',
        aiGenerated: true
      }
    ]
  },
  {
    id: 'book-2',
    title: 'Atomic Habits',
    author: 'James Clear',
    totalPages: 320,
    currentPage: 320,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    genre: 'Productivity',
    rating: 5,
    status: 'completed',
    createdAt: '2026-06-10T08:00:00Z',
    updatedAt: '2026-07-18T16:00:00Z',
    notes: 'Perubahan kecil 1% setiap hari akan menghasilkan dampak raksasa secara akumulatif.',
    chapters: [
      {
        id: 'chap-2-1',
        bookId: 'book-2',
        chapterNumber: 1,
        title: 'Kekuatan Dahsyat Perubahan 1%',
        startPage: 1,
        endPage: 50,
        summary: 'Bila Anda bisa menjadi 1% lebih baik setiap hari selama satu tahun, Anda akan berakhir 37 kali lebih baik.',
        keyTakeaways: [
          'Hasil adalah akumulasi dari kebiasaan harian Anda',
          'Fokus pada sistem, bukan hanya pada tujuan akhir',
          'Identitas menentukan kebiasaan yang akan bertahan lama'
        ],
        quote: 'Anda tidak naik ke tingkat tujuan Anda; Anda jatuh ke tingkat sistem Anda.',
        createdAt: '2026-06-15T20:00:00Z',
        aiGenerated: true
      }
    ]
  },
  {
    id: 'book-3',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    totalPages: 529,
    currentPage: 210,
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
    genre: 'Fiction',
    rating: 4,
    status: 'reading',
    createdAt: '2026-07-10T11:00:00Z',
    updatedAt: '2026-07-24T21:00:00Z',
    notes: 'Kisah inspiratif anak-anak Belitong memperjuangkan mimpi lewat pendidikan.',
    chapters: []
  },
  {
    id: 'book-4',
    title: 'Psychology of Money',
    author: 'Morgan Housel',
    totalPages: 256,
    currentPage: 0,
    coverUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    genre: 'Finance',
    status: 'plan_to_read',
    createdAt: '2026-07-20T15:00:00Z',
    updatedAt: '2026-07-20T15:00:00Z',
    chapters: []
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: 'Langkah Pertama',
    description: 'Selesaikan bab pertama dalam buku pilihanmu',
    iconName: 'BookOpen',
    category: 'progress',
    unlocked: true,
    unlockedAt: '2026-07-05T14:20:00Z',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'badge-2',
    title: 'Kutu Buku',
    description: 'Selesaikan setidaknya 1 buku secara penuh',
    iconName: 'Award',
    category: 'progress',
    unlocked: true,
    unlockedAt: '2026-07-18T16:00:00Z',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'badge-3',
    title: 'Membara (Streak 3)',
    description: 'Membaca secara konsisten selama 3 hari berturut-turut',
    iconName: 'Flame',
    category: 'streak',
    unlocked: true,
    unlockedAt: '2026-07-24T20:00:00Z',
    progress: 3,
    maxProgress: 3
  },
  {
    id: 'badge-4',
    title: 'Kalong Malam',
    description: 'Mencatat sesi membaca di atas pukul 22:00 malam',
    iconName: 'Moon',
    category: 'special',
    unlocked: true,
    unlockedAt: '2026-07-24T22:30:00Z',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'badge-5',
    title: 'Perpustakaan Mini',
    description: 'Kumpulkan minimal 5 buku di rak perpustakaanmu',
    iconName: 'Library',
    category: 'library',
    unlocked: false,
    progress: 4,
    maxProgress: 5
  },
  {
    id: 'badge-6',
    title: 'Target Pemburu',
    description: 'Capai target halaman bulananmu 100%',
    iconName: 'Target',
    category: 'progress',
    unlocked: false,
    progress: 394,
    maxProgress: 600
  },
  {
    id: 'badge-7',
    title: 'Ringkasan Master',
    description: 'Buat 5 ringkasan bab berbasis AI otomatis',
    iconName: 'Sparkles',
    category: 'summary',
    unlocked: false,
    progress: 3,
    maxProgress: 5
  },
  {
    id: 'badge-8',
    title: 'Kilat Membaca',
    description: 'Baca lebih dari 50 halaman dalam satu hari',
    iconName: 'Zap',
    category: 'special',
    unlocked: true,
    unlockedAt: '2026-07-22T19:00:00Z',
    progress: 55,
    maxProgress: 50
  }
];

export const INITIAL_READING_LOGS: DailyReadingLog[] = [
  { id: 'log-1', date: '2026-07-20', pagesRead: 25, minutesSpent: 30, bookId: 'book-1', bookTitle: 'Filosofi Teras' },
  { id: 'log-2', date: '2026-07-21', pagesRead: 18, minutesSpent: 20, bookId: 'book-1', bookTitle: 'Filosofi Teras' },
  { id: 'log-3', date: '2026-07-22', pagesRead: 55, minutesSpent: 65, bookId: 'book-3', bookTitle: 'Laskar Pelangi' },
  { id: 'log-4', date: '2026-07-23', pagesRead: 30, minutesSpent: 35, bookId: 'book-1', bookTitle: 'Filosofi Teras' },
  { id: 'log-5', date: '2026-07-24', pagesRead: 40, minutesSpent: 45, bookId: 'book-3', bookTitle: 'Laskar Pelangi' },
  { id: 'log-6', date: '2026-07-25', pagesRead: 20, minutesSpent: 25, bookId: 'book-1', bookTitle: 'Filosofi Teras' },
  { id: 'log-7', date: '2026-07-26', pagesRead: 15, minutesSpent: 20, bookId: 'book-1', bookTitle: 'Filosofi Teras' },
];

export const INITIAL_MONTHLY_TARGET: MonthlyTarget = {
  year: 2026,
  month: 7,
  targetBooks: 3,
  targetPages: 600,
};

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSetting = {
  enabled: true,
  reminderTime: '20:00',
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  soundEnabled: true,
};

export const INITIAL_USER_STATS: UserStats = {
  currentStreak: 4,
  longestStreak: 7,
  lastReadDate: '2026-07-26',
  totalPagesRead: 714,
  totalBooksCompleted: 1,
  totalChaptersSummarized: 3,
  totalReadingMinutes: 840,
  xpPoints: 350,
  level: 3,
};
