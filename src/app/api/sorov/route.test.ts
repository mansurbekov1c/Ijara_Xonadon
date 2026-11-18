import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { xonalar } from "@/lib/xonalar";

function sorov(body: unknown) {
  return POST(new Request("http://localhost/api/sorov", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

const togri = { xonaId: "X03", soat: 2, ism: "Sinovchi 01" };

describe("POST /api/sorov", () => {
  it("qabul misolini to‘liq qaytaradi", async () => {
    const response = await sorov(togri);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      sorovId: expect.stringMatching(/^S-[A-F0-9]{6}$/),
      ism: "Sinovchi 01",
      xona: { id: "X03", nomi: "Kichik studiya" },
      soat: 2,
      narx: 70000,
      jami: 140000,
    });
  });

  it.each(xonalar.flatMap((xona) => [1, 2, 3, 4, 5, 6, 7, 8].map((soat) => ({ xona, soat }))))("$xona.id × $soat narxini serverda hisoblaydi", async ({ xona, soat }) => {
    const response = await sorov({ xonaId: xona.id, soat, ism: "  Sinovchi 01  ", narx: 1, jami: 1 });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ism: "Sinovchi 01", xona: { id: xona.id, nomi: xona.nomi }, soat, narx: xona.narx, jami: xona.narx * soat });
  });

  it.each(["1", "8", " 3 "])("%j matn soatini qabul qiladi", async (soat) => {
    const response = await sorov({ ...togri, soat });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ soat: Number(soat), jami: 70000 * Number(soat) });
  });

  it.each(["0", "9", "2.5", "", " ", "2,5", "-1", "abc", "1e1", "03", "3.0", 0, 9, 2.5, -1, null, true, false, [], [2], {}, { toString: "2" }].map((soat) => ({ soat })))("$soat noto‘g‘ri soatni 400 bilan rad etadi", async ({ soat }) => {
    const response = await sorov({ ...togri, soat });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, xatolar: { soat: "1 dan 8 gacha butun son kiriting." } });
  });

  it.each(["", "   ", "A", "a".repeat(61), null, 12, true, {}, ["Ali"]].map((ism) => ({ ism })))("$ism noto‘g‘ri ismni 400 bilan rad etadi", async ({ ism }) => {
    const response = await sorov({ ...togri, ism });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, xatolar: { ism: expect.any(String) } });
  });

  it.each(["X00", "x03", "", null, 3, {}, ["X03"]].map((xonaId) => ({ xonaId })))("$xonaId noma’lum xona uchun 400 qaytaradi", async ({ xonaId }) => {
    const response = await sorov({ ...togri, xonaId });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, xatolar: { xonaId: "Ro‘yxatdan xona tanlang." } });
  });

  it("barcha maydon xatolarini birga qaytaradi", async () => {
    const response = await sorov({});
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, xatolar: {
      xonaId: "Ro‘yxatdan xona tanlang.",
      soat: "1 dan 8 gacha butun son kiriting.",
      ism: "Ismingizni kiriting.",
    } });
  });

  it.each([null, [], "matn", 42, false].map((body) => ({ body })))("$body JSON obyekt bo‘lmasa 400 qaytaradi", async ({ body }) => {
    const response = await sorov(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, xatolar: { umumiy: expect.any(String) } });
  });

  it("buzilgan JSON uchun 400 qaytaradi", async () => {
    const response = await POST(new Request("http://localhost/api/sorov", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, xatolar: { umumiy: "So‘rov JSON shaklida bo‘lishi kerak." } });
  });
});
