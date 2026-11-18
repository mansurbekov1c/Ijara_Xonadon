import { describe, expect, it } from "vitest";
import { keyingiXonaId, xonaniTekshir } from "./xona-tekshir";

const togri = { nomi: "Ijod xonasi", jihoz: "stol", sigim: 10, narx: 50000 };

describe("xonaniTekshir", () => {
  it("matnlarni tozalaydi va begona maydonlarni tashlaydi", () => {
    expect(xonaniTekshir({ ...togri, nomi: " Ijod xonasi ", jihoz: " stol ", sigim: " 10 ", narx: "50000", id: "X01", faol: false })).toEqual({ ok: true, xona: togri });
  });
  it.each([{ nomi: "Al", jihoz: "x", sigim: 1, narx: 1000 }, { nomi: "x".repeat(60), jihoz: "x".repeat(60), sigim: 500, narx: 10000000 }])("chegaralarni qabul qiladi", (xona) => expect(xonaniTekshir(xona)).toEqual({ ok: true, xona }));
  it.each(["", " ", "A", "x".repeat(61), null, 12, [], {}])("%j nomini rad etadi", (nomi) => expect(xonaniTekshir({ ...togri, nomi })).toMatchObject({ ok: false, xatolar: { nomi: expect.any(String) } }));
  it.each(["", " ", "x".repeat(61), null, 12, [], {}])("%j jihozni rad etadi", (jihoz) => expect(xonaniTekshir({ ...togri, jihoz })).toMatchObject({ ok: false, xatolar: { jihoz: expect.any(String) } }));
  it.each([0, 501, 2.5, -1, NaN, Infinity, "", " ", "1e2", "01", "1.0", "0x10", "1,5", true, null, [], {}])("%j sig‘imni rad etadi", (sigim) => expect(xonaniTekshir({ ...togri, sigim })).toMatchObject({ ok: false, xatolar: { sigim: expect.any(String) } }));
  it.each([999, 10000001, 1000.5, -1000, NaN, Infinity, "", " ", "1e4", "10 000", "0x1000", true, null, [], {}])("%j narxni rad etadi", (narx) => expect(xonaniTekshir({ ...togri, narx })).toMatchObject({ ok: false, xatolar: { narx: expect.any(String) } }));
  it.each([null, undefined, [], true, "matn", 1, {}])("%j uchun barcha maydonlarni tekshiradi", (qiymat) => expect(xonaniTekshir(qiymat)).toEqual({ ok: false, xatolar: { nomi: expect.any(String), sigim: expect.any(String), jihoz: expect.any(String), narx: expect.any(String) } }));
});

describe("keyingiXonaId", () => {
  it.each([[[], "X01"], [["X04", "X01", "X03"], "X05"], [["X99", "X09"], "X100"], [["X100", "X99", "custom", "x999", "Xno"], "X101"]] as const)("%j dan %s yaratadi", (idlar, id) => expect(keyingiXonaId(idlar)).toBe(id));
});
