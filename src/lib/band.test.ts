import { describe, expect, it } from "vitest";
import { bandTugashHisobla, bandVaqti, vaqtMatni } from "./band";

const hozir = new Date("2026-11-18T08:00:00.000Z");

describe("bandTugashHisobla", () => {
  it("bo‘sh xonani hozirdan hisoblaydi va sanani o‘zgartirmaydi", () => {
    expect(bandTugashHisobla(hozir, [], 2)).toBe("2026-11-18T10:00:00.000Z");
    expect(hozir.toISOString()).toBe("2026-11-18T08:00:00.000Z");
  });
  it("saralanmagan navbatning eng kech tugashidan davom etadi", () => {
    const mavjudlar = ["2026-11-18T10:30:00Z", "2026-11-18T09:00:00Z", "2026-11-18T15:00:00+05:00"];
    expect(bandTugashHisobla(hozir, mavjudlar, 3)).toBe("2026-11-18T13:30:00.000Z");
    expect(mavjudlar).toHaveLength(3);
  });
  it("o‘tgan va aynan hozir tugagan bandlikni hisobga olmaydi", () => {
    expect(bandTugashHisobla(hozir, ["2026-11-17T19:00:00Z", hozir.toISOString()], 1)).toBe("2026-11-18T09:00:00.000Z");
  });
  it("null va noto‘g‘ri saqlangan sanalar hisobni buzmaydi", () => {
    expect(bandTugashHisobla(hozir, [null, "", "xato"], 8)).toBe("2026-11-18T16:00:00.000Z");
  });
  it("navbatni keyingi kun va yilga o‘tkazadi", () => {
    expect(bandTugashHisobla(hozir, ["2026-12-31T23:00:00Z"], 2)).toBe("2027-01-01T01:00:00.000Z");
  });
  it.each([0, 9, -1, 2.5, NaN, Infinity])("%s soatni rad etadi", (soat) => {
    expect(() => bandTugashHisobla(hozir, [], soat)).toThrow(RangeError);
  });
  it("noto‘g‘ri hozirgi sanani rad etadi", () => expect(() => bandTugashHisobla(new Date(NaN), [], 1)).toThrow(RangeError));
});

describe("Toshkent vaqti", () => {
  it("shu kun uchun HH:MM ko‘rsatadi", () => expect(bandVaqti("2026-11-18T10:30:00Z", hozir.toISOString())).toBe("15:30 gacha"));
  it("UTC kuni bir xil bo‘lsa ham Toshkentdagi yangi kunni ajratadi", () => {
    expect(bandVaqti("2026-11-18T19:30:00Z", hozir.toISOString())).toBe("19-noy, 00:30 gacha");
  });
  it("yil almashganini hisobga oladi", () => expect(bandVaqti("2027-11-18T10:30:00Z", hozir.toISOString())).toBe("18-noy, 15:30 gacha"));
  it.each([undefined, null, "", "xato", "2026-11-18T07:59:59Z", hozir.toISOString()])("%s tugagan yoki noto‘g‘ri bandlikni yashiradi", (qiymat) => expect(bandVaqti(qiymat, hozir.toISOString())).toBeNull());
  it("yuborilgan vaqtni Toshkentda formatlaydi", () => expect(vaqtMatni("2026-11-18T19:30:00Z")).toBe("19-noy, 00:30"));
});
