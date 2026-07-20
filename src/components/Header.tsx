import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="На главную">
          <span className="brand-mark">N</span>
          <span>
            <b>Николай</b>
            <small>техническое партнёрство</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <Link href="/">Подход</Link>
          <Link href="/partnership">Условия</Link>
          <Link className="nav-cta" href="/apply">Проверить проект</Link>
        </nav>
      </div>
    </header>
  );
}
