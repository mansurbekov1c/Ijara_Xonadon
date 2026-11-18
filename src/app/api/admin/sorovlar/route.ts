import { adminAmal } from "@/lib/admin-api";
import { adminSorovlarniOl } from "@/lib/appwrite";

export async function GET() {
  return adminAmal(async () => Response.json({ ok: true, sorovlar: await adminSorovlarniOl() }, { headers: { "Cache-Control": "no-store" } }));
}
