"use client";

import { useMemo, useState } from "react";
import { TrackLink } from "@/components/TrackLink";
import { trackEvent } from "@/components/TrackPage";

const questions = [
  {
    key: "expertise",
    title: "У вас уже есть сильная экспертиза, которую можно превратить в продукт?",
    options: [
      { label: "Да, я уже работаю с людьми", value: 2 },
      { label: "Есть метод и опыт, но продукт ещё не собран", value: 1 },
      { label: "Пока только идея", value: 0 },
    ],
  },
  {
    key: "delivery",
    title: "Вы готовы лично отвечать за содержательную работу с клиентами?",
    options: [
      { label: "Да, это моя ключевая роль", value: 2 },
      { label: "Частично, хочу делегировать со временем", value: 1 },
      { label: "Нет, хочу полностью пассивный проект", value: 0 },
    ],
  },
  {
    key: "capital",
    title: "Готовы вложить 100 000 ₽ в запуск по этапам?",
    options: [
      { label: "Да, если вижу рабочий прототип и план", value: 2 },
      { label: "Нужно обсудить график", value: 1 },
      { label: "Нет, нужен запуск без вложений", value: 0 },
    ],
  },
  {
    key: "horizon",
    title: "Какой горизонт сотрудничества вам нужен?",
    options: [
      { label: "Долгосрочный проект и рост", value: 2 },
      { label: "Сначала проверка на 2–3 месяца", value: 1 },
      { label: "Разовая разработка", value: 0 },
    ],
  },
];

export function FunnelQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);

  const complete = step >= questions.length;
  const score = useMemo(() => Object.values(answers).reduce((sum, value) => sum + value, 0), [answers]);
  const fit = score >= 7 ? "strong" : score >= 4 ? "possible" : "weak";

  function answer(key: string, value: number, label: string) {
    if (!started) {
      setStarted(true);
      void trackEvent("qualification_started");
    }
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);
    void trackEvent("qualification_answer", { key, value, label, step: step + 1 });
    const next = step + 1;
    setStep(next);
    if (next === questions.length) {
      const total = Object.values(nextAnswers).reduce((sum, item) => sum + item, 0);
      void trackEvent("qualification_complete", {
        score: total,
        fit: total >= 7 ? "strong" : total >= 4 ? "possible" : "weak",
      });
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setStarted(false);
  }

  return (
    <section className="quiz-card" aria-live="polite">
      <div className="quiz-topline">
        <span className="eyebrow">Быстрая проверка</span>
        <span className="quiz-counter">{Math.min(step + 1, questions.length)}/{questions.length}</span>
      </div>

      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${(Math.min(step, questions.length) / questions.length) * 100}%` }} />
      </div>

      {!complete ? (
        <div className="quiz-body">
          <h2>{questions[step].title}</h2>
          <div className="quiz-options">
            {questions[step].options.map((option) => (
              <button
                key={option.label}
                type="button"
                className="choice-button"
                onClick={() => answer(questions[step].key, option.value, option.label)}
              >
                <span>{option.label}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
          <p className="microcopy">Без регистрации. Ответы нужны только для предварительной оценки формата.</p>
        </div>
      ) : (
        <div className="quiz-result">
          <span className={`fit-orb fit-${fit}`} />
          <span className="eyebrow">Предварительный результат</span>
          <h2>
            {fit === "strong" && "У проекта есть хорошая база для партнёрства"}
            {fit === "possible" && "Формат возможен, но нужно сверить роли и экономику"}
            {fit === "weak" && "Сейчас вам, вероятно, полезнее другой формат"}
          </h2>
          <p>
            {fit === "strong" && "Следующий экран покажет точные границы моей роли, этапы, деньги и защиту обеих сторон."}
            {fit === "possible" && "Следующий экран поможет понять, что нужно уточнить до заявки, без взаимных ожиданий из воздуха."}
            {fit === "weak" && "Я не продаю разработку любой ценой. Партнёрство имеет смысл, когда эксперт готов вести содержательную часть и вкладываться в запуск."}
          </p>
          <div className="button-row">
            {fit !== "weak" ? (
              <TrackLink className="button button-primary" href="/partnership" eventName="qualification_continue">
                Посмотреть модель партнёрства <span>→</span>
              </TrackLink>
            ) : (
              <TrackLink className="button button-secondary" href="/partnership" eventName="qualification_review_anyway">
                Всё равно изучить условия
              </TrackLink>
            )}
            <button className="text-button" type="button" onClick={reset}>Пройти заново</button>
          </div>
        </div>
      )}
    </section>
  );
}
