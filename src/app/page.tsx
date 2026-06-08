import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQ } from "@/components/marketing/FAQ";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main>
        <Hero />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
