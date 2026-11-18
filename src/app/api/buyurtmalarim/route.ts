import { buyurtmalarHolati } from "@/lib/appwrite";

// GET /api/buyurtmalarim?ids=a,b — mijoz brauzerida saqlangan so'rov ID'lari holati
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",").map((s) => s.trim()).filter((s) => /^[a-zA-Z0-9_]{1,36}$/.test(s)).slice(0, 50);
  try {
    return Response.json({ ok: true, holatlar: await buyurtmalarHolati(ids) });
  } catch {
    return Response.json({ ok: false, holatlar: [] }, { status: 503 });
  }
}
