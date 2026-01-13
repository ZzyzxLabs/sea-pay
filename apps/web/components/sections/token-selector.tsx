"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

type TokenOption = {
  token: string;
  blockchain: string;
  value: string;
};

type IconPairProps = {
  token: string;
  chain: string;
  tokenSize?: number;
  chainSize?: number;
};

const tokenIconMap: Record<string, string> = {
  USDC: "/usdc-logo.svg",
  USDT: "/tether-logo.svg",
};

const chainIconMap: Record<string, string> = {
  Base: "/base-chain-icon.svg",
  BNB: "/bnb-chain-icon.svg",
  Ethereum: "/ethereum-icon.svg",
  Polygon: "/polygon-chain-icon.svg",
  Solana: "/solana-chain-icon.svg",
};

function IconPair({
  token,
  chain,
  tokenSize = 40,
  chainSize = 16,
}: IconPairProps) {
  const tokenIcon = tokenIconMap[token];
  const chainIcon = chainIconMap[chain] || chainIconMap[chain.toUpperCase()];

  return (
    <div
      className='relative inline-flex'
      style={{ width: tokenSize, height: tokenSize }}
    >
      {tokenIcon ? (
        <Image
          src={tokenIcon}
          alt={token}
          width={tokenSize}
          height={tokenSize}
          className='rounded-lg object-contain'
        />
      ) : (
        <div
          className='flex h-full w-full items-center justify-center rounded-lg bg-slate-200 text-xs font-semibold text-slate-700'
          aria-label={token}
        >
          {token.slice(0, 3)}
        </div>
      )}

      {chainIcon ? (
        <Image
          src={chainIcon}
          alt={chain}
          width={chainSize}
          height={chainSize}
          className='absolute -bottom-1 -right-1 rounded-full object-contain'
        />
      ) : (
        <div className='absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-500 text-[10px] font-semibold text-white'>
          {chain.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

type TokenSelectorProps = {
  value: string;
  onChangeAction: (value: string) => void;
  options: TokenOption[];
};

export function TokenSelector({
  value,
  onChangeAction,
  options,
}: TokenSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  const formatOption = (option: TokenOption) => (
    <div className='flex items-center gap-2'>
      <IconPair token={option.token} chain={option.blockchain} />
      <div className='flex flex-col items-start leading-tight'>
        <span className='text-left text-base font-bold text-slate-900 sm:text-lg'>
          {option.token}
        </span>
        <span className='text-left text-sm font-medium text-slate-500 sm:text-base'>
          {option.blockchain}
        </span>
      </div>
    </div>
  );

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className='flex h-14 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 text-base font-medium shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
      >
        {formatOption(selectedOption)}
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isDropdownOpen && (
        <>
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className='absolute top-full z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg'>
            {options.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => {
                  onChangeAction(option.value);
                  setIsDropdownOpen(false);
                }}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 first:rounded-t-md last:rounded-b-md'
              >
                {formatOption(option)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
