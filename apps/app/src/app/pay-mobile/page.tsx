"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Web3 from "web3";
import { getCoinbaseWalletSDK } from "@/wallet/coinbase";
import {
  resolveDomain,
  buildMessage,
  buildTypedData,
  erc3009,
  randomNonce,
  TRANSFER_WITH_AUTHORIZATION_TYPE
} from "@seapay-ai/erc3009";

type WalletStatus = "idle" | "connecting" | "connected" | "error";

type Eip1193Provider = {
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  disconnect?: () => void | Promise<void>;
  close?: () => void | Promise<void>;
};

type Chain = {
  id: number;
  name: string;
  label: string;
};

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

const DEFAULT_CHAIN_ID = 1;

const parsedChainId = Number(process.env.NEXT_PUBLIC_COINBASE_CHAIN_ID);
const chainId =
  Number.isFinite(parsedChainId) && parsedChainId > 0
    ? parsedChainId
    : DEFAULT_CHAIN_ID;

const SUPPORTED_CHAINS: Chain[] = [
  { id: 1, name: "ethereum", label: "Ethereum Mainnet" },
  { id: 8453, name: "base", label: "Base Mainnet" },
  { id: 84532, name: "base-sepolia", label: "Base Sepolia" },
  { id: 11155111, name: "sepolia", label: "Ethereum Sepolia" },
  { id: 80002, name: "amoy", label: "Polygon Testnet (Amoy)" },
];

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
};

const EIP712_DOMAIN_TYPES = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const DEFAULT_USDC_RECIPIENT =
  "0xc3FcEF45C5a450D59E5F917Ed14A747649dbb360";
const DEFAULT_USDC_AMOUNT = BigInt("100");

const getNetworkLabel = (id: number) => {
  if (id === 1) {
    return "Ethereum Mainnet";
  }
  if (id === 8453) {
    return "Base Mainnet";
  }
  if (id === 84532) {
    return "Base Sepolia";
  }
  if (id === 11155111) {
    return "Ethereum Sepolia";
  }
  if (id === 80002) {
    return "polygon Testnet (Amoy)"
  }
  return `Chain ${id}`;
};

