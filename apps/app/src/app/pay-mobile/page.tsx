"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useWalletClient, useChainId, useSwitchChain } from "wagmi";
import {
  buildTypedData,
  buildMessage,
  nowPlusSeconds,
  type TypedData
} from "@seapay-ai/erc3009";
import { chains } from "@/lib/web3/chains";

type Asset = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  domain: {
    name: string;
    version: string;
  };
};

type ChainAssets = {
  [chainId: number]: Asset[];
};

const CHAIN_ASSETS: ChainAssets = {
  1: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      domain: { name: "USD Coin", version: "2" },
    },
  ],
  8453: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      domain: { name: "USD Coin", version: "2" },
    },
  ],
  84532: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      decimals: 6,
      domain: { name: "USDC", version: "2" },
    },
  ],
  11155111: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
      domain: { name: "USDC", version: "2" },
    },
  ],
  80002: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
      decimals: 6,
      domain: { name: "USD Coin", version: "2" },
    },
  ],
  137: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      decimals: 6,
      domain: { name: "USD Coin", version: "2" },
    },
  ],
};

const DEFAULT_USDC_RECIPIENT =
  "0xc3FcEF45C5a450D59E5F917Ed14A747649dbb360";
const DEFAULT_USDC_AMOUNT = BigInt("100");

