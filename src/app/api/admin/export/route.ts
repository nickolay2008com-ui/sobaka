import { getAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

function csv(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const requestedDays = Number(url.searchParams.get("days") || 30);
  const days = [7, 30, 90, 365].includes(requestedDays) ? requestedDays : 30;

  const result = await query<{
    created_at: string;
    name: string;
    email: string;
    messenger: string;
    niche: string;
    project_summary: string;
    proof: string;
    current_clients: string;
    score: number;
    fit: string;
    status: string;
    admin_notes: string;
  }>(
    `SELECT created_at::text, name, email, messenger, niche, project_summary, proof, current_clients, score, fit, status, admin_notes
     FROM leads
     WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
     ORDER BY created_at DESC`,
    [days],
  );

  const headers = ["created_at", "name", "email", "messenger", "niche", "project_summary", "proof", "current_clients", "score", "fit", "status", "admin_notes"];
  const rows = result.rows.map((row) => headers.map((key) => csv(row[key as keyof typeof row])).join(","));
  const content = "\uFEFF" + [headers.join(","), ...rows].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="partnership-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
