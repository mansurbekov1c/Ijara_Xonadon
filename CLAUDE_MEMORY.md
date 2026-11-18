# CLAUDE_MEMORY — Xona ijarasi (musobaqa, Bilet 003)

## Holat (2026-11-18)
- Viloyat bosqichi, "Eng yaxshi veb-sayt" yo'nalishi, 120 daqiqa. Bilet 003: "Xonalarni soatbay ijaraga olish".
- Stack: Next.js 16 (App Router, `src/`), TypeScript, Tailwind 4, lucide-react, vitest.
- GitHub: `mansurbekov1c/Ijara_Xonadon` (public). Vercel loyihasi `ijara-xonadon` — `main`ga push avtomatik deploy.
- Appwrite (2-bosqich, vaqt qolsa): loyiha ID `6afd4b6f0038f578e5ca`, CLI login qilingan (foydalanuvchi o'zi).

## Holat 12:50
- Jonli: https://ijara-xonadon.vercel.app (nomi Soatbay). Admin `/admin` (parol Vercel env `ADMIN_PAROL`, foydalanuvchi o'zi kiritgan).
- Appwrite ulangan: so'rovlar `sorovlar` jadvaliga (telefon bilan) yoziladi; admin tasdiqlasa xona "Band · HH:MM gacha".
- Mijoz hisobi: ism, familiya, telefon — brauzer localStorage'da (parolsiz, sinov). Hakam testida: ism "Sinovchi", familiya "01".
- 13:02: bron boshlanish vaqti (forma+server+baza), admin: bron vaqti/telefon, Bekor qilish/Erta tugatish (confirm ogohlantirish), ustma-ust bron 409. Holat enum'ga `bekor` qo'shildi.
- Mijoz "Buyurtmalarim": so'rov rowId'lari localStorage'da, holat `/api/buyurtmalarim?ids=` dan har 20 s.
- Keyingi bosqich (qilinmagan): haqiqiy auth (SMS), to'lov, mijoz tomonidan bekor qilish.

## Qarorlar va sabablari
- Faqat biletdagi 4 xona ma'lumoti — nizom jadvaldan tashqari ma'lumotni taqiqlaydi (manzil/rasm/bino yo'q).
- Server/baza nizomda talab qilinmaydi; Next.js API route (`/api/sorov`) server tomonda qayta tekshiradi — "zamonaviy texnologiya" bali uchun. Saqlash yo'q.
- Dizayn: qorong'i monoxrom premium (foydalanuvchi zoner.uz uslubini tanladi), Manrope, 10% marjon `#FF6B4A` urg'u.
- `.npmrc` `legacy-peer-deps=true` — vitest peer konflikti (npm ERESOLVE) sababli.

## Hakam tekshiruvi (bilet)
1. X01 + 3 soat → 150 000 so'm. 2. X03 + 2 soat + "Sinovchi 01" → "Kichik studiya", 2 soat, 140 000 so'm.
3. 0/9 soat, kasr, bo'sh ism (yoki faqat bo'shliq) → yuborilmaydi. Kengliklar: 390 va 1366 px.

## Buyruqlar
`npm run dev` · `npm run lint && npx tsc --noEmit && npm test && npm run build`

## Qaytarilgan xatolar
- create-next-app papka nomida bosh harf bo'lsa rad etadi → boshqa nomda yaratib ko'chirildi.
- Windows'da `cp -r node_modules` juda sekin — `Move-Item` (rename) ishlat.
