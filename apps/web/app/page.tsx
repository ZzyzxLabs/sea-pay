"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { LaunchBanner } from "@/components/sections/launch-banner";
import { PosQr } from "@/components/sections/pos-qr";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBanner(currentScrollY <= 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className='relative min-h-screen'>
      {/* Background blobs - responsive positioning */}
      <div className='pointer-events-none absolute left-[-100px] sm:left-[-180px] top-[-60px] sm:top-[-120px] h-48 w-48 sm:h-96 sm:w-96 rounded-full bg-sky-100 blur-3xl' />
      <div className='pointer-events-none absolute right-[-80px] sm:right-[-140px] top-10 sm:top-20 h-[200px] w-[200px] sm:h-[420px] sm:w-[420px] rounded-full bg-sky-50 blur-3xl' />
      
      {/* Header wrapper - shifts based on banner visibility */}
      <header 
        className={`fixed inset-x-0 z-40 transition-transform duration-300 ${
          showBanner ? 'translate-y-0' : '-translate-y-[40px]'
        }`}
      >
        <LaunchBanner />
        <Header />
      </header>
      
      {/* Main content with stable padding to prevent layout shifts */}
      <main className='relative z-10 pt-[104px]'>
        <Hero />
        <PosQr />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
