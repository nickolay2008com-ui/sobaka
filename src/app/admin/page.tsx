import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Админка", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <section className="admin-page"><div className="shell admin-wide"><AdminDashboard email={session.email} /></div></section>;
}
