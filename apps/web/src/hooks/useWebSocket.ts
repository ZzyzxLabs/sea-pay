"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface Activity {
  fromAddress: string;
  toAddress: string;
  blockNum: string;
  hash: string;
  value: number;
  asset: string;
  category: string;
  blockTimestamp: string;
  rawContract: {
    rawValue: string;
    address: string;
    decimals: number;
  };
  log: {
    address: string;
    topics: string[];
    data: string;
    blockHash: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
    transactionIndex: string;
    logIndex: string;
    removed: boolean;
  };
}

export interface WebhookData {
  webhookId: string;
  id: string;
  createdAt: string;
  type: string;
  event: {
    network: string;
    activity: Activity[];
    source: string;
  };
}

export type ConnectionStatus = "connected" | "disconnected" | "error";

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Create socket connection
    const socketInstance = io("http://localhost:3001", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on("connect", () => {
      console.log("WebSocket connected");
      setStatus("connected");
    });

    socketInstance.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setStatus("disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setStatus("error");
    });

    // Listen for webhook data
    socketInstance.on("webhook-data", (data: WebhookData) => {
      console.log("Received webhook data:", data);

      // Extract activities from the webhook data
      if (data.event?.activity && Array.isArray(data.event.activity)) {
        setActivities((prev) => {
          // Add new activities to the beginning and limit to 50
          const updated = [...data.event.activity, ...prev];
          return updated.slice(0, 50);
        });
      }
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket,
    status,
    activities,
  };
}
