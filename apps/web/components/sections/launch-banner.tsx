import { Calendar } from "lucide-react";

export function LaunchBanner() {
  return (
    <div className='relative overflow-hidden bg-gradient-to-r from-sky-600 to-sky-700 py-2.5 sm:py-3'>
      <div className='absolute inset-0 bg-[url("/grid.svg")] opacity-10' />
      <div className='relative mx-auto flex max-w-7xl items-center justify-center gap-2 sm:gap-3 px-4'>
        <Calendar className='h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0' />
        <p className='text-center text-xs font-semibold text-white sm:text-sm md:text-base'>
          🚀 Launching March 2026 · Join the waitlist today
        </p>
      </div>
    </div>
  );
}
