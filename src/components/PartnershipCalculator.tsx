"use client";

import { useMemo, useState } from "react";
import { BUSINESS } from "@/lib/content";
import { trackEvent } from "@/components/TrackPage";

function rubles(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export function PartnershipCalculator() {
  const [revenue, setRevenue] = useState(500_000);
  const split = useMemo(() => {
    const technical = Math.round((revenue * BUSINESS.revenueSharePercent) / 100);
    return { technical, partner: revenue - technical };
  }, [revenue]);

  return (
    <div className="calculator-card">
      <div className="calculator-heading">
        <div>
          <span className="eyebrow">Прозрачная экономика</span>
          <h3>Проверьте модель на цифрах</h3>
        </div>
        <span className="status-pill">пример, не прогноз</span>
      </div>

      <label className="range-label" htmlFor="revenue">
        <span>Выручка совместного проекта в месяц</span>
        <b>{rubles(revenue)}</b>
      </label>
      <input
        id="revenue"
        className="range-input"
        type="range"
        min="100000"
        max="3000000"
        step="50000"
        value={revenue}
        onChange={(event) => setRevenue(Number(event.target.value))}
        onPointerUp={() => void trackEvent("economics_calculated", { revenue })}
      />

      <div className="split-grid">
        <div className="split-box accent-box">
          <span>Техническая доля 20%</span>
          <strong>{rubles(split.technical)}</strong>
          <small>разработка, поддержка, автоматизация и рост цифровой системы</small>
        </div>
        <div className="split-box">
          <span>Доля партнёра 80%</span>
          <strong>{rubles(split.partner)}</strong>
          <small>экспертиза, работа с клиентами и содержательная ценность продукта</small>
        </div>
      </div>

      <div className="payment-strip">
        <div><span>Вклад в запуск</span><b>{rubles(BUSINESS.launchContribution)}</b></div>
        <div><span>Первый платёж</span><b>{rubles(BUSINESS.firstPayment)}</b><small>после рабочей первой версии</small></div>
        <div><span>Остаток</span><b>{rubles(BUSINESS.remainingPayment)}</b><small>по согласованным этапам</small></div>
      </div>
      <p className="microcopy">База расчёта доли, рекламные расходы, комиссии, налоги, возвраты и права на активы фиксируются в отдельном соглашении. Иначе цифры быстро превращаются в человеческий фольклор.</p>
    </div>
  );
}
