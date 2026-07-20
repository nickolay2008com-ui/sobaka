"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredSessionId, trackEvent } from "@/components/TrackPage";
import type { Fit, LeadPayload } from "@/lib/types";

const TOTAL_STEPS = 5;

type FormState = Omit<LeadPayload, "sessionId">;

const initialState: FormState = {
  name: "",
  email: "",
  messenger: "",
  niche: "",
  projectSummary: "",
  proof: "",
  currentClients: "",
  budgetReady: false,
  roleReady: false,
  longTermReady: false,
  timeReady: false,
  ethicsConfirmed: false,
  consent: false,
  answers: {},
};

function scoreForm(form: FormState): { score: number; fit: Fit } {
  let score = 0;
  if (form.budgetReady) score += 25;
  if (form.roleReady) score += 25;
  if (form.longTermReady) score += 20;
  if (form.timeReady) score += 10;
  if (form.ethicsConfirmed) score += 10;
  if ((form.proof || "").length >= 20) score += 5;
  if ((form.currentClients || "").length >= 10) score += 5;
  return { score, fit: score >= 75 ? "qualified" : score >= 50 ? "conditional" : "not_fit" };
}

function BinaryChoice({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="binary-card">
      <div>
        <b>{label}</b>
        <p>{description}</p>
      </div>
      <div className="binary-buttons" role="group" aria-label={label}>
        <button type="button" className={value ? "active" : ""} onClick={() => onChange(true)}>Да</button>
        <button type="button" className={!value ? "active negative" : ""} onClick={() => onChange(false)}>Нет</button>
      </div>
    </div>
  );
}

