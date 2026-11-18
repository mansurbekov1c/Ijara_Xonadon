"use client";
import { buyurtmaQosh } from "@/lib/buyurtmalar";
import { vaqtMatni } from "@/lib/band";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, Minus, Plus, Users, X } from "lucide-react";
import { formatSom, ismniTekshir, jamiNarx, soatniTekshir } from "@/lib/hisob";
import type { SorovNatijasi, Xatolar } from "@/lib/sorov";
import type { Xona } from "@/lib/xonalar";
import { XonaIkonka } from "./xona-ikonka";
import { JamiNarx } from "./jami-narx";
import { PROFIL_HODISA, profilniOl, profilniSaqla, profilniTekshir, toliqIsm, type Profil, type ProfilXatolar } from "@/lib/hisob-profil";

export function SorovModal({ xona, band: bandVaqt, yopish }: { xona: Xona; band: string | null; yopish: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const soatInput = useRef<HTMLInputElement>(null);
  const ismInput = useRef<HTMLInputElement>(null);
  const natijaSarlavha = useRef<HTMLHeadingElement>(null);
  const controller = useRef<AbortController | null>(null);
  const band = useRef(false);
  const [soat, setSoat] = useState("1");
  const [ism, setIsm] = useState("");
  const [familiya, setFamiliya] = useState("");
  const [boshlanish, setBoshlanish] = useState(() => {
    // standart: keyingi to'liq soat (brauzer vaqti)
    const d = new Date(); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 1);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00`;
  });
  const [telefon, setTelefon] = useState("");
  const [profil, setProfil] = useState<Profil | null>(null);
  const [profilXato, setProfilXato] = useState<ProfilXatolar>({});
  useEffect(() => {
    const yangila = () => setProfil(profilniOl());
    yangila();
    window.addEventListener(PROFIL_HODISA, yangila);
    return () => window.removeEventListener(PROFIL_HODISA, yangila);
  }, []);
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
    // Avval hisob: profil bo'lmasa ism, familiya, telefon bilan hisob ochiladi
    let joriy = profil;
    if (!joriy) {
      const pt = profilniTekshir({ ism, familiya, telefon });
      setProfilXato(pt.ok ? {} : pt.xatolar);
      if (!pt.ok) {
        setXatolar(tekshiruv.ok ? {} : { soat: tekshiruv.xato });
        if (pt.xatolar.ism) ismInput.current?.focus();
        return;
      }
      if (!tekshiruv.ok) { setXatolar({ soat: tekshiruv.xato }); xatogaFokus({ soat: tekshiruv.xato }); return; }
      joriy = pt.profil;
      profilniSaqla(joriy);
      setProfil(joriy);
    }
    const ismNatija = ismniTekshir(toliqIsm(joriy));
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
        body: JSON.stringify({ xonaId: xona.id, soat, ism: ismNatija.ism, telefon: joriy.telefon, boshlanish: boshlanish ? new Date(boshlanish).toISOString() : undefined }),
        signal: abort.signal,
      });
      const data: SorovNatijasi | { ok: false; xatolar: Xatolar } = await response.json();
      if (response.status === 400 && !data.ok) {
        setXatolar(data.xatolar);
        xatogaFokus(data.xatolar);
      } else if (response.ok && data.ok) {
        setNatija(data);
        buyurtmaQosh({ rowId: data.rowId, sorovId: data.sorovId, xonaNomi: data.xona.nomi, soat: data.soat, jami: data.jami, boshlanish: data.boshlanish, yaratilgan: new Date().toISOString(), telefon: joriy.telefon });
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
        <dl className="result-table"><div><dt>Ism</dt><dd>{natija.ism}</dd></div><div><dt>Xona</dt><dd>{natija.xona.nomi}</dd></div><div><dt>Soatlar soni</dt><dd>{natija.soat} soat</dd></div>{natija.boshlanish && <div><dt>Vaqt</dt><dd>{vaqtMatni(natija.boshlanish)} – {vaqtMatni(new Date(Date.parse(natija.boshlanish) + natija.soat * 3_600_000).toISOString()).split(", ")[1]}</dd></div>}<div className="result-total"><dt>Jami narx</dt><dd>{formatSom(natija.jami)}</dd></div><div><dt>So‘rov raqami</dt><dd className="request-id">{natija.sorovId}</dd></div></dl>
        <p className="result-disclaimer">Bu band qilish so‘rovi. Haqiqiy band qilish yoki to‘lov amalga oshirilmaydi. Admin so‘rovni ko‘rib, hisobingizdagi telefon raqamiga bog‘lanadi.</p>
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
          <div className={`form-field ${xatolar.boshlanish ? "has-error" : ""}`}><label htmlFor="boshlanish">Boshlanish vaqti <span className="required-mark">*</span></label><input id="boshlanish" type="datetime-local" required value={boshlanish} onChange={(e) => { setBoshlanish(e.target.value); setXatolar((x) => ({ ...x, boshlanish: undefined })); }} style={{ colorScheme: "dark" }} disabled={yuborilmoqda} />{xatolar.boshlanish && <p className="field-error" role="alert">{xatolar.boshlanish}</p>}</div>
          {profil ? (
            <div className="form-field"><label>Buyurtmachi</label><div className="total-panel" style={{ marginTop: 0 }}><div><strong>{toliqIsm(profil)}</strong><p className="total-equation">{profil.telefon}</p></div><button type="button" className="secondary-button" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => profilniSaqla(null)}>Boshqa hisob</button></div></div>
          ) : (
            <>
              <p className="eyebrow" style={{ marginTop: 26 }}>Avval hisob oching</p>
              {([["ism", "Ismingiz", "Masalan: Sinovchi", ism, setIsm, "given-name", ismInput], ["familiya", "Familiyangiz", "Masalan: 01", familiya, setFamiliya, "family-name", null], ["telefon", "Telefon raqamingiz", "+998 90 123 45 67", telefon, setTelefon, "tel", null]] as const).map(([key, label, ph, val, set, ac, ref]) => (
                <div key={key} className={`form-field ${profilXato[key] ? "has-error" : ""}`}><label htmlFor={`h-${key}`}>{label} <span className="required-mark">*</span></label><input id={`h-${key}`} ref={ref ?? undefined} placeholder={ph} autoComplete={ac} inputMode={key === "telefon" ? "tel" : undefined} value={val} onChange={(e) => { set(e.target.value); setProfilXato((x) => ({ ...x, [key]: undefined })); }} aria-invalid={Boolean(profilXato[key])} aria-describedby={profilXato[key] ? `h-${key}-xato` : undefined} disabled={yuborilmoqda} />{profilXato[key] && <p id={`h-${key}-xato`} className="field-error" role="alert">{profilXato[key]}</p>}</div>
              ))}
            </>
          )}
          {(xatolar.umumiy || xatolar.xonaId) && <p className="field-error network-error" role="alert">{xatolar.umumiy || xatolar.xonaId}</p>}
          <div className="modal-actions"><button className="primary-button" type="submit" disabled={yuborilmoqda}>{yuborilmoqda ? <>Yuborilmoqda…<LoaderCircle className="spinner" size={17} aria-hidden="true" /></> : <>So‘rov yuborish<ArrowRight size={17} strokeWidth={1.5} aria-hidden="true" /></>}</button><button className="secondary-button" type="button" onClick={yopish}>Ro‘yxatga qaytish</button></div>
        </form>
      </>}
    </dialog>
  );
}
