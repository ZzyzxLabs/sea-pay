"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Banknote,
  Lock,
  Sparkles,
  QrCode,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/container";
import { TokenSelector } from "./token-selector";

export function Hero() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <section id='hero' className='relative overflow-hidden'>
      <Container className='grid items-start gap-6 pb-10 pt-8 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='absolute -left-20 top-8 gradient-blob' aria-hidden />
        <div
          className='absolute right-[-160px] top-32 gradient-blob'
          aria-hidden
        />
        <div className='relative z-10 space-y-6'>
          <h1 className='text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl'>
            Accept stablecoins. <br className='hidden sm:inline' />
            No gas needed.
          </h1>
          <p className='max-w-xl text-lg text-slate-600'>
            Seapay lets internet businesses spin up compliant stablecoin
            checkout links, collect from global customers, and receive
            predictable settlement with clear webhooks.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Button size='lg' className='shadow-sm shadow-sky-100' asChild>
              <a href='#cta'>Create a payment link</a>
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='border-sky-200'
              asChild
            >
              <a
                href='https://docs.seapay.example'
                target='_blank'
                rel='noreferrer'
              >
                View docs
              </a>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size='lg' variant='ghost' className='text-slate-700'>
                  Preview sandbox
                </Button>
              </DialogTrigger>
              <DialogContent className='glass'>
                <DialogHeader>
                  <DialogTitle>Sandbox checkout</DialogTitle>
                  <DialogDescription>
                    Spin up a test payment link, settle to a test wallet, and
                    simulate webhook delivery in under a minute.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-2 rounded-lg border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                  <div className='flex items-center justify-between'>
                    <span className='text-slate-500'>Amount</span>
                    <span className='font-semibold text-slate-900'>
                      $150.00 USDC
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-slate-500'>Network</span>
                    <span className='font-medium text-slate-900'>
                      Base mainnet
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-slate-500'>Webhook</span>
                    <span className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700'>
                      200 ms delivery
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button className='w-full' asChild>
                    <a href='#cta'>Start sandbox</a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className='flex flex-wrap gap-4 text-sm text-slate-600'>
            <span className='inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm shadow-sky-50 ring-1 ring-slate-200'>
              <Lock className='h-4 w-4 text-sky-600' /> Non-custodial by design
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm shadow-sky-50 ring-1 ring-slate-200'>
              <Sparkles className='h-4 w-4 text-sky-600' /> Ready for POS &
              online
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm shadow-sky-50 ring-1 ring-slate-200'>
              <Banknote className='h-4 w-4 text-sky-600' /> Fees from 0.5% +
              network
            </span>
          </div>

          {/* Signup Panel */}
          <div className='flex flex-col gap-4 rounded-lg bg-stone-50 p-6'>
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
        </div>
        <CheckoutDemo />
      </Container>
    </section>
  );
}

function CheckoutDemo() {
  const [amount, setAmount] = useState("1");
  const [fiatCurrency, setFiatCurrency] = useState<"USD" | "EUR">("USD");
  const [currency, setCurrency] = useState("USDC-BASE");
  const [receiver, setReceiver] = useState("");
  const [isFiatDropdownOpen, setIsFiatDropdownOpen] = useState(false);

  const usdcAmount = parseFloat(amount) || 0;

  const tokenOptions = [
    { token: "USDC", blockchain: "BASE", value: "USDC-BASE" },
    { token: "USDT", blockchain: "BNB", value: "USDT-BNB" },
  ];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal point
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Card className='relative z-10 glass border-slate-200/60'>
      <CardContent className='space-y-4 pt-4'>
        {/* QR Code Display Area */}
        <div className='flex aspect-square w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50'>
          <div className='flex flex-col items-center gap-2 text-slate-400'>
            <QrCode className='h-16 w-16' />
            <span className='text-sm font-medium'>QR Code</span>
          </div>
        </div>

        {/* Input Fields */}
        <div className='flex items-center gap-3'>
          {/* Fiat Currency Selector */}
          <div className='relative flex-shrink-0'>
            <button
              type='button'
              onClick={() => setIsFiatDropdownOpen(!isFiatDropdownOpen)}
              className='flex h-10 items-center justify-between gap-2 rounded-lg border-0 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
            >
              <span className='flex items-center gap-2'>
                {fiatCurrency === "USD" && (
                  <Image
                    src='/usd-logo.svg'
                    alt='USD'
                    width={20}
                    height={20}
                    className='inline-block rounded-full'
                  />
                )}
                {fiatCurrency === "EUR" && (
                  <Image
                    src='/eur-logo.svg'
                    alt='EUR'
                    width={20}
                    height={20}
                    className='inline-block rounded-full'
                  />
                )}
                <span>{fiatCurrency}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-emerald-600 transition-transform ${
                  isFiatDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isFiatDropdownOpen && (
              <>
                <div
                  className='fixed inset-0 z-10'
                  onClick={() => setIsFiatDropdownOpen(false)}
                />
                <div className='absolute top-full z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg'>
                  <button
                    type='button'
                    onClick={() => {
                      setFiatCurrency("USD");
                      setIsFiatDropdownOpen(false);
                    }}
                    className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 first:rounded-t-md last:rounded-b-md'
                  >
                    <Image
                      src='/usd-logo.svg'
                      alt='USD'
                      width={20}
                      height={20}
                      className='inline-block rounded-full'
                    />
                    <span>USD</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setFiatCurrency("EUR");
                      setIsFiatDropdownOpen(false);
                    }}
                    className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 first:rounded-t-md last:rounded-b-md'
                  >
                    <Image
                      src='/eur-logo.svg'
                      alt='EUR'
                      width={20}
                      height={20}
                      className='inline-block rounded-full'
                    />
                    <span>EUR</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Amount Input */}
          <div className='flex-shrink-0 w-24'>
            <Input
              type='text'
              inputMode='decimal'
              value={amount}
              onChange={handleAmountChange}
              placeholder='1,000.00'
              className='h-10 text-base font-medium text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
          </div>

          {/* Arrow */}
          <ArrowRight className='h-5 w-5 text-slate-400 flex-shrink-0' />

          {/* Currency/Network Dropdown */}
          <div className='flex-1'>
            <TokenSelector
              value={currency}
              onChange={setCurrency}
              options={tokenOptions}
            />
          </div>
        </div>

        {/* Transaction Details */}
        <div className='space-y-2'>
          {/* Receiver */}
          <div className='rounded-lg border border-slate-200 bg-white px-4 py-3'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-sm font-medium text-slate-700'>
                Receiver:
              </span>
              <Input
                type='text'
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder='0x0000000000000000000000000000000000000000'
                className='h-8 flex-1 border-0 bg-transparent p-0 text-left text-sm font-mono text-slate-900 focus-visible:ring-0 placeholder:text-left'
              />
            </div>
          </div>

          {/* Quote with Submit Button */}
          <div className='flex items-center gap-2'>
            <div className='flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3'>
              <div className='flex items-center gap-2 text-sm font-medium text-slate-900'>
                <span>
                  Quote: {amount || "0"} USD → {usdcAmount.toFixed(2)}
                </span>
                <Image
                  src='/usdc-logo.svg'
                  alt='USDC'
                  width={16}
                  height={16}
                  className='inline-block'
                />
                <span>USDC</span>
              </div>
            </div>
            <Button
              size='sm'
              className='bg-black text-white hover:bg-slate-800'
            >
              Submit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
