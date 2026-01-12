import Image from "next/image";
import { Button } from "@/components/ui/button";

export function WalletButtons() {
  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        variant='outline'
        className='flex-1 min-w-0 bg-white text-slate-900 hover:bg-slate-50 border-slate-200'
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
        className='flex-1 min-w-0 bg-white text-slate-900 hover:bg-slate-50 border-slate-200'
      >
        <Image src='/metamask-icon.svg' alt='Metamask' width={20} height={20} />
        Metamask
      </Button>
      <Button
        variant='outline'
        className='flex-1 min-w-0 bg-white text-slate-900 hover:bg-slate-50 border-slate-200'
      >
        <Image
          src='/phantom-icon.png'
          alt='Trust Wallet'
          width={20}
          height={20}
        />
        Phantom
      </Button>
    </div>
  );
}
