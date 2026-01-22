import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { LaunchBanner } from "@/components/sections/launch-banner";
import { PosQr } from "@/components/sections/pos-qr";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <div className='relative overflow-hidden min-h-screen'>
      {/* Background blobs - responsive positioning */}
      <div className='pointer-events-none absolute left-[-100px] sm:left-[-180px] top-[-60px] sm:top-[-120px] h-48 w-48 sm:h-96 sm:w-96 rounded-full bg-sky-100 blur-3xl' />
      <div className='pointer-events-none absolute right-[-80px] sm:right-[-140px] top-10 sm:top-20 h-[200px] w-[200px] sm:h-[420px] sm:w-[420px] rounded-full bg-sky-50 blur-3xl' />
      
      {/* Fixed banner at top */}
      <div className='fixed inset-x-0 top-0 z-50'>
        <LaunchBanner />
      </div>
      
      {/* Header shifted down by banner height */}
      <div className='fixed inset-x-0 top-[40px] z-40'>
        <Header />
      </div>
      
      {/* Main content with padding for fixed header + banner */}
      <main className='relative z-10 pt-[108px]'>
        <Hero />
        <PosQr />
      </main>
      <Footer />
    </div>
  );
}
