"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Web3 from "web3";
import { getCoinbaseWalletSDK } from "@/wallet/coinbase";
import {
  buildTypedData,
  message_5_minutes,
  TRANSFER_WITH_AUTHORIZATION_TYPE,
  USDC_Domain,
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

const DEFAULT_CHAIN_ID = 1;

const parsedChainId = Number(process.env.NEXT_PUBLIC_COINBASE_CHAIN_ID);
const chainId =
  Number.isFinite(parsedChainId) && parsedChainId > 0
    ? parsedChainId
    : DEFAULT_CHAIN_ID;

const EIP712_DOMAIN_TYPES = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const DEFAULT_USDC_RECIPIENT =
  "0x0000000000000000000000000000000000000000";
const DEFAULT_USDC_AMOUNT = BigInt("1000000");

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
  return `Chain ${id}`;
};

export default function PayMobilePage() {
  const [status, setStatus] = useState<WalletStatus>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeChainId, setActiveChainId] = useState(chainId);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const providerRef = useRef<Eip1193Provider | null>(null);
  const web3Ref = useRef<Web3 | null>(null);
  const listenersAttachedRef = useRef(false);

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

  const signUSDCTransferWithAuthorization = useCallback(
    async (to: string, value: bigint) => {
      const provider = getProvider();
      const walletAddress = address ?? web3Ref.current?.eth.defaultAccount;

      if (typeof walletAddress !== "string") {
        throw new Error("Wallet is not connected.");
      }

      const domain = USDC_Domain();
      const message = message_5_minutes(walletAddress, to, value);
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

      const signature = await provider.request({
        method: "eth_signTypedData_v4",
        params: [walletAddress, JSON.stringify(payload)],
      });

      if (typeof signature !== "string") {
        throw new Error("Unexpected signature response.");
      }

      return signature;
    },
    [address, getProvider]
  );

  const signTransfer = useCallback(async () => {
    setIsSigning(true);
    setSignatureError(null);

    try {
      const sig = await signUSDCTransferWithAuthorization(
        DEFAULT_USDC_RECIPIENT,
        DEFAULT_USDC_AMOUNT
      );
      setSignature(sig);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sign transfer.";
      setSignature(null);
      setSignatureError(message);
    } finally {
      setIsSigning(false);
    }
  }, [signUSDCTransferWithAuthorization]);

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

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay</p>
          <h1>Pay on Mobile</h1>
          <p className="lede">
            Connect your Coinbase Wallet on mobile to view your account details.
          </p>
          <Link href="/" className="tx-link hero-link">
            Back to activity
          </Link>
        </div>
        <div className="hero-badge">
          <span className="pulse" />
          <span>{statusLabel}</span>
        </div>
      </header>

      <section className="panel">
        <div className={`status ${statusClass}`} role="status" aria-live="polite">
          <div className="status-row">
            <span className="status-label">Connection</span>
            <span>{statusLabel}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Account</span>
            <span className="tx-value">
              {status === "connected" ? `${address}` : "Not connected"}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Network</span>
            <span>
              {status === "connected"
                ? `${getNetworkLabel(activeChainId)} (${activeChainId})`
                : "Not connected"}
            </span>
          </div>
        </div>

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

        {signature ? (
          <div className="status status-success" role="status" aria-live="polite">
            <div className="status-row status-row-stack">
              <span className="status-label">Signature</span>
              <span className="tx-value">{signature}</span>
            </div>
          </div>
        ) : null}

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
            disabled={status !== "connected" || isSigning}
          >
            {isSigning ? "Signing..." : "Sign USDC Transfer"}
          </button>
        </div>

        <p className="form-help">
          On mobile, Coinbase Wallet will open to complete the connection.
        </p>
      </section>
    </main>
  );
}
