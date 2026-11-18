import { DoorOpen, Lightbulb, Presentation, Projector, Tv, type LucideIcon } from "lucide-react";
import type { Xona } from "@/lib/xonalar";

const ikonkalar: Record<string, LucideIcon> = { doska: Presentation, televizor: Tv, yoritgich: Lightbulb, proyektor: Projector };

export function XonaIkonka({ jihoz }: { jihoz: Xona["jihoz"] }) {
  const nomi = jihoz.toLowerCase();
  const Ikonka = Object.hasOwn(ikonkalar, nomi) ? ikonkalar[nomi] : DoorOpen;
  return <span className="room-icon"><Ikonka size={28} strokeWidth={1.5} aria-hidden="true" /></span>;
}
