import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "ijara_admin";
export const ADMIN_MUDDAT = 8 * 60 * 60;

export function parolTeng(kiritilgan: string, parol: string): boolean {
  return timingSafeEqual(createHash("sha256").update(kiritilgan).digest(), createHash("sha256").update(parol).digest());
}

function imzo(exp: string, parol: string): string {
  return createHmac("sha256", parol).update(`admin:${exp}`).digest("hex");
}

export function adminTokenYarat(parol: string, hozir = Date.now()): string {
  const exp = String(Math.floor(hozir / 1000) + ADMIN_MUDDAT);
  return `${exp}.${imzo(exp, parol)}`;
}

export function adminTokenTekshir(token: string | undefined, parol: string | undefined, hozir = Date.now()): boolean {
  if (!token || !parol || !/^\d{10,11}\.[a-f0-9]{64}$/.test(token)) return false;
  const [exp, hmac] = token.split(".");
  const muddat = Number(exp) - Math.floor(hozir / 1000);
  return muddat > 0 && muddat <= ADMIN_MUDDAT && timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(imzo(exp, parol), "hex"));
}

export const adminCookieSozlama = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: ADMIN_MUDDAT,
};
