"use client";

import { ArrowRight, CreditCard, Sparkles, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import BalanceCard from "@/components/balance-card";
import ModuleCard from "@/components/module-card";
import SkeletonCard from "@/components/skeleton-card";
import StatusPill from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBalances } from "@/hooks/use-balances";
import { useEarn } from "@/hooks/use-earn";
import { useInvest } from "@/hooks/use-invest";
import { useCard } from "@/hooks/use-card";
import { useChain } from "@/hooks/use-chain";
import { usePrivyAddress } from "@/hooks/use-privy-address";
import { formatUsd, formatDateTime } from "@/lib/format";

export default function OverviewPage() {
  const address = usePrivyAddress();
  const { chainKey } = useChain();
  const { state: earnState } = useEarn();
  const { state: investState } = useInvest();
  const { state: cardState } = useCard();
  const balances = useBalances(address, chainKey);

  const totalBalance =
    earnState.balance +
    investState.positions.reduce((sum, position) => {
      const asset = investState.assets.find((item) => item.symbol === position.symbol);
      return sum + (asset?.price ?? 0) * position.quantity;
    }, 0) +
    balances.usdc;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">
            All your money views in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            label={balances.status === "ok" ? "RPC healthy" : "RPC degraded"}
            status={balances.status}
          />
          <Badge variant="outline" className="text-xs">
            {balances.lastUpdated
              ? `Updated ${formatDateTime(balances.lastUpdated)}`
              : "Fetching balances"}
          </Badge>
          <Button size="sm" variant="outline" onClick={balances.refresh}>
            Retry
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {balances.loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <BalanceCard
              title="Total balance"
              balance={totalBalance}
              subtitle="Across your money buckets"
            />
            <BalanceCard
              title="Savings"
              balance={earnState.balance}
              subtitle={`APY ${earnState.apy.toFixed(2)}%`}
              badge="Simulated"
              delta={`+${formatUsd(earnState.earned)} earned`}
            />
            <BalanceCard
              title="USDC wallet"
              balance={balances.usdc}
              subtitle={address ? "Base wallet balance" : "Connect wallet to view"}
              badge={address ? "Onchain" : "Mock mode"}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ModuleCard
          title="Earn"
          description="Daily accrual and easy deposits."
          href="/earn"
          icon={<Wallet className="h-4 w-4" />}
        />
        <ModuleCard
          title="Stablecoin Card"
          description="Spend like a student, track every swipe."
          href="/card"
          icon={<CreditCard className="h-4 w-4" />}
          tone="secondary"
        />
        <ModuleCard
          title="Tokenized Stocks"
          description="Own slices of your favorite companies."
          href="/invest"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Quick actions
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/earn">Add to savings</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/card">Get your card</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/invest">Invest</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              This week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Card spending</span>
              <span className="font-semibold">{formatUsd(cardState.spent)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Invested</span>
              <span className="font-semibold">
                {formatUsd(
                  investState.positions.reduce((sum, position) => {
                    const asset = investState.assets.find(
                      (item) => item.symbol === position.symbol
                    );
                    return sum + (asset?.price ?? 0) * position.quantity;
                  }, 0)
                )}
              </span>
            </div>
            <Button variant="link" className="px-0" asChild>
              <Link href="/activity" className="flex items-center gap-1 text-sm">
                See full activity <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
