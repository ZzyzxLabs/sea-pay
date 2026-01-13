"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildDeeplinkUrl } from "@seapay/deeplink";
import { chains } from "@/lib/web3/chains";
import styles from "./pay.module.css";

export default function PayPage() {
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

    if (walletType === "coinbase") {
      // Use buildDeeplinkUrl for Coinbase Wallet
      const deeplinkUrl = buildDeeplinkUrl(payMobileUrl);
      window.location.href = deeplinkUrl;
    } else if (walletType === "metamask") {
      // MetaMask uses a different URL scheme
      // For now, redirect to the pay-mobile page directly
      // MetaMask browser extension will handle the connection
      window.location.href = payMobileUrl;
    } else if (walletType === "phantom") {
      // Phantom uses solana: URL scheme
      // For now, redirect to pay-mobile page
      window.location.href = payMobileUrl;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header with light blue gradient */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>SeaPay</h1>
          <div className={styles.amountDisplay}>{formattedAmount} USD</div>
        </div>
      </header>

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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="12" fill="#0052FF" />
                  <path
                    d="M12 7L8 10L12 13L16 10L12 7Z"
                    fill="white"
                  />
                  <path
                    d="M8 10V14L12 17L16 14V10"
                    fill="white"
                  />
                </svg>
              </div>
              <span>Coinbase Wallet</span>
            </button>

            {/* MetaMask */}
            <button
              className={styles.walletButton}
              onClick={() => handleWalletConnect("metamask")}
            >
              <div className={styles.walletIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="12" fill="#E2761B" />
                  <path
                    d="M18.5 6.5L13.5 12L18.5 17.5L21 15L16 12L21 9L18.5 6.5Z"
                    fill="white"
                  />
                  <path
                    d="M5.5 6.5L10.5 12L5.5 17.5L3 15L8 12L3 9L5.5 6.5Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span>MetaMask</span>
            </button>

            {/* Phantom */}
            <button
              className={styles.walletButton}
              onClick={() => handleWalletConnect("phantom")}
            >
              <div className={styles.walletIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="12" fill="#AB9FF2" />
                  <path
                    d="M12 6L9 10L12 14L15 10L12 6Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span>Phantom</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}