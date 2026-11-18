export type Xona = {
  id: string;
  nomi: string;
  sigim: number;
  jihoz: string;
  narx: number;
  faol: boolean;
};

export const xonalar: readonly Xona[] = [
  { id: "X01", nomi: "O‘quv xonasi", sigim: 10, jihoz: "doska", narx: 50_000, faol: true },
  { id: "X02", nomi: "Uchrashuv xonasi", sigim: 6, jihoz: "televizor", narx: 40_000, faol: true },
  { id: "X03", nomi: "Kichik studiya", sigim: 4, jihoz: "yoritgich", narx: 70_000, faol: true },
  { id: "X04", nomi: "Seminar xonasi", sigim: 20, jihoz: "proyektor", narx: 100_000, faol: true },
];
