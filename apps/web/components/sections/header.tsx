"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Menu,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { NavDropdownColumn, type DropdownItem } from "./nav-dropdown-column";
import Image from "next/image";
type DropdownColumn = {
  header: string;
  items: DropdownItem[];
};

type NavItem = {
  label: string;
  href: string;
  columns?: DropdownColumn[];
  links?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  {
    label: "Seapay Cash",
    href: "/#seapay-cash",
  },
  {
    label: "QR & POS",
    href: "/#pos-qr",
  },
  {
    label: "FAQ",
    href: "/#faq",
  },
  {
    label: "Blog",
    href: "/blog",
  }
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className='w-full'>
      <div
        className={[
          "transition-all border-b duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm border-slate-200/60"
            : "bg-white/50 backdrop-blur-sm border-transparent",
        ].join(" ")}
      >
        <div className='relative mx-auto h-[64px] w-full max-w-[1280px] sm:px-6 lg:px-6'>
          {/* Left: logo */}
          <div className='absolute left-4 sm:left-6 top-1/2 -translate-y-1/2'>
            <Link
              href='/'
              className='flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900'
            >
              <Image src="/seapay-logo-64x64.png" alt="Seapay" width={32} height={32} className="h-8 w-8 rounded-[2px]" />
              Seapay
            </Link>
          </div>

          {/* Center: nav */}
          <nav
            aria-label='Main'
            className='mx-auto hidden h-full items-center justify-center md:flex'
          >
            {navItems.map((item) => {
              const hasDropdown = item.columns || item.links;

              return (
                <div key={item.href} className='relative group'>
                  <Link
                    href={item.href}
                    className='flex items-center gap-1 rounded-md px-3 py-2 text-base text-slate-700 hover:text-slate-900'
                  >
                    {item.label}
                    {hasDropdown && (
                      <ChevronDown className='relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-hover:rotate-180' />
                    )}
                  </Link>
                  {hasDropdown && (
                    <div className='pointer-events-none absolute left-0 top-full mt-2 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100'>
                      <div className='rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-md'>
                        {item.columns ? (
                          <div className='flex gap-8'>
                            {item.columns.map((column, idx) => (
                              <NavDropdownColumn
                                key={idx}
                                header={column.header}
                                items={column.items}
                              />
                            ))}
                          </div>
                        ) : item.links ? (
                          <div className='flex flex-col gap-2'>
                            {item.links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className='rounded-md px-2 py-2 text-base text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: CTA */}
          <div className='absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 hidden items-center gap-3 md:flex'>
            <Button disabled className='rounded-full shadow-sm bg-slate-200 text-slate-500 hover:bg-slate-200 text-base'>
              Coming soon
            </Button>
          </div>

          {/* Mobile: menu */}
          <div className='absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 md:hidden'>
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
                  <div className='text-base font-semibold text-slate-900'>
                    Menu
                  </div>
                  <nav className='flex flex-col gap-3'>
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className='text-lg text-slate-800 hover:text-slate-950'
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
                        className='text-base text-slate-700 hover:text-slate-900'
                      >
                        Pricing
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className='w-full rounded-full shadow-sm shadow-sky-100 text-base'>
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
    </div>
  );
}
