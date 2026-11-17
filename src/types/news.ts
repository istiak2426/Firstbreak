export type Language = 'en' | 'bn';

export interface FeedConfig {
  id: string;
  source: string;
  url: string;
  fallbackUrl?: string;
  language: 'bn' | 'en';
  enabled: boolean;
  isCustom?: boolean;
}

export interface FeedStatus {
  id: string;
  source: string;
  url: string;
  status: 'ok' | 'error';
  count: number;
  error?: string;
}

export interface ClusteredArticle {
  source: string;
  title: string;
  link: string;
  published_at: string;
  published_iso: string;
  published_ms: number;
  delay_minutes_num: number;
  delay_minutes: string;
  is_first: boolean;
  similarity_to_lead: number;
  snippet?: string;
}

export interface StoryCluster {
  id: string;
  story_topic: string;
  earliest_source: string;
  earliest_published_at: string;
  earliest_ms: number;
  max_delay_minutes: number;
  source_count: number;
  article_count: number;
  avg_similarity: number;
  articles: ClusteredArticle[];
}

export interface OutletStat {
  source: string;
  total_articles: number;
  shared_stories: number;
  first_to_break: number;
  avg_delay_minutes: number;
  fastest_lead_margin: number;
}

export interface ClusterResponse {
  generated_at: string;
  threshold: number;
  total_articles: number;
  total_clusters: number;
  multi_source_clusters: number;
  clustering_engine: 'gemini-embedding-2';
  feed_statuses: FeedStatus[];
  outlet_stats: OutletStat[];
  stories: StoryCluster[];
}

export interface LiveTrendNewsItem {
  title: string;
  url: string;
  source: string;
}

export interface LiveTrendItem {
  keyword: string;
  traffic: string;
  published_at: string;
  link: string;
  news_items: LiveTrendNewsItem[];
}

export interface LiveTrendsResponse {
  geo: string;
  fetched_at: string;
  trends: LiveTrendItem[];
}

export interface GroundedSource {
  title: string;
  uri: string;
}

export interface TrendAnalysisResponse {
  keyword: string;
  momentum_label: string;
  summary: string;
  matched_live_trends: LiveTrendItem[];
  sources: GroundedSource[];
  analyzed_at: string;
}
