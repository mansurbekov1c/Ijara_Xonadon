import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminTokenTekshir } from "./admin-auth";
import { appwriteYoqilgan, BazaXatosi, bazaXatosiniYoz } from "./appwrite";

export async function adminRuxsati(): Promise<boolean> {
  return adminTokenTekshir((await cookies()).get(ADMIN_COOKIE)?.value, process.env.ADMIN_PAROL);
}

export function adminXato(xato: string, status: number): Response {
  return Response.json({ ok: false, xato }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function adminAmal(amal: () => Promise<Response>): Promise<Response> {
  if (!await adminRuxsati()) return adminXato("Avval tizimga kiring.", 401);
  if (!appwriteYoqilgan()) return adminXato("Baza ulanmagan — APPWRITE_API_KEY sozlanmagan.", 503);
  try { return await amal(); }
  catch (xato) {
    if (xato instanceof BazaXatosi) return adminXato(xato.message, xato.status);
    if (xato instanceof SyntaxError) return adminXato("So‘rov JSON shaklida bo‘lishi kerak.", 400);
    if (xato && typeof xato === "object" && "code" in xato) {
      if (xato.code === 404) return adminXato("Ma’lumot topilmadi. Ro‘yxatni yangilang.", 404);
      if (xato.code === 409) return adminXato("Ma’lumot boshqa amalda o‘zgardi. Ro‘yxatni yangilab, qayta urinib ko‘ring.", 409);
    }
    bazaXatosiniYoz("Admin amali", xato);
    return adminXato("Baza bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring.", 502);
  }
}

export function obyekt(qiymat: unknown): Record<string, unknown> {
  return qiymat && typeof qiymat === "object" && !Array.isArray(qiymat) ? qiymat as Record<string, unknown> : {};
}
