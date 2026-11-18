"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function AdminKirish() {
  const router = useRouter();
  const [parol, setParol] = useState("");
  const [xato, setXato] = useState("");
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [yangilanmoqda, startTransition] = useTransition();
  const band = useRef(false);

  async function kirish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (band.current) return;
    if (!parol) { setXato("Parolni kiriting."); return; }
    band.current = true;
    setYuborilmoqda(true);
    setXato("");
    try {
      const response = await fetch("/api/admin/kirish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parol }) });
      const data = await response.json();
      if (!response.ok) { setXato(data.xato || "Kirish amalga oshmadi."); return; }
      setParol("");
      startTransition(() => router.refresh());
    } catch { setXato("Server bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring."); }
    finally { band.current = false; setYuborilmoqda(false); }
  }

  return <form className="admin-login admin-card" onSubmit={kirish} noValidate aria-busy={yuborilmoqda || yangilanmoqda}>
    <div className={`form-field ${xato ? "has-error" : ""}`}><label htmlFor="admin-parol">Parol</label><input id="admin-parol" name="parol" type="password" autoComplete="current-password" required value={parol} onChange={(event) => { setParol(event.target.value); setXato(""); }} aria-invalid={Boolean(xato)} aria-describedby={xato ? "kirish-xato" : undefined} disabled={yuborilmoqda || yangilanmoqda} />{xato && <p id="kirish-xato" className="field-error" role="alert">{xato}</p>}</div>
    <button className="primary-button" type="submit" disabled={yuborilmoqda || yangilanmoqda}>{yuborilmoqda || yangilanmoqda ? "…" : <>Kirish<ArrowRight size={17} aria-hidden="true" /></>}</button>
  </form>;
}
