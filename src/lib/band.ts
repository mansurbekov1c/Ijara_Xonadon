export function bandTugashHisobla(hozir: Date, mavjudlar: readonly (string | null)[], soat: number): string {
  if (!Number.isFinite(hozir.getTime()) || !Number.isInteger(soat) || soat < 1 || soat > 8) {
    throw new RangeError("Vaqt yoki soat noto‘g‘ri.");
  }
  const boshlanish = mavjudlar.reduce((engKech, vaqt) => {
    const tugash = vaqt ? Date.parse(vaqt) : NaN;
    return Number.isFinite(tugash) ? Math.max(engKech, tugash) : engKech;
  }, hozir.getTime());
  return new Date(boshlanish + soat * 3_600_000).toISOString();
}

const vaqtFormati = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const kunFormati = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit",
});
const oylar = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

export function vaqtMatni(vaqt: string): string {
  const sana = new Date(vaqt);
  if (!Number.isFinite(sana.getTime())) return "—";
  const qismlar = kunFormati.formatToParts(sana);
  const kun = Number(qismlar.find((qism) => qism.type === "day")?.value);
  const oy = Number(qismlar.find((qism) => qism.type === "month")?.value);
  return `${kun}-${oylar[oy - 1]}, ${vaqtFormati.format(sana)}`;
}

export function bandVaqti(tugash: string | undefined | null, hozir: string): string | null {
  if (!tugash || !Number.isFinite(Date.parse(tugash)) || Date.parse(tugash) <= Date.parse(hozir)) return null;
  return `${kunFormati.format(new Date(tugash)) === kunFormati.format(new Date(hozir))
    ? vaqtFormati.format(new Date(tugash)) : vaqtMatni(tugash)} gacha`;
}
