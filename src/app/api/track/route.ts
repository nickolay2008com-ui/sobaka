import { query } from "@/lib/db";
import { assertSameOrigin, checkRateLimit, cleanText, deviceFromAgent, getClientIp, hashIp, isUuid } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return Response.json({ ok: false }, { status: 403 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const sessionId = cleanText(body.sessionId, 64);
    const eventName = cleanText(body.eventName, 80);
    const path = cleanText(body.path, 300) || "/";
    if (!isUuid(sessionId) || !/^[a-z0-9_:-]{2,80}$/i.test(eventName)) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    if (!(await checkRateLimit(`track:${ipHash}`, 400, 3600))) {
      return Response.json({ ok: true, limited: true });
    }

    const referrer = cleanText(body.referrer, 1000);
    const userAgent = cleanText(request.headers.get("user-agent"), 1000);
    const utm = typeof body.utm === "object" && body.utm ? (body.utm as Record<string, unknown>) : {};
    const data = typeof body.data === "object" && body.data ? body.data : {};

    await query(
      `INSERT INTO visitor_sessions (
        id, first_path, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, user_agent, device, ip_hash
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (id) DO UPDATE SET last_seen_at = NOW()`,
      [
        sessionId,
        path,
        referrer,
        cleanText(utm.source, 200),
        cleanText(utm.medium, 200),
        cleanText(utm.campaign, 300),
        cleanText(utm.content, 300),
        cleanText(utm.term, 300),
        userAgent,
        deviceFromAgent(userAgent),
        ipHash,
      ],
    );

    await query(
      `INSERT INTO funnel_events (session_id, event_name, path, data)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [sessionId, eventName, path, JSON.stringify(data).slice(0, 10_000)],
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("track error", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
