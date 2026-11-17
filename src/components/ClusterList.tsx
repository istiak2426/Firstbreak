import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Clock,
  Search,
  Zap,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { ClusterResponse, Language } from '../types/news';
import type { Translations } from '../utils/i18n';

interface ClusterListProps {
  data: ClusterResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  language: Language;
  t: Translations;
}

type FilterMode = 'compared' | 'all';
type SortMode = 'multi' | 'latest' | 'gap';

function formatRelativeTime(ms: number, lang: Language): string {
  const diffMins = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (diffMins < 1) {
    return lang === 'bn' ? 'এইমাত্র' : 'Just now';
  }
  if (diffMins < 60) {
    return lang === 'bn' ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return lang === 'bn' ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
  }
  const date = new Date(ms);
  return date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(mins: number, t: Translations): string {
  if (mins < 60) {
    return `${mins} ${t.minuteShort}`;
  }
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0
    ? `${hrs} ${t.hourShort} ${rem} ${t.minuteShort}`
    : `${hrs} ${t.hourShort}`;
}

function formatDelayLabel(mins: number, isFirst: boolean, t: Translations): string {
  if (isFirst) return t.firstToReport;
  if (mins === 0) return t.sameTime;
  return `${formatDuration(mins, t)} ${t.laterSuffix}`;
}

function formatRank(index: number, lang: Language, t: Translations): string {
  if (index === 0) return t.rankFirst;
  if (lang === 'bn') {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const numStr = String(index + 1)
      .split('')
      .map((d) => bnDigits[Number(d)] ?? d)
      .join('');
    if (index === 1 || index === 2) return `${numStr}য়`;
    if (index === 3) return `${numStr}র্থ`;
    return `${numStr}ম`;
  }
  const n = index + 1;
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

export function ClusterList({
  data,
  isLoading,
  error,
  onRetry,
  language,
  t,
}: ClusterListProps) {
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('compared');
  const [sortMode, setSortMode] = useState<SortMode>('multi');

  const topFirstBreaker = useMemo(() => {
    if (!data || data.outlet_stats.length === 0) return '—';
    const top = data.outlet_stats[0];
    if (top.first_to_break === 0) return '—';
    return `${top.source} (${top.first_to_break})`;
  }, [data]);

  const activeSourceCount = useMemo(() => {
    if (!data) return 0;
    return data.feed_statuses.filter((f) => f.status === 'ok').length;
  }, [data]);

  const effectiveFilterMode: FilterMode =
    filterMode === 'compared' && data && data.multi_source_clusters === 0
      ? 'all'
      : filterMode;

  const filteredStories = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();

    const list = data.stories.filter((cluster) => {
      if (effectiveFilterMode === 'compared' && cluster.source_count < 2) {
        return false;
      }
      if (!q) return true;
      return (
        cluster.story_topic.toLowerCase().includes(q) ||
        cluster.articles.some(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.source.toLowerCase().includes(q)
        )
      );
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'latest') {
        return b.earliest_ms - a.earliest_ms;
      }
      if (sortMode === 'gap') {
        return b.max_delay_minutes - a.max_delay_minutes;
      }
      if (b.source_count !== a.source_count) return b.source_count - a.source_count;
      return b.earliest_ms - a.earliest_ms;
    });
  }, [data, query, effectiveFilterMode, sortMode]);

  if (error && !data) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900">{t.errorTitle}</h3>
        <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.retryBtn}</span>
        </button>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-slate-900">{t.loadingTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.loadingDesc}</p>
        </div>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse space-y-3"
          >
            <div className="h-3 w-48 bg-slate-200 rounded" />
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Clear 1-glance explanation banner */}
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900">
          {t.heroTitle}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-3xl">
          {t.heroSubtitle}
        </p>
      </section>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-semibold text-amber-900 underline hover:text-slate-900 whitespace-nowrap cursor-pointer"
          >
            {t.retryBtn}
          </button>
        </div>
      )}

      {/* 3-Column Clear Summary Strip */}
      {data && (
        <div className="bg-white border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-4">
            <div className="text-xs font-medium text-slate-500">{t.statCompared}</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-blue-600">
              {data.multi_source_clusters}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{t.statComparedSub}</div>
          </div>
          <div className="p-4">
            <div className="text-xs font-medium text-slate-500">{t.statFastest}</div>
            <div className="mt-1 text-lg font-bold text-slate-900 truncate">
              {topFirstBreaker}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{t.statFastestSub}</div>
          </div>
          <div className="p-4">
            <div className="text-xs font-medium text-slate-500">{t.statSources}</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {activeSourceCount}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              {activeSourceCount} {t.statSourcesSub}
            </div>
          </div>
        </div>
      )}

      {/* Simple Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md shrink-0">
          <button
            type="button"
            onClick={() => setFilterMode('compared')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              effectiveFilterMode === 'compared'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterCompared}
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              effectiveFilterMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterAll}
          </button>
        </div>

        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>

          <select
            aria-label="Sort stories"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shrink-0"
          >
            <option value="multi">{t.sortMultiFirst}</option>
            <option value="latest">{t.sortLatest}</option>
            <option value="gap">{t.sortBiggestGap}</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredStories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <h3 className="text-base font-semibold text-slate-900">{t.noClustersTitle}</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {t.noClustersDesc}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFilterMode('all');
            }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            {t.showAllBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStories.map((cluster) => {
            const isMulti = cluster.source_count >= 2;
            const leadSnippet = cluster.articles[0]?.snippet;

            return (
              <article
                key={cluster.id}
                className="bg-white border border-slate-200 rounded-lg p-5"
              >
                {/* Clear summary kicker */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    {isMulti ? (
                      <>
                        <span className="font-semibold text-emerald-700">
                          {t.publishedFirstBy} {cluster.earliest_source}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums font-medium text-slate-700">
                          {cluster.source_count} {t.sourcesCount}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500">
                        {t.singleOutletNote}
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400 tabular-nums">
                    {formatRelativeTime(cluster.earliest_ms, language)}
                  </span>
                </div>

                {/* Story Headline */}
                <h2 className="mt-2 text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                  <a
                    href={cluster.articles[0]?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {cluster.story_topic}
                  </a>
                </h2>

                {leadSnippet && (
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {leadSnippet}
                  </p>
                )}

                {/* Chronological Outlet List */}
                <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                  {cluster.articles.map((art, index) => (
                    <div
                      key={`${art.link}-${index}`}
                      className="py-3 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        {isMulti && (
                          <div className="w-40 shrink-0 flex items-center gap-1.5 text-xs tabular-nums">
                            {art.is_first ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                <Zap className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {formatRank(index, language, t)} · {t.firstToReport}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {formatRank(index, language, t)} ·{' '}
                                  {formatDelayLabel(art.delay_minutes_num, false, t)}
                                </span>
                              </span>
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-xs font-semibold text-slate-900 shrink-0">
                              {art.source}
                            </span>
                            <a
                              href={art.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-slate-700 hover:text-blue-600 hover:underline leading-snug"
                            >
                              {art.title}
                            </a>
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-400 tabular-nums">
                            {new Date(art.published_ms).toLocaleTimeString(
                              language === 'bn' ? 'bn-BD' : 'en-US',
                              { hour: 'numeric', minute: '2-digit' }
                            )}
                            {' · '}
                            {formatRelativeTime(art.published_ms, language)}
                          </div>
                        </div>
                      </div>

                      <a
                        href={art.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0 self-end sm:self-center"
                      >
                        <span>{t.openArticle}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
