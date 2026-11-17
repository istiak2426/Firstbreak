import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FeedConfig, FeedStatus, Language } from '../types/news';
import type { Translations } from '../utils/i18n';

interface SidebarProps {
  feeds: FeedConfig[];
  feedStatuses: FeedStatus[];
  onToggleFeed: (id: string) => void;
  onAddFeed: (source: string, url: string) => void;
  onRemoveFeed: (id: string) => void;
  threshold: number;
  onThresholdChange: (value: number) => void;
  limitPerFeed: number;
  onLimitChange: (value: number) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  t: Translations;
}

const GROUPING_PRESETS = [
  { key: 'exact', value: 0.78 },
  { key: 'balanced', value: 0.7 },
  { key: 'broad', value: 0.6 },
] as const;

export function Sidebar({
  feeds,
  feedStatuses,
  onToggleFeed,
  onAddFeed,
  onRemoveFeed,
  threshold,
  onThresholdChange,
  limitPerFeed,
  onLimitChange,
  language,
  onLanguageChange,
  t,
}: SidebarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [formError, setFormError] = useState('');

  const statusMap = new Map(feedStatuses.map((s) => [s.id, s]));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedSource = newSource.trim();
    const trimmedUrl = newUrl.trim();
    if (!trimmedSource || !trimmedUrl) {
      setFormError('Please enter both the outlet name and link.');
      return;
    }
    try {
      const parsed = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setFormError('Link must start with http:// or https://');
        return;
      }
    } catch {
      setFormError('Please enter a valid web link.');
      return;
    }

    setFormError('');
    onAddFeed(trimmedSource, trimmedUrl);
    setNewSource('');
    setNewUrl('');
    setShowAddForm(false);
  };

  const getPresetLabel = (key: (typeof GROUPING_PRESETS)[number]['key']) => {
    if (key === 'exact') return t.groupingExact;
    if (key === 'balanced') return t.groupingBalanced;
    return t.groupingBroad;
  };

  return (
    <aside className="w-full lg:w-[270px] shrink-0 space-y-5">
      {/* Language Switch */}
      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <h2 className="text-xs font-semibold text-slate-700 mb-2.5">
          {t.languageLabel}
        </h2>
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              language === 'en'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('bn')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              language === 'bn'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            বাংলা
          </button>
        </div>
      </section>

      {/* Reading Preferences */}
      <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
        <h2 className="text-xs font-semibold text-slate-700">
          {t.storyGrouping}
        </h2>

        <div>
          <span className="block text-xs font-medium text-slate-700 mb-2">
            {t.groupingModeLabel}
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
            {GROUPING_PRESETS.map((preset) => {
              const isSelected = Math.abs(threshold - preset.value) < 0.03;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => onThresholdChange(preset.value)}
                  className={`py-1.5 px-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {getPresetLabel(preset.key)}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            {t.groupingHint}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <span className="block text-xs font-medium text-slate-700 mb-2">
            {t.storiesPerSource}
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
            {[5, 8, 12].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onLimitChange(count)}
                className={`py-1.5 text-xs font-mono tabular-nums font-medium rounded transition-colors cursor-pointer ${
                  limitPerFeed === count
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Sources */}
      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <h2 className="text-xs font-semibold text-slate-700 mb-3">
          {t.sidebarSources}
        </h2>

        <ul className="divide-y divide-slate-100">
          {feeds.map((feed) => {
            const st = statusMap.get(feed.id);
            return (
              <li key={feed.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <label className="flex items-start gap-2.5 cursor-pointer min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={feed.enabled}
                      onChange={() => onToggleFeed(feed.id)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-blue-600 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {feed.source}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{feed.language === 'bn' ? 'বাংলা' : 'English'}</span>
                        {st && feed.enabled && (
                          <>
                            <span aria-hidden="true">·</span>
                            {st.status === 'ok' ? (
                              <span className="tabular-nums text-emerald-700">
                                {st.count} {t.storyCountUnit}
                              </span>
                            ) : (
                              <span className="text-amber-700">
                                {t.unavailableText}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </label>

                  {feed.isCustom && (
                    <button
                      type="button"
                      onClick={() => onRemoveFeed(feed.id)}
                      aria-label={`Remove ${feed.source}`}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 pt-3 border-t border-slate-100">
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {t.addSourceToggle}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder={t.addSourcePlaceholderName}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
              />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={t.addSourcePlaceholderUrl}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
              />
              {formError && (
                <p className="text-[11px] text-red-600">{formError}</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addSourceBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError('');
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </aside>
  );
}
