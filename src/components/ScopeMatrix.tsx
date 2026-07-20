"use client";

import { useState } from "react";
import { trackEvent } from "@/components/TrackPage";

const tabs = [
  {
    id: "mine",
    label: "Моя зона",
    title: "Я строю и поддерживаю цифровую машину проекта",
    items: [
      "Продукт: сайт, приложение, личный кабинет или бот",
      "CRM, путь клиента, автоматизация и интеграции",
      "Аналитика, воронка, рекламная инфраструктура",
      "Промо-материалы и система контента для соцсетей",
      "Техническая поддержка, улучшения и документация",
    ],
  },
  {
    id: "partner",
    label: "Зона партнёра",
    title: "Партнёр отвечает за реальную ценность для клиента",
    items: [
      "Экспертиза, метод, материалы и корректность обещаний",
      "Работа с клиентами и исполнение продукта",
      "Участие в интервью, тестах и принятии решений",
      "Юридическая, налоговая и профессиональная ответственность",
      "Своевременная обратная связь и развитие содержательной части",
    ],
  },
  {
    id: "shared",
    label: "Общее",
    title: "Вместе принимаются только решения, влияющие на весь проект",
    items: [
      "Позиционирование, продуктовая стратегия и цена",
      "Бюджеты, приоритеты и ключевые эксперименты",
      "Правила расчёта доли и финансовая отчётность",
      "Права доступа, владение активами и порядок выхода",
      "Квартальные цели и критерии продолжения сотрудничества",
    ],
  },
];

export function ScopeMatrix() {
  const [active, setActive] = useState(tabs[0].id);
  const selected = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className="scope-card">
      <div className="scope-tabs" role="tablist" aria-label="Распределение ответственности">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? "active" : ""}
            onClick={() => {
              setActive(tab.id);
              void trackEvent("scope_tab_opened", { tab: tab.id });
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="scope-content" role="tabpanel">
        <h3>{selected.title}</h3>
        <div className="scope-list">
          {selected.items.map((item, index) => (
            <div key={item} className="scope-item">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
