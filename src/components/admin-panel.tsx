"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, Plus, RefreshCw, Users } from "lucide-react";
import { bandVaqti, vaqtMatni } from "@/lib/band";
import { formatSom } from "@/lib/hisob";
import type { AdminSorov } from "@/lib/sorov";
import type { Xona } from "@/lib/xonalar";
import { xonaniTekshir, type XonaXatolari } from "@/lib/xona-tekshir";
import { AvtoYangilash } from "./avto-yangilash";
import { XonaIkonka } from "./xona-ikonka";

const holatlar = { kutilmoqda: "Kutilmoqda", tasdiqlangan: "Tasdiqlangan", rad: "Rad etilgan" };
const filtrlar = [{ id: "hammasi", nomi: "Hammasi" }, { id: "kutilmoqda", nomi: "Kutilmoqda" }, { id: "tasdiqlangan", nomi: "Tasdiqlangan" }, { id: "rad", nomi: "Rad" }] as const;
const boshXona = { nomi: "", sigim: "", jihoz: "", narx: "" };
const maydonlar = [
  { id: "nomi", nomi: "Xona nomi", placeholder: "Masalan: Ijod xonasi", yordam: "2–60 belgi" },
  { id: "sigim", nomi: "Sig‘im", placeholder: "10", yordam: "1–500 kishi, butun son" },
  { id: "jihoz", nomi: "Jihoz", placeholder: "Masalan: doska", yordam: "1–60 belgi" },
  { id: "narx", nomi: "Bir soat narxi", placeholder: "50000", yordam: "1 000–10 000 000 so‘m, butun son" },
] as const;

type Props = { xonalar: Xona[]; sorovlar: AdminSorov[]; bandliklar: Record<string, string>; hozir: string; bazaUlangan: boolean; serverXato: string };

