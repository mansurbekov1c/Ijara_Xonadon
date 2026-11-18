import { describe, expect, it } from "vitest";
import { formatSom, ismniTekshir, jamiNarx, soatniTekshir } from "./hisob";
import { xonalar } from "./xonalar";

describe("soatniTekshir", () => {
  it.each(["1", "2", "3", "4", "5", "6", "7", "8", " 3 ", "\t8\n"])("%j soatni qabul qiladi", (qiymat) => {
    expect(soatniTekshir(qiymat)).toEqual({ ok: true, soat: Number(qiymat) });
  });

  it.each(["", "0", "9", "2.5", "2,5", "-1", "abc", " ", "1e1", "03", "3.0", "+3", "1 2", "NaN", "Infinity", "0x3", "３", "1\n2"])("%j soatni rad etadi", (qiymat) => {
    expect(soatniTekshir(qiymat)).toEqual({ ok: false, xato: "1 dan 8 gacha butun son kiriting." });
  });
});

describe("ismniTekshir", () => {
  it.each(["", "   ", "\t\n"])("%j bo‘sh ismni rad etadi", (qiymat) => {
    expect(ismniTekshir(qiymat)).toEqual({ ok: false, xato: "Ismingizni kiriting." });
  });
  it.each(["A", " A ", "a".repeat(61)])("chegaradan tashqari uzunlikni rad etadi", (qiymat) => {
    expect(ismniTekshir(qiymat).ok).toBe(false);
  });
  it.each(["Al", "a".repeat(60), "Sinovchi 01", "G‘ayrat O‘ktamov", "<script>alert(1)</script>"])("%j ismni oddiy matn sifatida qabul qiladi", (ism) => {
    expect(ismniTekshir(` \t${ism}\n`)).toEqual({ ok: true, ism });
  });
});

describe("narx hisoblash va formatlash", () => {
  it("X01 × 3 = 150 000 so‘m", () => {
    expect(formatSom(jamiNarx(xonalar[0].narx, 3))).toBe("150 000 so‘m");
  });
  it("X03 × 2 = 140 000 so‘m", () => {
    expect(formatSom(jamiNarx(xonalar[2].narx, 2))).toBe("140 000 so‘m");
  });
  it.each([[0, "0 so‘m"], [999, "999 so‘m"], [1000, "1 000 so‘m"], [150000, "150 000 so‘m"], [1000000, "1 000 000 so‘m"]] as const)("%i ni oddiy bo‘shliq bilan formatlaydi", (qiymat, kutilgan) => {
    expect(formatSom(qiymat)).toBe(kutilgan);
    expect(formatSom(qiymat)).not.toMatch(/[\u00a0\u202f]/);
  });
  it.each(xonalar)("$id uchun 1 va 8 soat chegaralarini hisoblaydi", (xona) => {
    expect(jamiNarx(xona.narx, 1)).toBe(xona.narx);
    expect(jamiNarx(xona.narx, 8)).toBe(xona.narx * 8);
  });
});
