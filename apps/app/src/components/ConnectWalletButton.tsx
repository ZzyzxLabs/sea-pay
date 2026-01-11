"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button onClick={() => disconnect()}>
        Disconnect ({address?.slice(0, 6)}…{address?.slice(-4)})
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {connectors.map((c) => (
        <button key={c.uid} onClick={() => connect({ connector: c })}>
          {c.name}
        </button>
      ))}
    </div>
  );
}
