import type { IncomingMessage, ServerResponse } from "http";
import { clusterNewsFeeds, extractReadableError } from "./_lib/newsService.js";
import type { FeedConfig } from "../src/types/news.js";

interface VercelLikeRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
}

async function readJsonBody(req: VercelLikeRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === "object") {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body) as Record<string, unknown>;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const body = req.method === "POST" ? await readJsonBody(req) : {};
    const feeds = Array.isArray(body.feeds) ? (body.feeds as FeedConfig[]) : null;
    const threshold = Number(
      body.threshold ?? url.searchParams.get("threshold") ?? 0.7
    );
    const limit = Number(body.limit ?? url.searchParams.get("limit") ?? 8);

    const payload = await clusterNewsFeeds({ feeds, threshold, limit });
    res.statusCode = 200;
    res.end(JSON.stringify(payload));
  } catch (err) {
    const { status, message } = extractReadableError(
      err,
      "খবর সংগ্রহ ও প্রক্রিয়াকরণে সমস্যা হয়েছে।"
    );
    res.statusCode = status;
    res.end(JSON.stringify({ error: message }));
  }
}
