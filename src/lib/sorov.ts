export type Xatolar = Partial<Record<"xonaId" | "soat" | "ism" | "umumiy" | "boshlanish", string>>;

export type AdminSorov = {
  id: string;
  yaratilgan: string;
  xonaId: string;
  xonaNomi: string;
  ism: string;
  soat: number;
  jami: number;
  holat: "kutilmoqda" | "tasdiqlangan" | "rad" | "bekor" | "tugatildi";
  bandTugash: string | null;
  boshlanish?: string | null;
  telefon?: string | null;
};

export type SorovNatijasi = {
  ok: true;
  sorovId: string;
  ism: string;
  xona: { id: string; nomi: string };
  soat: number;
  narx: number;
  jami: number;
  boshlanish?: string;
  rowId?: string;
};

export type BuyurtmaHolati = { id: string; holat: "kutilmoqda" | "tasdiqlangan" | "rad" | "bekor" | "tugatildi"; bandTugash: string | null };
