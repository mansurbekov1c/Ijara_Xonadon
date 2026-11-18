// Mijoz hisobi: ism, familiya, telefon. Brauzerda saqlanadi (parol yo'q — sinov loyihasi).
export type Profil = { ism: string; familiya: string; telefon: string };

const KALIT = "soatbay:hisob";
export const PROFIL_HODISA = "soatbay:hisob-ozgardi";

export type ProfilXatolar = Partial<Record<keyof Profil, string>>;

// Telefon: +998 XX XXX XX XX (bo'shliq, chiziqcha, qavs ruxsat). Normal ko'rinishga keltiriladi.
export function telefonniTekshir(qiymat: string): { ok: true; telefon: string } | { ok: false; xato: string } {
  const raqam = qiymat.replace(/[\s\-()]/g, "");
  const m = /^(?:\+?998)?(\d{9})$/.exec(raqam);
  if (!m) return { ok: false, xato: "Telefon raqamini +998 90 123 45 67 ko‘rinishida kiriting." };
  const d = m[1];
  return { ok: true, telefon: `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}` };
}

export function profilniTekshir(p: Profil): { ok: true; profil: Profil } | { ok: false; xatolar: ProfilXatolar } {
  const xatolar: ProfilXatolar = {};
  const ism = p.ism.trim().replace(/\s+/g, " ");
  const familiya = p.familiya.trim().replace(/\s+/g, " ");
  if (!ism) xatolar.ism = "Ismingizni kiriting.";
  else if (ism.length < 2 || ism.length > 40) xatolar.ism = "Ism 2 dan 40 gacha belgidan iborat bo‘lsin.";
  if (!familiya) xatolar.familiya = "Familiyangizni kiriting.";
  else if (familiya.length > 40) xatolar.familiya = "Familiya 40 belgidan oshmasin.";
  const tel = telefonniTekshir(p.telefon);
  if (!tel.ok) xatolar.telefon = tel.xato;
  if (Object.keys(xatolar).length || !tel.ok) return { ok: false, xatolar };
  return { ok: true, profil: { ism, familiya, telefon: tel.telefon } };
}

export function profilniOl(): Profil | null {
  try {
    const raw = localStorage.getItem(KALIT);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profil;
    return profilniTekshir(p).ok ? p : null;
  } catch {
    return null;
  }
}

export function profilniSaqla(p: Profil | null) {
  try {
    if (p) localStorage.setItem(KALIT, JSON.stringify(p));
    else localStorage.removeItem(KALIT);
  } catch {
    // brauzer xotirasi yopiq — hisob faqat shu sahifa uchun ishlaydi
  }
  window.dispatchEvent(new Event(PROFIL_HODISA));
}

export const toliqIsm = (p: Profil) => `${p.ism} ${p.familiya}`;
