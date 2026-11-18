import "server-only";
import { Client, ID, Query, TablesDB, type Models } from "node-appwrite";
import { bandTugashHisobla, vaqtMatni } from "./band";
import type { AdminSorov, BuyurtmaHolati, SorovNatijasi } from "./sorov";
import { keyingiXonaId, type YangiXona } from "./xona-tekshir";
import { xonalar, type Xona } from "./xonalar";

const databaseId = "ijara";
type XonaQatori = Models.Row & Omit<Xona, "id">;
type SorovQatori = Models.Row & Omit<AdminSorov, "id" | "yaratilgan">;

export class BazaXatosi extends Error {
  constructor(public status: number, xabar: string) { super(xabar); }
}

export function appwriteYoqilgan(): boolean {
  return Boolean(process.env.APPWRITE_API_KEY?.trim());
}

function baza(): TablesDB {
  const kalit = process.env.APPWRITE_API_KEY;
  if (!kalit?.trim()) throw new BazaXatosi(503, "Baza ulanmagan — APPWRITE_API_KEY sozlanmagan.");
  return new TablesDB(new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_PROJECT_ID || "6afd4b6f0038f578e5ca")
    .setKey(kalit));
}

export function bazaXatosiniYoz(amal: string, xato: unknown) {
  const kod = xato && typeof xato === "object" && "code" in xato && typeof xato.code === "number" ? xato.code : "noma’lum";
  // SDK xatosida kalit yoki shaxsiy ma’lumot bo‘lishi mumkin; faqat kod yoziladi.
  console.error(`[Appwrite] ${amal}; kod: ${kod}`);
}

