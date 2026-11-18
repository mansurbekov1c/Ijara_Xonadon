"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, Minus, Plus, Users, X } from "lucide-react";
import { formatSom, ismniTekshir, jamiNarx, soatniTekshir } from "@/lib/hisob";
import type { SorovNatijasi, Xatolar } from "@/lib/sorov";
import type { Xona } from "@/lib/xonalar";
import { XonaIkonka } from "./xona-ikonka";
import { JamiNarx } from "./jami-narx";

export function SorovModal({ xona, band: bandVaqt, yopish }: { xona: Xona; band: string | null; yopish: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const soatInput = useRef<HTMLInputElement>(null);
  const ismInput = useRef<HTMLInputElement>(null);
  const natijaSarlavha = useRef<HTMLHeadingElement>(null);
  const controller = useRef<AbortController | null>(null);
  const band = useRef(false);
  const [soat, setSoat] = useState("1");
  const [ism, setIsm] = useState("");
  const [xatolar, setXatolar] = useState<Xatolar>({});
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [natija, setNatija] = useState<SorovNatijasi | null>(null);
  const tekshiruv = soatniTekshir(soat);

  useEffect(() => {
    const node = dialog.current!;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    soatInput.current?.focus();
    return () => {
      controller.current?.abort();
      node.close();
      document.body.style.overflow = oldOverflow;
    };
  }, []);

  useEffect(() => {
    if (natija) natijaSarlavha.current?.focus();
  }, [natija]);

  function xatoniTozalash(maydon: "soat" | "ism") {
    setXatolar((old) => ({ ...old, [maydon]: undefined, umumiy: undefined }));
  }

  function soatniOzgartirish(qadam: number) {
    const yangi = tekshiruv.ok ? Math.max(1, Math.min(8, tekshiruv.soat + qadam)) : 1;
    setSoat(String(yangi));
    xatoniTozalash("soat");
  }

  function xatogaFokus(errors: Xatolar) {
    requestAnimationFrame(() => {
      if (errors.soat) soatInput.current?.focus();
      else if (errors.ism) ismInput.current?.focus();
    });
  }

  async function yuborish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (band.current) return;
    if (!xona.faol) { setXatolar({ xonaId: "Bu xona vaqtincha yopiq." }); return; }
    const ismNatija = ismniTekshir(ism);
    const errors: Xatolar = {};
    if (!tekshiruv.ok) errors.soat = tekshiruv.xato;
    if (!ismNatija.ok) errors.ism = ismNatija.xato;
    setXatolar(errors);
    if (!tekshiruv.ok || !ismNatija.ok) { xatogaFokus(errors); return; }
    band.current = true;
    setYuborilmoqda(true);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await fetch("/api/sorov", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xonaId: xona.id, soat, ism: ismNatija.ism }),
        signal: abort.signal,
      });
      const data: SorovNatijasi | { ok: false; xatolar: Xatolar } = await response.json();
      if (response.status === 400 && !data.ok) {
        setXatolar(data.xatolar);
        xatogaFokus(data.xatolar);
      } else if (response.ok && data.ok) {
        setNatija(data);
      } else {
        throw new Error("So‘rov bajarilmadi");
      }
    } catch {
      if (!abort.signal.aborted) setXatolar({ umumiy: "Server bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring." });
    } finally {
      band.current = false;
      if (!abort.signal.aborted) setYuborilmoqda(false);
    }
  }

  function yangiSorov() {
    setNatija(null);
    setSoat("1");
    setIsm("");
    setXatolar({});
    requestAnimationFrame(() => soatInput.current?.focus());
  }

  return (
    <dialog ref={dialog} className="request-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" onCancel={(event) => { event.preventDefault(); yopish(); }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) yopish();
    }}>
      <button className="icon-button close-button" type="button" aria-label="Yopish" onClick={yopish}><X size={20} strokeWidth={1.5} aria-hidden="true" /></button>
      {natija ? <div className="result-panel">
        <div className="success-icon"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="21" /><path d="m14 24 7 7 14-14" /></svg></div>
        <p className="eyebrow">SO‘ROV YUBORILDI</p>
        <h2 id="modal-title" ref={natijaSarlavha} tabIndex={-1}>So‘rovingiz qabul qilindi</h2>
        <p className="result-intro">So‘rovingiz tafsilotlari quyida.</p>
        <dl className="result-table"><div><dt>Ism</dt><dd>{natija.ism}</dd></div><div><dt>Xona</dt><dd>{natija.xona.nomi}</dd></div><div><dt>Soatlar soni</dt><dd>{natija.soat} soat</dd></div><div className="result-total"><dt>Jami narx</dt><dd>{formatSom(natija.jami)}</dd></div><div><dt>So‘rov raqami</dt><dd className="request-id">{natija.sorovId}</dd></div></dl>
        <p className="result-disclaimer">Bu band qilish so‘rovi. Haqiqiy band qilish yoki to‘lov amalga oshirilmaydi.</p>
        <div className="modal-actions"><button type="button" className="primary-button" onClick={yopish}>Ro‘yxatga qaytish<ArrowRight size={17} aria-hidden="true" /></button><button type="button" className="secondary-button" onClick={yangiSorov}>Yangi so‘rov</button></div>
      </div> : <>
        <p className="eyebrow modal-eyebrow">XONA TAFSILOTLARI <span> / {xona.id}</span></p>
        <div className="modal-room"><XonaIkonka jihoz={xona.jihoz} /><div><h2 id="modal-title">{xona.nomi}</h2><p className="room-spec"><Users size={15} aria-hidden="true" />{xona.sigim} kishi<span className="spec-dot">·</span><span className="equipment">{xona.jihoz}</span></p></div></div>
        <p className="modal-hourly">{formatSom(xona.narx)} <span>/ soat</span></p>
        {bandVaqt && <p className="availability-note"><span className="room-busy">Band · {bandVaqt}</span><br />Hozir band — so‘rovingiz navbatga qo‘yiladi</p>}
        {!xona.faol && <p className="field-error" role="alert">Bu xona vaqtincha yopiq.</p>}
        <form noValidate onSubmit={yuborish} aria-busy={yuborilmoqda}>
          <div className={`form-field ${xatolar.soat ? "has-error" : ""}`}><label htmlFor="soat">Necha soatga?</label><div className="stepper"><button type="button" aria-label="Bir soat kamaytirish" onClick={() => soatniOzgartirish(-1)} disabled={yuborilmoqda || (tekshiruv.ok && tekshiruv.soat === 1)}><Minus size={18} aria-hidden="true" /></button><input id="soat" name="soat" ref={soatInput} inputMode="numeric" type="text" value={soat} onChange={(event) => { setSoat(event.target.value); xatoniTozalash("soat"); }} aria-invalid={Boolean(xatolar.soat)} aria-describedby={`soat-yordam${xatolar.soat ? " soat-xato" : ""}`} disabled={yuborilmoqda} autoComplete="off" /><button type="button" aria-label="Bir soat qo‘shish" onClick={() => soatniOzgartirish(1)} disabled={yuborilmoqda || (tekshiruv.ok && tekshiruv.soat === 8)}><Plus size={18} aria-hidden="true" /></button></div><p id="soat-yordam" className="field-help">1 dan 8 gacha butun son</p>{xatolar.soat && <p id="soat-xato" className="field-error" role="alert">{xatolar.soat}</p>}</div>
          <div className="total-panel"><div><span className="eyebrow">JAMI NARX</span><p className="total-equation">{tekshiruv.ok ? `${formatSom(xona.narx).replace(" so‘m", "")} × ${tekshiruv.soat}` : "—"}</p></div><JamiNarx qiymat={tekshiruv.ok ? jamiNarx(xona.narx, tekshiruv.soat) : null} /></div>
          <div className={`form-field ${xatolar.ism ? "has-error" : ""}`}><label htmlFor="ism">Ismingiz <span className="required-mark">*</span></label><input id="ism" name="ism" ref={ismInput} placeholder="Masalan: Sinovchi 01" autoComplete="name" required value={ism} onChange={(event) => { setIsm(event.target.value); xatoniTozalash("ism"); }} aria-invalid={Boolean(xatolar.ism)} aria-describedby={xatolar.ism ? "ism-xato" : undefined} disabled={yuborilmoqda} />{xatolar.ism && <p id="ism-xato" className="field-error" role="alert">{xatolar.ism}</p>}</div>
          {(xatolar.umumiy || xatolar.xonaId) && <p className="field-error network-error" role="alert">{xatolar.umumiy || xatolar.xonaId}</p>}
          <div className="modal-actions"><button className="primary-button" type="submit" disabled={yuborilmoqda}>{yuborilmoqda ? <>Yuborilmoqda…<LoaderCircle className="spinner" size={17} aria-hidden="true" /></> : <>So‘rov yuborish<ArrowRight size={17} strokeWidth={1.5} aria-hidden="true" /></>}</button><button className="secondary-button" type="button" onClick={yopish}>Ro‘yxatga qaytish</button></div>
        </form>
      </>}
    </dialog>
  );
}
