import { adminCookie, createSessionToken, isAllowedAdmin, verifyAdminCode } from "@/lib/auth";
import { assertSameOrigin, checkRateLimit, cleanText, getClientIp, hashIp, isEmail } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return Response.json({ ok: false, error: "Недопустимый запрос." }, { status: 403 });

  try {
    const body = (await request.json()) as { email?: string; code?: string };
    const email = cleanText(body.email, 254).toLowerCase();
    const code = cleanText(body.code, 6);
    const ipHash = hashIp(getClientIp(request));
    if (!isEmail(email) || !/^\d{6}$/.test(code) || !isAllowedAdmin(email)) {
      return Response.json({ ok: false, error: "Неверный email или код." }, { status: 400 });
    }
    if (!(await checkRateLimit(`admin-verify:${ipHash}`, 15, 900))) {
      return Response.json({ ok: false, error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
    }

    const valid = await verifyAdminCode(email, code);
    if (!valid) return Response.json({ ok: false, error: "Код неверен или устарел." }, { status: 401 });

    const response = Response.json({ ok: true });
    response.headers.append("Cache-Control", "no-store");
    const cookie = adminCookie(createSessionToken(email));
    response.headers.append(
      "Set-Cookie",
      `${cookie.name}=${cookie.value}; Path=${cookie.path}; Max-Age=${cookie.maxAge}; HttpOnly; SameSite=Strict${cookie.secure ? "; Secure" : ""}`,
    );
    return response;
  } catch (error) {
    console.error("verify admin code error", error);
    return Response.json({ ok: false, error: "Не удалось проверить код." }, { status: 500 });
  }
}
