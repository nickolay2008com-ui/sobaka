import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await query("SELECT 1");
    return Response.json({ ok: true, service: "partnership-funnel", time: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }
}
