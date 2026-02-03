"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useWalletClient, useChainId, useSwitchChain } from "wagmi";
import {
  buildTypedData,
  buildMessage,
  nowPlusSeconds,
  type TypedData
} from "@seapay-ai/erc3009";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { chains } from "@/lib/web3/chains";
import { useWalletType } from "@/lib/web3/useWalletType";
import styles from "./pay-mobile.module.css";

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
  const [isRelaying, setIsRelaying] = useState(false);
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
    const chainParam = params.get("chain");

    if (addressParam) {
      setRecipientAddress(addressParam);
    }
    if (amountParam) {
      setPaymentAmount(amountParam);
    }
    if (chainParam) {
      const chainId = parseInt(chainParam, 10);
      if (!isNaN(chainId)) {
        setSelectedChainId(chainId);
      }
    }
  }, []);

  // Initialize selected asset (always USDC) when chain changes
  useEffect(() => {
    const assets = CHAIN_ASSETS[selectedChainId];
    if (assets && assets.length > 0) {
      // Always use USDC (first asset)
      const usdcAsset = assets.find(a => a.symbol === "USDC") || assets[0];
      setSelectedAsset(usdcAsset);
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

  // Detect wallet type to determine payment routing
  const { walletType } = useWalletType();

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
    console.log("walletType", walletType);
    setIsSigning(true);
    setSignatureError(null);

    try {
      // Route payment based on wallet type
      if (walletType === "smart-wallet") {
        // Smart Contract Wallet: Use Alchemy's ERC-4337 API
        await handleSmartWalletPayment(amountToSend);
      } else {
        // EOA: Use ERC-3009 flow
        await handleEOAPayment(amountToSend);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process payment.";
      setSignature(null);
      setSignatureError(message);
      setTransactionSuccess(false);
      setTransactionHash(null);
      setIsRelaying(false);
    } finally {
      setIsSigning(false);
    }
  }, [signTransferWithAuthorization, selectedAsset, recipientAddress, paymentAmount, walletType]);

  // ERC-3009 flow for EOA wallets
  const handleEOAPayment = async (amountToSend: bigint) => {
    const { typedData, signature } = await signTransferWithAuthorization(
      selectedAsset!,
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

    // Start relaying
    setIsRelaying(true);

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
    setIsRelaying(false);
    setTransactionSuccess(true);
    if (relayResult.transactionHash || relayResult.hash || relayResult.txHash) {
      setTransactionHash(relayResult.transactionHash || relayResult.hash || relayResult.txHash);
    }
  };

  // ERC-4337 flow for Smart Contract Wallets (Alchemy API)
  const handleSmartWalletPayment = async (amountToSend: bigint) => {
    console.log("Using Alchemy ERC-4337 API for Smart Wallet payment");
    console.log("Amount:", amountToSend.toString());
    console.log("Recipient:", recipientAddress);
    console.log("Token:", selectedAsset?.address);

    // Start relaying
    setIsRelaying(true);

    // TODO: Integrate Alchemy's ERC-4337 API
    // Placeholder implementation
    // const alchemyResponse = await fetch("https://api.g.alchemy.com/v2/YOUR_API_KEY", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     // Alchemy API payload for ERC-4337 user operation
    //     chainId: selectedChainId,
    //     from: address,
    //     to: recipientAddress,
    //     token: selectedAsset?.address,
    //     amount: amountToSend.toString(),
    //   }),
    // });

    // Simulate success for now
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Set success state
    setIsRelaying(false);
    setTransactionSuccess(true);
    setTransactionHash("0x" + "placeholder".repeat(8)); // Placeholder hash
  };

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
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div style={{ width: "24px" }} /> {/* Spacer for centering */}
        <h1 className={styles.logo}>SeaPay</h1>
        <div className={styles.statusBadge} role="status" aria-live="polite">
          <span className={styles.pulse} />
          <span>{statusLabel}</span>
          {shortAddress ? (
            <>
              <span className={styles.separator} aria-hidden="true">
                •
              </span>
              <span>{shortAddress}</span>
            </>
          ) : null}
        </div>
      </header>

      {/* Amount Display */}
      {paymentAmount && (
        <div className={styles.amountDisplay}>
          ${parseFloat(paymentAmount).toFixed(2)}
        </div>
      )}

      {/* Main content area */}
      <div className={styles.mainContent}>
        {/* Error messages */}
        {displayError ? (
          <div className={`${styles.statusBox} ${styles.statusBoxError}`} role="status" aria-live="polite">
            <div className={styles.statusRowStack}>
              <span className={styles.statusLabel}>Error</span>
              <span className={styles.statusMessage}>{displayError}</span>
            </div>
          </div>
        ) : null}

        {signatureError ? (
          <div className={`${styles.statusBox} ${styles.statusBoxError}`} role="status" aria-live="polite">
            <div className={styles.statusRowStack}>
              <span className={styles.statusLabel}>Signature Error</span>
              <span className={styles.statusMessage}>{signatureError}</span>
            </div>
          </div>
        ) : null}

        {transactionSuccess ? (
          <div className={`${styles.statusBox} ${styles.statusBoxSuccess}`} role="status" aria-live="polite">
            <div className={styles.statusRowStack}>
              <span className={styles.statusLabel}>Transaction Successful</span>
              <span className={styles.statusMessage}>
                Your payment is complete!
              </span>
            </div>
          </div>
        ) : signature ? (
          <div className={`${styles.statusBox} ${styles.statusBoxSuccess}`} role="status" aria-live="polite">
            <div className={styles.statusRowStack}>
              <span className={styles.statusLabel}>Signature</span>
              <span className={styles.statusValue}>{signature}</span>
            </div>
          </div>
        ) : null}

        {/* Payment details */}
        <div className={styles.statusBox}>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Recipient Address</span>
            <span className={styles.statusValueSmall}>{recipientAddress}</span>
          </div>
          <div className={styles.statusRow} style={{ marginTop: "0.5rem" }}>
            <span className={styles.statusLabel}>Chain</span>
            <span className={styles.statusValue}>
              {chains.find((c) => c.id === selectedChainId)?.name || `Chain ${selectedChainId}`}
            </span>
          </div>
          <div className={styles.statusRow} style={{ marginTop: "0.5rem" }}>
            <span className={styles.statusLabel}>Asset</span>
            <span className={styles.statusValue}>USDC</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!isConnected ? (
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              disabled={isPending}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={disconnectWallet}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                Disconnect
              </button>
              <button
                type="button"
                onClick={signTransfer}
                disabled={!isConnected || isSigning || isSwitchingChain || !selectedAsset || isRelaying}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                {isSwitchingChain ? "Switching Chain..." : isSigning || isRelaying ? "Processing..." : "Pay"}
              </button>
            </>
          )}
        </div>
      </div>

        {/* Wallet Selection Modal */}
        {showWalletModal && (
          <div
            className={styles.modalBackdrop}
            onClick={() => setShowWalletModal(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={styles.modalTitle}>Connect Wallet</h2>
              <p className={styles.modalSubtitle}>
                Choose a wallet to connect
              </p>
              <div className={styles.modalButtons}>
                {connectors.length > 0 ? (
                  connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      type="button"
                      onClick={() => handleConnectWallet(connector.uid)}
                      disabled={isPending}
                      className={styles.modalButton}
                    >
                      {connector.name}
                    </button>
                  ))
                ) : (
                  <p style={{ color: "#9ca3af", fontSize: "14px", textAlign: "center", padding: "16px" }}>
                    No wallet connectors available
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className={styles.modalCancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading/Success Animation Modal */}
        {(isRelaying || transactionSuccess) && (
          <div className={styles.animationModal}>
            <div className={styles.animationContent}>
              {isRelaying ? (
                <>
                  <DotLottieReact
                    src="/lottie/Loading.json"
                    loop
                    autoplay
                    className={styles.lottieAnimation}
                  />
                  <h3 className={styles.animationTitle}>Processing payment...</h3>
                </>
              ) : transactionSuccess ? (
                <>
                  <DotLottieReact
                    src="/lottie/Success.json"
                    loop={false}
                    autoplay
                    className={styles.lottieAnimation}
                  />
                  <h3 className={styles.animationTitle}>Payment successful!</h3>
                </>
              ) : null}
            </div>
          </div>
        )}
    </div>
  );
}
