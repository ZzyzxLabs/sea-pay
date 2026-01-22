"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { buildDeeplinkUrl } from "@seapay/deeplink";
import QRCodeStyling from "qr-code-styling";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/container";
import { SectionHeading } from "./section-heading";
import { TokenSelector } from "./token-selector";
import { WalletButtons } from "./wallet-buttons";

export function PosQr() {
  return (
    <section id='pos-qr' className='scroll-mt-24'>
      <Container>
        <div className='grid gap-6 lg:grid-cols-[1fr_1fr]'>
          {/* Left side: Title and Supported Chains */}
          <div className='space-y-6'>
            <SectionHeading
              eyebrow='POS & QR'
              title='Accept payments in person with QR codes'
              description='Generate dynamic QR codes for point-of-sale payments. Perfect for retail, restaurants, and in-person transactions.'
            />
            
            {/* Supported Chains */}
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-sm font-medium text-slate-500'>
                Supported chains:
              </span>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className='inline-flex items-center justify-center gap-1.5 border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
                >
                  <Image
                    src='/ethereum-icon.svg'
                    alt='Ethereum'
                    width={16}
                    height={16}
                    className='inline-block'
                  />
                  <span>Ethereum</span>
                </Badge>
                <Badge
                  variant='outline'
                  className='inline-flex items-center justify-center gap-1.5 border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
                >
                  <Image
                    src='/base-chain-icon.svg'
                    alt='Base'
                    width={16}
                    height={16}
                    className='inline-block'
                  />
                  <span>Base</span>
                </Badge>
                <Badge
                  variant='outline'
                  className='inline-flex items-center justify-center gap-1.5 border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
                >
                  <Image
                    src='/polygon-icon.svg'
                    alt='Polygon'
                    width={16}
                    height={16}
                    className='inline-block'
                  />
                  <span>Polygon</span>
                </Badge>
                <Badge
                  variant='outline'
                  className='inline-flex items-center justify-center gap-1.5 border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
                >
                  <Image
                    src='/solana-logo.svg'
                    alt='Solana'
                    width={16}
                    height={16}
                    className='inline-block'
                  />
                  <span>Solana</span>
                </Badge>
                <Badge
                  variant='outline'
                  className='inline-flex items-center justify-center gap-1.5 border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
                >
                  <Image
                    src='/bnb-logo.svg'
                    alt='BNB Chain'
                    width={16}
                    height={16}
                    className='inline-block'
                  />
                  <span>BNB Chain</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Right side: QR Code Generator */}
          <QRCodeGenerator />
        </div>
      </Container>
    </section>
  );
}

