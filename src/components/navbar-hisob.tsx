"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { PROFIL_HODISA, profilniOl, profilniSaqla, type Profil } from "@/lib/hisob-profil";

// Navbar: bo'limlar va mijoz hisobi (ism + chiqish)
export function NavbarHisob() {
  const [profil, setProfil] = useState<Profil | null>(null);
  useEffect(() => {
    const yangila = () => setProfil(profilniOl());
    yangila();
    window.addEventListener(PROFIL_HODISA, yangila);
    return () => window.removeEventListener(PROFIL_HODISA, yangila);
  }, []);
  return (
    <nav aria-label="Asosiy menyu" style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13 }}>
      <a href="#xonalar" className="header-note">Xonalar</a>
      <Link href="/admin" prefetch={false} className="header-note">Admin</Link>
      {profil ? (
        <span className="header-note" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <UserRound size={15} aria-hidden="true" /> {profil.ism}
          <button type="button" onClick={() => profilniSaqla(null)} style={{ color: "#8e8e96", textDecoration: "underline" }}>Chiqish</button>
        </span>
      ) : (
        <span className="header-note" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><UserRound size={15} aria-hidden="true" /> Hisob xona tanlaganda ochiladi</span>
      )}
    </nav>
  );
}
