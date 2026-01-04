"use client";

import { Banknote, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Container } from "@/components/container";

export function Hero() {
  return (
    <section id='hero' className='relative overflow-hidden'>
      <Container className='grid items-center gap-12 pb-10 pt-16 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='absolute -left-20 top-8 gradient-blob' aria-hidden />
        <div
          className='absolute right-[-160px] top-32 gradient-blob'
          aria-hidden
        />
        <div className='relative z-10 space-y-6'>
          <Badge
            variant='outline'
            className='border-sky-200 bg-sky-50 text-sky-800'
          >
            Settle in seconds • Non-custodial
          </Badge>
          <h1 className='text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl'>
            Accept stablecoin payments. <br className='hidden sm:inline' />
            Settle instantly.
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
        </div>
        <Card className='relative z-10 glass border-slate-200/60'>
          <CardHeader className='border-b border-slate-200/70 pb-4'>
            <CardTitle className='flex items-center justify-between text-lg'>
              Checkout demo
              <Badge className='bg-emerald-100 text-emerald-700 hover:bg-emerald-100'>
                Live
              </Badge>
            </CardTitle>
            <CardDescription>
              Customers pay in stablecoins; you get instant confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 pt-4'>
            <div className='rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-slate-500'>Amount due</span>
                <span className='text-lg font-semibold text-slate-900'>
                  $250.00 USDC
                </span>
              </div>
              <div className='mt-3 flex items-center justify-between'>
                <span className='text-sm text-slate-500'>Network</span>
                <Badge variant='secondary' className='bg-sky-100 text-sky-800'>
                  Base
                </Badge>
              </div>
              <div className='mt-3 flex items-center justify-between'>
                <span className='text-sm text-slate-500'>Wallet</span>
                <span className='font-mono text-sm text-slate-800'>
                  0x8a9c...42bf
                </span>
              </div>
              <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                <Button variant='outline' className='border-slate-200'>
                  Copy link
                </Button>
                <Button className='shadow-sm shadow-sky-100'>
                  Pay with USDC
                </Button>
              </div>
            </div>
            <div className='rounded-xl border border-dashed border-sky-200/70 bg-sky-50/60 px-4 py-3 text-sm text-sky-800'>
              Webhook will post{" "}
              <strong className='font-semibold'>payment.confirmed</strong> in
              under 500 ms.
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
