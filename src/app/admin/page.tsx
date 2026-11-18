import Link from "next/link";
import { ArrowLeft, DoorOpen } from "lucide-react";
import { adminRuxsati } from "@/lib/admin-api";
import { adminBandliklarniOl, adminSorovlarniOl, adminXonalarniOl, appwriteYoqilgan, bazaXatosiniYoz } from "@/lib/appwrite";
import { AdminKirish } from "@/components/admin-kirish";
import { AdminPanel } from "@/components/admin-panel";
import type { AdminSorov } from "@/lib/sorov";
import { xonalar as statikXonalar, type Xona } from "@/lib/xonalar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Boshqaruv — Soatbay", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const kirgan = await adminRuxsati();
  const bazaUlangan = appwriteYoqilgan();
  let xonalar: Xona[] = [];
  let sorovlar: AdminSorov[] = [];
  let bandliklar: Record<string, string> = {};
  let xato = "";
  if (kirgan) {
    if (bazaUlangan) {
      try { [xonalar, sorovlar, bandliklar] = await Promise.all([adminXonalarniOl(), adminSorovlarniOl(), adminBandliklarniOl()]); }
      catch (xatolik) { bazaXatosiniYoz("Admin ma’lumotlarini o‘qish", xatolik); xato = "Baza bilan bog‘lanib bo‘lmadi. Ro‘yxatni yangilab ko‘ring."; }
    } else {
      xonalar = [...statikXonalar];
    }
  }

  return <div className="site-shell">
    <header className="site-header container"><Link className="brand" href="/"><span className="brand-mark"><DoorOpen size={22} strokeWidth={1.5} aria-hidden="true" /></span><span><strong>Soatbay</strong><span className="brand-caption">SOATBAY IJARA</span></span></Link><Link className="admin-back" href="/"><ArrowLeft size={16} aria-hidden="true" />Saytga qaytish</Link></header>
    <main className="container admin-main">
      {kirgan ? <AdminPanel xonalar={xonalar} sorovlar={sorovlar} bandliklar={bandliklar} hozir={new Date().toISOString()} bazaUlangan={bazaUlangan} serverXato={xato} />
        : <><div className="admin-heading"><p className="eyebrow"><span className="tiny-line" />BOSHQARUV</p><h1>Admin paneli</h1><p className="hero-description">Davom etish uchun parolni kiriting.</p></div><AdminKirish /></>}
    </main>
  </div>;
}
