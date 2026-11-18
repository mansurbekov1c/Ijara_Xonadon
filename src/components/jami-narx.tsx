"use client";

import { useLayoutEffect, useRef } from "react";
import { formatSom } from "@/lib/hisob";

export function JamiNarx({ qiymat }: { qiymat: number | null }) {
  const element = useRef<HTMLSpanElement>(null);
  const oldingi = useRef<number | null>(qiymat);

  useLayoutEffect(() => {
    const node = element.current;
    const boshlanish = oldingi.current;
    if (!node) return;
    if (qiymat === null || boshlanish === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = qiymat === null ? "—" : formatSom(qiymat);
      oldingi.current = qiymat;
      return;
    }
    node.textContent = formatSom(boshlanish);
    let frame = 0;
    const vaqt = performance.now();
    const yangilash = (now: number) => {
      const progress = Math.min((now - vaqt) / 300, 1);
      const hozirgi = Math.round(boshlanish + (qiymat - boshlanish) * (1 - (1 - progress) ** 3));
      node.textContent = formatSom(hozirgi);
      oldingi.current = hozirgi;
      if (progress < 1) frame = requestAnimationFrame(yangilash);
    };
    frame = requestAnimationFrame(yangilash);
    return () => cancelAnimationFrame(frame);
  }, [qiymat]);

  return <span className="total-number"><span className="sr-only" role="status">{qiymat === null ? "—" : formatSom(qiymat)}</span><span aria-hidden="true" ref={element}>{qiymat === null ? "—" : formatSom(qiymat)}</span></span>;
}
