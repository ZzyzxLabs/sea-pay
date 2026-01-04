"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Activity, WebhookData, ConnectionStatus } from "./useWebSocket";

interface FilterConfig {
  address: string; // Wallet address to monitor (lowercase)
  amount: number; // Exact amount to match
  asset: string; // Asset type to match (e.g., "ETH", "USDC")
}

export function useFilteredWebSocket(filterConfig: FilterConfig | null) {
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
      console.log("WebSocket connected (filtered)");
      setStatus("connected");
    });

    socketInstance.on("disconnect", () => {
      console.log("WebSocket disconnected (filtered)");
      setStatus("disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error (filtered):", error);
      setStatus("error");
    });

    // Listen for webhook data
    socketInstance.on("webhook-data", (data: WebhookData) => {
      console.log("Received webhook data (filtered):", data);

      // Only process if we have a filter config
      if (!filterConfig) {
        return;
      }

      // Extract activities from the webhook data
      if (data.event?.activity && Array.isArray(data.event.activity)) {
        // Filter activities based on address and amount
        const matchingActivities = data.event.activity.filter((activity) => {
          
          const toMatches =
            activity.toAddress.toLowerCase() === filterConfig.address;
          const amountMatches = activity.value === filterConfig.amount;
          const assetMatches = activity.asset === filterConfig.asset;

          // Match if address is in to, AND amount matches exactly
          return toMatches && amountMatches;
        });

        if (matchingActivities.length > 0) {
          console.log(
            `Found ${matchingActivities.length} matching activities`,
            matchingActivities
          );

          setActivities((prev) => {
            // Add new matching activities to the beginning and limit to 50
            const updated = [...matchingActivities, ...prev];
            return updated.slice(0, 50);
          });
        }
      }
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [filterConfig]);

  // Clear activities when filter config changes or is removed
  useEffect(() => {
    setActivities([]);
  }, [filterConfig]);

  return {
    socket,
    status,
    activities,
  };
}