export function ApplicationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const assessment = useMemo(() => scoreForm(form), [form]);

  useEffect(() => {
    void trackEvent("apply_started");
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function validateCurrentStep() {
    if (step === 0) {
      if (form.niche.trim().length < 3) return "Укажите нишу или область экспертизы.";
      if (form.projectSummary.trim().length < 40) return "Опишите проект чуть конкретнее: для кого он и какую задачу решает.";
    }
    if (step === 1 && (form.proof || "").trim().length < 20) {
      return "Добавьте хотя бы один признак реальной экспертизы: опыт, кейсы, аудитория или практика.";
    }
    if (step === 2 && !form.ethicsConfirmed) {
      return "Партнёрство возможно только для законного и этичного продукта с честными обещаниями клиенту.";
    }
    if (step === 3) {
      if (form.name.trim().length < 2) return "Укажите имя.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Проверьте адрес электронной почты.";
      if (!form.consent) return "Нужно согласие на обработку заявки и обратную связь.";
    }
    return "";
  }

  function next() {
    const message = validateCurrentStep();
    if (message) {
      setError(message);
      return;
    }
    const nextStep = Math.min(step + 1, TOTAL_STEPS - 1);
    void trackEvent("apply_step_completed", { step: step + 1, nextStep: nextStep + 1 });
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setError("");
    setStep((current) => Math.max(0, current - 1));
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const payload: LeadPayload = {
        ...form,
        sessionId: getStoredSessionId(),
        answers: {
          assessment,
          submittedFrom: window.location.pathname,
        },
      };
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; id?: string; fit?: Fit; error?: string };
      if (!response.ok || !result.ok || !result.id || !result.fit) {
        throw new Error(result.error || "Не удалось отправить заявку.");
      }
      void trackEvent("lead_submitted", { fit: result.fit, score: assessment.score });
      router.push(`/thanks?fit=${result.fit}&id=${encodeURIComponent(result.id)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось отправить заявку. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  }

  return (
    <div className="application-shell">
      <aside className="application-sidebar">
        <span className="eyebrow">Проверка совместимости</span>
        <h2>Не собеседование. Сверка реальности.</h2>
        <p>Заявка нужна, чтобы не тратить недели на разговоры, когда роли, ресурсы или ожидания изначально не сходятся.</p>
        <div className="application-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div key={index} className={index < step ? "done" : index === step ? "active" : ""}>
              <span>{index < step ? "✓" : index + 1}</span>
              <small>{["Проект", "Опора", "Готовность", "Контакт", "Итог"][index]}</small>
            </div>
          ))}
        </div>
        <div className="score-preview">
          <span>Текущая совместимость</span>
          <b>{assessment.score}/100</b>
          <div className="score-track"><span style={{ width: `${assessment.score}%` }} /></div>
        </div>
      </aside>

      <section className="application-card" aria-live="polite">
        {step === 0 && (
          <div className="form-step">
            <span className="step-label">01 · Проект</span>
            <h1>Что вы хотите реализовать?</h1>
            <p className="form-lead">Не нужен идеальный питч. Нужна понятная задача, аудитория и ваша роль.</p>
            <label className="field">
              <span>Ниша или область экспертизы</span>
              <input value={form.niche} onChange={(event) => update("niche", event.target.value)} maxLength={120} placeholder="Например: психология отношений, образование, консалтинг" />
            </label>
            <label className="field">
              <span>Суть проекта</span>
              <textarea value={form.projectSummary} onChange={(event) => update("projectSummary", event.target.value)} maxLength={1800} rows={7} placeholder="Для кого проект, какую проблему решает, что человек получает и как вы будете с ним работать?" />
              <small>{form.projectSummary.length}/1800</small>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="form-step">
            <span className="step-label">02 · Опора</span>
            <h1>На чём держится ваша экспертность?</h1>
            <p className="form-lead">Диплом полезен, но живой опыт и доказательства обычно говорят громче любых рамочек на стене.</p>
            <label className="field">
              <span>Опыт, кейсы, метод, аудитория или результаты</span>
              <textarea value={form.proof} onChange={(event) => update("proof", event.target.value)} maxLength={1400} rows={6} placeholder="Что показывает, что вы можете создавать реальную ценность для клиентов?" />
            </label>
            <label className="field">
              <span>Текущие клиенты или способ привлечения</span>
              <textarea value={form.currentClients} onChange={(event) => update("currentClients", event.target.value)} maxLength={900} rows={4} placeholder="Есть ли клиенты, подписчики, база, рекомендации, выступления или понятный доступ к аудитории?" />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <span className="step-label">03 · Готовность</span>
            <h1>Пять вещей, без которых партнёрство не работает</h1>
            <div className="binary-list">
              <BinaryChoice label="Вклад в запуск" description="Готовы вложить 100 000 ₽ по этапам, первый платёж 20 000 ₽ после рабочей первой версии." value={form.budgetReady} onChange={(value) => update("budgetReady", value)} />
              <BinaryChoice label="Содержательная роль" description="Готовы лично отвечать за экспертность, работу с клиентами и качество результата." value={form.roleReady} onChange={(value) => update("roleReady", value)} />
              <BinaryChoice label="Долгий горизонт" description="Ищете не разовую разработку, а устойчивый совместный проект." value={form.longTermReady} onChange={(value) => update("longTermReady", value)} />
              <BinaryChoice label="Время на решения" description="Можете участвовать в интервью, тестах и давать обратную связь без недель молчания." value={form.timeReady} onChange={(value) => update("timeReady", value)} />
              <BinaryChoice label="Этика и законность" description="Продукт не строится на обмане, опасных обещаниях или серых схемах." value={form.ethicsConfirmed} onChange={(value) => update("ethicsConfirmed", value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <span className="step-label">04 · Контакт</span>
            <h1>Куда отправить результат сверки?</h1>
            <p className="form-lead">Контакты не передаются третьим лицам и не отправляются в унылую рассылочную мясорубку.</p>
            <div className="field-grid">
              <label className="field"><span>Имя</span><input value={form.name} onChange={(event) => update("name", event.target.value)} maxLength={100} autoComplete="name" /></label>
              <label className="field"><span>Email</span><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} maxLength={254} autoComplete="email" /></label>
            </div>
            <label className="field"><span>Telegram или другой удобный контакт</span><input value={form.messenger} onChange={(event) => update("messenger", event.target.value)} maxLength={160} placeholder="@username или номер" /></label>
            <label className="consent-row">
              <input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} />
              <span>Согласен на обработку данных заявки и обратную связь по проекту. Подробности в <a href="/privacy" target="_blank">политике конфиденциальности</a>.</span>
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="form-step review-step">
            <span className="step-label">05 · Предварительный итог</span>
            <div className={`assessment-badge assessment-${assessment.fit}`}>
              <span>{assessment.score}</span>
              <small>из 100</small>
            </div>
            <h1>
              {assessment.fit === "qualified" && "Есть сильная основа для разговора"}
              {assessment.fit === "conditional" && "Нужна короткая сверка условий"}
              {assessment.fit === "not_fit" && "Сейчас формат, вероятно, не совпадает"}
            </h1>
            <p className="form-lead">
              {assessment.fit === "qualified" && "После заявки я изучу проект и отвечу по существу: что вижу, где риск и какой первый рабочий контур разумно собрать."}
              {assessment.fit === "conditional" && "Это не отказ. Скорее всего, нужно уточнить бюджет, распределение ролей или готовность к долгому горизонту."}
              {assessment.fit === "not_fit" && "Заявку всё равно можно отправить. Я не стану притворяться, что любой проект подходит, но дам честный ответ, что должно измениться."}
            </p>
            <div className="review-grid">
              <div><span>Проект</span><b>{form.niche}</b><p>{form.projectSummary}</p></div>
              <div><span>Контакт</span><b>{form.name}</b><p>{form.email}<br />{form.messenger}</p></div>
            </div>
            <div className="trust-note"><b>Что произойдёт после отправки</b><p>Заявка попадёт в закрытую админку. Если формат реалистичен, вы получите предложение короткой сверки. Никаких оплат до согласованной модели и первой рабочей версии.</p></div>
          </div>
        )}

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-actions">
          {step > 0 ? <button className="button button-secondary" type="button" onClick={back}>← Назад</button> : <span />}
          {step < TOTAL_STEPS - 1 ? (
            <button className="button button-primary" type="button" onClick={next}>Продолжить →</button>
          ) : (
            <button className="button button-primary" type="button" disabled={submitting} onClick={submit}>{submitting ? "Отправляю…" : "Отправить заявку →"}</button>
          )}
        </div>
      </section>
    </div>
  );
}
