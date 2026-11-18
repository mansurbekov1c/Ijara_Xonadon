import { Lightbulb, Presentation, Projector, Tv } from "lucide-react";
import type { Xona } from "@/lib/xonalar";

const ikonkalar = { doska: Presentation, televizor: Tv, yoritgich: Lightbulb, proyektor: Projector };

export function XonaIkonka({ jihoz }: { jihoz: Xona["jihoz"] }) {
  const Ikonka = ikonkalar[jihoz];
  return <span className="room-icon"><Ikonka size={28} strokeWidth={1.5} aria-hidden="true" /></span>;
}
