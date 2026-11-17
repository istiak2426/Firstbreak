import Parser from "rss-parser";
import { GoogleGenAI } from "@google/genai";
import type {
  ClusteredArticle,
  ClusterResponse,
  FeedConfig,
  FeedStatus,
  GroundedSource,
  LiveTrendItem,
  OutletStat,
  StoryCluster,
  TrendAnalysisResponse,
} from "../src/types/news";

export const DEFAULT_FEEDS: FeedConfig[] = [
  {
    id: "prothom-alo",
    source: "প্রথম আলো (Prothom Alo)",
    url: "https://www.prothomalo.com/feed",
    language: "bn",
    enabled: true,
  },
  {
    id: "prothom-alo-en",
    source: "Prothom Alo English",
    url: "https://en.prothomalo.com/feed",
    language: "en",
    enabled: true,
  },
  {
    id: "daily-star",
    source: "The Daily Star",
    url: "https://www.thedailystar.net/rss.xml",
    language: "en",
    enabled: true,
  },
  {
    id: "bbc-bangla",
    source: "বিবিসি বাংলা (BBC Bangla)",
    url: "https://feeds.bbci.co.uk/bengali/rss.xml",
    fallbackUrl: "https://www.bbc.com/bengali/index.xml",
    language: "bn",
    enabled: true,
  },
  {
    id: "dw-bangla",
    source: "ডয়চে ভেলে বাংলা (DW)",
    url: "https://rss.dw.com/xml/rss-ben-all",
    language: "bn",
    enabled: true,
  },
  {
    id: "bbc-world",
    source: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    language: "en",
    enabled: true,
  },
  {
    id: "al-jazeera",
    source: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
    enabled: true,
  },
];

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; FirstBreakNewsBot/1.0; +https://firstbreak.local)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

type TrendParserItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  traffic?: string;
  newsItems?: Array<{
    "ht:news_item_title"?: string[];
    "ht:news_item_url"?: string[];
    "ht:news_item_source"?: string[];
  }>;
};

