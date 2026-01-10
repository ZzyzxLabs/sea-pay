"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function TransactionSuccessContent() {
  const searchParams = useSearchParams();
  const transactionHash = searchParams.get("hash");

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay</p>
          <h1>Transaction Complete!</h1>
          <p className="lede">
            Your payment has been successfully processed.
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="status status-success" role="status" aria-live="polite">
          <div className="status-row status-row-stack">
            <span className="status-label">Transaction Successful</span>
            <span className="status-message">
              Your payment is complete!
            </span>
          </div>
          {transactionHash && (
            <div className="status-row status-row-stack">
              <span className="status-label">Transaction Hash</span>
              <span className="tx-value">{transactionHash}</span>
            </div>
          )}
        </div>

        <div className="actions">
          <Link href="/pay-mobile" className="tx-link hero-link">
            Make Another Payment
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function TransactionSuccessPage() {
  return (
    <Suspense fallback={
      <main className="app">
        <header className="hero">
          <div>
            <p className="eyebrow">SeaPay</p>
            <h1>Loading...</h1>
          </div>
        </header>
      </main>
    }>
      <TransactionSuccessContent />
    </Suspense>
  );
}
