import "dotenv/config";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  analyzeSearchTrend,
  clusterNewsFeeds,
  DEFAULT_FEEDS,
  extractReadableError,
  fetchGoogleTrendsRss,
} from "./api/_lib/newsService.js";
import type { FeedConfig } from "./src/types/news.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/default-feeds", (_req: Request, res: Response) => {
    res.json({ feeds: DEFAULT_FEEDS });
  });

  const handleClusterNews = async (req: Request, res: Response) => {
    try {
      const feeds = Array.isArray(req.body?.feeds)
        ? (req.body.feeds as FeedConfig[])
        : null;
      const threshold = Number(req.body?.threshold ?? req.query.threshold ?? 0.7);
      const limit = Number(req.body?.limit ?? req.query.limit ?? 8);

      const payload = await clusterNewsFeeds({ feeds, threshold, limit });
      return res.json(payload);
    } catch (err) {
      const { status, message } = extractReadableError(
        err,
        "খবর সংগ্রহ ও প্রক্রিয়াকরণে সমস্যা হয়েছে।"
      );
      console.error("Cluster error:", message);
      return res.status(status).json({ error: message });
    }
  };

  app.get("/api/cluster-news", handleClusterNews);
  app.post("/api/cluster-news", handleClusterNews);

  app.get("/api/trends/live", async (req: Request, res: Response) => {
    try {
      const geo = String(req.query.geo || "BD").toUpperCase();
      const trends = await fetchGoogleTrendsRss(geo);
      return res.json({
        geo,
        fetched_at: new Date().toISOString(),
        trends,
      });
    } catch (err) {
      const { status, message } = extractReadableError(
        err,
        "ট্রেন্ডিং তালিকা লোড করা যায়নি।"
      );
      return res.status(status >= 400 ? status : 502).json({ error: message });
    }
  });

  app.post("/api/trends/analyze", async (req: Request, res: Response) => {
    try {
      const keyword = String(req.body?.keyword || "");
      const geo = String(req.body?.geo || "BD");
      const lang = String(req.body?.lang || "bn");
      const payload = await analyzeSearchTrend({ keyword, geo, lang });
      return res.json(payload);
    } catch (err) {
      const { status, message } = extractReadableError(
        err,
        "সার্চ জনপ্রিয়তা বিশ্লেষণ করা যায়নি।"
      );
      console.error("Trend analysis error:", message);
      return res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build output not found. Run npm run build first.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FirstBreak server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
