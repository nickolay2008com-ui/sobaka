import crypto from "node:crypto";
import { query } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";
import { scoreLead } from "@/lib/scoring";
import { assertSameOrigin, checkRateLimit, cleanText, getClientIp, hashIp, isEmail, isUuid } from "@/lib/security";
import type { LeadPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return Response.json({ ok: false, error: "Недопустимый источник запроса." }, { status: 403 });

  try {
    const raw = (await request.json()) as Partial<LeadPayload>;
    const sessionId = cleanText(raw.sessionId, 64);
    const ipHash = hashIp(getClientIp(request));
    if (!(await checkRateLimit(`lead:${ipHash}`, 5, 3600))) {
      return Response.json({ ok: false, error: "Слишком много отправок. Попробуйте позже." }, { status: 429 });
    }

    const payload: LeadPayload = {
      sessionId,
      name: cleanText(raw.name, 100),
      email: cleanText(raw.email, 254).toLowerCase(),
      messenger: cleanText(raw.messenger, 160),
      niche: cleanText(raw.niche, 120),
      projectSummary: cleanText(raw.projectSummary, 1800),
      proof: cleanText(raw.proof, 1400),
      currentClients: cleanText(raw.currentClients, 900),
      budgetReady: raw.budgetReady === true,
      roleReady: raw.roleReady === true,
      longTermReady: raw.longTermReady === true,
      timeReady: raw.timeReady === true,
      ethicsConfirmed: raw.ethicsConfirmed === true,
      consent: raw.consent === true,
      answers: typeof raw.answers === "object" && raw.answers ? raw.answers : {},
    };

    if (!isUuid(payload.sessionId) || payload.name.length < 2 || !isEmail(payload.email) || payload.niche.length < 3 || payload.projectSummary.length < 40 || !payload.consent) {
      return Response.json({ ok: false, error: "Проверьте обязательные поля заявки." }, { status: 400 });
    }

    if (!payload.ethicsConfirmed) {
      return Response.json({ ok: false, error: "Партнёрство доступно только для законных и этичных проектов." }, { status: 400 });
    }

    const { score, fit } = scoreLead(payload);
    const id = crypto.randomUUID();
    const answersJson = JSON.stringify(payload.answers || {}).slice(0, 20_000);

    await query(
      `INSERT INTO leads (
        id, session_id, name, email, messenger, niche, project_summary, proof, current_clients,
        budget_ready, role_ready, long_term_ready, time_ready, ethics_confirmed,
        score, fit, answers, consent
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18)`,
      [
        id,
        payload.sessionId,
        payload.name,
        payload.email,
        payload.messenger || "",
        payload.niche,
        payload.projectSummary,
        payload.proof || "",
        payload.currentClients || "",
        payload.budgetReady,
        payload.roleReady,
        payload.longTermReady,
        payload.timeReady,
        payload.ethicsConfirmed,
        score,
        fit,
        answersJson,
        payload.consent,
      ],
    );

    await query(
      `INSERT INTO funnel_events (session_id, event_name, path, data)
       VALUES ($1, 'lead_created', '/apply', $2::jsonb)`,
      [payload.sessionId, JSON.stringify({ leadId: id, fit, score })],
    );

    void sendLeadNotification({
      id,
      name: payload.name,
      email: payload.email,
      messenger: payload.messenger || "",
      niche: payload.niche,
      projectSummary: payload.projectSummary,
      score,
      fit,
    }).catch((error) => console.error("lead notification error", error));

    return Response.json({ ok: true, id, score, fit });
  } catch (error) {
    console.error("lead error", error);
    return Response.json({ ok: false, error: "Сервис временно недоступен. Попробуйте ещё раз." }, { status: 500 });
  }
}
