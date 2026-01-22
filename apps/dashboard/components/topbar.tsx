"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePrivyAddress } from "@/hooks/use-privy-address";
import { formatShortAddress } from "@/lib/format";

export default function TopBar() {
  const { ready, authenticated, login, logout } = usePrivy();
  const address = usePrivyAddress();

  return (
    <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Welcome back</span>
        </div>
        <h1 className="text-xl font-semibold">Your money, simplified.</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1">
          <Bell className="h-3 w-3" />
          {authenticated ? "Wallet ready" : "Mock mode"}
        </Badge>
        {address && (
          <Badge variant="outline" className="font-mono text-xs">
            {formatShortAddress(address)}
          </Badge>
        )}
        {authenticated ? (
          <Button size="sm" variant="outline" onClick={logout}>
            Log out
          </Button>
        ) : (
          <Button size="sm" onClick={login} disabled={!ready}>
            Log in
          </Button>
        )}
      </div>
    </div>
  );
}
