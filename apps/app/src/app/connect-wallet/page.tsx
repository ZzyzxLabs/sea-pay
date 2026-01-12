"use client";

import { WalletOptions } from "@/components/WalletOptions";

export default function ConnectWalletPage() {
  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay</p>
          <h1>Connect Wallet</h1>
          <p className="lede">
            Connect your wallet to get started
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="actions">
          <WalletOptions />
        </div>
      </section>
    </main>
  );
}