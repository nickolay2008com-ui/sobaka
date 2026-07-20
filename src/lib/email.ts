import { escapeHtml } from "@/lib/security";
import type { Fit } from "@/lib/types";

async function sendEmail(input: { to: string | string[]; subject: string; html: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("Email delivery is not configured");
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, ...input }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend error ${response.status}: ${details.slice(0, 300)}`);
  }

  return response.json();
}

export async function sendAdminCode(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: "Код входа в админку",
    text: `Код входа: ${code}. Он действует 10 минут.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;padding:24px"><p>Код входа в админку:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</div><p style="color:#666">Код действует 10 минут. Если вы его не запрашивали, просто проигнорируйте письмо.</p></div>`,
  });
}

export async function sendLeadNotification(lead: {
  id: string;
  name: string;
  email: string;
  messenger: string;
  niche: string;
  projectSummary: string;
  score: number;
  fit: Fit;
}) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (!admins.length) return;

  const safe = Object.fromEntries(Object.entries(lead).map(([key, value]) => [key, escapeHtml(String(value))]));
  const appUrl = process.env.APP_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "");
  await sendEmail({
    to: admins,
    subject: `Новая заявка: ${lead.name} · ${lead.score}/100`,
    text: `${lead.name}\n${lead.email}\n${lead.messenger}\n${lead.niche}\n${lead.projectSummary}\nScore: ${lead.score}\nFit: ${lead.fit}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;padding:24px"><h2>Новая партнёрская заявка</h2><p><b>${safe.name}</b> · ${safe.score}/100 · ${safe.fit}</p><p>${safe.email}<br>${safe.messenger}</p><p><b>Ниша:</b> ${safe.niche}</p><p><b>Проект:</b><br>${safe.projectSummary}</p><p>${appUrl ? `<a href="${escapeHtml(appUrl)}/admin">Открыть админку</a>` : "Откройте /admin на домене проекта."}</p></div>`,
  });
}
