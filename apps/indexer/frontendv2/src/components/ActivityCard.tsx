"use client";

import { Activity } from "@/hooks/useWebSocket";
import { useState } from "react";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (hexTimestamp: string) => {
    const timestamp = parseInt(hexTimestamp, 16) * 1000;
    return new Date(timestamp).toLocaleString();
  };

  const formatBlockNumber = (hexBlock: string) => {
    return parseInt(hexBlock, 16).toLocaleString();
  };

  const getAssetTone = (asset: string) => {
    switch (asset) {
      case "USDC":
      case "USDT":
        return "in";
      case "ETH":
        return "out";
      default:
        return "self";
    }
  };

  const getExplorerUrl = (hash: string) => {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  return (
    <article className="tx-card">
      <div className="tx-top">
        <span className={`tx-direction ${getAssetTone(activity.asset)}`}>
          {activity.asset}
        </span>
        <span className="tx-hash">
          {formatTimestamp(activity.blockTimestamp)}
        </span>
      </div>

      <div className="tx-grid">
        <div>
          <div className="tx-label">Value</div>
          <div className="tx-value">
            {activity.value} {activity.asset}
          </div>
        </div>
        <div>
          <div className="tx-label">From</div>
          <div className="tx-value tx-value-inline">
            <button
              onClick={() => copyToClipboard(activity.fromAddress, "from")}
              className="inline-button"
              title={activity.fromAddress}
            >
              {shortenAddress(activity.fromAddress)}
              {copiedField === "from" ? (
                <span className="copy-indicator">✓</span>
              ) : (
                <span className="copy-indicator">📋</span>
              )}
            </button>
          </div>
        </div>
        <div>
          <div className="tx-label">To</div>
          <div className="tx-value tx-value-inline">
            <button
              onClick={() => copyToClipboard(activity.toAddress, "to")}
              className="inline-button"
              title={activity.toAddress}
            >
              {shortenAddress(activity.toAddress)}
              {copiedField === "to" ? (
                <span className="copy-indicator">✓</span>
              ) : (
                <span className="copy-indicator">📋</span>
              )}
            </button>
          </div>
        </div>
        <div>
          <div className="tx-label">Tx Hash</div>
          <div className="tx-value tx-value-inline">
            <a
              href={getExplorerUrl(activity.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
              title={activity.hash}
            >
              {shortenAddress(activity.hash)}
            </a>
            <button
              onClick={() => copyToClipboard(activity.hash, "hash")}
              className="inline-button inline-icon"
              title="Copy transaction hash"
            >
              {copiedField === "hash" ? (
                <span className="copy-indicator">✓</span>
              ) : (
                <span className="copy-indicator">📋</span>
              )}
            </button>
          </div>
        </div>
        <div>
          <div className="tx-label">Block</div>
          <div className="tx-value">{formatBlockNumber(activity.blockNum)}</div>
        </div>
        <div>
          <div className="tx-label">Category</div>
          <div className="tx-value capitalize">{activity.category}</div>
        </div>
      </div>
    </article>
  );
}
