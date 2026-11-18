// Mijozning buyurtmalari — hisob bilan birga brauzerda saqlanadi, holati serverdan olinadi
export type Buyurtma = {
  rowId?: string;
  sorovId: string;
  xonaNomi: string;
  soat: number;
  jami: number;
  boshlanish?: string;
  yaratilgan: string;
  telefon: string;
};

const KALIT = "soatbay:buyurtmalar";
export const BUYURTMA_HODISA = "soatbay:buyurtmalar-ozgardi";

export function buyurtmalarniOl(telefon: string): Buyurtma[] {
  try {
    const hammasi = JSON.parse(localStorage.getItem(KALIT) ?? "[]") as Buyurtma[];
    return Array.isArray(hammasi) ? hammasi.filter((b) => b.telefon === telefon) : [];
  } catch {
    return [];
  }
}

export function buyurtmaQosh(b: Buyurtma) {
  try {
    const hammasi = JSON.parse(localStorage.getItem(KALIT) ?? "[]") as Buyurtma[];
    localStorage.setItem(KALIT, JSON.stringify([b, ...(Array.isArray(hammasi) ? hammasi : [])].slice(0, 50)));
  } catch {
    // brauzer xotirasi yopiq
  }
  window.dispatchEvent(new Event(BUYURTMA_HODISA));
}
