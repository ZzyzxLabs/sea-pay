"use client";

import { ConnectButton } from "@/components/ConnectWalletButton";
import { useAccount, useBalance, useChainId, useEnsName } from "wagmi";
import { formatUnits } from "viem";

export default function TestWagmiPage() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  });
  const { data: ensName } = useEnsName({
    address: address,
    query: {
      enabled: !!address,
    },
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Wagmi Test Page</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Wallet Connection</h2>
        <ConnectButton />
      </section>

      {isConnected && (
        <section style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Account Information</h2>
          <div
            style={{
              padding: "1.5rem",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#22c55e" }}>Connected</span>
            </div>

            {address && (
              <div style={{ marginBottom: "1rem" }}>
                <strong>Address:</strong>{" "}
                <code
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                  }}
                >
                  {address}
                </code>
              </div>
            )}

            {ensName && (
              <div style={{ marginBottom: "1rem" }}>
                <strong>ENS Name:</strong> {ensName}
              </div>
            )}

            {connector && (
              <div style={{ marginBottom: "1rem" }}>
                <strong>Connector:</strong> {connector.name}
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <strong>Chain ID:</strong> {chainId}
            </div>

            {balance && (
              <div>
                <strong>Balance:</strong>{" "}
                {formatUnits(balance.value, balance.decimals)} {balance.symbol}
              </div>
            )}
          </div>
        </section>
      )}

      {!isConnected && (
        <section style={{ marginTop: "2rem" }}>
          <p style={{ color: "#666" }}>Connect a wallet to see account information</p>
        </section>
      )}
    </div>
  );
}
