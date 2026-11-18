import { randomBytes, createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ADMIN_MUDDAT, adminTokenTekshir, adminTokenYarat, parolTeng } from "./admin-auth";

const parol = randomBytes(24).toString("hex");
const hozir = Date.parse("2026-11-18T08:00:00Z");

describe("admin paroli va tokeni", () => {
  it("parolni teng va farqli uzunliklarda xavfsiz solishtiradi", () => {
    expect(parolTeng(parol, parol)).toBe(true);
    expect(parolTeng("", parol)).toBe(false);
    expect(parolTeng(`${parol}x`, parol)).toBe(false);
    expect(parolTeng("x".repeat(parol.length), parol)).toBe(false);
  });
  it("belgilangan HMAC formatini yaratadi", () => {
    const exp = String(hozir / 1000 + ADMIN_MUDDAT);
    expect(adminTokenYarat(parol, hozir)).toBe(`${exp}.${createHmac("sha256", parol).update(`admin:${exp}`).digest("hex")}`);
  });
  it("8 soatgacha amal qiladi, aynan chegarada tugaydi", () => {
    const token = adminTokenYarat(parol, hozir);
    expect(adminTokenTekshir(token, parol, hozir)).toBe(true);
    expect(adminTokenTekshir(token, parol, hozir + ADMIN_MUDDAT * 1000 - 1)).toBe(true);
    expect(adminTokenTekshir(token, parol, hozir + ADMIN_MUDDAT * 1000)).toBe(false);
  });
  it("muddat yoki imzo soxtalashtirilsa rad etadi", () => {
    const [exp, imzo] = adminTokenYarat(parol, hozir).split(".");
    expect(adminTokenTekshir(`${Number(exp) - 1}.${imzo}`, parol, hozir)).toBe(false);
    expect(adminTokenTekshir(`${exp}.${"0".repeat(64)}`, parol, hozir)).toBe(false);
    expect(adminTokenTekshir(`${exp}.${imzo.slice(1)}`, parol, hozir)).toBe(false);
  });
  it("o‘zgargan yoki sozlanmagan parolda rad etadi", () => {
    const token = adminTokenYarat(parol, hozir);
    expect(adminTokenTekshir(token, `${parol}x`, hozir)).toBe(false);
    expect(adminTokenTekshir(token, undefined, hozir)).toBe(false);
    expect(adminTokenTekshir(token, "", hozir)).toBe(false);
  });
  it.each([undefined, "", "x", "1.aa", "9999999999999999.aa", "1e9.aa", "0".repeat(10000)])("noto‘g‘ri tokenni xatosiz rad etadi", (token) => expect(adminTokenTekshir(token, parol, hozir)).toBe(false));
  it("kelajakda yaratilgan token muddatini cheklaydi", () => expect(adminTokenTekshir(adminTokenYarat(parol, hozir + 1000), parol, hozir)).toBe(false));
});
