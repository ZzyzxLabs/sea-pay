"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Menu,
  ChevronDown,
  Book,
  Code,
  FileCode,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NavDropdownColumn, type DropdownItem } from "./nav-dropdown-column";

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
    columns: [
      {
        header: "Resources",
        items: [
          {
            label: "API Documentation",
            href: "/developers/api",
            icon: <Book className='h-4 w-4 text-slate-700' />,
          },
          {
            label: "Webhooks",
            href: "/developers/webhooks",
            icon: <Code className='h-4 w-4 text-slate-700' />,
          },
          {
            label: "SDKs",
            href: "/developers/sdks",
            icon: <FileCode className='h-4 w-4 text-slate-700' />,
          },
        ],
      },
    ],
  },
  {
    label: "Pricing",
    href: "#pricing",
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
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <header className='w-full'>
      <div
        className={[
          "transition-all border-bi duration-300",
          scrolled
            ? "bg-white/50 backdrop-blur-md shadow-sm border-white/30 hover:bg-white"
            : "bg-transparent border-transparent",
        ].join(" ")}
      >
        <div className='relative mx-auto h-[64px] w-full max-w-[1280px] sm:px-6 lg:px-6'>
          {/* Left: logo */}
          <div className='absolute left-4 sm:left-6 top-1/2 -translate-y-1/2'>
            <Link
              href='/'
              className='flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900'
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='text-sky-600 rotate-90'
              >
                <path
                  d='M2 12C2 12 5 8 12 8C19 8 22 12 22 12M2 16C2 16 5 12 12 12C19 12 22 16 22 16M2 20C2 20 5 16 12 16C19 16 22 20 22 20'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              Sea Pay
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
                    className='flex items-center gap-1 rounded-md px-3 py-2 text-sm text-slate-700 hover:text-slate-900 uppercase'
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
                                className='rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
            {mounted && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className='rounded-full shadow-sm shadow-sky-100 uppercase'>
                    Sign up
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className='max-w-4xl p-0 bg-stone-50'
                  showCloseButton={false}
                >
                  <DialogHeader className='sr-only'>
                    <DialogTitle>Sign up for newsletter</DialogTitle>
                  </DialogHeader>
                  <div className='flex flex-col gap-6 rounded-lg bg-stone-50 p-8'>
                    <div className='space-y-1'>
                      <p className='text-base text-slate-700 font-bold'>
                        Sign up for our newsletter to hear our
                      </p>
                      <p className='text-base text-slate-700 font-bold'>
                        latest product updates
                      </p>
                    </div>
                    <form
                      onSubmit={handleSubmit}
                      className='flex items-center gap-0 rounded-lg bg-white shadow-sm'
                    >
                      <Input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Enter email for updates*'
                        required
                        className='h-12 flex-1 rounded-l-lg rounded-r-none border-0 bg-white px-4 text-sm focus-visible:ring-0'
                      />
                      <Button
                        type='submit'
                        className='h-12 rounded-l-none rounded-r-lg bg-slate-200 px-6 text-sm font-medium uppercase text-slate-700 hover:bg-slate-300'
                      >
                        Submit
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {!mounted && (
              <Button className='rounded-full shadow-sm shadow-sky-100 uppercase'>
                Sign up
              </Button>
            )}
          </div>

          {/* Mobile: menu */}
          <div className='absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 md:hidden'>
            {mounted ? (
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
            ) : (
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full'
                aria-label='Open menu'
              >
                <Menu className='h-5 w-5' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