export function AdminPanel({ xonalar, sorovlar, bandliklar, hozir, bazaUlangan, serverXato }: Props) {
  const router = useRouter();
  const [bolim, setBolim] = useState<"sorovlar" | "xonalar">("sorovlar");
  const [filtr, setFiltr] = useState<string>("hammasi");
  const [bajarilmoqda, setBajarilmoqda] = useState<string | null>(null);
  const [yangilanmoqda, startTransition] = useTransition();
  const [xato, setXato] = useState("");
  const [xabar, setXabar] = useState("");
  const [yangiXona, setYangiXona] = useState(boshXona);
  const [xatolar, setXatolar] = useState<XonaXatolari>({});
  const band = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const ishlamoqda = Boolean(bajarilmoqda) || yangilanmoqda;
  const tahrirYopiq = ishlamoqda || !bazaUlangan || Boolean(serverXato);

  function yangilash() { startTransition(() => router.refresh()); }

  async function amal(id: string, url: string, method: string, body?: unknown): Promise<boolean> {
    if (band.current) return false;
    band.current = true;
    setBajarilmoqda(id);
    setXato("");
    setXabar("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      const data = await response.json();
      if (!response.ok) {
        if (data.xatolar) { setXatolar(data.xatolar); xatogaFokus(data.xatolar); }
        else setXato(data.xato || "Amal bajarilmadi. Qayta urinib ko‘ring.");
        if (response.status === 401 || response.status === 409 || response.status === 404) yangilash();
        return false;
      }
      setXabar("O‘zgarish saqlandi.");
      yangilash();
      return true;
    } catch { setXato("Server bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring."); return false; }
    finally { band.current = false; setBajarilmoqda(null); }
  }

  function xatogaFokus(errors: XonaXatolari) {
    const id = maydonlar.find((maydon) => errors[maydon.id])?.id;
    if (id) requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>(`#xona-${id}`)?.focus());
  }

  async function xonaQoshish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tahrirYopiq) return;
    const tekshiruv = xonaniTekshir(yangiXona);
    setXatolar(tekshiruv.ok ? {} : tekshiruv.xatolar);
    if (!tekshiruv.ok) { xatogaFokus(tekshiruv.xatolar); return; }
    if (await amal("yangi-xona", "/api/admin/xonalar", "POST", tekshiruv.xona)) setYangiXona(boshXona);
  }

  return <>
    <AvtoYangilash />
    <div className="admin-heading admin-heading-row"><div><p className="eyebrow"><span className="tiny-line" />BOSHQARUV</p><h1>Admin paneli</h1><p className="hero-description">So‘rovlar, xonalar va bandlik — bir joyda.</p></div><button className="secondary-button admin-logout" disabled={ishlamoqda} onClick={() => void amal("chiqish", "/api/admin/chiqish", "POST")}>{bajarilmoqda === "chiqish" ? "…" : <><LogOut size={16} aria-hidden="true" />Chiqish</>}</button></div>
    {!bazaUlangan && <p className="admin-notice" role="status">Baza ulanmagan — APPWRITE_API_KEY sozlanmagan.</p>}
    {(xato || serverXato) && <p className="field-error network-error" role="alert">{xato || serverXato}</p>}
    <p className="admin-feedback" role="status">{xabar}</p>
    <div className="admin-toolbar"><div className="admin-tabs" role="group" aria-label="Boshqaruv bo‘limlari"><button id="sorovlar-tab" type="button" className={`admin-tab ${bolim === "sorovlar" ? "active" : ""}`} aria-pressed={bolim === "sorovlar"} aria-controls="sorovlar-panel" onClick={() => setBolim("sorovlar")}>So‘rovlar <span>{sorovlar.length}</span></button><button id="xonalar-tab" type="button" className={`admin-tab ${bolim === "xonalar" ? "active" : ""}`} aria-pressed={bolim === "xonalar"} aria-controls="xonalar-panel" onClick={() => setBolim("xonalar")}>Xonalar <span>{xonalar.length}</span></button></div><button className="icon-button" type="button" aria-label="Ro‘yxatni yangilash" disabled={ishlamoqda} onClick={yangilash}><RefreshCw size={17} className={yangilanmoqda ? "spinner" : ""} aria-hidden="true" /></button></div>
    <section id="sorovlar-panel" aria-labelledby="sorovlar-tab" hidden={bolim !== "sorovlar"}>
      <div className="filter-row admin-filters"><div className="filter-chips" role="group" aria-label="So‘rov holati">{filtrlar.map((item) => <button key={item.id} type="button" className={`filter-chip ${filtr === item.id ? "active" : ""}`} aria-pressed={filtr === item.id} onClick={() => setFiltr(item.id)}><span className="chip-dot" />{item.nomi}</button>)}</div><span className="field-help">Eng yangi 100 ta so‘rov · Toshkent vaqti</span></div>
      <div className="admin-list">{sorovlar.filter((sorov) => filtr === "hammasi" || sorov.holat === filtr).map((sorov) => {
        const vaqt = bandVaqti(sorov.bandTugash, hozir);
        return <article className="admin-card request-card" key={sorov.id}>
          <div className="request-main"><div><p className="admin-small">{sorov.xonaId} · {sorov.xonaNomi}</p><h2>{sorov.ism}</h2><p className="admin-small"><time dateTime={sorov.yaratilgan}>{vaqtMatni(sorov.yaratilgan)}</time></p></div><div className="request-price"><strong>{formatSom(sorov.jami)}</strong><span>{sorov.soat} soat</span></div></div>
          <div className="request-bottom"><div className="request-status"><span className={`status-badge status-${sorov.holat}`}>{holatlar[sorov.holat]}</span>{sorov.holat === "tasdiqlangan" && <span className="status-until">{vaqt ? `${vaqt} band` : "Bandlik tugagan"}</span>}</div>{sorov.holat === "kutilmoqda" && <div className="admin-actions"><button className="primary-button" type="button" disabled={tahrirYopiq} onClick={() => void amal(`tasdiq-${sorov.id}`, `/api/admin/sorovlar/${encodeURIComponent(sorov.id)}`, "PATCH", { amal: "tasdiqla" })}>{bajarilmoqda === `tasdiq-${sorov.id}` ? "…" : "Tasdiqlash"}</button><button className="secondary-button danger-button" type="button" disabled={tahrirYopiq} onClick={() => void amal(`rad-${sorov.id}`, `/api/admin/sorovlar/${encodeURIComponent(sorov.id)}`, "PATCH", { amal: "rad" })}>{bajarilmoqda === `rad-${sorov.id}` ? "…" : "Rad etish"}</button></div>}</div>
        </article>;
      })}</div>
      {!sorovlar.some((sorov) => filtr === "hammasi" || sorov.holat === filtr) && <p className="empty-state">{serverXato ? "So‘rovlar yuklanmadi." : "Bu bo‘limda so‘rovlar yo‘q."}</p>}
    </section>
    <section id="xonalar-panel" aria-labelledby="xonalar-tab" hidden={bolim !== "xonalar"}>
      <div className="admin-rooms">{xonalar.map((xona) => {
        const vaqt = bandVaqti(bandliklar[xona.id], hozir);
        return <article className="admin-card admin-room" key={xona.id}><div className="admin-room-title"><XonaIkonka jihoz={xona.jihoz} /><div><p className="admin-small">{xona.id}</p><h2>{xona.nomi}</h2></div></div><p className="room-spec"><Users size={15} aria-hidden="true" />{xona.sigim} kishi<span className="spec-dot">·</span><span className="equipment">{xona.jihoz}</span></p><p className="admin-room-price">{formatSom(xona.narx)} <span>/ soat</span></p><div className="admin-room-status"><span className={`status-badge ${xona.faol ? "status-tasdiqlangan" : "status-kutilmoqda"}`}>{xona.faol ? "Faol" : "Vaqtincha yopiq"}</span><span className={vaqt ? "room-busy" : "admin-small"}>{vaqt ? `Band · ${vaqt}` : "Hozir bo‘sh"}</span></div><div className="admin-actions"><button className="secondary-button" type="button" disabled={tahrirYopiq} onClick={() => void amal(`faol-${xona.id}`, `/api/admin/xonalar/${encodeURIComponent(xona.id)}`, "PATCH", { faol: !xona.faol })}>{bajarilmoqda === `faol-${xona.id}` ? "…" : xona.faol ? "To‘xtatish" : "Faollashtirish"}</button><button className="secondary-button danger-button" type="button" disabled={tahrirYopiq} onClick={() => { if (window.confirm(`${xona.id} — ${xona.nomi} xonasini o‘chirasizmi?`)) void amal(`ochir-${xona.id}`, `/api/admin/xonalar/${encodeURIComponent(xona.id)}`, "DELETE"); }}>{bajarilmoqda === `ochir-${xona.id}` ? "…" : "O‘chirish"}</button></div></article>;
      })}</div>
      {!xonalar.length && <p className="empty-state">{serverXato ? "Xonalar yuklanmadi." : "Hozircha xonalar yo‘q. Birinchi xonani qo‘shing."}</p>}
      <form ref={form} className="admin-card new-room-form" onSubmit={xonaQoshish} noValidate aria-busy={bajarilmoqda === "yangi-xona"}><p className="eyebrow"><Plus size={15} aria-hidden="true" />XONALAR</p><h2>Yangi xona</h2><div className="new-room-fields">{maydonlar.map((maydon) => <div className={`form-field ${xatolar[maydon.id] ? "has-error" : ""}`} key={maydon.id}><label htmlFor={`xona-${maydon.id}`}>{maydon.nomi}</label><input id={`xona-${maydon.id}`} name={maydon.id} value={yangiXona[maydon.id]} inputMode={maydon.id === "narx" || maydon.id === "sigim" ? "numeric" : "text"} placeholder={maydon.placeholder} required disabled={tahrirYopiq} onChange={(event) => { setYangiXona((old) => ({ ...old, [maydon.id]: event.target.value })); setXatolar((old) => ({ ...old, [maydon.id]: undefined })); }} aria-invalid={Boolean(xatolar[maydon.id])} aria-describedby={`xona-${maydon.id}-yordam${xatolar[maydon.id] ? ` xona-${maydon.id}-xato` : ""}`} /><p className="field-help" id={`xona-${maydon.id}-yordam`}>{maydon.yordam}</p>{xatolar[maydon.id] && <p className="field-error" id={`xona-${maydon.id}-xato`} role="alert">{xatolar[maydon.id]}</p>}</div>)}</div><button className="primary-button" type="submit" disabled={tahrirYopiq}>{bajarilmoqda === "yangi-xona" ? "…" : <>Xona qo‘shish<ArrowRight size={16} aria-hidden="true" /></>}</button></form>
    </section>
  </>;
}
