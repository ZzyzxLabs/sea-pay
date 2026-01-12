"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/container";
import Link from "next/link";
import Image from "next/image";

type FormStatus = "idle" | "submitting" | "success" | "error";

const emailSchema = z.string().email("Please enter a valid email address");

export function NewsletterSignup() {
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
    <section className='relative overflow-hidden py-12 sm:py-16 lg:py-20'>
      <Container>
        <div className='flex flex-col gap-8 rounded-lg bg-card p-6 sm:flex-row sm:gap-12 sm:p-8 lg:gap-16 lg:p-10'>
          {/* Contact Us Section */}
          <div className='flex flex-col gap-4 sm:w-1/3'>
            <h2 className='text-xl font-semibold text-slate-900 sm:text-2xl'>
              Contact us
            </h2>
            <div className='flex flex-wrap items-center gap-4'>
              <Link
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center rounded-lg bg-slate-100 p-3 text-slate-700 transition-colors hover:bg-slate-200'
                aria-label='Follow us on X'
              >
                <Image
                  src='/x-icon.svg'
                  alt='X'
                  width={20}
                  height={20}
                  className='h-5 w-5'
                />
              </Link>
              <Link
                href='https://substack.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center rounded-lg bg-slate-100 p-3 text-slate-700 transition-colors hover:bg-slate-200'
                aria-label='Follow us on Substack'
              >
                <Image
                  src='/substack-icon.svg'
                  alt='Substack'
                  width={20}
                  height={20}
                  className='h-5 w-5'
                />
              </Link>
              <Link
                href='https://discord.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center rounded-lg bg-slate-100 p-3 text-slate-700 transition-colors hover:bg-slate-200'
                aria-label='Join our Discord'
              >
                <Image
                  src='/discord-logo.svg'
                  alt='Discord'
                  width={20}
                  height={20}
                  className='h-5 w-5'
                />
              </Link>
              <Link
                href='https://telegram.org'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center rounded-lg bg-slate-100 p-3 text-slate-700 transition-colors hover:bg-slate-200'
                aria-label='Join our Telegram'
              >
                <Image
                  src='/telegram-icon.svg'
                  alt='Telegram'
                  width={20}
                  height={20}
                  className='h-5 w-5'
                />
              </Link>
            </div>
          </div>

          {/* Newsletter Form Section */}
          <div className='flex-1'>
            {formStatus === "error" && errorMessage && (
              <div className='flex items-center gap-2 text-sm text-red-600'>
                <AlertCircle className='h-4 w-4 flex-shrink-0' />
                <span>{errorMessage}</span>
              </div>
            )}
            {formStatus === "success" && (
              <div className='flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700'>
                <CheckCircle2 className='h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5' />
                <span className='font-medium'>
                  Successfully added to waitlist!
                </span>
              </div>
            )}
            {formStatus !== "success" && (
              <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                {/* Large Email Input Field */}
                <Input
                  type='email'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing
                    if (formStatus === "error") {
                      setFormStatus("idle");
                      setErrorMessage("");
                    }
                  }}
                  placeholder='Enter your email'
                  required
                  disabled={formStatus === "submitting"}
                  autoComplete='email'
                  autoCapitalize='none'
                  autoCorrect='off'
                  spellCheck='false'
                  inputMode='email'
                  className='h-16 w-full rounded-lg border-0 bg-sky-50 px-6 text-2xl font-bold text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed sm:h-20 sm:text-3xl sm:px-8 lg:text-4xl'
                  aria-invalid={formStatus === "error"}
                  aria-label='Enter your email'
                />

                {/* Descriptive Text and Button Row */}
                <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <p className='text-sm text-slate-600 sm:text-base font-bold'>
                    Sign up for our newsletter and become first to try out the
                    product.
                  </p>
                  <Button
                    type='submit'
                    disabled={formStatus === "submitting"}
                    className='h-12 rounded-full bg-blue-200 px-8 text-sm font-medium text-slate-900 hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed sm:h-14 sm:px-10 sm:text-base'
                  >
                    {formStatus === "submitting" ? "..." : "Sign up"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
