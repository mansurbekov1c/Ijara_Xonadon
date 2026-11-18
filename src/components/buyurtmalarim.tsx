"use client";

import { useEffect, useState } from "react";
import { formatSom } from "@/lib/hisob";
import { vaqtMatni } from "@/lib/band";
import { PROFIL_HODISA, profilniOl, type Profil } from "@/lib/hisob-profil";
import { BUYURTMA_HODISA, buyurtmalarniOl, type Buyurtma } from "@/lib/buyurtmalar";
import type { BuyurtmaHolati } from "@/lib/sorov";

const nomlar: Record<BuyurtmaHolati["holat"], string> = {
  kutilmoqda: "Kutilmoqda", tasdiqlangan: "Tasdiqlangan", rad: "Rad etilgan", bekor: "Bekor qilingan", tugatildi: "Erta tugatildi", mijoz_bekor: "Siz bekor qildingiz",
};

// "Buyurtmalarim" — mijoz hisobidagi so'rovlar va ularning joriy holati (20 soniyada yangilanadi)
export function Buyurtmalarim() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [royxat, setRoyxat] = useState<Buyurtma[]>([]);
  const [holat, setHolat] = useState<Record<string, BuyurtmaHolati>>({});
  const [hozir, setHozir] = useState(0);
  const [bekorXato, setBekorXato] = useState<Record<string, string>>({});
  const [yangilash, setYangilash] = useState(0);
  const [kutish, setKutish] = useState<string | null>(null);

  async function bekorQil(b: Buyurtma) {
    if (!b.rowId || !profil) return;
    if (!window.confirm(`${b.xonaNomi} bronini bekor qilasizmi? Bu amalni qaytarib bo‘lmaydi.`)) return;
    setKutish(b.rowId);
    try {
      const r = await fetch("/api/buyurtmalarim/bekor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.rowId, telefon: profil.telefon }) });
      const d = (await r.json()) as { ok: boolean; xato?: string };
      setBekorXato((x) => ({ ...x, [b.rowId!]: d.ok ? "" : d.xato ?? "Bekor qilinmadi." }));
      setYangilash((n) => n + 1);
    } catch {
      setBekorXato((x) => ({ ...x, [b.rowId!]: "Server bilan bog‘lanib bo‘lmadi." }));
    } finally {
      setKutish(null);
    }
  }

  useEffect(() => {
    const yukla = () => {
      const p = profilniOl();
      setProfil(p);
      setRoyxat(p ? buyurtmalarniOl(p.telefon) : []);
    };
    yukla();
    window.addEventListener(PROFIL_HODISA, yukla);
    window.addEventListener(BUYURTMA_HODISA, yukla);
    return () => { window.removeEventListener(PROFIL_HODISA, yukla); window.removeEventListener(BUYURTMA_HODISA, yukla); };
  }, []);

  useEffect(() => {
    const ids = royxat.map((b) => b.rowId).filter(Boolean).join(",");
    if (!ids) return;
    let tirik = true;
    const ol = () => fetch(`/api/buyurtmalarim?ids=${encodeURIComponent(ids)}`).then((r) => r.json())
      .then((d: { holatlar?: BuyurtmaHolati[] }) => { if (tirik) { setHolat(Object.fromEntries((d.holatlar ?? []).map((h) => [h.id, h]))); setHozir(Date.now()); } })
      .catch(() => {});
    ol();
    const t = setInterval(ol, 20_000);
    return () => { tirik = false; clearInterval(t); };
  }, [royxat, yangilash]);

  if (!profil) return null;
  return (
    <section id="buyurtmalarim" className="container" style={{ marginTop: 72 }} aria-labelledby="buyurtmalarim-sarlavha">
      <p className="eyebrow">MENING HISOBIM · {profil.ism.toUpperCase()} {profil.familiya.toUpperCase()}</p>
      <h2 id="buyurtmalarim-sarlavha" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "8px 0 24px" }}>Buyurtmalarim</h2>
      {royxat.length === 0 ? (
        <p className="admin-small">Hali buyurtma yo‘q. Xonani tanlab so‘rov yuboring — u shu yerda paydo bo‘ladi.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {royxat.map((b) => {
            const h = b.rowId ? holat[b.rowId] : undefined;
            // Tasdiqlangan bron vaqti o'tib ketgan bo'lsa — "Yakunlangan"
            const yakun = h?.holat === "tasdiqlangan" && h.bandTugash && Date.parse(h.bandTugash) <= hozir;
            // Bazada topilmagan (o'chirilgan) so'rov
            const yoq = Boolean(b.rowId && hozir && !h);
            const nom = h ? (yakun ? "Yakunlangan" : nomlar[h.holat]) : yoq ? "Mavjud emas" : "Kutilmoqda";
            const cls = h ? (yakun ? "status-kutilmoqda" : `status-${h.holat}`) : "status-kutilmoqda";
            const tugash = b.boshlanish ? new Date(Date.parse(b.boshlanish) + b.soat * 3_600_000).toISOString() : null;
            return (
              <article key={b.sorovId + b.yaratilgan} className="admin-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <p className="admin-small">{b.sorovId}</p>
                  <strong style={{ fontSize: 17 }}>{b.xonaNomi}</strong>
                  <p className="admin-small">{b.boshlanish && tugash ? `${vaqtMatni(b.boshlanish)} – ${vaqtMatni(tugash).split(", ")[1]}` : vaqtMatni(b.yaratilgan)} · {b.soat} soat · {formatSom(b.jami)}</p>
                  {h?.holat === "bekor" && <p className="admin-small" style={{ color: "#ff5a5a" }}>Admin bronni bekor qildi. Savollar bo‘lsa, admin siz bilan telefon orqali bog‘lanadi.</p>}
                  {h?.holat === "tugatildi" && h.bandTugash && <p className="admin-small" style={{ color: "#ffb35a" }}>Admin broningizni erta tugatdi: <strong>{vaqtMatni(h.bandTugash)}</strong> da. Xona bo‘shatildi.</p>}
                  {h?.holat === "tasdiqlangan" && h.bandTugash && !yakun && <p className="admin-small" style={{ color: "#3ddc97" }}>Xona {vaqtMatni(h.bandTugash)} gacha siz uchun band.</p>}
                  {h?.holat === "mijoz_bekor" && <p className="admin-small">Bron siz tomondan bekor qilindi. Xona boshqa mijozlar uchun bo‘shatildi.</p>}
                  {h?.holat === "rad" && <p className="admin-small" style={{ color: "#ff5a5a" }}>So‘rov rad etildi. Boshqa vaqt yoki xonani tanlab ko‘ring.</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span className={`status-badge ${cls}`}>{nom}</span>
                  {b.rowId && (h?.holat === "kutilmoqda" || (h?.holat === "tasdiqlangan" && b.boshlanish && Date.parse(b.boshlanish) > hozir)) && (
                    <button type="button" className="secondary-button danger-button" style={{ padding: "6px 12px", fontSize: 12 }} disabled={kutish === b.rowId} onClick={() => void bekorQil(b)}>{kutish === b.rowId ? "…" : "Bekor qilish"}</button>
                  )}
                  {b.rowId && bekorXato[b.rowId] && <p className="admin-small" role="alert" style={{ color: "#ff5a5a", maxWidth: 220, textAlign: "right" }}>{bekorXato[b.rowId]}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
