"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WalletButtons() {
  const [selectedWallet, setSelectedWallet] = useState<
    "coinbase" | "metamask" | "phantom"
  >("coinbase");

  return (
    <div className='space-y-3'>
      <p className='text-sm text-slate-600'>Choose a wallet to pay.</p>
      <div className='flex flex-wrap gap-2'>
        <Button
          variant='outline'
          onClick={() => setSelectedWallet("coinbase")}
          className={cn(
            "w-[calc(50%-0.25rem)] sm:flex-1 min-w-0 bg-white text-slate-900 hover:bg-slate-50 border-slate-200",
            selectedWallet === "coinbase" &&
              "ring-2 ring-slate-400 ring-offset-2 border-slate-400"
          )}
        >
          <Image
            src='/coinbase-wallet-icon.png'
            alt='Coinbase Wallet'
            width={20}
            height={20}
          />
          Coinbase Wallet
        </Button>
        <Button
          variant='outline'
          onClick={() => setSelectedWallet("metamask")}
          className={cn(
            "w-[calc(50%-0.25rem)] sm:flex-1 min-w-0 bg-white text-slate-900 hover:bg-slate-50 border-slate-200",
            selectedWallet === "metamask" &&
              "ring-2 ring-slate-400 ring-offset-2 border-slate-400"
          )}
        >
          <Image
            src='/metamask-icon.svg'
            alt='Metamask'
            width={20}
            height={20}
          />
          Metamask
        </Button>
        <Button
          variant='outline'
          onClick={() => setSelectedWallet("phantom")}
          className={cn(
            "w-[calc(50%-0.25rem)] sm:flex-1 min-w-0 bg-white text-slate-900 hover:bg-slate-50 border-slate-200",
            selectedWallet === "phantom" &&
              "ring-2 ring-slate-400 ring-offset-2 border-slate-400"
          )}
        >
          <Image src='/phantom-icon.png' alt='Phantom' width={20} height={20} />
          Phantom
        </Button>
      </div>
    </div>
  );
}
