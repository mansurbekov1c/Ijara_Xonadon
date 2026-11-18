import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieSozlama } from "@/lib/admin-auth";
import { adminRuxsati, adminXato } from "@/lib/admin-api";

export async function POST() {
  if (!await adminRuxsati()) return adminXato("Avval tizimga kiring.", 401);
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieSozlama, maxAge: 0 });
  return response;
}
