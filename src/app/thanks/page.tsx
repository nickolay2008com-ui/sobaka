import type { Metadata } from "next";
import Link from "next/link";
import { FIT_LABELS } from "@/lib/content";
import type { Fit } from "@/lib/types";

export const metadata: Metadata = { title: "Заявка принята" };

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ fit?: string; id?: string }> }) {
  const params = await searchParams;
  const fit: Fit = params.fit === "qualified" || params.fit === "conditional" || params.fit === "not_fit" ? params.fit : "conditional";

  return (
    <section className="thanks-page">
      <div className="shell narrow-shell">
        <div className={`thanks-card thanks-${fit}`}>
          <span className="thanks-icon">✓</span>
          <span className="eyebrow">Заявка сохранена</span>
          <h1>{FIT_LABELS[fit]}</h1>
          <p>
            {fit === "qualified" && "Я изучу материалы и отвечу с предметной оценкой: что можно собрать первым, где главный риск и какой формат партнёрства выглядит разумным."}
            {fit === "conditional" && "Я посмотрю, можно ли снять несоответствие короткой сверкой условий. Ответ будет честным, даже если правильным решением окажется не начинать."}
            {fit === "not_fit" && "Я всё равно посмотрю заявку. Если партнёрство сейчас преждевременно, укажу, какую опору стоит создать прежде, чем вкладываться в разработку."}
          </p>
          <div className="next-steps"><div><span>01</span><p><b>Проверка заявки</b><small>Проект, роль, ресурс и реалистичность обещаний.</small></p></div><div><span>02</span><p><b>Ответ по существу</b><small>Без автоматической продажи и давления.</small></p></div><div><span>03</span><p><b>Сверка и меморандум</b><small>Только если обе стороны видят смысл продолжать.</small></p></div></div>
          <Link className="button button-secondary" href="/">Вернуться на главную</Link>
          {params.id && <small className="application-id">Номер заявки: {params.id.slice(0, 8)}</small>}
        </div>
      </div>
    </section>
  );
}
