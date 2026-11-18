# Soatbay — xonalarni soatbay ijaraga olish

Dars yoki kichik uchrashuv uchun xona kerak bo‘lgan foydalanuvchi 4 ta xonani sig‘imi, jihozi va soatlik narxi bilan ko‘radi,
xonani tanlaydi, 1–8 soat kiritadi, jami narxni darhol ko‘radi va ismi bilan **band qilish so‘rovini** yuboradi.

**Jonli sayt:** https://ijara-xonadon.vercel.app

> Sinov loyihasi (Bilet 003): haqiqiy band qilish, to‘lov yoki xabar yuborish amalga oshirilmaydi. Ma’lumotlar sun’iy.

## Imkoniyatlar
- Xonalar ro‘yxati + "Necha kishi?" filtri (sig‘imi yetmaydigan xona belgilanadi)
- Xona tafsiloti alohida oynada; soat −/+ yoki qo‘lda; jami narx jonli hisoblanadi (`50 000 × 3 = 150 000 so‘m`)
- Ikki qatlamli tekshiruv: brauzerda va serverda (`/api/sorov`) — 0, 9, kasr son, bo‘sh ism rad etiladi
- Natijada ism, xona, soatlar soni, jami narx va so‘rov raqami
- Admin paneli (`/admin`, parol bilan): so‘rovlarni tasdiqlash/rad etish, xona qo‘shish, o‘chirish, vaqtincha to‘xtatish;
  tasdiqlangan xona mijozlarga "Band · HH:MM gacha" bo‘lib ko‘rinadi
- Telefon (390 px) va kompyuter (1366 px) uchun moslashgan, `prefers-reduced-motion` hurmat qilinadi

## Texnologiyalar
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Appwrite (TablesDB) · Vercel · Vitest · lucide-react

## Ishga tushirish
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # birlik testlari
npm run build      # production build
```
Baza va admin uchun muhit o‘zgaruvchilari (ixtiyoriy — ularsiz ham mijoz oqimi to‘liq ishlaydi):
`APPWRITE_API_KEY`, `ADMIN_PAROL` (`vercel env pull .env.local` bilan olinadi).

## Tekshirish misollari (biletdan)
1. X01 + 3 soat → **150 000 so‘m**
2. X03 + 2 soat + "Sinovchi 01" → tasdiqda "Kichik studiya", 2 soat, **140 000 so‘m**
3. 0 yoki 9 soat, kasr qiymat, bo‘sh ism → so‘rov yuborilmaydi
