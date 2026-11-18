import { adminAmal } from "@/lib/admin-api";
import { adminXonalarniOl, xonaQosh } from "@/lib/appwrite";
import { xonaniTekshir } from "@/lib/xona-tekshir";

export async function GET() {
  return adminAmal(async () => Response.json({ ok: true, xonalar: await adminXonalarniOl() }, { headers: { "Cache-Control": "no-store" } }));
}

export async function POST(request: Request) {
  return adminAmal(async () => {
    const natija = xonaniTekshir(await request.json());
    if (!natija.ok) return Response.json({ ok: false, xatolar: natija.xatolar }, { status: 400 });
    return Response.json({ ok: true, xona: await xonaQosh(natija.xona) }, { status: 201 });
  });
}
