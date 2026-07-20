"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string; error?: string; devCode?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось отправить код.");
      setStage("code");
      setMessage(result.devCode ? `${result.message} Dev-код: ${result.devCode}` : result.message || "Код отправлен.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось отправить код.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Код не принят.");
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Код не принят.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-card">
      <span className="eyebrow">Закрытый контур</span>
      <h1>Админка партнёрской воронки</h1>
      <p>Вход только для адресов из переменной <code>ADMIN_EMAILS</code>. Код действует 10 минут.</p>

      {stage === "email" ? (
        <label className="field">
          <span>Email администратора</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" onKeyDown={(event) => event.key === "Enter" && void requestCode()} />
        </label>
      ) : (
        <label className="field">
          <span>Шестизначный код</span>
          <input className="otp-input" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} onKeyDown={(event) => event.key === "Enter" && void verifyCode()} autoFocus />
        </label>
      )}

      {message && <div className="form-success">{message}</div>}
      {error && <div className="form-error">{error}</div>}

      <button className="button button-primary full-button" type="button" disabled={loading || (stage === "email" ? !email : code.length !== 6)} onClick={stage === "email" ? requestCode : verifyCode}>
        {loading ? "Проверяю…" : stage === "email" ? "Получить код →" : "Открыть админку →"}
      </button>
      {stage === "code" && <button className="text-button" type="button" onClick={() => { setStage("email"); setCode(""); setMessage(""); }}>Изменить email</button>}
    </div>
  );
}
