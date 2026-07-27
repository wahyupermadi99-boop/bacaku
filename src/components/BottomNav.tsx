import React from 'react';
import { Library, BookOpenCheck, BarChart3, Award } from 'lucide-react';

export type TabType = 'library' | 'chapters' | 'stats' | 'badges';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unlockedBadgeCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  unlockedBadgeCount,
}) => {
  const tabs = [
    { id: 'library' as TabType, label: 'Rak Buku', icon: Library },
    { id: 'chapters' as TabType, label: 'Progress & Bab', icon: BookOpenCheck },
    { id: 'stats' as TabType, label: 'Statistik', icon: BarChart3 },
    { id: 'badges' as TabType, label: 'Lencana', icon: Award, badge: unlockedBadgeCount },
  ];

  return (
    <nav className="fixed bottom-0 md:bottom-3 left-1/2 -translate-x-1/2 w-full max-w-full md:max-w-3xl lg:max-w-4xl z-30 backdrop-blur-xl bg-white/95 dark:bg-emerald-950/95 border-t md:border border-emerald-100/80 dark:border-emerald-900/60 px-3 md:px-6 py-2 transition-all shadow-xl md:rounded-2xl">
      <div className="grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-100 dark:bg-emerald-900/70 scale-105'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{tab.label}</span>

              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-2 bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

