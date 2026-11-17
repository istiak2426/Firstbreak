import { useCallback, useEffect, useRef, useState } from 'react';
import { ClusterList } from './components/ClusterList';
import { Header, type ActiveTab } from './components/Header';
import { LeaderboardView } from './components/LeaderboardView';
import { Sidebar } from './components/Sidebar';
import type { ClusterResponse, FeedConfig, Language } from './types/news';
import { fetchJson } from './utils/api';
import { I18N } from './utils/i18n';

const INITIAL_FEEDS: FeedConfig[] = [
  {
    id: 'prothom-alo',
    source: 'প্রথম আলো (Prothom Alo)',
    url: 'https://www.prothomalo.com/feed',
    language: 'bn',
    enabled: true,
  },
  {
    id: 'prothom-alo-en',
    source: 'Prothom Alo English',
    url: 'https://en.prothomalo.com/feed',
    language: 'en',
    enabled: true,
  },
  {
    id: 'daily-star',
    source: 'The Daily Star',
    url: 'https://www.thedailystar.net/rss.xml',
    language: 'en',
    enabled: true,
  },
  {
    id: 'bbc-bangla',
    source: 'বিবিসি বাংলা (BBC Bangla)',
    url: 'https://feeds.bbci.co.uk/bengali/rss.xml',
    fallbackUrl: 'https://www.bbc.com/bengali/index.xml',
    language: 'bn',
    enabled: true,
  },
  {
    id: 'dw-bangla',
    source: 'ডয়চে ভেলে বাংলা (DW)',
    url: 'https://rss.dw.com/xml/rss-ben-all',
    language: 'bn',
    enabled: true,
  },
  {
    id: 'bbc-world',
    source: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    language: 'en',
    enabled: true,
  },
  {
    id: 'al-jazeera',
    source: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    language: 'en',
    enabled: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clusters');
  const [language, setLanguage] = useState<Language>('bn');
  const [feeds, setFeeds] = useState<FeedConfig[]>(INITIAL_FEEDS);
  const [threshold, setThreshold] = useState(0.7);
  const [limitPerFeed, setLimitPerFeed] = useState(8);

  const [clusterData, setClusterData] = useState<ClusterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = I18N[language];
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchClusters = useCallback(
    async (
      targetFeeds: FeedConfig[],
      targetThreshold: number,
      targetLimit: number,
      activeLang: Language
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const json = await fetchJson<ClusterResponse>(
          '/api/cluster-news',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              feeds: targetFeeds,
              threshold: targetThreshold,
              limit: targetLimit,
            }),
          },
          activeLang
        );
        setClusterData(json);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : activeLang === 'bn'
              ? 'খবর লোড করতে সমস্যা হয়েছে।'
              : 'Could not load the latest news right now.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchClusters(INITIAL_FEEDS, 0.7, 8, 'bn');
  }, [fetchClusters]);

  const scheduleRecluster = (
    nextFeeds: FeedConfig[],
    nextThreshold: number,
    nextLimit: number,
    delayMs = 250
  ) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchClusters(nextFeeds, nextThreshold, nextLimit, language);
    }, delayMs);
  };

  const handleToggleFeed = (id: string) => {
    const updated = feeds.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    setFeeds(updated);
    scheduleRecluster(updated, threshold, limitPerFeed, 200);
  };

  const handleAddFeed = (source: string, url: string) => {
    const newFeed: FeedConfig = {
      id: `custom-${Date.now()}`,
      source,
      url,
      language: 'bn',
      enabled: true,
      isCustom: true,
    };
    const updated = [...feeds, newFeed];
    setFeeds(updated);
    scheduleRecluster(updated, threshold, limitPerFeed, 100);
  };

  const handleRemoveFeed = (id: string) => {
    const updated = feeds.filter((f) => f.id !== id);
    setFeeds(updated);
    scheduleRecluster(updated, threshold, limitPerFeed, 100);
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
    scheduleRecluster(feeds, value, limitPerFeed, 150);
  };

  const handleLimitChange = (value: number) => {
    setLimitPerFeed(value);
    scheduleRecluster(feeds, threshold, value, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={() => fetchClusters(feeds, threshold, limitPerFeed, language)}
        isLoading={isLoading}
        t={t}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Sidebar
            feeds={feeds}
            feedStatuses={clusterData?.feed_statuses || []}
            onToggleFeed={handleToggleFeed}
            onAddFeed={handleAddFeed}
            onRemoveFeed={handleRemoveFeed}
            threshold={threshold}
            onThresholdChange={handleThresholdChange}
            limitPerFeed={limitPerFeed}
            onLimitChange={handleLimitChange}
            language={language}
            onLanguageChange={setLanguage}
            t={t}
          />

          <div className="flex-1 min-w-0 w-full">
            {activeTab === 'clusters' && (
              <ClusterList
                data={clusterData}
                isLoading={isLoading}
                error={error}
                onRetry={() => fetchClusters(feeds, threshold, limitPerFeed, language)}
                language={language}
                t={t}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardView
                stats={clusterData?.outlet_stats || []}
                t={t}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
