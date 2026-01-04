"use client";

import { useEffect, useState } from "react";
import { useFilteredWebSocket } from "@/hooks/useFilteredWebSocket";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function MonitorPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [assetType, setAssetType] = useState("ETH");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchPhase, setMatchPhase] = useState<"idle" | "loading" | "success">(
    "idle"
  );
  const [lastSender, setLastSender] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [filterConfig, setFilterConfig] = useState<{
    address: string;
    amount: number;
    asset: string;
  } | null>(null);

  const { status, activities } = useFilteredWebSocket(filterConfig);
  const router = useRouter();

  const handleStartMonitoring = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress.trim() || !amount.trim() || !assetType.trim()) {
      setError("Please enter wallet address, amount, and asset type");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMatchPhase("loading");
    setLastSender(null);
    setIsPopupOpen(true);
    setQrSvg(null);
    setQrUri(null);

    try {
      const qrResponse = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress.trim(),
        }),
      });

      const qrData = await qrResponse.json();

      if (!qrResponse.ok) {
        throw new Error(qrData.error || "Failed to generate QR code");
      }
      console.log("QR code generated:", qrData.uri);
      setQrSvg(qrData.svg);
      setQrUri(qrData.uri);
    } catch (err) {
      console.error("Error generating QR code:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code"
      );
      setIsPopupOpen(false);
      setMatchPhase("idle");
      setIsLoading(false);
      setQrUri(null);
      return;
    }

    try {
      // Add wallet address to Alchemy webhook
      const response = await fetch("/api/webhook-addresses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressesToAdd: [walletAddress.trim()],
          addressesToRemove: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add address to webhook");
      }

      console.log("Address added to webhook:", data);

      // Start monitoring
      setFilterConfig({
        address: walletAddress.trim().toLowerCase(),
        amount: parsedAmount,
        asset: assetType || "USDC",
      });
      setIsMonitoring(true);
    } catch (err) {
      console.error("Error adding address to webhook:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start monitoring"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopMonitoring = async () => {
    if (!filterConfig) return;

    setIsLoading(true);
    setError(null);

    try {
      // Remove wallet address from Alchemy webhook
      const response = await fetch("/api/webhook-addresses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressesToAdd: [],
          addressesToRemove: [filterConfig.address],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove address from webhook");
      }

      console.log("Address removed from webhook:", data);

      // Stop monitoring
      setFilterConfig(null);
      setIsMonitoring(false);
      setMatchPhase("idle");
      setIsPopupOpen(false);
      setQrSvg(null);
      setQrUri(null);
    } catch (err) {
      console.error("Error removing address from webhook:", err);
      setError(
        err instanceof Error ? err.message : "Failed to stop monitoring"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const buildPayUrl = () => {
    const params = new URLSearchParams();
    const trimmedAddress = walletAddress.trim();
    const trimmedAmount = amount.trim();
    const trimmedAsset = assetType.trim();

    if (trimmedAddress) {
      params.set("address", trimmedAddress);
    }
    if (trimmedAmount) {
      params.set("amount", trimmedAmount);
    }
    if (trimmedAsset) {
      params.set("asset", trimmedAsset);
    }
    if (qrUri) {
      params.set("uri", qrUri);
    }

    const query = params.toString();
    return query ? `/pay?${query}` : "/pay";
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
    }
  };

  const hasMatch = matchPhase === "success";

  useEffect(() => {
    if (activities.length > 0) {
      setMatchPhase("success");
      setLastSender(activities[0].fromAddress);
    }
  }, [activities]);

  useEffect(() => {
    if (!isMonitoring) {
      setMatchPhase("idle");
      setLastSender(null);
      setIsPopupOpen(false);
      setQrSvg(null);
      setQrUri(null);
    }
  }, [isMonitoring]);

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay</p>
          <h1>Receive Payments</h1>
          <Link href="/" className="tx-link hero-link">
            View all activity
          </Link>
        </div>
        <div className="hero-badge">
          <span className="pulse" />
          <span>{getStatusText()}</span>
        </div>
      </header>

      <section className="panel">
        {/* <div className="status" role="status" aria-live="polite">
          <div className="status-row">
            <span className="status-label">Status</span>
            <span>{getStatusText()}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Monitoring</span>
            <span>{isMonitoring ? "Active" : "Inactive"}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Matches</span>
            <span>{activities.length}</span>
          </div>
        </div> */}

        <form onSubmit={handleStartMonitoring} className="form-grid">
          <div className="form-item">
            <label htmlFor="walletAddress" className="form-label">
              Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              disabled={isMonitoring}
              className="form-input"
            />
            <p className="form-help">
              Enter the wallet address to monitor (from or to)
            </p>
          </div>

          <div className="form-item">
            <label htmlFor="amount" className="form-label">
              Transaction Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              step="0.000001"
              disabled={isMonitoring}
              className="form-input"
            />
            <p className="form-help">
              Only show transactions with this exact amount
            </p>
          </div>

          <div className="form-item">
            <label htmlFor="assetType" className="form-label">
              Asset Type
            </label>
            <select
              id="assetType"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              disabled={isMonitoring}
              className="form-input"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
            <p className="form-help">Choose the asset to monitor</p>
          </div>

          <div className="actions">
            {!isMonitoring ? (
              <button type="submit" disabled={isLoading} id="startBtn">
                {isLoading ? "Generating..." : "Generate QR Code"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopMonitoring}
                disabled={isLoading}
                className="secondary"
              >
                {isLoading ? "Stopping..." : "Stop Monitoring"}
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="status status-error" role="status" aria-live="polite">
            <div className="status-row status-row-stack">
              <span className="status-label">Error</span>
              <span className="status-message">{error}</span>
            </div>
          </div>
        )}

        {isMonitoring && filterConfig && (
          <div className="status status-success" role="status" aria-live="polite">
            <div className="status-row status-row-stack">
              <span className="status-label">Monitoring</span>
              <span className="status-message">
                Address {filterConfig.address} for transactions of exactly{" "}
                {filterConfig.amount} {assetType}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* <section className="results">
        <div className="results-header">
          <h2>Matches</h2>
          <p className="muted">{resultsHint}</p>
        </div>
        <div className="results-list">
          {isMonitoring ? (
            <div className="tx-card empty-state">
              <h3>{hasMatch ? "Match received" : "Monitoring..."}</h3>
              <p className="muted">
                {hasMatch
                  ? "Check the popup for details."
                  : "Waiting for matching transactions"}
              </p>
              {filterConfig && !hasMatch && (
                <>
                  <p className="muted small">Address: {filterConfig.address}</p>
                  <p className="muted small">Amount: {filterConfig.amount}</p>
                </>
              )}
            </div>
          ) : (
            <div className="tx-card empty-state">
              <h3>Not Monitoring</h3>
              <p className="muted">
                Fill in the form above and click "Start Monitoring" to begin
              </p>
            </div>
          )}
        </div>
      </section> */}

      {isPopupOpen && (
        <div className="modal-backdrop" role="status" aria-live="polite">
          <div className="modal-card">
            <button
              type="button"
              className="modal-close"
              onClick={() => setIsPopupOpen(false)}
              aria-label="Close popup"
            >
              x
            </button>
            <div className="modal-body">
              {qrSvg ? (
                <div
                  className="modal-qr"
                  role="img"
                  aria-label="Payment QR code"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="modal-qr modal-qr-loading">
                  <span className="muted small">Generating QR code...</span>
                </div>
              )}
              {hasMatch ? (
                <DotLottieReact
                  key="success"
                  src="/lottie/Success.json"
                  autoplay
                  loop={false}
                  className="modal-lottie"
                />
              ) : (
                <DotLottieReact
                  key="loading"
                  src="/lottie/Loading.json"
                  autoplay
                  loop={true}
                  className="modal-lottie"
                />
              )}
              
              <h3 className="modal-title">
                {hasMatch ? "Payment received" : "Waiting for payment..."}
              </h3>
              {hasMatch && lastSender && (
                <div className="modal-wallet">
                  <span className="tx-value text-sm">Amount: {amount} {assetType}</span>
                  <span className="tx-label">From: {lastSender}</span>
                </div>
              )}
              {!hasMatch && qrSvg && (
                <div className="actions">
                  <button
                    type="button"
                    onClick={() => router.push(buildPayUrl())}
                    className="secondary"
                  >
                    Open payment page
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
