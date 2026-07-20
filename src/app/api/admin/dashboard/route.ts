import { getAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

function asNumber(value: unknown) {
  return Number(value || 0);
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const requestedDays = Number(url.searchParams.get("days") || 30);
  const days = [7, 30, 90, 365].includes(requestedDays) ? requestedDays : 30;

  try {
    const [metricResult, sourceResult, dailyResult, leadResult] = await Promise.all([
      query<{
        visitors: string;
        partnership_views: string;
        apply_starts: string;
        submissions: string;
        qualified: string;
      }>(
        `SELECT
          (SELECT COUNT(DISTINCT session_id) FROM funnel_events WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')) AS visitors,
          (SELECT COUNT(DISTINCT session_id) FROM funnel_events WHERE event_name = 'partnership_view' AND created_at >= NOW() - ($1::int * INTERVAL '1 day')) AS partnership_views,
          (SELECT COUNT(DISTINCT session_id) FROM funnel_events WHERE event_name = 'apply_started' AND created_at >= NOW() - ($1::int * INTERVAL '1 day')) AS apply_starts,
          (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')) AS submissions,
          (SELECT COUNT(*) FROM leads WHERE fit = 'qualified' AND created_at >= NOW() - ($1::int * INTERVAL '1 day')) AS qualified`,
        [days],
      ),
      query<{ source: string; visitors: string; leads: string }>(
        `SELECT
          CASE
            WHEN NULLIF(v.utm_source, '') IS NOT NULL THEN v.utm_source
            WHEN NULLIF(v.referrer, '') IS NOT NULL THEN regexp_replace(v.referrer, '^https?://([^/]+).*$','\\1')
            ELSE 'direct'
          END AS source,
          COUNT(DISTINCT v.id) AS visitors,
          COUNT(DISTINCT l.id) AS leads
        FROM visitor_sessions v
        LEFT JOIN leads l ON l.session_id = v.id AND l.created_at >= NOW() - ($1::int * INTERVAL '1 day')
        WHERE v.created_at >= NOW() - ($1::int * INTERVAL '1 day')
        GROUP BY 1
        ORDER BY visitors DESC
        LIMIT 20`,
        [days],
      ),
      query<{ day: string; visitors: string; leads: string }>(
        `WITH calendar AS (
          SELECT generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, INTERVAL '1 day')::date AS day
        ), event_daily AS (
          SELECT created_at::date AS day, COUNT(DISTINCT session_id) AS visitors
          FROM funnel_events
          WHERE created_at >= CURRENT_DATE - ($1::int - 1)
          GROUP BY 1
        ), lead_daily AS (
          SELECT created_at::date AS day, COUNT(*) AS leads
          FROM leads
          WHERE created_at >= CURRENT_DATE - ($1::int - 1)
          GROUP BY 1
        )
        SELECT to_char(c.day, 'YYYY-MM-DD') AS day,
               COALESCE(e.visitors, 0)::text AS visitors,
               COALESCE(l.leads, 0)::text AS leads
        FROM calendar c
        LEFT JOIN event_daily e USING (day)
        LEFT JOIN lead_daily l USING (day)
        ORDER BY c.day`,
        [days],
      ),
      query<{
        id: string;
        created_at: string;
        name: string;
        email: string;
        messenger: string;
        niche: string;
        project_summary: string;
        score: number;
        fit: "qualified" | "conditional" | "not_fit";
        status: string;
        admin_notes: string;
      }>(
        `SELECT id, created_at::text, name, email, messenger, niche, project_summary, score, fit, status, admin_notes
         FROM leads
         WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
         ORDER BY created_at DESC
         LIMIT 100`,
        [days],
      ),
    ]);

    const raw = metricResult.rows[0];
    const visitors = asNumber(raw.visitors);
    const partnershipViews = asNumber(raw.partnership_views);
    const applyStarts = asNumber(raw.apply_starts);
    const submissions = asNumber(raw.submissions);
    const qualified = asNumber(raw.qualified);
    const conversion = visitors ? (submissions / visitors) * 100 : 0;

    const funnelBase = visitors || 1;
    const funnel = [
      { label: "Посетители", value: visitors, rate: visitors ? 100 : 0 },
      { label: "Изучили условия", value: partnershipViews, rate: (partnershipViews / funnelBase) * 100 },
      { label: "Начали заявку", value: applyStarts, rate: (applyStarts / funnelBase) * 100 },
      { label: "Отправили заявку", value: submissions, rate: (submissions / funnelBase) * 100 },
      { label: "Сильный fit", value: qualified, rate: (qualified / funnelBase) * 100 },
    ];

    return Response.json({
      rangeDays: days,
      metrics: { visitors, partnershipViews, applyStarts, submissions, qualified, conversion },
      funnel,
      sources: sourceResult.rows.map((row) => ({ source: row.source || "direct", visitors: asNumber(row.visitors), leads: asNumber(row.leads) })),
      daily: dailyResult.rows.map((row) => ({ day: row.day, visitors: asNumber(row.visitors), leads: asNumber(row.leads) })),
      leads: leadResult.rows.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        name: row.name,
        email: row.email,
        messenger: row.messenger,
        niche: row.niche,
        projectSummary: row.project_summary,
        score: row.score,
        fit: row.fit,
        status: row.status,
        adminNotes: row.admin_notes,
      })),
    });
  } catch (error) {
    console.error("dashboard error", error);
    return Response.json({ error: "dashboard_unavailable" }, { status: 500 });
  }
}
