import { adminAmal, adminXato, obyekt } from "@/lib/admin-api";
import { xonaFaolliginiOzgartir, xonaniOchir } from "@/lib/appwrite";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  return adminAmal(async () => {
    const { faol } = obyekt(await request.json());
    if (typeof faol !== "boolean") return adminXato("Xona holati noto‘g‘ri.", 400);
    await xonaFaolliginiOzgartir((await context.params).id, faol);
    return Response.json({ ok: true });
  });
}

export async function DELETE(_request: Request, context: Context) {
  return adminAmal(async () => {
    await xonaniOchir((await context.params).id);
    return Response.json({ ok: true });
  });
}
