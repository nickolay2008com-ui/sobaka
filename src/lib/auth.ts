import crypto from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

const COOKIE_NAME = "partner_admin";
const SESSION_SECONDS = 60 * 60 * 12;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  return value;
}

export function allowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string) {
  return allowedAdminEmails().includes(email.toLowerCase());
}

export function hashAdminCode(email: string, code: string) {
  return crypto.createHmac("sha256", secret()).update(`${email.toLowerCase()}:${code}`).digest("hex");
}

export async function createAdminCode(email: string, code: string) {
  await query(
    `INSERT INTO admin_codes (email, code_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
    [email.toLowerCase(), hashAdminCode(email, code)],
  );
}

export async function verifyAdminCode(email: string, code: string) {
  const result = await query<{
    id: number;
    code_hash: string;
    attempts: number;
  }>(
    `SELECT id, code_hash, attempts
     FROM admin_codes
     WHERE email = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [email.toLowerCase()],
  );

  const row = result.rows[0];
  if (!row || row.attempts >= 5) return false;

  const expected = Buffer.from(row.code_hash, "hex");
  const actual = Buffer.from(hashAdminCode(email, code), "hex");
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

  await query(
    `UPDATE admin_codes
     SET attempts = attempts + 1, used_at = CASE WHEN $2 THEN NOW() ELSE used_at END
     WHERE id = $1`,
    [row.id, matches],
  );

  return matches;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({ email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (expected.length !== signature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email: string; exp: number };
    if (data.exp < Math.floor(Date.now() / 1000) || !isAllowedAdmin(data.email)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export function adminCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

export function clearAdminCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };
}
