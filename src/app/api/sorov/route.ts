import { telefonniTekshir } from "@/lib/hisob-profil";
import { ismniTekshir, jamiNarx, soatniTekshir } from "@/lib/hisob";
import type { SorovNatijasi, Xatolar } from "@/lib/sorov";
import { sorovniSaqlash, xonalarniOl } from "@/lib/appwrite";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, xatolar: { umumiy: "So‘rov JSON shaklida bo‘lishi kerak." } },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { ok: false, xatolar: { umumiy: "So‘rov ma’lumotlarini tekshiring." } },
      { status: 400 },
    );
  }

  const data = body as Record<string, unknown>;
  const xona = (await xonalarniOl()).find((item) => item.id === data.xonaId);
  const soat = soatniTekshir(
    typeof data.soat === "string" || typeof data.soat === "number" ? String(data.soat) : "",
  );
  const ism = ismniTekshir(typeof data.ism === "string" ? data.ism : "");
  const xatolar: Xatolar = {};
  if (!xona) xatolar.xonaId = "Ro‘yxatdan xona tanlang.";
  else if (!xona.faol) xatolar.xonaId = "Bu xona vaqtincha yopiq.";
  if (!soat.ok) xatolar.soat = soat.xato;
  if (!ism.ok) xatolar.ism = ism.xato;

  if (!xona || !xona.faol || !soat.ok || !ism.ok) {
    return Response.json({ ok: false, xatolar }, { status: 400 });
  }

  const result: SorovNatijasi = {
    ok: true,
    sorovId: `S-${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`,
    ism: ism.ism,
    xona: { id: xona.id, nomi: xona.nomi },
    soat: soat.soat,
    narx: xona.narx,
    jami: jamiNarx(xona.narx, soat.soat),
  };
  // Hisobdagi telefon (ixtiyoriy, bo'lsa tekshiriladi)
  let telefon: string | undefined;
  if (typeof data.telefon === "string" && data.telefon.trim()) {
    const t = telefonniTekshir(data.telefon);
    if (!t.ok) return Response.json({ ok: false, xatolar: { telefon: t.xato } }, { status: 400 });
    telefon = t.telefon;
  }
  result.sorovId = await sorovniSaqlash(result, telefon);
  return Response.json(result);
}
