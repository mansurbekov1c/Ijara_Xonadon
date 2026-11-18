import { adminAmal, adminXato, obyekt } from "@/lib/admin-api";
import { sorovniBoshqar } from "@/lib/appwrite";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return adminAmal(async () => {
    const { amal } = obyekt(await request.json());
    if (amal !== "tasdiqla" && amal !== "rad") return adminXato("Amal noto‘g‘ri.", 400);
    await sorovniBoshqar((await context.params).id, amal);
    return Response.json({ ok: true });
  });
}
