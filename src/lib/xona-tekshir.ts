import type { Xona } from "./xonalar";

export type YangiXona = Pick<Xona, "nomi" | "sigim" | "jihoz" | "narx">;
export type XonaXatolari = Partial<Record<keyof YangiXona, string>>;

function butunSon(qiymat: unknown): number {
  if (typeof qiymat === "number") return qiymat;
  if (typeof qiymat === "string" && /^(0|[1-9]\d*)$/.test(qiymat.trim())) return Number(qiymat);
  return NaN;
}

export function xonaniTekshir(qiymat: unknown):
  | { ok: true; xona: YangiXona }
  | { ok: false; xatolar: XonaXatolari } {
  const data = qiymat && typeof qiymat === "object" && !Array.isArray(qiymat)
    ? qiymat as Record<string, unknown> : {};
  const nomi = typeof data.nomi === "string" ? data.nomi.trim() : "";
  const jihoz = typeof data.jihoz === "string" ? data.jihoz.trim() : "";
  const sigim = butunSon(data.sigim);
  const narx = butunSon(data.narx);
  const xatolar: XonaXatolari = {};
  if (nomi.length < 2 || nomi.length > 60) xatolar.nomi = "Nomi 2 dan 60 gacha belgidan iborat bo‘lsin.";
  if (jihoz.length < 1 || jihoz.length > 60) xatolar.jihoz = "Jihoz 1 dan 60 gacha belgidan iborat bo‘lsin.";
  if (!Number.isInteger(sigim) || sigim < 1 || sigim > 500) xatolar.sigim = "Sig‘im 1 dan 500 gacha butun son bo‘lsin.";
  if (!Number.isInteger(narx) || narx < 1_000 || narx > 10_000_000) xatolar.narx = "Narx 1 000 dan 10 000 000 gacha butun so‘m bo‘lsin.";
  return Object.keys(xatolar).length ? { ok: false, xatolar } : { ok: true, xona: { nomi, jihoz, sigim, narx } };
}

export function keyingiXonaId(idlar: readonly string[]): string {
  const engKatta = idlar.reduce((max, id) => /^X\d+$/.test(id) ? Math.max(max, Number(id.slice(1))) : max, 0);
  if (!Number.isSafeInteger(engKatta + 1)) throw new RangeError("Xona raqami chegaradan oshdi.");
  return `X${String(engKatta + 1).padStart(2, "0")}`;
}
