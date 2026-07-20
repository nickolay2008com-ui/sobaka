import { clearAdminCookie } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const cookie = clearAdminCookie();
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", `${cookie.name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${cookie.secure ? "; Secure" : ""}`);
  return response;
}