const trendsParser = new Parser<Record<string, unknown>, TrendParserItem>({
  timeout: 10000,
  customFields: {
    item: [
      ["ht:approx_traffic", "traffic"],
      ["ht:news_item", "newsItems", { keepArray: true }],
    ],
  },
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; FirstBreakNewsBot/1.0)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

const embeddingCache = new Map<string, number[]>();
const MAX_CACHE_SIZE = 600;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY কনফিগার করা নেই। সার্ভার এনভায়রনমেন্ট বা Vercel Secrets-এ GEMINI_API_KEY যোগ করুন।"
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export function extractReadableError(
  err: unknown,
  fallback: string
): { status: number; message: string } {
  if (err && typeof err === "object") {
    const anyErr = err as { status?: number; message?: string };
    const status =
      typeof anyErr.status === "number" && anyErr.status >= 400
        ? anyErr.status
        : 500;
    const rawMsg = anyErr.message || fallback;
    try {
      const parsed = JSON.parse(rawMsg);
      const nestedMsg = parsed?.error?.message;
      if (typeof nestedMsg === "string" && nestedMsg.trim()) {
        return { status, message: nestedMsg.trim() };
      }
    } catch {
      // Not JSON
    }
    return { status, message: rawMsg };
  }
  return { status: 500, message: fallback };
}

function cleanSnippet(raw?: string): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function formatUtcTimestamp(ms: number): string {
  return new Date(ms).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function decodeXmlText(raw: string): string {
  return raw
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function parseRssTolerant(
  xmlText: string,
  limitPerFeed: number
): Array<{ title: string; link: string; dateStr?: string; snippet?: string }> {
  const itemMatches =
    xmlText.match(/<(?:item|entry)\b[^>]*>[\s\S]*?<\/(?:item|entry)>/gi) || [];
  const results: Array<{
    title: string;
    link: string;
    dateStr?: string;
    snippet?: string;
  }> = [];

  for (const block of itemMatches.slice(0, limitPerFeed)) {
    const titleMatch = block.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const linkHrefMatch = block.match(
      /<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i
    );
    const linkTextMatch = block.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i);
    const dateMatch = block.match(
      /<(?:pubDate|published|updated|dc:date)\b[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i
    );
    const timeAttrMatch = block.match(
      /<time\b[^>]*datetime=["']([^"']+)["']/i
    );
    const descMatch = block.match(
      /<(?:description|summary|content)\b[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/i
    );

    const title = titleMatch
      ? decodeXmlText(titleMatch[1]).replace(/\s+/g, " ")
      : "";
    const link = linkTextMatch
      ? decodeXmlText(linkTextMatch[1])
      : linkHrefMatch
        ? decodeXmlText(linkHrefMatch[1])
        : "";
    const dateStr = dateMatch
      ? decodeXmlText(dateMatch[1])
      : timeAttrMatch
        ? timeAttrMatch[1]
        : undefined;
    const snippet = descMatch ? cleanSnippet(decodeXmlText(descMatch[1])) : "";

    if (title) {
      results.push({ title, link, dateStr, snippet });
    }
  }

  return results;
}

async function fetchSingleFeed(
  feed: FeedConfig,
  limitPerFeed: number
): Promise<{
  articles: Array<{
    source: string;
    title: string;
    link: string;
    published_ms: number;
    snippet: string;
  }>;
  status: FeedStatus;
}> {
  const candidateUrls = [
    feed.url,
    ...(feed.fallbackUrl ? [feed.fallbackUrl] : []),
  ];
  let lastError = "ফিড সংগ্রহ করা যায়নি";

  for (const targetUrl of candidateUrls) {
    try {
      const response = await fetch(targetUrl, {
        signal: AbortSignal.timeout(9000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        },
      });

      if (!response.ok) {
        lastError = `HTTP ${response.status} ${response.statusText}`;
        continue;
      }

      const xmlText = await response.text();
      if (
        !xmlText.includes("<rss") &&
        !xmlText.includes("<feed") &&
        !xmlText.includes("<channel")
      ) {
        lastError = "সঠিক নিউজ ফিড পাওয়া যায়নি";
        continue;
      }

      let rawItems: Array<{
        title: string;
        link: string;
        dateStr?: string;
        snippet?: string;
      }> = [];

      try {
        const parsed = await rssParser.parseString(xmlText);
        rawItems = (parsed.items || [])
          .slice(0, limitPerFeed)
          .filter((item) => Boolean(item.title && item.title.trim()))
          .map((item) => ({
            title: (item.title || "").replace(/\s+/g, " ").trim(),
            link: item.link || targetUrl,
            dateStr: item.isoDate || item.pubDate,
            snippet: cleanSnippet(
              item.contentSnippet || item.summary || item.content
            ),
          }));
      } catch {
        rawItems = parseRssTolerant(xmlText, limitPerFeed).map((item) => ({
          ...item,
          link: item.link || targetUrl,
        }));
      }

      if (rawItems.length === 0) {
        lastError = "কোনো খবর পাওয়া যায়নি";
        continue;
      }

      const articles = rawItems.map((item) => {
        const parsedDate = item.dateStr ? Date.parse(item.dateStr) : NaN;
        const published_ms = Number.isFinite(parsedDate)
          ? parsedDate
          : Date.now();
        return {
          source: feed.source,
          title: item.title,
          link: item.link,
          published_ms,
          snippet: item.snippet || "",
        };
      });

      return {
        articles,
        status: {
          id: feed.id,
          source: feed.source,
          url: targetUrl,
          status: "ok",
          count: articles.length,
        },
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "নেটওয়ার্ক ত্রুটি";
    }
  }

  return {
    articles: [],
    status: {
      id: feed.id,
      source: feed.source,
      url: feed.url,
      status: "error",
      count: 0,
      error: lastError,
    },
  };
}

async function getTitleEmbeddings(
  ai: GoogleGenAI,
  titles: string[]
): Promise<number[][]> {
  const results: number[][] = new Array(titles.length);
  const missingIndices: number[] = [];

  for (let i = 0; i < titles.length; i++) {
    const cached = embeddingCache.get(titles[i]);
    if (cached) {
      results[i] = cached;
    } else {
      missingIndices.push(i);
    }
  }

  const BATCH_SIZE = 6;
  for (let start = 0; start < missingIndices.length; start += BATCH_SIZE) {
    const batch = missingIndices.slice(start, start + BATCH_SIZE);
    await Promise.all(
      batch.map(async (idx) => {
        const title = titles[idx];
        const response = await ai.models.embedContent({
          model: "gemini-embedding-2",
          contents: title,
        });
        const vector = response.embeddings?.[0]?.values;
        if (!vector || vector.length === 0) {
          throw new Error(
            `Empty embedding vector returned for headline: "${title.slice(0, 50)}"`
          );
        }
        if (embeddingCache.size >= MAX_CACHE_SIZE) {
          const oldestKey = embeddingCache.keys().next().value;
          if (oldestKey) embeddingCache.delete(oldestKey);
        }
        embeddingCache.set(title, vector);
        results[idx] = vector;
      })
    );
  }

  return results;
}

function buildOutletLeaderboard(
  allSources: string[],
  articlesBySource: Map<string, number>,
  clusters: StoryCluster[]
): OutletStat[] {
  const sharedCount = new Map<string, number>();
  const firstBreaks = new Map<string, number>();
  const delayTotals = new Map<string, number>();
  const delaySamples = new Map<string, number>();
  const bestLeadMargin = new Map<string, number>();

  for (const src of allSources) {
    sharedCount.set(src, 0);
    firstBreaks.set(src, 0);
    delayTotals.set(src, 0);
    delaySamples.set(src, 0);
    bestLeadMargin.set(src, 0);
  }

  for (const cluster of clusters) {
    if (cluster.source_count < 2) continue;
    const seenInCluster = new Set<string>();
    const sortedDistinctSources: ClusteredArticle[] = [];

    for (const art of cluster.articles) {
      if (!seenInCluster.has(art.source)) {
        seenInCluster.add(art.source);
        sortedDistinctSources.push(art);
      }
    }

    if (sortedDistinctSources.length < 2) continue;

    const firstArt = sortedDistinctSources[0];
    const secondArt = sortedDistinctSources[1];
    const leadMargin = Math.max(
      0,
      secondArt.delay_minutes_num - firstArt.delay_minutes_num
    );

    firstBreaks.set(firstArt.source, (firstBreaks.get(firstArt.source) || 0) + 1);
    bestLeadMargin.set(
      firstArt.source,
      Math.max(bestLeadMargin.get(firstArt.source) || 0, leadMargin)
    );

    for (const art of sortedDistinctSources) {
      sharedCount.set(art.source, (sharedCount.get(art.source) || 0) + 1);
      delayTotals.set(
        art.source,
        (delayTotals.get(art.source) || 0) + art.delay_minutes_num
      );
      delaySamples.set(art.source, (delaySamples.get(art.source) || 0) + 1);
    }
  }

  return allSources
    .map((source) => {
      const samples = delaySamples.get(source) || 0;
      const avgDelay =
        samples > 0 ? Math.round((delayTotals.get(source) || 0) / samples) : 0;
      return {
        source,
        total_articles: articlesBySource.get(source) || 0,
        shared_stories: sharedCount.get(source) || 0,
        first_to_break: firstBreaks.get(source) || 0,
        avg_delay_minutes: avgDelay,
        fastest_lead_margin: bestLeadMargin.get(source) || 0,
      };
    })
    .sort((a, b) => {
      if (b.first_to_break !== a.first_to_break)
        return b.first_to_break - a.first_to_break;
      if (a.avg_delay_minutes !== b.avg_delay_minutes)
        return a.avg_delay_minutes - b.avg_delay_minutes;
      return b.total_articles - a.total_articles;
    });
}

export async function clusterNewsFeeds(params: {
  feeds?: FeedConfig[] | null;
  threshold?: number;
  limit?: number;
}): Promise<ClusterResponse> {
  const activeFeeds = (
    params.feeds && params.feeds.length > 0 ? params.feeds : DEFAULT_FEEDS
  ).filter((f) => f.enabled !== false && Boolean(f.url));

  const rawThreshold = Number(params.threshold ?? 0.7);
  const threshold = Math.min(
    0.95,
    Math.max(0.45, Number.isFinite(rawThreshold) ? rawThreshold : 0.7)
  );

  const rawLimit = Number(params.limit ?? 8);
  const limitPerFeed = Math.min(
    20,
    Math.max(2, Number.isFinite(rawLimit) ? rawLimit : 8)
  );

  if (activeFeeds.length === 0) {
    const err = new Error("অন্তত একটি সংবাদ মাধ্যম নির্বাচন করুন।") as Error & {
      status?: number;
    };
    err.status = 400;
    throw err;
  }

  const feedResults = await Promise.all(
    activeFeeds.map((feed) => fetchSingleFeed(feed, limitPerFeed))
  );

  const feedStatuses = feedResults.map((r) => r.status);
  const rawArticles = feedResults.flatMap((r) => r.articles);

  if (rawArticles.length === 0) {
    const err = new Error(
      "কোনো সংবাদ মাধ্যম থেকে খবর সংগ্রহ করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।"
    ) as Error & { status?: number };
    err.status = 502;
    throw err;
  }

  const ai = getGeminiClient();
  const titles = rawArticles.map((a) => a.title);
  const embeddings = await getTitleEmbeddings(ai, titles);

  const n = rawArticles.length;
  const simMatrix: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0)
  );
  for (let i = 0; i < n; i++) {
    simMatrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const sim = cosineSimilarity(embeddings[i], embeddings[j]);
      simMatrix[i][j] = sim;
      simMatrix[j][i] = sim;
    }
  }

  const visited = new Set<number>();
  const stories: StoryCluster[] = [];

  for (let i = 0; i < n; i++) {
    if (visited.has(i)) continue;
    const memberIndices = [i];
    visited.add(i);

    for (let j = i + 1; j < n; j++) {
      if (!visited.has(j) && simMatrix[i][j] >= threshold) {
        memberIndices.push(j);
        visited.add(j);
      }
    }

    memberIndices.sort(
      (idxA, idxB) =>
        rawArticles[idxA].published_ms - rawArticles[idxB].published_ms
    );

    const leadIdx = memberIndices[0];
    const leadArt = rawArticles[leadIdx];
    const earliestMs = leadArt.published_ms;

    const formattedArticles: ClusteredArticle[] = memberIndices.map(
      (idx, pos) => {
        const art = rawArticles[idx];
        const diffMins = Math.max(
          0,
          Math.round((art.published_ms - earliestMs) / 60000)
        );
        const simToLead = Number(simMatrix[leadIdx][idx].toFixed(3));
        let delayLabel = "First to Break (T+0)";
        if (pos > 0) {
          delayLabel =
            diffMins === 0 ? "Same Minute (+0m)" : `+${diffMins} mins`;
        }

        return {
          source: art.source,
          title: art.title,
          link: art.link,
          published_at: formatUtcTimestamp(art.published_ms),
          published_iso: new Date(art.published_ms).toISOString(),
          published_ms: art.published_ms,
          delay_minutes_num: diffMins,
          delay_minutes: delayLabel,
          is_first: pos === 0,
          similarity_to_lead: simToLead,
          snippet: art.snippet,
        };
      }
    );

    const distinctSources = new Set(formattedArticles.map((a) => a.source));
    const maxDelay = Math.max(
      ...formattedArticles.map((a) => a.delay_minutes_num)
    );
    const avgSim =
      formattedArticles.reduce((acc, a) => acc + a.similarity_to_lead, 0) /
      formattedArticles.length;

    stories.push({
      id: `cluster-${leadIdx}-${earliestMs}`,
      story_topic: leadArt.title,
      earliest_source: leadArt.source,
      earliest_published_at: formatUtcTimestamp(earliestMs),
      earliest_ms: earliestMs,
      max_delay_minutes: maxDelay,
      source_count: distinctSources.size,
      article_count: formattedArticles.length,
      avg_similarity: Number(avgSim.toFixed(3)),
      articles: formattedArticles,
    });
  }

  stories.sort((a, b) => {
    if (b.source_count !== a.source_count)
      return b.source_count - a.source_count;
    return b.earliest_ms - a.earliest_ms;
  });

  const articlesBySource = new Map<string, number>();
  for (const art of rawArticles) {
    articlesBySource.set(
      art.source,
      (articlesBySource.get(art.source) || 0) + 1
    );
  }

  const outletStats = buildOutletLeaderboard(
    activeFeeds.map((f) => f.source),
    articlesBySource,
    stories
  );

  return {
    generated_at: new Date().toISOString(),
    threshold,
    total_articles: rawArticles.length,
    total_clusters: stories.length,
    multi_source_clusters: stories.filter((s) => s.source_count >= 2).length,
    clustering_engine: "gemini-embedding-2",
    feed_statuses: feedStatuses,
    outlet_stats: outletStats,
    stories,
  };
}

export async function fetchGoogleTrendsRss(
  geo: string
): Promise<LiveTrendItem[]> {
  const safeGeo = ["BD", "US", "GB", "IN"].includes(geo.toUpperCase())
    ? geo.toUpperCase()
    : "BD";
  const url = `https://trends.google.com/trending/rss?geo=${safeGeo}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(9000),
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FirstBreakNewsBot/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });

  if (!response.ok) {
    throw new Error(`Google Trends RSS responded with HTTP ${response.status}`);
  }

  const xml = await response.text();
  const parsed = await trendsParser.parseString(xml);

  return (parsed.items || [])
    .slice(0, 15)
    .map((item) => {
      const newsItems = (item.newsItems || [])
        .slice(0, 3)
        .map((n) => ({
          title: n["ht:news_item_title"]?.[0] || "",
          url: n["ht:news_item_url"]?.[0] || "",
          source: n["ht:news_item_source"]?.[0] || "",
        }))
        .filter((n) => n.title && n.url);

      return {
        keyword: (item.title || "").trim(),
        traffic: item.traffic || "Trending",
        published_at: item.pubDate || "",
        link:
          item.link ||
          `https://trends.google.com/trends/explore?geo=${safeGeo}&q=${encodeURIComponent(item.title || "")}`,
        news_items: newsItems,
      };
    })
    .filter((t) => Boolean(t.keyword));
}

