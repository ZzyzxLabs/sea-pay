import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/container";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/80">
      <Container className="flex flex-col items-center gap-4 py-6 text-sm text-slate-600 sm:flex-row sm:justify-between">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Seapay. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href='https://x.com/seapay_ai'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200'
            aria-label='Follow us on X'
          >
            <Image
              src='/x-icon.svg'
              alt='X'
              width={16}
              height={16}
              className='h-4 w-4'
            />
          </Link>
          <Link
            href='https://t.me/seapayai'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200'
            aria-label='Join our Telegram'
          >
            <Image
              src='/telegram-icon.svg'
              alt='Telegram'
              width={16}
              height={16}
              className='h-4 w-4'
            />
          </Link>
        </div>
      </Container>
    </footer>
  );
}

