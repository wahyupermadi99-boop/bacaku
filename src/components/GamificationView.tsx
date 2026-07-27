import React from 'react';
import { Badge, UserStats } from '../types';
import {
  Trophy,
  Award,
  Lock,
  Flame,
  BookOpen,
  Target,
  CheckCircle2,
  Moon,
  Library,
  Sparkles,
  Zap,
  Star,
  Medal,
  Shield,
  Crown,
} from 'lucide-react';

interface GamificationViewProps {
  badges: Badge[];
  userStats: UserStats;
}

const renderBadgeIcon = (badge: Badge) => {
  const iconName = badge.iconName || (badge as any).icon;

  if (!iconName) {
    return <Award className="w-6 h-6 text-amber-500" />;
  }

  if (typeof iconName !== 'string') {
    return iconName;
  }

  const iconClass = 'w-6 h-6';

  switch (iconName) {
    case 'BookOpen':
      return <BookOpen className={`${iconClass} text-blue-500 dark:text-blue-400`} />;
    case 'Award':
      return <Award className={`${iconClass} text-amber-500 dark:text-amber-400`} />;
    case 'Flame':
      return <Flame className={`${iconClass} text-orange-500 dark:text-orange-400`} />;
    case 'Moon':
      return <Moon className={`${iconClass} text-indigo-500 dark:text-indigo-400`} />;
    case 'Library':
      return <Library className={`${iconClass} text-emerald-500 dark:text-emerald-400`} />;
    case 'Target':
      return <Target className={`${iconClass} text-rose-500 dark:text-rose-400`} />;
    case 'Sparkles':
      return <Sparkles className={`${iconClass} text-purple-500 dark:text-purple-400`} />;
    case 'Zap':
      return <Zap className={`${iconClass} text-yellow-500 dark:text-yellow-400`} />;
    case 'Trophy':
      return <Trophy className={`${iconClass} text-amber-500 dark:text-amber-400`} />;
    case 'Star':
      return <Star className={`${iconClass} text-amber-400 dark:text-amber-300`} />;
    case 'Medal':
      return <Medal className={`${iconClass} text-amber-600 dark:text-amber-400`} />;
    case 'Shield':
      return <Shield className={`${iconClass} text-blue-500 dark:text-blue-400`} />;
    case 'Crown':
      return <Crown className={`${iconClass} text-yellow-500 dark:text-yellow-400`} />;
    default:
      if (iconName.length <= 4) {
        return <span className="text-xl">{iconName}</span>;
      }
      return <Award className={`${iconClass} text-amber-500 dark:text-amber-400`} />;
  }
};

export const GamificationView: React.FC<GamificationViewProps> = ({ badges, userStats }) => {
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const percentage = Math.round((unlockedCount / badges.length) * 100) || 0;

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-emerald-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          Lencana & Gamifikasi Pencapaian
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Raih lencana unik dengan membaca buku, menjaga streak, dan membuat ringkasan bab!
        </p>
      </div>

      {/* Gamification Level Summary */}
      <div className="backdrop-blur-md bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg text-white shadow-inner">
              <Award className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                Level Pembaca #{userStats.level}
              </span>
              <h3 className="text-lg font-bold">
                {userStats.level === 1
                  ? 'Pembaca Pemula'
                  : userStats.level === 2
                  ? 'Kutu Buku Tekun'
                  : 'Master Literasi'}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black">{unlockedCount}</span>
            <span className="text-xs text-emerald-100"> / {badges.length} Lencana</span>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-emerald-100 font-medium">
            <span>Poin Pengalaman (XP)</span>
            <span>{userStats.totalXP} XP</span>
          </div>
          <div className="w-full bg-emerald-950/50 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-200 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Mini Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-3 text-center">
          <Flame className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-stone-900 dark:text-emerald-100">
            {userStats.currentStreak}
          </span>
          <p className="text-[10px] text-stone-500 font-medium">Hari Streak</p>
        </div>

        <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-3 text-center">
          <BookOpen className="w-5 h-5 text-teal-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-stone-900 dark:text-emerald-100">
            {userStats.totalPagesRead}
          </span>
          <p className="text-[10px] text-stone-500 font-medium">Total Hal</p>
        </div>

        <div className="backdrop-blur-md bg-white/85 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-3 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-stone-900 dark:text-emerald-100">
            {userStats.booksCompleted}
          </span>
          <p className="text-[10px] text-stone-500 font-medium">Buku Selesai</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-stone-900 dark:text-emerald-100">
          Koleksi Lencana Pencapaian
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`backdrop-blur-md border rounded-2xl p-3.5 flex items-center gap-3.5 transition-all ${
                badge.unlocked
                  ? 'bg-white/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                  : 'bg-stone-100/60 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs ${
                  badge.unlocked
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200/60'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 grayscale'
                }`}
              >
                {renderBadgeIcon(badge)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="font-bold text-xs text-stone-900 dark:text-emerald-100 truncate">
                    {badge.title}
                  </h4>
                  {badge.unlocked ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                      Terbuka
                    </span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  {badge.description}
                </p>
                {badge.unlockedAt && (
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium mt-1">
                    Diperoleh: {badge.unlockedAt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
