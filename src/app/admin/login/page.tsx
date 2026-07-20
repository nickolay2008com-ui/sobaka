import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/AdminLogin";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Вход в админку", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  return <section className="admin-login-page"><AdminLogin /></section>;
}
