import { getAdminSession } from "@/lib/auth";
import { LEAD_STATUSES } from "@/lib/content";
import { query } from "@/lib/db";
import { assertSameOrigin, cleanText, isUuid } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!assertSameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "invalid_id" }, { status: 400 });

  try {
    const body = (await request.json()) as { status?: string; adminNotes?: string };
    const status = cleanText(body.status, 30);
    const adminNotes = cleanText(body.adminNotes, 2000);
    if (!LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
      return Response.json({ error: "invalid_status" }, { status: 400 });
    }

    const result = await query<{ id: string }>(
      `UPDATE leads SET status = $2, admin_notes = $3, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id, status, adminNotes],
    );
    if (!result.rowCount) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("lead update error", error);
    return Response.json({ error: "update_failed" }, { status: 500 });
  }
}
