"use client";

import * as React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!privyAppId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not set. Please add it to your root .env file.");
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#4F46E5",
          logo: undefined,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
