import type { IncomingMessage, ServerResponse } from "http";
import { extractReadableError, fetchGoogleTrendsRss } from "../_lib/newsService.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const geo = (url.searchParams.get("geo") || "BD").toUpperCase();
    const trends = await fetchGoogleTrendsRss(geo);
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        geo,
        fetched_at: new Date().toISOString(),
        trends,
      })
    );
  } catch (err) {
    const { status, message } = extractReadableError(
      err,
      "ট্রেন্ডিং তালিকা লোড করা যায়নি।"
    );
    res.statusCode = status >= 400 ? status : 502;
    res.end(JSON.stringify({ error: message }));
  }
}
