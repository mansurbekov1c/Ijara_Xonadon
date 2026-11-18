import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieSozlama, adminTokenYarat, parolTeng } from "@/lib/admin-auth";
import { adminXato, obyekt } from "@/lib/admin-api";

export async function POST(request: Request) {
  const parol = process.env.ADMIN_PAROL;
  if (!parol) return adminXato("Admin sozlanmagan.", 503);
  let body: Record<string, unknown>;
  try { body = obyekt(await request.json()); }
  catch { return adminXato("So‘rov JSON shaklida bo‘lishi kerak.", 400); }
  if (typeof body.parol !== "string" || !parolTeng(body.parol, parol)) return adminXato("Parol noto‘g‘ri.", 401);
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ADMIN_COOKIE, adminTokenYarat(parol), adminCookieSozlama);
  return response;
}
