import { RefreshCw } from 'lucide-react';
import type { Translations } from '../utils/i18n';

export type ActiveTab = 'clusters' | 'leaderboard' | 'trends';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRefresh: () => void;
  isLoading: boolean;
  t: Translations;
}

export function Header({
  activeTab,
  onTabChange,
  onRefresh,
  isLoading,
  t,
}: HeaderProps) {
  const navItems: Array<{ id: ActiveTab; label: string }> = [
    { id: 'clusters', label: t.navClusters },
    { id: 'leaderboard', label: t.navLeaderboard },
    { id: 'trends', label: t.navTrends },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        <a
          href="#stories"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('clusters');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          {t.brand}
        </a>

        <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm ${
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-900" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? t.refreshing : t.refreshNews}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        className="flex md:hidden items-center gap-4 px-4 overflow-x-auto border-t border-slate-100"
        aria-label="Mobile Primary"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`py-2.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