export async function analyzeSearchTrend(params: {
  keyword: string;
  geo?: string;
  lang?: string;
}): Promise<TrendAnalysisResponse> {
  const keyword = params.keyword.trim();
  const geo = (params.geo || "BD").toUpperCase();
  const lang = params.lang === "en" ? "en" : "bn";

  if (!keyword) {
    const err = new Error("অনুগ্রহ করে একটি বিষয় বা শিরোনাম লিখুন।") as Error & {
      status?: number;
    };
    err.status = 400;
    throw err;
  }

  const ai = getGeminiClient();

  const prompt =
    lang === "bn"
      ? `নিচের সংবাদ বা বিষয়টি নিয়ে বর্তমান সার্চ আগ্রহ ও প্রেক্ষাপট বাংলায় সংক্ষেপে বিশ্লেষণ করুন: "${keyword}"।
উত্তর এই ফরম্যাটে দিন:
১. প্রথম লাইনে লিখুন "MOMENTUM:" এবং তার পাশে লিখুন নিচের যেকোনো একটি: তীব্র আলোচনা, সক্রিয় সংবাদ, স্বাভাবিক আগ্রহ, অথবা নির্দিষ্ট বিষয়।
২. এরপর ৩-৪ বাক্যে সহজ ও প্রাঞ্জল বাংলায় বুঝিয়ে লিখুন মানুষ কেন এখন এটি নিয়ে খুঁজছে এবং মূল ঘটনা কী।`
      : `Analyze current search interest and public context for the topic or headline: "${keyword}".
Provide:
1. A single line starting with "MOMENTUM:" followed by one of: High Surge, Active Coverage, Steady Interest, or Niche Topic.
2. A crisp 3-4 sentence newsroom briefing summarizing why people are searching for this right now.`;

  const [liveTrends, groundingResponse] = await Promise.all([
    fetchGoogleTrendsRss(geo).catch(() => [] as LiveTrendItem[]),
    ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }),
  ]);

  const rawText = (groundingResponse.text || "").trim();
  let momentumLabel = lang === "bn" ? "সক্রিয় সংবাদ" : "Active Coverage";
  let summaryText = rawText;

  const momentumMatch = rawText.match(/MOMENTUM:\s*([^\n]+)/i);
  if (momentumMatch) {
    momentumLabel = momentumMatch[1].replace(/[*`]/g, "").trim();
    summaryText = rawText.replace(momentumMatch[0], "").trim();
  }

  const chunks =
    groundingResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const seenUris = new Set<string>();
  const sources: GroundedSource[] = [];

  for (const chunk of chunks) {
    const uri = chunk.web?.uri;
    const title = chunk.web?.title || uri;
    if (uri && !seenUris.has(uri)) {
      seenUris.add(uri);
      sources.push({ uri, title: title || uri });
    }
  }

  const lowerWords = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const matchedLiveTrends = liveTrends.filter((t) => {
    const trendLower = t.keyword.toLowerCase();
    return (
      trendLower.includes(keyword.toLowerCase()) ||
      lowerWords.some((w) => trendLower.includes(w))
    );
  });

  return {
    keyword,
    momentum_label: momentumLabel,
    summary:
      summaryText ||
      (lang === "bn"
        ? "এই বিষয়ে কোনো অতিরিক্ত সারাংশ পাওয়া যায়নি।"
        : "No summary returned."),
    matched_live_trends: matchedLiveTrends,
    sources: sources.slice(0, 6),
    analyzed_at: new Date().toISOString(),
  };
}
