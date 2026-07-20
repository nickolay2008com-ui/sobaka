import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Технический партнёр для экспертного проекта",
    template: "%s · Техническое партнёрство",
  },
  description:
    "Разработка приложения, CRM, автоматизация, аналитика, промо и реклама в долгосрочном партнёрстве с экспертом.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Технический партнёр для экспертного проекта",
    description: "Вы отвечаете за экспертность и клиентов. Я строю цифровую систему проекта.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
