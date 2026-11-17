import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, Search, TrendingUp, RefreshCw } from 'lucide-react';
import type {
  Language,
  LiveTrendItem,
  LiveTrendsResponse,
  TrendAnalysisResponse,
} from '../types/news';
import { fetchJson } from '../utils/api';
import type { Translations } from '../utils/i18n';

interface TrendsViewProps {
  language: Language;
  t: Translations;
}

const REGION_CODES = ['BD', 'US', 'GB', 'IN'] as const;

export function TrendsView({ language, t }: TrendsViewProps) {
  const [geo, setGeo] = useState<'BD' | 'US' | 'GB' | 'IN'>('BD');
  const [liveTrends, setLiveTrends] = useState<LiveTrendItem[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('');
  const [analysis, setAnalysis] = useState<TrendAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const loadLiveTrends = async (regionCode: string) => {
    setTrendsLoading(true);
    setTrendsError(null);
    try {
      const json = await fetchJson<LiveTrendsResponse>(
        `/api/trends/live?geo=${encodeURIComponent(regionCode)}`,
        undefined,
        language
      );
      setLiveTrends(json.trends || []);
    } catch (err) {
      setTrendsError(
        err instanceof Error
          ? err.message
          : language === 'bn'
            ? 'ট্রেন্ডিং তালিকা লোড করা যায়নি।'
            : 'Could not load trending searches right now.'
      );
    } finally {
      setTrendsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveTrends(geo);
  }, [geo]);

  const runAnalysis = async (targetKeyword: string) => {
    const clean = targetKeyword.trim();
    if (!clean) return;
    setKeyword(clean);
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const json = await fetchJson<TrendAnalysisResponse>(
        '/api/trends/analyze',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: clean, geo, lang: language }),
        },
        language
      );
      setAnalysis(json);
    } catch (err) {
      setAnalysisError(
        err instanceof Error
          ? err.message
          : language === 'bn'
            ? 'সার্চ জনপ্রিয়তা যাচাই করা যায়নি।'
            : 'Could not check search interest right now.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runAnalysis(keyword);
  };

  return (
    <div className="space-y-6">
      {/* Search Interest Lookup */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t.trendsTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t.trendsSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t.analyzeKeywordPlaceholder}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={analyzing || !keyword.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{analyzing ? t.analyzingBtn : t.analyzeBtn}</span>
          </button>
        </form>

        {analysisError && (
          <p className="text-xs text-red-600">{analysisError}</p>
        )}

        {analysis && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-900">
                {analysis.keyword}
              </span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="font-semibold text-blue-600">
                {analysis.momentum_label}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-600 mb-1">
                {t.groundedAnalysisHeading}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {analysis.summary}
              </p>
            </div>

            {analysis.sources.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-600 mb-1.5">
                  {t.groundedSourcesHeading}
                </h3>
                <ul className="space-y-1">
                  {analysis.sources.map((src, idx) => (
                    <li key={`${src.uri}-${idx}`}>
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <span>{src.title}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Live Trending Searches */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {t.liveTrendsHeading}
            </h3>
            <button
              type="button"
              onClick={() => loadLiveTrends(geo)}
              disabled={trendsLoading}
              aria-label="Reload trending searches"
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${trendsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md self-start sm:self-auto">
            {REGION_CODES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setGeo(code)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  geo === code
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.regions[code]}
              </button>
            ))}
          </div>
        </div>

        {trendsError ? (
          <div className="p-6 text-xs text-red-600">{trendsError}</div>
        ) : trendsLoading && liveTrends.length === 0 ? (
          <div className="p-6 text-xs text-slate-500">{t.loadingTrends}</div>
        ) : liveTrends.length === 0 ? (
          <div className="p-6 text-xs text-slate-500">{t.noTrends}</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {liveTrends.map((item, idx) => (
              <li
                key={`${item.keyword}-${idx}`}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono tabular-nums text-xs text-slate-400 w-6">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => runAnalysis(item.keyword)}
                      className="text-sm font-semibold text-slate-900 hover:text-blue-600 text-left cursor-pointer"
                    >
                      {item.keyword}
                    </button>
                    <span className="tabular-nums text-xs text-emerald-700 font-medium">
                      {item.traffic} {t.searchesUnit}
                    </span>
                  </div>

                  {item.news_items.length > 0 && (
                    <div className="mt-1 pl-8 text-xs text-slate-500 truncate">
                      <a
                        href={item.news_items[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-800 hover:underline"
                      >
                        {item.news_items[0].source ? `${item.news_items[0].source} · ` : ''}
                        {item.news_items[0].title}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pl-8 sm:pl-0 shrink-0">
                  <button
                    type="button"
                    onClick={() => runAnalysis(item.keyword)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap cursor-pointer"
                  >
                    {t.analyzeBtn}
                  </button>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-700"
                    aria-label={`View ${item.keyword} on Google Trends`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
