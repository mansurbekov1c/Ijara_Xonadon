"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Users } from "lucide-react";
import { formatSom } from "@/lib/hisob";
import { xonalar, type Xona } from "@/lib/xonalar";
import { XonaIkonka } from "./xona-ikonka";
import { SorovModal } from "./sorov-modal";

const filtrlar = [0, 4, 6, 10, 20];

export function XonalarRoyxati() {
  const [sigim, setSigim] = useState(0);
  const [tanlangan, setTanlangan] = useState<Xona | null>(null);
  const manba = useRef<HTMLButtonElement | null>(null);

  function yopish() {
    setTanlangan(null);
    requestAnimationFrame(() => manba.current?.focus());
  }

  return (
    <section id="xonalar" className="rooms-section" aria-labelledby="rooms-title">
      <div className="section-heading"><div><p className="eyebrow">SIZNING REJANGIZGA MOS</p><h2 id="rooms-title">Xonani tanlang<span className="room-count">04</span></h2></div><span className="section-caption">Har bir soat — o‘zingizniki.</span></div>
      <div className="filter-row"><span id="filter-label" className="filter-label"><Users size={16} strokeWidth={1.5} aria-hidden="true" /> Necha kishi?</span><div className="filter-chips" role="group" aria-labelledby="filter-label">{filtrlar.map((qiymat) => <button type="button" key={qiymat} className={`filter-chip ${sigim === qiymat ? "active" : ""}`} aria-pressed={sigim === qiymat} onClick={() => setSigim(qiymat)}><span className="chip-dot" />{qiymat === 0 ? "Hammasi" : `${qiymat} gacha`}</button>)}</div></div>
      <div className="room-grid">{xonalar.map((xona, index) => {
        const yetmaydi = xona.sigim < sigim;
        return <button
          type="button"
          className={`room-card ${yetmaydi ? "insufficient" : ""}`}
          key={xona.id}
          style={{ "--index": index } as CSSProperties}
          aria-label={`${xona.nomi}, ${xona.sigim} kishi, ${formatSom(xona.narx)} / soat. ${yetmaydi ? "Sig‘im yetmaydi. " : ""}Tanlash`}
          aria-haspopup="dialog"
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse") return;
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
            event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
          }}
          onClick={(event) => { manba.current = event.currentTarget; setTanlangan(xona); }}
        >
          <span className="card-top"><span className="room-id">{xona.id}</span><ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" /></span>
          <XonaIkonka jihoz={xona.jihoz} />
          <span className="room-name">{xona.nomi}</span>
          <span className="room-spec"><Users size={15} strokeWidth={1.5} aria-hidden="true" />{xona.sigim} kishi<span className="spec-dot">·</span><span className="equipment">{xona.jihoz}</span></span>
          <span className="capacity-status">{yetmaydi ? "Sig‘im yetmaydi" : "1–8 soatga"}</span>
          <span className="card-bottom"><span className="room-price">{formatSom(xona.narx).replace(" so‘m", "")} <span>so‘m</span><small>/ soat</small></span><span className="primary-button card-action">Tanlash<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" /></span></span>
        </button>;
      })}</div>
      {tanlangan && <SorovModal xona={tanlangan} yopish={yopish} />}
    </section>
  );
}
