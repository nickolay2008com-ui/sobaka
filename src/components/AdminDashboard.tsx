"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FIT_LABELS, LEAD_STATUSES, STATUS_LABELS } from "@/lib/content";
import type { DashboardResponse } from "@/lib/types";

function percent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function AdminDashboard({ email }: { email: string }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/dashboard?days=${days}`, { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const result = (await response.json()) as DashboardResponse & { error?: string };
      if (!response.ok) throw new Error(result.error || "Не удалось загрузить аналитику.");
      setData(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось загрузить аналитику.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxDaily = useMemo(() => Math.max(1, ...(data?.daily.map((item) => item.visitors) || [1])), [data]);

  async function saveLead(id: string, status: string, adminNotes: string) {
    setSavingId(id);
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!response.ok) throw new Error("Не удалось сохранить изменения.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось сохранить изменения.");
    } finally {
      setSavingId("");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="admin-shell">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Полная картина воронки</span>
          <h1>Партнёрская система</h1>
          <p>{email}</p>
        </div>
        <div className="admin-actions">
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} aria-label="Период аналитики">
            <option value={7}>7 дней</option>
            <option value={30}>30 дней</option>
            <option value={90}>90 дней</option>
            <option value={365}>Год</option>
          </select>
          <a className="button button-secondary compact-button" href={`/api/admin/export?days=${days}`}>CSV</a>
          <button className="button button-secondary compact-button" type="button" onClick={() => void load()}>Обновить</button>
          <button className="text-button" type="button" onClick={() => void logout()}>Выйти</button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && !data ? <div className="admin-loading">Собираю цифры…</div> : null}

      {data && (
        <>
          <section className="metric-grid">
            <div className="metric-card"><span>Посетители</span><strong>{data.metrics.visitors}</strong><small>уникальные сессии</small></div>
            <div className="metric-card"><span>Изучили условия</span><strong>{data.metrics.partnershipViews}</strong><small>{percent(data.metrics.visitors ? (data.metrics.partnershipViews / data.metrics.visitors) * 100 : 0)} от входа</small></div>
            <div className="metric-card"><span>Начали заявку</span><strong>{data.metrics.applyStarts}</strong><small>{percent(data.metrics.visitors ? (data.metrics.applyStarts / data.metrics.visitors) * 100 : 0)} от входа</small></div>
            <div className="metric-card accent-metric"><span>Заявки</span><strong>{data.metrics.submissions}</strong><small>конверсия {percent(data.metrics.conversion)}</small></div>
            <div className="metric-card"><span>Сильный fit</span><strong>{data.metrics.qualified}</strong><small>{percent(data.metrics.submissions ? (data.metrics.qualified / data.metrics.submissions) * 100 : 0)} от заявок</small></div>
          </section>

          <section className="admin-grid-two">
            <div className="admin-panel">
              <div className="panel-heading"><div><span className="eyebrow">Воронка</span><h2>Где люди отпадают</h2></div></div>
              <div className="funnel-bars">
                {data.funnel.map((item) => (
                  <div key={item.label} className="funnel-row">
                    <div><span>{item.label}</span><b>{item.value}</b></div>
                    <div className="funnel-track"><span style={{ width: `${Math.max(item.rate, item.value ? 3 : 0)}%` }} /></div>
                    <small>{percent(item.rate)}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-panel">
              <div className="panel-heading"><div><span className="eyebrow">Динамика</span><h2>Посетители и заявки</h2></div></div>
              <div className="daily-chart" aria-label="Динамика по дням">
                {data.daily.map((item) => (
                  <div className="day-column" key={item.day} title={`${item.day}: ${item.visitors} посетителей, ${item.leads} заявок`}>
                    <div className="bar-wrap"><span className="visitor-bar" style={{ height: `${Math.max(4, (item.visitors / maxDaily) * 100)}%` }} /><span className="lead-dot" style={{ bottom: `${Math.min(92, (item.leads / maxDaily) * 100)}%` }} /></div>
                    <small>{item.day.slice(5)}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="admin-panel sources-panel">
            <div className="panel-heading"><div><span className="eyebrow">Источники</span><h2>Откуда приходят</h2></div></div>
            <div className="source-table">
              <div className="source-row source-head"><span>Источник</span><span>Посетители</span><span>Заявки</span><span>Конверсия</span></div>
              {data.sources.length ? data.sources.map((source) => (
                <div className="source-row" key={source.source}><b>{source.source}</b><span>{source.visitors}</span><span>{source.leads}</span><span>{percent(source.visitors ? (source.leads / source.visitors) * 100 : 0)}</span></div>
              )) : <p className="muted">Источники появятся после первых посещений.</p>}
            </div>
          </section>

          <section className="admin-panel leads-panel">
            <div className="panel-heading"><div><span className="eyebrow">Лиды</span><h2>Последние заявки</h2></div><span className="status-pill">{data.leads.length} в выборке</span></div>
            <div className="lead-list">
              {data.leads.length ? data.leads.map((lead) => (
                <LeadEditor key={lead.id} lead={lead} saving={savingId === lead.id} onSave={saveLead} />
              )) : <div className="empty-state">Заявок пока нет. Воронка хотя бы честно не рисует воображаемых клиентов, уже достижение.</div>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function LeadEditor({
  lead,
  saving,
  onSave,
}: {
  lead: DashboardResponse["leads"][number];
  saving: boolean;
  onSave: (id: string, status: string, notes: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.adminNotes);
  const dirty = status !== lead.status || notes !== lead.adminNotes;

  return (
    <article className="lead-card">
      <div className="lead-main">
        <div className="lead-title-row">
          <div><h3>{lead.name}</h3><p>{dateTime(lead.createdAt)} · {lead.niche}</p></div>
          <span className={`fit-label fit-label-${lead.fit}`}>{lead.score}/100 · {FIT_LABELS[lead.fit]}</span>
        </div>
        <p className="lead-summary">{lead.projectSummary}</p>
        <div className="lead-contacts"><a href={`mailto:${lead.email}`}>{lead.email}</a>{lead.messenger && <span>{lead.messenger}</span>}</div>
      </div>
      <div className="lead-controls">
        <label><span>Статус</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{LEAD_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}</select></label>
        <label><span>Заметка</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} maxLength={2000} placeholder="Что важно помнить, следующий шаг, договорённость…" /></label>
        <button className="button button-primary compact-button" type="button" disabled={!dirty || saving} onClick={() => void onSave(lead.id, status, notes)}>{saving ? "Сохраняю…" : "Сохранить"}</button>
      </div>
    </article>
  );
}
