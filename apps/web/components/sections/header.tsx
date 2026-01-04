"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

type NavItem = {
  label: string;
  href: string;
  links: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  {
    label: "Product",
    href: "/product",
    links: [
      { label: "Overview", href: "/product/overview" },
      { label: "Checkout links", href: "/product/checkout-links" },
      { label: "POS & QR", href: "/product/pos" },
    ],
  },
  {
    label: "Developers",
    href: "/developers",
    links: [
      { label: "API reference", href: "/developers/api" },
      { label: "Webhooks", href: "/developers/webhooks" },
      { label: "SDKs", href: "/developers/sdks" },
    ],
  },
  {
    label: "Pricing",
    href: "/pricing",
    links: [
      { label: "Plans", href: "/pricing#plans" },
      { label: "Enterprise", href: "/pricing/enterprise" },
      { label: "Compare", href: "/pricing/compare" },
    ],
  },
  {
    label: "Company",
    href: "/company",
    links: [
      { label: "About", href: "/company/about" },
      { label: "Security", href: "/company/security" },
      { label: "Status", href: "https://status.seapay.example" },
    ],
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className='fixed inset-x-0 top-0 z-50'>
      <div
        className={[
          "transition-all border-b",
          scrolled
            ? "bg-white/50 backdrop-blur-md shadow-sm border-white/30 hover:bg-white"
            : "bg-transparent border-transparent",
        ].join(" ")}
      >
        <div className='relative mx-auto flex h-[64px] w-full items-center sm:px-6 lg:px-6 max-w-[1280px]'>
          <Link
            href='/'
            className='text-lg font-semibold tracking-tight text-slate-900'
          >
            Seapay
          </Link>

          <nav
            aria-label='Main'
            className='hidden flex-1 items-center justify-center gap-4 md:flex'
          >
            {navItems.map((item) => (
              <div key={item.href} className='relative group'>
                <Link
                  href={item.href}
                  className='flex items-center gap-1 rounded-md px-3 py-2 text-sm text-slate-700 hover:text-slate-900'
                >
                  {item.label}
                  <ChevronDown className='relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-hover:rotate-180' />
                </Link>
                <div className='pointer-events-none absolute left-0 top-full mt-2 w-56 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100'>
                  <div className='rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-md'>
                    <div className='flex flex-col gap-2'>
                      {item.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className='rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className='hidden items-center gap-3 md:flex'>
            <Button className='rounded-full shadow-sm shadow-sky-100' asChild>
              <a href='#cta'>Get started</a>
            </Button>
          </div>

          <div className='md:hidden'>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full'
                  aria-label='Open menu'
                >
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[320px]'>
                <div className='flex flex-col gap-6 pt-6'>
                  <div className='text-sm font-semibold text-slate-900'>
                    Menu
                  </div>
                  <nav className='flex flex-col gap-3'>
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className='text-base text-slate-800 hover:text-slate-950'
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className='h-px bg-slate-200' />
                  <div className='flex flex-col gap-3'>
                    <SheetClose asChild>
                      <Link
                        href='#pricing'
                        className='text-sm text-slate-700 hover:text-slate-900'
                      >
                        Pricing
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className='w-full rounded-full shadow-sm shadow-sky-100'>
                        <a href='#cta'>Get started</a>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
