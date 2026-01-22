"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ChevronDown, ShieldCheck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBalances } from "@/hooks/use-balances";
import { useChain } from "@/hooks/use-chain";
import { usePrivyAddress } from "@/hooks/use-privy-address";
import { CHAIN_CONFIGS } from "@/services/evm/chains";
import { formatDateTime, formatShortAddress } from "@/lib/format";

export default function SettingsPage() {
  const { ready, authenticated, login, logout } = usePrivy();
  const address = usePrivyAddress();
  const { chainKey, updateChain } = useChain();
  const balances = useBalances(address, chainKey);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Profile, wallet, and advanced blockchain settings.
          </p>
        </div>
        <Badge variant="outline">Student-friendly defaults</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Status</span>
            <Badge variant="secondary">
              {authenticated ? "Wallet ready" : "Mock mode"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Address</span>
            <span className="font-mono text-xs text-muted-foreground">
              {address ? formatShortAddress(address) : "Not connected"}
            </span>
          </div>
          {authenticated ? (
            <Button variant="outline" onClick={logout}>
              Log out
            </Button>
          ) : (
            <Button onClick={login} disabled={!ready}>
              Log in with Privy
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Advanced
          </CardTitle>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Chain</span>
            <select
              value={chainKey}
              onChange={(event) => updateChain(event.target.value)}
              className="rounded-lg border px-2 py-1 text-xs"
            >
              {CHAIN_CONFIGS.map((chain) => (
                <option key={chain.key} value={chain.key}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Wallet address</span>
            <span className="font-mono text-xs text-muted-foreground">
              {address ? formatShortAddress(address) : "Not connected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>RPC status</span>
            <Badge variant={balances.status === "ok" ? "secondary" : "outline"}>
              {balances.status === "ok" ? "Healthy" : "Degraded"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Last updated</span>
            <span className="text-xs text-muted-foreground">
              {balances.lastUpdated ? formatDateTime(balances.lastUpdated) : "—"}
            </span>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Blockchain details are hidden by default. This panel is best-effort
            and read-only on free RPCs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
