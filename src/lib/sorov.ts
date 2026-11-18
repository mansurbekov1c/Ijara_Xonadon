export type Xatolar = Partial<Record<"xonaId" | "soat" | "ism" | "umumiy", string>>;

export type SorovNatijasi = {
  ok: true;
  sorovId: string;
  ism: string;
  xona: { id: string; nomi: string };
  soat: number;
  narx: number;
  jami: number;
};