export default function PayMobilePage() {
  const router = useRouter();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const [error, setError] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number>(84532); // Default to Base Sepolia
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>(DEFAULT_USDC_RECIPIENT);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const lastSwitchedChainIdRef = useRef<number | null>(null);

  // Read URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const addressParam = params.get("address");
    const amountParam = params.get("amount");
    const assetParam = params.get("asset");

    if (addressParam) {
      setRecipientAddress(addressParam);
    }
    if (amountParam) {
      setPaymentAmount(amountParam);
    }
    if (assetParam) {
      // Try to find the asset in the current chain's assets
      const assets = CHAIN_ASSETS[selectedChainId];
      const foundAsset = assets?.find(a => a.symbol.toUpperCase() === assetParam.toUpperCase());
      if (foundAsset) {
        setSelectedAsset(foundAsset);
      }
    }
  }, []);

  // Initialize selected asset when chain changes
  useEffect(() => {
    const assets = CHAIN_ASSETS[selectedChainId];
    if (assets && assets.length > 0) {
      setSelectedAsset(assets[0]);
    } else {
      setSelectedAsset(null);
    }
    // Reset transaction success state when chain changes (new transaction context)
    setTransactionSuccess(false);
    setTransactionHash(null);
    setSignature(null);
  }, [selectedChainId]);

  // Switch chain when selectedChainId changes (if wallet is connected)
  useEffect(() => {
    // Only switch if:
    // 1. Wallet is connected
    // 2. Selected chain differs from active chain
    // 3. Not already switching
    // 4. We haven't already initiated a switch to this chain (prevents loops)
    if (
      isConnected &&
      selectedChainId !== chainId &&
      !isSwitchingChain &&
      lastSwitchedChainIdRef.current !== selectedChainId
    ) {
      lastSwitchedChainIdRef.current = selectedChainId;
      switchChain({ chainId: selectedChainId });
    }
    // Reset the ref when chainId actually matches selectedChainId (switch completed)
    if (selectedChainId === chainId) {
      lastSwitchedChainIdRef.current = null;
    }
  }, [isConnected, selectedChainId, chainId, switchChain, isSwitchingChain]);

  // Sync error state with connect error
  useEffect(() => {
    if (connectError) {
      setError(connectError.message);
    }
  }, [connectError]);

  // Clear error when account changes (user switched accounts)
  useEffect(() => {
    if (isConnected && address) {
      setError(null);
    }
  }, [isConnected, address]);

  const signTransferWithAuthorization = useCallback(
    async (asset: Asset, to: string, value: bigint) => {
      if (!address) {
        throw new Error("Wallet is not connected.");
      }

      if (!walletClient) {
        throw new Error("Wallet client is not available.");
      }

      const message = buildMessage({
        from: address,
        to: to,
        value: value,
        validBefore: nowPlusSeconds(300), // Valid for 5 minutes
      });

      const {
        domain,
        types,
        message: msg,
      } = buildTypedData({
        chainId: chainId, // Use active chainId to match walletClient's chain
        token: asset.symbol,
        message,
      });
      console.log("chainId", chainId);

      const signature = await walletClient.signTypedData({
        domain: domain as any,
        types: types as any,
        primaryType: "TransferWithAuthorization",
        message: msg as any,
      });

      const typedData: TypedData = {
        domain: domain,
        types: types,
        primaryType: "TransferWithAuthorization",
        message: msg,
      }
      console.log("Received signature:", signature);

      return { typedData, signature };
    },
    [address, walletClient, chainId]
  );

  const signTransfer = useCallback(async () => {
    if (!selectedAsset) {
      setSignatureError("Please select an asset to transfer.");
      return;
    }

    // Use the payment amount from URL params or default
    const amountToSend = paymentAmount
      ? BigInt(Math.floor(parseFloat(paymentAmount) * Math.pow(10, selectedAsset.decimals)))
      : DEFAULT_USDC_AMOUNT;


    console.log("selectedChainId", selectedChainId);  
    setIsSigning(true);
    setSignatureError(null);

    try {
      // Use selectedChainId for signing (chain switching happens automatically in useEffect)
      const { typedData, signature } = await signTransferWithAuthorization(
        selectedAsset,
        recipientAddress,
        amountToSend
      );

      setSignature(signature);

      // Convert BigInt values to strings for JSON serialization
      const serializeTypedData = (data: any): any => {
        if (typeof data === "bigint") {
          return data.toString();
        }
        if (Array.isArray(data)) {
          return data.map(serializeTypedData);
        }
        if (data && typeof data === "object") {
          const serialized: any = {};
          for (const key in data) {
            serialized[key] = serializeTypedData(data[key]);
          }
          return serialized;
        }
        return data;
      };

      // Send the signed transfer to the relay API
      const relayResponse = await fetch("https://sea-pay.onrender.com/erc3009/relay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          typedData: serializeTypedData(typedData),
          signature: signature,
        }),
      });

      if (!relayResponse.ok) {
        const errorText = await relayResponse.text();
        throw new Error(`Relay API error: ${errorText}`);
      }

      const relayResult = await relayResponse.json();
      console.log("Relay result:", relayResult);

      // Set success state
      setTransactionSuccess(true);
      if (relayResult.transactionHash || relayResult.hash || relayResult.txHash) {
        setTransactionHash(relayResult.transactionHash || relayResult.hash || relayResult.txHash);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sign transfer.";
      setSignature(null);
      setSignatureError(message);
      setTransactionSuccess(false);
      setTransactionHash(null);
    } finally {
      setIsSigning(false);
    }
  }, [signTransferWithAuthorization, selectedAsset, recipientAddress, paymentAmount]);

  const handleConnectWallet = useCallback((connectorId: string) => {
    setError(null);
    const connector = connectors.find((c) => c.uid === connectorId || c.id === connectorId);
    if (connector) {
      connect({ connector });
      setShowWalletModal(false);
    } else {
      setError(`Wallet connector not found.`);
    }
  }, [connectors, connect]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setSignature(null);
    setSignatureError(null);
    setError(null);
  }, [disconnect]);

  // Redirect to success page when transaction succeeds
  useEffect(() => {
    if (transactionSuccess) {
      const params = new URLSearchParams();
      if (transactionHash) {
        params.set("hash", transactionHash);
      }
      const queryString = params.toString();
      const redirectUrl = `/pay-mobile/success${queryString ? `?${queryString}` : ""}`;
      router.push(redirectUrl);
    }
  }, [transactionSuccess, transactionHash, router]);

  const statusLabel = isPending
    ? "Connecting"
    : isConnected
      ? "Connected"
      : error || connectError
        ? "Error"
        : "Not connected";

  const statusClass = isConnected
    ? "status-success"
    : error || connectError
      ? "status-error"
      : "";

  const shortAddress = isConnected && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const displayError = error || connectError?.message;

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay</p>
          <h1>Make a Payment</h1>
          {!isConnected && (
            <p className="lede">
              Connect your wallet to make a payment.
            </p>
          )}
          {/* <Link href="/" className="tx-link hero-link">
            Back to activity
          </Link> */}
        </div>
        <div
          className={`hero-badge hero-badge-compact ${statusClass}`}
          role="status"
          aria-live="polite"
        >
          <span className="pulse" />
          <span>{statusLabel}</span>
          {shortAddress ? (
            <>
              <span className="hero-badge-sep" aria-hidden="true">
                •
              </span>
              <span className="tx-value hero-badge-account">
                {shortAddress}
              </span>
            </>
          ) : null}
        </div>
      </header>

      <section className="panel">
        {displayError ? (
          <div className="status status-error" role="status" aria-live="polite">
            <div className="status-row status-row-stack">
              <span className="status-label">Error</span>
              <span className="status-message">{displayError}</span>
            </div>
          </div>
        ) : null}

        {signatureError ? (
          <div className="status status-error" role="status" aria-live="polite">
            <div className="status-row status-row-stack">
              <span className="status-label">Signature Error</span>
              <span className="status-message">{signatureError}</span>
            </div>
          </div>
        ) : null}

        {transactionSuccess ? (
          <div className="status status-success" role="status" aria-live="polite">
            <div className="status-row status-row-stack">
              <span className="status-label">Transaction Successful</span>
              <span className="status-message">
                Your payment is complete!
              </span>
            </div>
            {/* {transactionHash && (
              <div className="status-row status-row-stack">
                <span className="status-label">Transaction Hash</span>
                <span className="tx-value">{transactionHash}</span>
              </div>
            )} */}
          </div>
        ) : signature ? (
          <div className="status status-success" role="status" aria-live="polite">
            <div className="status-row status-row-stack">
              <span className="status-label">Signature</span>
              <span className="tx-value">{signature}</span>
            </div>
          </div>
        ) : null}

        <div className="status" style={{ marginTop: "1rem" }}>
          <div className="status-row">
            <span className="status-label">Recipient Address</span>
            <span className="tx-small">{recipientAddress}</span>
          </div>
          {paymentAmount && (
            <div className="status-row">
              <span className="status-label">Amount</span>
              <span className="tx-value">
                {paymentAmount} {selectedAsset?.symbol || ""}
              </span>
            </div>
          )}
        </div>

        <div className="status" style={{ marginTop: "1rem" }}>
          <div className="status-row">
            <span className="status-label">Select Chain</span>
            <select
              value={selectedChainId}
              onChange={(e) => setSelectedChainId(Number(e.target.value))}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "white",
                fontSize: "0.9rem",
              }}
            >
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          <div className="status-row" style={{ marginTop: "0.5rem" }}>
            <span className="status-label">Select Asset</span>
            <select
              value={selectedAsset?.address || ""}
              onChange={(e) => {
                const asset = CHAIN_ASSETS[selectedChainId]?.find(
                  (a) => a.address === e.target.value
                );
                setSelectedAsset(asset || null);
              }}
              disabled={!CHAIN_ASSETS[selectedChainId]?.length}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "white",
                fontSize: "0.9rem",
              }}
            >
              {CHAIN_ASSETS[selectedChainId]?.map((asset) => (
                <option key={asset.address} value={asset.address}>
                  {asset.name} ({asset.symbol})
                </option>
              )) || <option value="">No assets available</option>}
            </select>
          </div>
        </div>

        <div className="actions">
          {!isConnected ? (
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              disabled={isPending}
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={disconnectWallet}
                className="secondary"
              >
                Disconnect
              </button>
              <button
                type="button"
                onClick={signTransfer}
                disabled={!isConnected || isSigning || isSwitchingChain || !selectedAsset}
                className="pay-button"
              >
                {isSwitchingChain ? "Switching Chain..." : isSigning ? "Processing..." : "Pay"}
              </button>
            </>
          )}
        </div>

        {/* Wallet Selection Modal */}
        {showWalletModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowWalletModal(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                maxWidth: "400px",
                width: "90%",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>
                Connect Wallet
              </h2>
              <p style={{ margin: "0 0 1.5rem 0", color: "#666", fontSize: "0.9rem" }}>
                Choose a wallet to connect
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {connectors.length > 0 ? (
                  connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      type="button"
                      onClick={() => handleConnectWallet(connector.uid)}
                      disabled={isPending}
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "6px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "white",
                        cursor: isPending ? "not-allowed" : "pointer",
                        fontSize: "1rem",
                        textAlign: "left",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isPending) {
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      {connector.name}
                    </button>
                  ))
                ) : (
                  <p style={{ color: "#666", fontSize: "0.9rem", textAlign: "center", padding: "1rem" }}>
                    No wallet connectors available
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: "white",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* <p className="form-help">
          On mobile, Coinbase Wallet will open to complete the connection.
        </p> */}
      </section>
    </main>
  );
}
