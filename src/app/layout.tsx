import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xona ijarasi — soatbay",
  description: "Dars va kichik uchrashuvlar uchun xonani tanlang, 1–8 soat narxini hisoblang va sinov so‘rovini yuboring.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="uz"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
