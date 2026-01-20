"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/container";

type FormStatus = "idle" | "submitting" | "success" | "error";

const emailSchema = z.string().email("Please enter a valid email address");

export function Hero() {
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  // Extract UTM parameters from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};

      [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
      ].forEach((key) => {
        const value = params.get(key);
        if (value) utm[key] = value;
      });

      setUtmParams(utm);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setErrorMessage("");

    // Validate email using Zod
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Email is required");
      setFormStatus("error");
      return;
    }

    const validationResult = emailSchema.safeParse(trimmedEmail);
    if (!validationResult.success) {
      setErrorMessage(
        validationResult.error.message || "Please enter a valid email address"
      );
      setFormStatus("error");
      return;
    }

    const validatedEmail = validationResult.data;

    // Prevent double submission
    if (formStatus === "submitting") {
      return;
    }

    setFormStatus("submitting");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: validatedEmail,
          source: "website",
          ...utmParams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide user-friendly error message
        const errorMessage =
          data.error ||
          "Unable to sign up at this time. Please try again later.";
        throw new Error(errorMessage);
      }

      setFormStatus("success");
      setEmail("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Waitlist signup error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      setFormStatus("error");
    }
  };

  return (
    <section id='hero' className='relative overflow-hidden min-h-[calc(100vh-108px)] lg:h-[calc(100vh-108px)] lg:max-h-[692px] flex items-center py-8 lg:py-0'>
      <Container className='h-full w-full'>
        <div className='absolute -left-20 top-8 gradient-blob' aria-hidden />
        <div
          className='absolute right-[-160px] top-32 gradient-blob'
          aria-hidden
        />
        
        <div className='relative z-10 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-6 h-full items-center'>
          {/* Left side: Content + Newsletter */}
          <div className='flex flex-col gap-4 sm:gap-6 justify-center'>
            {/* Text Content */}
            <div className='space-y-3 sm:space-y-4 text-center lg:text-left'>
              <h1 className='text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl'>
                Seapay enables APAC students to spend money abroad
              </h1>
              <p className='text-sm text-slate-600 sm:text-base lg:text-lg'>
                We specialize in enabling APAC international students to spend money abroad with their local bank accounts.
              </p>
            </div>

            {/* Newsletter Signup */}
            <div className='rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 p-3 sm:p-4 lg:p-6'>
              <div className='space-y-3 sm:space-y-4'>
                {/* Contact Links */}
                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3'>
                  <span className='text-xs sm:text-sm font-medium text-slate-600'>Contact:</span>
                  <div className='flex items-center gap-2'>
                    <Link
                      href='https://twitter.com'
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
                      href='https://discord.com'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200'
                      aria-label='Join our Discord'
                    >
                      <Image
                        src='/discord-logo.svg'
                        alt='Discord'
                        width={16}
                        height={16}
                        className='h-4 w-4'
                      />
                    </Link>
                    <Link
                      href='https://telegram.org'
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
                </div>

                {/* Form Status Messages */}
                {formStatus === "error" && errorMessage && (
                  <div className='flex items-center gap-2 text-sm text-red-600'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0' />
                    <span>{errorMessage}</span>
                  </div>
                )}
                {formStatus === "success" && (
                  <div className='flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700'>
                    <CheckCircle2 className='h-4 w-4 flex-shrink-0' />
                    <span className='font-medium'>
                      Successfully added to waitlist!
                    </span>
                  </div>
                )}

                {/* Form */}
                {formStatus !== "success" && (
                  <form onSubmit={handleSubmit} className='space-y-2 sm:space-y-3'>
                    <Input
                      type='email'
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formStatus === "error") {
                          setFormStatus("idle");
                          setErrorMessage("");
                        }
                      }}
                      placeholder='Enter your email'
                      required
                      disabled={formStatus === "submitting"}
                      autoComplete='email'
                      className='h-10 sm:h-12 w-full rounded-lg border-slate-200 bg-white px-3 sm:px-4 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-200'
                      aria-invalid={formStatus === "error"}
                      aria-label='Enter your email'
                    />
                    <div className='flex flex-col gap-2 sm:gap-3'>
                      <p className='text-xs text-slate-600 sm:text-sm'>
                        Sign up for our newsletter and be first to try the product.
                      </p>
                      <Button
                        type='submit'
                        disabled={formStatus === "submitting"}
                        className='h-9 sm:h-10 w-full sm:w-auto rounded-full bg-sky-600 px-6 text-sm font-medium text-white hover:bg-sky-700 whitespace-nowrap'
                      >
                        {formStatus === "submitting" ? "..." : "Sign up"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right side: iPhone Mockup */}
          <div className='relative hidden lg:flex justify-center lg:justify-end'>
            <div className='relative'>
              {/* iPhone Frame */}
              <div className='relative w-[240px] xl:w-[300px] 2xl:w-[360px]'>
                {/* Phone outer frame with notch */}
                <div className='relative rounded-[2rem] xl:rounded-[2.5rem] bg-slate-900 p-1.5 xl:p-2 shadow-2xl ring-1 ring-slate-900/10'>
                  {/* Screen */}
                  <div className='relative overflow-hidden rounded-[1.75rem] xl:rounded-[2rem] bg-white'>
                    {/* Notch */}
                    <div className='absolute left-1/2 top-0 z-10 h-5 xl:h-6 w-24 xl:w-32 -translate-x-1/2 rounded-b-3xl bg-slate-900' />
                    
                    {/* Screen Content */}
                    <div className='relative aspect-[9/19.5] bg-gradient-to-br from-sky-50 to-slate-50'>
                      {/* App UI Preview */}
                      <div className='flex h-full flex-col p-4 xl:p-6 pt-8 xl:pt-10 pb-16 xl:pb-20'>
                        {/* Header */}
                        <div className='mb-6 xl:mb-8 text-center'>
                          <h3 className='text-lg xl:text-xl font-bold text-slate-900'>Seapay</h3>
                          <p className='text-[10px] xl:text-xs text-slate-600'>Payment App</p>
                        </div>
                        
                        {/* Balance Card */}
                        <div className='mb-4 xl:mb-6 rounded-xl xl:rounded-2xl bg-gradient-to-br from-sky-600 to-sky-700 p-4 xl:p-6 shadow-lg'>
                          <p className='text-[10px] xl:text-xs text-sky-100'>Total Balance</p>
                          <p className='mt-1 xl:mt-2 text-2xl xl:text-3xl font-bold text-white'>$1,250.00</p>
                          <p className='mt-0.5 xl:mt-1 text-[10px] xl:text-xs text-sky-100'>≈ 1,250 USDC</p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className='mb-4 xl:mb-6 grid grid-cols-3 gap-2 xl:gap-3'>
                          <div className='flex flex-col items-center gap-1 xl:gap-2'>
                            <div className='flex h-10 w-10 xl:h-12 xl:w-12 items-center justify-center rounded-full bg-sky-100'>
                              <svg className='h-5 w-5 xl:h-6 xl:w-6 text-sky-700' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                              </svg>
                            </div>
                            <span className='text-[9px] xl:text-[10px] text-slate-600'>Send</span>
                          </div>
                          <div className='flex flex-col items-center gap-1 xl:gap-2'>
                            <div className='flex h-10 w-10 xl:h-12 xl:w-12 items-center justify-center rounded-full bg-sky-100'>
                              <svg className='h-5 w-5 xl:h-6 xl:w-6 text-sky-700' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                              </svg>
                            </div>
                            <span className='text-[9px] xl:text-[10px] text-slate-600'>Receive</span>
                          </div>
                          <div className='flex flex-col items-center gap-1 xl:gap-2'>
                            <div className='flex h-10 w-10 xl:h-12 xl:w-12 items-center justify-center rounded-full bg-sky-100'>
                              <svg className='h-5 w-5 xl:h-6 xl:w-6 text-sky-700' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' />
                              </svg>
                            </div>
                            <span className='text-[9px] xl:text-[10px] text-slate-600'>Scan</span>
                          </div>
                        </div>
                        
                        {/* Recent Transactions */}
                        <div className='flex-1 space-y-2 xl:space-y-3'>
                          <h4 className='text-[10px] xl:text-xs font-semibold text-slate-900'>Recent</h4>
                          <div className='space-y-1.5 xl:space-y-2'>
                            <div className='flex items-center justify-between rounded-lg bg-white p-2 xl:p-3 shadow-sm'>
                              <div className='flex items-center gap-2 xl:gap-3'>
                                <div className='h-6 w-6 xl:h-8 xl:w-8 rounded-full bg-emerald-100' />
                                <div>
                                  <p className='text-[10px] xl:text-[11px] font-medium text-slate-900'>Coffee Shop</p>
                                  <p className='text-[8px] xl:text-[9px] text-slate-500'>Today, 2:30 PM</p>
                                </div>
                              </div>
                              <p className='text-[10px] xl:text-xs font-semibold text-slate-900'>-$4.50</p>
                            </div>
                            <div className='flex items-center justify-between rounded-lg bg-white p-2 xl:p-3 shadow-sm'>
                              <div className='flex items-center gap-2 xl:gap-3'>
                                <div className='h-6 w-6 xl:h-8 xl:w-8 rounded-full bg-sky-100' />
                                <div>
                                  <p className='text-[10px] xl:text-[11px] font-medium text-slate-900'>Grocery Store</p>
                                  <p className='text-[8px] xl:text-[9px] text-slate-500'>Yesterday</p>
                                </div>
                              </div>
                              <p className='text-[10px] xl:text-xs font-semibold text-slate-900'>-$42.30</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Navigation */}
                      <div className='absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200'>
                        <div className='grid grid-cols-4 gap-0.5 xl:gap-1 px-2 xl:px-4 py-2 xl:py-3'>
                          {/* Home */}
                          <button className='flex flex-col items-center gap-0.5 xl:gap-1'>
                            <svg className='h-4 w-4 xl:h-5 xl:w-5 text-sky-600' fill='currentColor' viewBox='0 0 24 24'>
                              <path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' />
                            </svg>
                            <span className='text-[8px] xl:text-[9px] font-medium text-sky-600'>Home</span>
                          </button>
                          
                          {/* Invest */}
                          <button className='flex flex-col items-center gap-0.5 xl:gap-1'>
                            <svg className='h-4 w-4 xl:h-5 xl:w-5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                            </svg>
                            <span className='text-[8px] xl:text-[9px] font-medium text-slate-400'>Invest</span>
                          </button>
                          
                          {/* Payment */}
                          <button className='flex flex-col items-center gap-0.5 xl:gap-1'>
                            <svg className='h-4 w-4 xl:h-5 xl:w-5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
                            </svg>
                            <span className='text-[8px] xl:text-[9px] font-medium text-slate-400'>Payment</span>
                          </button>
                          
                          {/* Setting */}
                          <button className='flex flex-col items-center gap-0.5 xl:gap-1'>
                            <svg className='h-4 w-4 xl:h-5 xl:w-5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            </svg>
                            <span className='text-[8px] xl:text-[9px] font-medium text-slate-400'>Setting</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements around phone - hidden on smaller screens */}
                <div className='hidden xl:block absolute -right-4 top-20 rounded-lg bg-white px-3 py-2 shadow-lg ring-1 ring-slate-900/5'>
                  <p className='text-xs font-semibold text-emerald-600'>Instant</p>
                </div>
                <div className='hidden xl:block absolute -left-4 top-40 rounded-lg bg-white px-3 py-2 shadow-lg ring-1 ring-slate-900/5'>
                  <p className='text-xs font-semibold text-sky-600'>Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
