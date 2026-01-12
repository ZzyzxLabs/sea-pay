"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

type TokenOption = {
  token: string;
  blockchain: string;
  value: string;
};

type TokenSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  options: TokenOption[];
};

export function TokenSelector({
  value,
  onChange,
  options,
}: TokenSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  const formatOption = (option: TokenOption) => {
    return (
      <>
        {option.token === "USDC" && (
          <Image
            src='/usdc-logo.svg'
            alt='USDC'
            width={14}
            height={14}
            className='inline-block'
          />
        )}
        {option.token === "USDT" && (
          <Image
            src='/tether-logo.svg'
            alt='USDT'
            width={14}
            height={14}
            className='inline-block'
          />
        )}
        <span
          className={
            option.token === "USDC" || option.token === "USDT" ? "ml-1.5" : ""
          }
        >
          {option.token} on
        </span>
        {option.blockchain === "BASE" && (
          <>
            <Image
              src='/base-logo.svg'
              alt='Base'
              width={14}
              height={14}
              className='inline-block ml-1.5'
            />
            <span className='ml-1.5'>{option.blockchain}</span>
          </>
        )}
        {option.blockchain === "BNB" && (
          <>
            <Image
              src='/bnb-logo.svg'
              alt='BNB'
              width={14}
              height={14}
              className='inline-block ml-1.5'
            />
            <span className='ml-1.5'>{option.blockchain}</span>
          </>
        )}
        {option.blockchain !== "BASE" && option.blockchain !== "BNB" && (
          <span className='ml-1.5'>{option.blockchain}</span>
        )}
      </>
    );
  };

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className='flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 text-base font-medium shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
      >
        <span className='flex items-center gap-1.5'>
          {selectedOption.token === "USDC" && (
            <Image
              src='/usdc-logo.svg'
              alt='USDC'
              width={14}
              height={14}
              className='inline-block'
            />
          )}
          {selectedOption.token === "USDT" && (
            <Image
              src='/tether-logo.svg'
              alt='USDT'
              width={14}
              height={14}
              className='inline-block'
            />
          )}
          <span>{selectedOption.token} on</span>
          {selectedOption.blockchain === "BASE" && (
            <>
              <Image
                src='/base-logo.svg'
                alt='Base'
                width={14}
                height={14}
                className='inline-block'
              />
              <span>{selectedOption.blockchain}</span>
            </>
          )}
          {selectedOption.blockchain === "BNB" && (
            <>
              <Image
                src='/bnb-logo.svg'
                alt='BNB'
                width={14}
                height={14}
                className='inline-block'
              />
              <span>{selectedOption.blockchain}</span>
            </>
          )}
          {selectedOption.blockchain !== "BASE" &&
            selectedOption.blockchain !== "BNB" && (
              <span>{selectedOption.blockchain}</span>
            )}
        </span>
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
                  onChange(option.value);
                  setIsDropdownOpen(false);
                }}
                className='flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 first:rounded-t-md last:rounded-b-md'
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