function QRCodeGenerator() {
  const [amount, setAmount] = useState("");
  const [fiatCurrency] = useState<"USD" | "EUR">("USD");
  const [currency, setCurrency] = useState("USDC-BASE");
  const [receiver, setReceiver] = useState("");
  const [cryptoPrice, setCryptoPrice] = useState<number>(1);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const [qrSize, setQrSize] = useState(300);

  // Calculate responsive QR code size
  useEffect(() => {
    const updateQrSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile: smaller QR code
        setQrSize(240);
      } else if (width < 1024) {
        // Tablet: medium QR code
        setQrSize(280);
      } else {
        // Desktop: full size
        setQrSize(300);
      }
    };

    updateQrSize();
    window.addEventListener("resize", updateQrSize);
    return () => window.removeEventListener("resize", updateQrSize);
  }, []);

  // Parse amount by removing commas
  const parseAmount = (value: string): number => {
    const cleaned = value.replace(/,/g, "");
    return parseFloat(cleaned) || 0;
  };

  const fiatAmount = parseAmount(amount);
  const cryptoAmount = cryptoPrice > 0 ? fiatAmount / cryptoPrice : 0;

  // Validate Ethereum address
  const isValidEthereumAddress = (address: string): boolean => {
    // Ethereum addresses are 42 characters: 0x followed by 40 hex characters
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  };

  const isReceiverValid = isValidEthereumAddress(receiver);

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
        // Use the converted crypto amount instead of fiat amount
        if (amount && cryptoAmount > 0) {
          params.set("amount", cryptoAmount.toFixed(6));
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
            width: qrSize,
            height: qrSize,
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
            width: qrSize,
            height: qrSize,
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
  }, [receiver, amount, currency, cryptoAmount, qrSize]);

  const tokenOptions = [
    { token: "USDC", blockchain: "Base", value: "USDC-BASE" },
    { token: "USDC", blockchain: "Polygon", value: "USDC-POLYGON" },
    { token: "USDC", blockchain: "Ethereum", value: "USDC-ETHEREUM" },
    { token: "USDC", blockchain: "Solana", value: "USDC-SOLANA" },
    { token: "USDT", blockchain: "BNB", value: "USDT-BNB" },
  ];

  const formatAmount = (value: string): string => {
    // Remove all non-digit characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, "");

    // Split by decimal point
    const parts = cleaned.split(".");

    // Format integer part with commas
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Limit decimal part to 2 digits
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : "";

    // Combine
    if (decimalPart) {
      return `${integerPart}.${decimalPart}`;
    } else if (cleaned.includes(".")) {
      return `${integerPart}.`;
    } else {
      return integerPart;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string
    if (value === "") {
      setAmount("");
      return;
    }

    // Format the value
    const formatted = formatAmount(value);
    setAmount(formatted);
  };

  return (
    <Card className='relative z-10 glass border-slate-200/60'>
      <CardContent className='space-y-3 pt-3 pb-4 sm:space-y-4 sm:pt-4 sm:pb-6'>
        {/* QR Code Display Area */}
        <div className='flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 mx-auto p-1 w-full max-w-[256px] aspect-square sm:max-w-[296px] lg:max-w-[316px]'>
          <div
            ref={qrCodeRef}
            className='flex items-center justify-center w-full h-full'
          />
        </div>

        {/* Money Input and Token Selector */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          {/* Money Input Box - 50% width */}
          <div className='flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden flex-1 h-14'>
            {/* Currency Symbol Segment */}
            <div className='flex items-center justify-center h-14 pl-5 pr-4 bg-slate-100 border-r border-slate-200 sm:pl-6 sm:pr-5'>
              <span className='text-lg font-bold text-slate-900 sm:text-xl'>
                $
              </span>
            </div>
            {/* Amount Input */}
            <div className='flex-1'>
              <Input
                type='text'
                inputMode='decimal'
                value={amount}
                onChange={handleAmountChange}
                placeholder='1,000.00'
                className='h-14 border-0 rounded-none text-base font-semibold text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none sm:text-lg'
              />
            </div>
          </div>

          {/* Crypto Currency Selector - 50% width */}
          <div className='flex-1'>
            <TokenSelector
              value={currency}
              onChangeAction={setCurrency}
              options={tokenOptions}
            />
          </div>
        </div>

        {/* Transaction Details */}
        <div className='space-y-2'>
          {/* Receiver */}
          <div className='flex h-14 items-center rounded-lg border border-slate-200 bg-white px-4 sm:px-5'>
            <div className='flex w-full items-center justify-between gap-3'>
              {isReceiverValid ? (
                <Image
                  src='/ethereum-icon.svg'
                  alt='Ethereum'
                  width={24}
                  height={24}
                  className='flex-shrink-0'
                />
              ) : (
                <span className='text-sm font-bold text-slate-900 sm:text-base'>
                  Receiver:
                </span>
              )}
              <Input
                type='text'
                value={receiver}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setReceiver(e.target.value)
                }
                placeholder='EVM (0x...) / Solana / Bitcoin address...'
                className='h-14 flex-1 border-0 bg-transparent p-0 text-left text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 placeholder:text-left sm:text-base'
              />
            </div>
          </div>

          {/* Quote */}
          <div className='flex h-14 items-center rounded-lg border border-slate-200 bg-white px-4 sm:px-5'>
            <div className='flex flex-wrap items-center gap-2 text-sm text-slate-900 sm:gap-2.5 sm:text-base'>
              <span className='whitespace-nowrap font-bold'>Quote:</span>
              <span className='whitespace-nowrap font-medium'>
                {amount || "0"} {fiatCurrency} →
              </span>
              <span className='whitespace-nowrap font-medium'>
                {isLoadingPrice ? "..." : cryptoAmount.toFixed(2)}
              </span>
              <div className='flex items-center gap-1.5 font-medium'>
                <Image
                  src={
                    currency.startsWith("USDC")
                      ? "/usdc-logo.svg"
                      : "/tether-logo.svg"
                  }
                  alt={currency.split("-")[0]}
                  width={18}
                  height={18}
                  className='inline-block sm:w-5 sm:h-5'
                />
                <span>{currency.split("-")[0]}</span>
              </div>
            </div>
          </div>
        </div>

        <WalletButtons />
      </CardContent>
    </Card>
  );
}
