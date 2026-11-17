import type { IncomingMessage, ServerResponse } from "http";
import { analyzeSearchTrend, extractReadableError } from "../../server/newsService";

interface VercelLikeRequest extends IncomingMessage {
  body?: unknown;
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
    const body = await readJsonBody(req);
    const keyword = String(body.keyword || "");
    const geo = String(body.geo || "BD");
    const lang = String(body.lang || "bn");
    const payload = await analyzeSearchTrend({ keyword, geo, lang });
    res.statusCode = 200;
    res.end(JSON.stringify(payload));
  } catch (err) {
    const { status, message } = extractReadableError(
      err,
      "সার্চ জনপ্রিয়তা বিশ্লেষণ করা যায়নি।"
    );
    res.statusCode = status;
    res.end(JSON.stringify({ error: message }));
  }
}
