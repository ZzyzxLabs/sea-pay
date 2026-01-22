"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { buildDeeplinkUrl, WalletType } from "@seapay/deeplink";
import { chains } from "@/lib/web3/chains";
import styles from "./pay.module.css";

function PayPageContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "0.00";
  const address = searchParams.get("address") || "";

  const [selectedChainId, setSelectedChainId] = useState<number>(chains[0]?.id || 1);

  // Format amount for display
  const formattedAmount = parseFloat(amount).toFixed(2);

  const handleWalletConnect = (walletType: "coinbase" | "metamask" | "phantom") => {
    // Build the pay-mobile URL with params
    const params = new URLSearchParams();
    if (amount) {
      params.set("amount", amount);
    }
    if (address) {
      params.set("address", address);
    }
    
    const selectedChain = chains.find((c) => c.id === selectedChainId);
    if (selectedChain) {
      params.set("chain", selectedChain.id.toString());
    }

    const payMobileUrl = `https://app.seapay.ai/pay-mobile?${params.toString()}`;

    // Map wallet type string to WalletType enum
    const walletTypeMap: Record<"coinbase" | "metamask" | "phantom", WalletType> = {
      coinbase: WalletType.COINBASE,
      metamask: WalletType.METAMASK,
      phantom: WalletType.PHANTOM,
    };

    const deeplinkUrl = buildDeeplinkUrl(payMobileUrl, walletTypeMap[walletType]);
    window.location.href = deeplinkUrl;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div style={{ width: "24px" }} /> {/* Spacer for centering */}
        <h1 className={styles.logo}>SeaPay</h1>
        <div style={{ width: "24px" }} /> {/* Spacer for centering */}
      </header>

      {/* Amount Display */}
      <div className={styles.amountDisplay}>
        ${formattedAmount}
      </div>

      {/* Main content area */}
      <div className={styles.mainContent}>
        {/* Chain selector */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Select chain</h2>
          <div className={styles.chainGrid}>
            {chains.map((chain) => (
              <button
                key={chain.id}
                className={`${styles.chainButton} ${
                  selectedChainId === chain.id ? styles.chainButtonActive : ""
                }`}
                onClick={() => setSelectedChainId(chain.id)}
              >
                {chain.name}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet options */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Select wallet</h2>
          <div className={styles.walletOptions}>
            {/* Coinbase Wallet */}
            <button
              className={styles.walletButton}
              onClick={() => handleWalletConnect("coinbase")}
            >
              <div className={styles.walletIcon}>
                <img 
                  src="/coinbase-wallet-icon.png" 
                  alt="Coinbase Wallet" 
                  width={24} 
                  height={24}
                  style={{ borderRadius: "50%" }}
                />
              </div>
              <span>Coinbase Wallet</span>
            </button>

            {/* MetaMask */}
            <button
              className={styles.walletButton}
              onClick={() => handleWalletConnect("metamask")}
            >
              <div className={styles.walletIcon}>
                <img 
                  src="/metamask-icon.svg" 
                  alt="MetaMask" 
                  width={24} 
                  height={24}
                  style={{ borderRadius: "50%" }}
                />
              </div>
              <span>MetaMask</span>
            </button>

            {/* Phantom */}
            <button
              className={styles.walletButton}
              onClick={() => handleWalletConnect("phantom")}
            >
              <div className={styles.walletIcon}>
                <img 
                  src="/phantom-icon.png" 
                  alt="Phantom" 
                  width={24} 
                  height={24}
                  style={{ borderRadius: "50%" }}
                />
              </div>
              <span>Phantom</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <header className={styles.header}>
          <div style={{ width: "24px" }} />
          <h1 className={styles.logo}>SeaPay</h1>
          <div style={{ width: "24px" }} />
        </header>
        <div className={styles.mainContent}>
          <div>Loading...</div>
        </div>
      </div>
    }>
      <PayPageContent />
    </Suspense>
  );
}