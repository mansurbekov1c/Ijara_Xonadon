import { NavbarHisob } from "@/components/navbar-hisob";
import { ArrowDown, DoorOpen, ArrowUpRight } from "lucide-react";
import { XonalarRoyxati } from "@/components/xonalar-royxati";
import Link from "next/link";
import { bandliklarniOl, xonalarniOl } from "@/lib/appwrite";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [xonalar, bandliklar] = await Promise.all([xonalarniOl(), bandliklarniOl()]);
  return (
    <div className="site-shell">
      <header className="site-header container">
        <Link className="brand" href="/" aria-label="Xona ijarasi — bosh sahifa">
          <span className="brand-mark"><DoorOpen size={22} strokeWidth={1.5} aria-hidden="true" /></span>
          <span><strong>Soatbay</strong><span className="brand-caption">XONALARNI SOATBAY IJARA</span></span>
        </Link>
        <NavbarHisob />
      </header>

      <main className="container" id="asosiy">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow"><span className="tiny-line" /> XONALAR · SIG‘IM · NARXLAR</p>
          <h1 id="hero-title">Dars va uchrashuvlar<br className="desktop-break" /> uchun xona <span className="hero-muted">— soatbay</span></h1>
          <p className="hero-description">Xonani tanlang, kerakli soatni belgilang va so‘rov yuboring.</p>
          <a className="hero-link" href="#xonalar">O‘zingizga mos xonani toping <ArrowDown size={16} strokeWidth={1.5} aria-hidden="true" /></a>
          <div className="hero-index" aria-hidden="true"><span>01 — 04</span><ArrowUpRight size={28} strokeWidth={1} /></div>
        </section>

        <XonalarRoyxati xonalar={xonalar} bandliklar={bandliklar} hozir={new Date().toISOString()} />

        <aside className="trial-note"><span className="note-icon"><DoorOpen size={17} strokeWidth={1.5} aria-hidden="true" /></span><p><strong>Bir necha qadam. Bitta qulay xona.</strong><span>Bu sinov loyihasi. Haqiqiy band qilish yoki to‘lov amalga oshirilmaydi.</span></p><span className="eyebrow trial-label">SINOV REJIMI</span></aside>
      </main>

      <footer className="site-footer container"><span>© Soatbay</span><span>Sinov loyihasi · Ma’lumotlar sun’iy</span><Link href="/admin" prefetch={false}>Admin</Link></footer>
    </div>
  );
}
