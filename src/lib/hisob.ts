export function soatniTekshir(qiymat: string):
  | { ok: true; soat: number }
  | { ok: false; xato: string } {
  return /^\s*[1-8]\s*$/.test(qiymat)
    ? { ok: true, soat: Number(qiymat) }
    : { ok: false, xato: "1 dan 8 gacha butun son kiriting." };
}

export function ismniTekshir(qiymat: string):
  | { ok: true; ism: string }
  | { ok: false; xato: string } {
  const ism = qiymat.trim();
  if (!ism) return { ok: false, xato: "Ismingizni kiriting." };
  if (ism.length < 2 || ism.length > 60) {
    return { ok: false, xato: "Ism 2 dan 60 gacha belgidan iborat bo‘lsin." };
  }
  return { ok: true, ism };
}

export function jamiNarx(narx: number, soat: number): number {
  return narx * soat;
}

export function formatSom(n: number): string {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;
}