export default function PayMobilePage() {
  const [status, setStatus] = useState<WalletStatus>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeChainId, setActiveChainId] = useState(chainId);
  const [selectedChainId, setSelectedChainId] = useState<number>(84532); // Default to Base Sepolia
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>(DEFAULT_USDC_RECIPIENT);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const providerRef = useRef<Eip1193Provider | null>(null);
  const web3Ref = useRef<Web3 | null>(null);
  const listenersAttachedRef = useRef(false);

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
  }, [selectedChainId]);

  const getProvider = useCallback(() => {
    if (!providerRef.current) {
      const sdk = getCoinbaseWalletSDK();
      if (!sdk) {
        throw new Error("Coinbase Wallet SDK is only available in the browser.");
      }
      providerRef.current = sdk.getProvider() as Eip1193Provider;
    }
    return providerRef.current;
  }, []);

  const signTransferWithAuthorization = useCallback(
    async (asset: Asset, to: string, value: bigint) => {
      const provider = getProvider();
      const walletAddress = address ?? web3Ref.current?.eth.defaultAccount;

      if (typeof walletAddress !== "string") {
        throw new Error("Wallet is not connected.");
      }

      // 1. Resolve domain from registry
      const domain = resolveDomain({
        chainId: selectedChainId,
        token: "USDC",
      });

      // 2. Build message
      const message = buildMessage({
        from: walletAddress,
        to: to,
        value: value,
        validAfter: 0,
        validBefore: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
        nonce: randomNonce(),
      });

      
      // 3. Build typed data
      const typedData = buildTypedData({ domain, message });
      const payload = {
        domain: typedData.domain,
        types: {
          EIP712Domain: EIP712_DOMAIN_TYPES,
          ...typedData.types,
        },
        primaryType: TRANSFER_WITH_AUTHORIZATION_TYPE,
        message: {
          ...typedData.message,
          value: typedData.message.value.toString(),
          validAfter: typedData.message.validAfter.toString(),
          validBefore: typedData.message.validBefore.toString(),
        },
      };

      console.log("Signing payload:", JSON.stringify(payload));
      console.log("With wallet address:", walletAddress);

      const signature = await provider.request({
        method: "eth_signTypedData_v4",
        params: [walletAddress, payload],
      });
      

      console.log("Received signature:", signature);

      if (typeof signature !== "string") {
        console.error("Invalid signature response:", signature);
        throw new Error("Unexpected signature response.");
      }

      console.log("Domain:", JSON.stringify(domain));

      return { signature, domain, message };
    },
    [address, getProvider, selectedChainId]
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

    setIsSigning(true);
    setSignatureError(null);

    try {
      const { signature, domain, message } = await signTransferWithAuthorization(
        selectedAsset,
        recipientAddress,
        amountToSend
      );

      setSignature(signature);

      // Send the signed transfer to the relay API
      const relayResponse = await fetch("https://sea-pay.onrender.com/erc3009/relay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: domain.verifyingContract,
          from: message.from,
          to: message.to,
          value: message.value.toString(),
          validAfter: message.validAfter.toString(),
          validBefore: message.validBefore.toString(),
          nonce: message.nonce,
          signature,
          domain: {
            name: domain.name,
            version: domain.version,
            chainId: domain.chainId.toString(),
            verifyingContract: domain.verifyingContract,
          },
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

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    const primary = accounts?.[0] ?? null;
    setAddress(primary);

    if (primary) {
      if (web3Ref.current) {
        web3Ref.current.eth.defaultAccount = primary;
      }
      setStatus("connected");
      setError(null);
    } else {
      setStatus("idle");
    }
  }, []);

  const handleChainChanged = useCallback((nextChainId: string) => {
    const parsed = Number.parseInt(nextChainId, 10);
    if (Number.isFinite(parsed)) {
      setActiveChainId(parsed);
    }
  }, []);

  useEffect(() => {
    if (status !== "connected") {
      return;
    }

    const provider = providerRef.current;
    if (!provider?.on || listenersAttachedRef.current) {
      return;
    }

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    listenersAttachedRef.current = true;

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
      listenersAttachedRef.current = false;
    };
  }, [handleAccountsChanged, handleChainChanged, status]);

  const connectWallet = useCallback(async () => {
    setStatus("connecting");
    setError(null);

    try {
      const provider = getProvider();

      if (!web3Ref.current) {
        web3Ref.current = new Web3(provider as any);
      }

      const response = await provider.request({
        method: "eth_requestAccounts",
      });
      const accounts = response as string[];
      const primary = accounts?.[0];

      if (!primary) {
        throw new Error("No accounts returned from Coinbase Wallet.");
      }

      web3Ref.current.eth.defaultAccount = primary;
      setAddress(primary);

      const chainResponse = await provider.request({ method: "eth_chainId" });
      if (typeof chainResponse === "string") {
        const parsed = Number.parseInt(chainResponse, 16);
        if (Number.isFinite(parsed)) {
          setActiveChainId(parsed);
        }
      }

      setStatus("connected");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to connect to Coinbase Wallet.";
      setError(message);
      setStatus("error");
    }
  }, [getProvider]);

  const restoreConnection = useCallback(async () => {
    try {
      const provider = getProvider();

      if (!web3Ref.current) {
        web3Ref.current = new Web3(provider as any);
      }

      const response = await provider.request({ method: "eth_accounts" });
      const accounts = response as string[];
      const primary = accounts?.[0];

      if (!primary) {
        return;
      }

      web3Ref.current.eth.defaultAccount = primary;
      setAddress(primary);
      setStatus("connected");
      setError(null);

      const chainResponse = await provider.request({ method: "eth_chainId" });
      if (typeof chainResponse === "string") {
        const parsed = Number.parseInt(chainResponse, 16);
        if (Number.isFinite(parsed)) {
          setActiveChainId(parsed);
        }
      }
    } catch {
      // Ignore restore errors and let the user connect manually.
    }
  }, [getProvider]);

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);

  const disconnectWallet = useCallback(async () => {
    const provider = getProvider();
    if (provider.disconnect) {
      await provider.disconnect();
    }
    setAddress(null);
    setActiveChainId(chainId);
    setStatus("idle");
    setError(null);
    setSignature(null);
    setSignatureError(null);
  }, [getProvider]);

  const statusLabel = (() => {
    switch (status) {
      case "connecting":
        return "Connecting";
      case "connected":
        return "Connected";
      case "error":
        return "Error";
      default:
        return "Not connected";
    }
  })();

  const statusClass =
    status === "connected"
      ? "status-success"
      : status === "error"
        ? "status-error"
        : "";
  const shortAddress =
    status === "connected" && address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : null;

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay</p>
          <h1>Make a Payment</h1>
          <p className="lede">
            Connect your Coinbase Wallet on mobile.
          </p>
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
        {error ? (
          <div className="status status-error" role="status" aria-live="polite">
            <div className="status-row status-row-stack">
              <span className="status-label">Error</span>
              <span className="status-message">{error}</span>
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
            {transactionHash && (
              <div className="status-row status-row-stack">
                <span className="status-label">Transaction Hash</span>
                <span className="tx-value">{transactionHash}</span>
              </div>
            )}
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
              {SUPPORTED_CHAINS.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.label}
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
          <button
            type="button"
            onClick={connectWallet}
            disabled={status === "connecting" || status === "connected"}
          >
            {status === "connecting"
              ? "Connecting..."
              : "Connect Coinbase Wallet"}
          </button>
          <button
            type="button"
            onClick={disconnectWallet}
            disabled={status !== "connected"}
            className="secondary"
          >
            Disconnect
          </button>
          <button
            type="button"
            onClick={signTransfer}
            disabled={status !== "connected" || isSigning || !selectedAsset}
            className="pay-button"
          >
            {isSigning ? "Paying..." : "Pay"}
          </button>
        </div>

        <p className="form-help">
          On mobile, Coinbase Wallet will open to complete the connection.
        </p>
      </section>
    </main>
  );
}
