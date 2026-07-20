import crypto from "node:crypto";
import { query } from "@/lib/db";

export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function hashIp(ip: string) {
  const salt = process.env.ANALYTICS_SALT || process.env.ADMIN_SESSION_SECRET || "development-salt";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}

export function deviceFromAgent(agent: string) {
  if (/tablet|ipad/i.test(agent)) return "tablet";
  if (/mobile|android|iphone/i.test(agent)) return "mobile";
  return "desktop";
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const bucketNumber = Math.floor(now / (windowSeconds * 1000));
  const bucket = String(bucketNumber);
  const expiresAt = new Date((bucketNumber + 1) * windowSeconds * 1000);

  const result = await query<{ hits: number }>(
    `INSERT INTO rate_limits (rate_key, bucket, hits, expires_at)
     VALUES ($1, $2, 1, $3)
     ON CONFLICT (rate_key, bucket)
     DO UPDATE SET hits = rate_limits.hits + 1
     RETURNING hits`,
    [key, bucket, expiresAt],
  );

  return result.rows[0].hits <= limit;
}
