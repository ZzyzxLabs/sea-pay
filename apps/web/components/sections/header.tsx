"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full size-11 hover:bg-slate-100/80'
                  aria-label='Open menu'
                >
                  <Menu className='h-6 w-6 text-slate-700' strokeWidth={2} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='w-full max-w-full sm:w-full sm:max-w-full h-full bg-white border-0 p-0 flex flex-col'
              >
                {/* X on the menu – top right */}
                <div className='flex items-center justify-end shrink-0 px-4 pt-4 pb-2'>
                  <SheetClose asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-full size-11 text-black hover:bg-slate-100 hover:text-black'
                      aria-label='Close menu'
                    >
                      <X className='h-6 w-6' strokeWidth={2.25} />
                    </Button>
                  </SheetClose>
                </div>
                {/* Nav links – full-bleed scroll area */}
                <nav className='flex-1 flex flex-col px-5 pb-6 overflow-auto'>
                  <div className='flex flex-col gap-1'>
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className='rounded-lg py-4 px-3 text-[17px] font-medium text-black hover:bg-slate-100 transition-colors'
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                  <div className='mt-auto pt-6'>
                    <SheetClose asChild>
                      <Button
                        asChild
                        className='w-full rounded-full h-12 text-base font-semibold bg-slate-900 text-white hover:bg-slate-800'
                      >
                        <a href='#cta'>Get started</a>
                      </Button>
                    </SheetClose>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
