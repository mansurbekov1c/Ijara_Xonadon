import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminTokenTekshir } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/admin/kirish") return NextResponse.next();
  if (!adminTokenTekshir(request.cookies.get(ADMIN_COOKIE)?.value, process.env.ADMIN_PAROL)) {
    return NextResponse.json({ ok: false, xato: "Avval tizimga kiring." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/admin/:path*" };
