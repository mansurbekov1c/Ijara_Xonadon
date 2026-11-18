import { BazaXatosi, mijozBekorQiladi } from "@/lib/appwrite";
import { telefonniTekshir } from "@/lib/hisob-profil";

// POST /api/buyurtmalarim/bekor { id, telefon } — mijoz o'z bronini bekor qiladi
export async function POST(request: Request) {
  let body: { id?: unknown; telefon?: unknown };
  try { body = await request.json(); } catch { return Response.json({ ok: false, xato: "So‘rov noto‘g‘ri." }, { status: 400 }); }
  const id = typeof body.id === "string" && /^[a-zA-Z0-9_]{1,36}$/.test(body.id) ? body.id : null;
  const tel = telefonniTekshir(typeof body.telefon === "string" ? body.telefon : "");
  if (!id || !tel.ok) return Response.json({ ok: false, xato: "So‘rov noto‘g‘ri." }, { status: 400 });
  try {
    await mijozBekorQiladi(id, tel.telefon);
    return Response.json({ ok: true });
  } catch (xato) {
    if (xato instanceof BazaXatosi) return Response.json({ ok: false, xato: xato.message }, { status: xato.status });
    return Response.json({ ok: false, xato: "Server bilan bog‘lanib bo‘lmadi." }, { status: 503 });
  }
}
