import Link from "next/link";
import { SITE } from "@/lib/content";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">N</span>
            <span><b>Техническое партнёрство</b><small>не агентство и не потоковая разработка</small></span>
          </div>
          <p className="muted">Цифровая система совместного проекта с ясными ролями, цифрами и ответственностью.</p>
        </div>
        <div className="footer-links">
          <Link href="/partnership">Модель работы</Link>
          <Link href="/apply">Заявка</Link>
          <Link href="/privacy">Конфиденциальность</Link>
          <a href={SITE.allyUrl} target="_blank" rel="noreferrer">Мой проект Ally AI ↗</a>
        </div>
      </div>
    </footer>
  );
}
