import crypto from "node:crypto";
import { createAdminCode, isAllowedAdmin } from "@/lib/auth";
import { sendAdminCode } from "@/lib/email";
import { assertSameOrigin, checkRateLimit, cleanText, getClientIp, hashIp, isEmail } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return Response.json({ ok: false, error: "Недопустимый запрос." }, { status: 403 });

  try {
    const body = (await request.json()) as { email?: string };
    const email = cleanText(body.email, 254).toLowerCase();
    const ipHash = hashIp(getClientIp(request));
    if (!isEmail(email)) return Response.json({ ok: false, error: "Проверьте email." }, { status: 400 });
    if (!(await checkRateLimit(`admin-code-ip:${ipHash}`, 8, 900)) || !(await checkRateLimit(`admin-code-email:${email}`, 5, 900))) {
      return Response.json({ ok: false, error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
    }
    if (!isAllowedAdmin(email)) {
      return Response.json({ ok: false, error: "Этот адрес не имеет доступа к админке." }, { status: 403 });
    }

    const code = String(crypto.randomInt(100000, 1_000_000));
    await createAdminCode(email, code);
    await sendAdminCode(email, code);

    return Response.json({
      ok: true,
      message: "Код отправлен на указанную почту.",
      ...(process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY ? { devCode: code } : {}),
    });
  } catch (error) {
    console.error("request admin code error", error);
    return Response.json({ ok: false, error: "Не удалось отправить код. Проверьте почтовые переменные." }, { status: 503 });
  }
}
