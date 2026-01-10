"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { buildDeeplinkUrl } from "@seapay/deeplink";
import QRCodeStyling from "qr-code-styling";
import {
  Banknote,
  Lock,
  Sparkles,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
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

type FormStatus = "idle" | "submitting" | "success" | "error";

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

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setErrorMessage("");

    // Validate email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Email is required");
      setFormStatus("error");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address");
      setFormStatus("error");
      return;
    }

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
          email: trimmedEmail,
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
          <div className='flex flex-col gap-4 rounded-lg bg-card p-6'>
            <div className='space-y-1'>
              <p className='text-base text-slate-700 font-bold'>
                Sign up for our newsletter to hear our
              </p>
              <p className='text-base text-slate-700 font-bold'>
                latest product updates
              </p>
            </div>
            {formStatus === "success" ? (
              <div className='flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700'>
                <CheckCircle2 className='h-5 w-5 flex-shrink-0' />
                <span className='font-medium'>
                  Successfully added to waitlist!
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
                <div className='flex items-center gap-0 rounded-lg bg-white shadow-sm'>
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
                    placeholder='Enter email for updates*'
                    required
                    disabled={formStatus === "submitting"}
                    className='h-12 flex-1 rounded-l-lg rounded-r-none border-0 bg-white px-4 text-sm focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-invalid={formStatus === "error"}
                  />
                  <Button
                    type='submit'
                    disabled={formStatus === "submitting"}
                    className='h-12 rounded-l-none rounded-r-lg bg-slate-200 px-6 text-sm font-medium uppercase text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {formStatus === "submitting" ? "..." : "Submit"}
                  </Button>
                </div>
                {formStatus === "error" && errorMessage && (
                  <div className='flex items-center gap-2 text-sm text-red-600'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0' />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </form>
            )}
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
  const [cryptoPrice, setCryptoPrice] = useState<number>(1);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const fiatAmount = parseFloat(amount) || 0;
  const cryptoAmount = cryptoPrice > 0 ? fiatAmount / cryptoPrice : 0;

  // Fetch crypto price from CoinGecko
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoadingPrice(true);
        const [token] = currency.split("-");

        // Map token symbols to CoinGecko IDs
        const coinGeckoIds: Record<string, string> = {
          USDC: "usd-coin",
          USDT: "tether",
          ETH: "ethereum",
          BTC: "bitcoin",
        };

        const coinId = coinGeckoIds[token] || "usd-coin";
        const vsCurrency = fiatCurrency.toLowerCase();

        const apiKey = process.env.NEXT_PUBLIC_COIN_GECKO_API_KEY || "";
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}&x_cg_demo_api_key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch price");
        }

        const data = await response.json();
        const price = data[coinId]?.[vsCurrency];

        if (price) {
          setCryptoPrice(price);
        }
      } catch (error) {
        console.error("Failed to fetch crypto price:", error);
        // Default to 1:1 for stablecoins if fetch fails
        setCryptoPrice(1);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [currency, fiatCurrency]);

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        // Build payment URL with parameters
        const params = new URLSearchParams();
        if (receiver) {
          params.set("address", receiver);
        }
        if (amount) {
          params.set("amount", amount);
        }
        if (currency) {
          const [token] = currency.split("-");
          params.set("asset", token);
        }

        // Create full URL and encode it for deeplink
        const paymentUrl = `app.seapay.ai/pay-mobile?${params.toString()}`;
        const deeplinkUrl = buildDeeplinkUrl(paymentUrl);
        console.log("Deeplink URL:", deeplinkUrl);

        // Create or update QR code with styling
        if (!qrCodeInstance.current) {
          qrCodeInstance.current = new QRCodeStyling({
            width: 300,
            height: 300,
            data: deeplinkUrl,
            margin: 4,
            qrOptions: {
              typeNumber: 0,
              mode: "Byte",
              errorCorrectionLevel: "Q",
            },
            imageOptions: {
              hideBackgroundDots: true,
              imageSize: 0.4,
              margin: 8,
            },
            dotsOptions: {
              color: "#1e293b",
              type: "rounded",
            },
            backgroundOptions: {
              color: "#ffffff",
            },
            cornersSquareOptions: {
              color: "#0f172a",
              type: "extra-rounded",
            },
            cornersDotOptions: {
              color: "#0f172a",
              type: "dot",
            },
          });
        } else {
          qrCodeInstance.current.update({
            data: deeplinkUrl,
          });
        }

        // Append to DOM if ref is available
        if (qrCodeRef.current) {
          qrCodeRef.current.innerHTML = "";
          qrCodeInstance.current.append(qrCodeRef.current);
        }
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    };

    generateQrCode();
  }, [receiver, amount, currency]);

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
      <CardContent className='space-y-4 pt-4 pb-6'>
        {/* QR Code Display Area */}
        <div className='flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 mx-auto p-1 w-[316px] h-[316px]'>
          <div
            ref={qrCodeRef}
            className='flex items-center justify-center'
          />
        </div>

        {/* Input Fields */}
        <div className='flex items-center gap-3'>
          {/* Fiat Currency Selector */}
          <div className='relative flex-shrink-0'>
            <button
              type='button'
              onClick={() => setIsFiatDropdownOpen(!isFiatDropdownOpen)}
              className='flex h-10 items-center justify-between gap-2 rounded-lg border-0 bg-slate-100 px-3 py-2 text-base font-medium text-slate-900 transition-colors hover:bg-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
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
              <span className='text-base font-medium text-slate-700'>
                Receiver:
              </span>
              <Input
                type='text'
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder='0x0000000000000000000000000000000000000000'
                className='h-8 flex-1 border-0 bg-transparent p-0 text-left text-base font-mono text-slate-900 focus-visible:ring-0 placeholder:text-left'
              />
            </div>
          </div>

          {/* Quote with Submit Button */}
          <div className='flex items-center gap-2'>
            <div className='flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3'>
              <div className='flex items-center gap-2 text-base font-medium text-slate-900'>
                <span>
                  Quote: {amount || "0"} {fiatCurrency} →{" "}
                  {isLoadingPrice ? "..." : cryptoAmount.toFixed(6)}
                </span>
                <Image
                  src={
                    currency.startsWith("USDC")
                      ? "/usdc-logo.svg"
                      : "/tether-logo.svg"
                  }
                  alt={currency.split("-")[0]}
                  width={16}
                  height={16}
                  className='inline-block'
                />
                <span>{currency.split("-")[0]}</span>
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