async function barchaQatorlar<T extends Models.Row>(db: TablesDB, tableId: string, queries: string[] = []): Promise<T[]> {
  const rows: T[] = [];
  let cursor: string | undefined;
  do {
    const sahifa = await db.listRows<T>({ databaseId, tableId,
      queries: [...queries, Query.orderAsc("$id"), Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
      total: false,
    });
    rows.push(...sahifa.rows);
    cursor = sahifa.rows.length === 100 ? sahifa.rows[sahifa.rows.length - 1].$id : undefined;
  } while (cursor);
  return rows;
}

function xonaOl(row: XonaQatori): Xona {
  return { id: row.$id, nomi: row.nomi, sigim: row.sigim, jihoz: row.jihoz, narx: row.narx, faol: row.faol };
}

function sorovOl(row: SorovQatori): AdminSorov {
  return { id: row.$id, yaratilgan: row.$createdAt, xonaId: row.xonaId, xonaNomi: row.xonaNomi,
    ism: row.ism, soat: row.soat, jami: row.jami, holat: row.holat, bandTugash: row.bandTugash ?? null,
    boshlanish: row.boshlanish ?? null, telefon: row.telefon ?? null };
}

export async function adminXonalarniOl(): Promise<Xona[]> {
  return (await barchaQatorlar<XonaQatori>(baza(), "xonalar")).map(xonaOl);
}

export async function xonalarniOl(): Promise<Xona[]> {
  if (appwriteYoqilgan()) {
    try { return await adminXonalarniOl(); }
    catch (xato) { bazaXatosiniYoz("Xonalarni o‘qish; statik ro‘yxat ishlatiladi", xato); }
  }
  return xonalar.map((xona) => ({ ...xona, faol: true }));
}

export async function adminBandliklarniOl(): Promise<Record<string, string>> {
  const rows = await barchaQatorlar<SorovQatori>(baza(), "sorovlar", [
    Query.equal("holat", "tasdiqlangan"), Query.greaterThan("bandTugash", new Date().toISOString()),
    Query.select(["$id", "xonaId", "bandTugash"]),
  ]);
  const natija: Record<string, string> = Object.create(null);
  for (const row of rows) {
    if (row.bandTugash && (!natija[row.xonaId] || Date.parse(row.bandTugash) > Date.parse(natija[row.xonaId]))) {
      natija[row.xonaId] = row.bandTugash;
    }
  }
  return { ...natija };
}

export async function bandliklarniOl(): Promise<Record<string, string>> {
  if (!appwriteYoqilgan()) return {};
  try { return await adminBandliklarniOl(); }
  catch (xato) { bazaXatosiniYoz("Bandlikni o‘qish", xato); return {}; }
}

export async function sorovniSaqlash(sorov: SorovNatijasi, telefon?: string, boshlanish?: string): Promise<string> {
  if (appwriteYoqilgan()) {
    try {
      const row = await baza().createRow({ databaseId, tableId: "sorovlar", rowId: ID.unique(), data: {
        xonaId: sorov.xona.id, xonaNomi: sorov.xona.nomi, ism: sorov.ism, soat: sorov.soat,
        jami: sorov.jami, holat: "kutilmoqda", bandTugash: null, ...(telefon ? { telefon } : {}), ...(boshlanish ? { boshlanish } : {}),
      } });
      sorov.rowId = row.$id;
      return `S-${row.$id.slice(-6).toUpperCase()}`;
    } catch (xato) { bazaXatosiniYoz("So‘rovni yozish; mahalliy raqam qaytariladi", xato); }
  }
  return sorov.sorovId;
}

// Mijoz "Buyurtmalarim": faqat o'zida saqlangan (taxmin qilib bo'lmaydigan) qator ID'lari bo'yicha holat
export async function buyurtmalarHolati(ids: string[]): Promise<BuyurtmaHolati[]> {
  if (!appwriteYoqilgan() || !ids.length) return [];
  const natija = await baza().listRows<SorovQatori>({ databaseId, tableId: "sorovlar",
    queries: [Query.equal("$id", ids), Query.select(["$id", "holat", "bandTugash"]), Query.limit(50)], total: false });
  return natija.rows.map((r) => ({ id: r.$id, holat: r.holat, bandTugash: r.bandTugash ?? null }));
}

export async function adminSorovlarniOl(): Promise<AdminSorov[]> {
  const natija = await baza().listRows<SorovQatori>({ databaseId, tableId: "sorovlar",
    queries: [Query.orderDesc("$createdAt"), Query.limit(100)], total: false });
  return natija.rows.map(sorovOl);
}

// Mijoz o'z bronini bekor qiladi: egaligi telefon bilan tekshiriladi; boshlangan bronni bekor qilib bo'lmaydi
export async function mijozBekorQiladi(id: string, telefon: string): Promise<void> {
  const db = baza();
  const row = await db.getRow<SorovQatori>({ databaseId, tableId: "sorovlar", rowId: id });
  if (!row.telefon || row.telefon !== telefon) throw new BazaXatosi(403, "Bu bron sizning hisobingizga tegishli emas.");
  if (row.holat !== "kutilmoqda" && row.holat !== "tasdiqlangan") throw new BazaXatosi(409, "Bu bronni bekor qilib bo‘lmaydi.");
  if (row.holat === "tasdiqlangan" && (!row.boshlanish || Date.parse(row.boshlanish) <= Date.now())) {
    throw new BazaXatosi(409, "Bron boshlangan — bekor qilish uchun admin bilan bog‘laning.");
  }
  await db.updateRow({ databaseId, tableId: "sorovlar", rowId: id, data: { holat: "mijoz_bekor", bandTugash: null } });
}

// Tasdiqlangan bronni bekor qilish (mijoz kelmadi) yoki erta tugatish (erta ketdi)
export async function bronniOzgartir(id: string, amal: "bekor" | "tugat"): Promise<void> {
  const db = baza();
  const row = await db.getRow<SorovQatori>({ databaseId, tableId: "sorovlar", rowId: id });
  if (row.holat !== "tasdiqlangan") throw new BazaXatosi(409, "Faqat tasdiqlangan bronni o‘zgartirish mumkin.");
  const hozir = new Date().toISOString();
  if (amal === "bekor") {
    await db.updateRow({ databaseId, tableId: "sorovlar", rowId: id, data: { holat: "bekor", bandTugash: null } });
  } else {
    if (!row.bandTugash || Date.parse(row.bandTugash) <= Date.now()) throw new BazaXatosi(409, "Bu bron allaqachon tugagan.");
    if (row.boshlanish && Date.parse(row.boshlanish) > Date.now()) throw new BazaXatosi(409, "Bron hali boshlanmagan — uni bekor qiling.");
    // holat "tugatildi" — xona darhol bo'shaydi, bandTugash = haqiqiy tugatilgan vaqt
    await db.updateRow({ databaseId, tableId: "sorovlar", rowId: id, data: { holat: "tugatildi", bandTugash: hozir } });
  }
}

export async function sorovniBoshqar(id: string, amal: "tasdiqla" | "rad"): Promise<void> {
  const db = baza();
  const transactionId = (await db.createTransaction({ ttl: 60 })).$id;
  try {
    const row = await db.getRow<SorovQatori>({ databaseId, tableId: "sorovlar", rowId: id, transactionId });
    if (row.holat !== "kutilmoqda") throw new BazaXatosi(409, "Bu so‘rov allaqachon ko‘rib chiqilgan.");
    let bandTugash: string | null = null;
    if (amal === "tasdiqla") {
      const xona = await db.getRow<XonaQatori>({ databaseId, tableId: "xonalar", rowId: row.xonaId, transactionId });
      // Bir xonaning parallel tasdiqlari shu qator orqali tranzaksiyada to‘qnashadi.
      await db.updateRow({ databaseId, tableId: "xonalar", rowId: row.xonaId, data: { faol: xona.faol }, transactionId });
      const hozir = new Date();
      const mavjudlar = await db.listRows<SorovQatori>({ databaseId, tableId: "sorovlar", transactionId,
        queries: [Query.equal("xonaId", row.xonaId), Query.equal("holat", "tasdiqlangan"),
          Query.greaterThan("bandTugash", hozir.toISOString()), Query.orderDesc("bandTugash"), Query.limit(1)], total: false });
      const bosh = row.boshlanish;
      // Mijoz boshlanish vaqtini tanlagan bo'lsa — aynan o'sha oraliq band bo'ladi
      if (bosh && Number.isFinite(Date.parse(bosh))) {
        const b = Date.parse(bosh), t = b + row.soat * 3_600_000;
        // Ustma-ust bronni tekshirish: shu xonaning tasdiqlangan oraliqlari bilan kesishmasin
        const band = await db.listRows<SorovQatori>({ databaseId, tableId: "sorovlar", transactionId,
          queries: [Query.equal("xonaId", row.xonaId), Query.equal("holat", "tasdiqlangan"),
            Query.greaterThan("bandTugash", new Date(b).toISOString()), Query.limit(100)], total: false });
        const tuqnash = band.rows.find((x) => {
          if (!x.bandTugash) return false;
          const xt = Date.parse(x.bandTugash);
          const xb = x.boshlanish ? Date.parse(x.boshlanish) : xt - x.soat * 3_600_000;
          return xb < t && xt > b;
        });
        if (tuqnash) throw new BazaXatosi(409, `Bu vaqt band: ${tuqnash.ism} (${vaqtMatni(tuqnash.boshlanish ?? tuqnash.bandTugash!)} — ${vaqtMatni(tuqnash.bandTugash!)}).`);
        bandTugash = new Date(t).toISOString();
      } else {
        bandTugash = bandTugashHisobla(hozir, mavjudlar.rows.map((item) => item.bandTugash), row.soat);
      }
    }
    await db.updateRow({ databaseId, tableId: "sorovlar", rowId: id, transactionId,
      data: { holat: amal === "tasdiqla" ? "tasdiqlangan" : "rad", bandTugash } });
    await db.updateTransaction({ transactionId, commit: true });
  } catch (xato) {
    try { await db.updateTransaction({ transactionId, rollback: true }); }
    catch (bekorXato) { bazaXatosiniYoz("Tranzaksiyani bekor qilish", bekorXato); }
    throw xato;
  }
}

export async function xonaQosh(xona: YangiXona): Promise<Xona> {
  const db = baza();
  // Bir vaqtda qo‘shilgan xonalar ID to‘qnashuvida qayta raqamlanadi.
  for (let urinish = 0; urinish < 3; urinish++) {
    const rows = await barchaQatorlar<XonaQatori>(db, "xonalar", [Query.select(["$id"])]);
    const rowId = keyingiXonaId(rows.map((row) => row.$id));
    try {
      return xonaOl(await db.createRow<XonaQatori>({ databaseId, tableId: "xonalar", rowId, data: { ...xona, faol: true } }));
    } catch (xato) {
      if (!(xato && typeof xato === "object" && "code" in xato && xato.code === 409) || urinish === 2) throw xato;
    }
  }
  throw new BazaXatosi(409, "Xona qo‘shilmadi. Qayta urinib ko‘ring.");
}

export async function xonaFaolliginiOzgartir(id: string, faol: boolean): Promise<void> {
  await baza().updateRow({ databaseId, tableId: "xonalar", rowId: id, data: { faol } });
}

export async function xonaniOchir(id: string): Promise<void> {
  await baza().deleteRow({ databaseId, tableId: "xonalar", rowId: id });
}
