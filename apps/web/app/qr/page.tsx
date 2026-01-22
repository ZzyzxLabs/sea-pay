import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { PosQr } from "@/components/sections/pos-qr";

export default function QRPage() {
  return (
    <div className='relative overflow-hidden'>
      <div className='pointer-events-none absolute left-[-180px] top-[-120px] h-96 w-96 rounded-full bg-sky-100 blur-3xl' />
      <div className='pointer-events-none absolute right-[-140px] top-20 h-[420px] w-[420px] rounded-full bg-sky-50 blur-3xl' />
      <Header />
      <main className='relative z-10 py-24'>
        <PosQr />
      </main>
      <Footer />
    </div>
  );
}
