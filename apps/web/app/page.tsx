import { FAQ } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { FinalCTA } from "@/components/sections/final-cta";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Pricing } from "@/components/sections/pricing";
import { Security } from "@/components/sections/security";

export default function Home() {
  return (
    <div className='relative overflow-hidden'>
      <div className='pointer-events-none absolute left-[-180px] top-[-120px] h-96 w-96 rounded-full bg-sky-100 blur-3xl' />
      <div className='pointer-events-none absolute right-[-140px] top-20 h-[420px] w-[420px] rounded-full bg-sky-50 blur-3xl' />
      <Header />
      <main className='relative z-10 space-y-20 pb-24 pt-16'>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Security />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
