"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, PiggyBank } from "lucide-react";
import BalanceCard from "@/components/balance-card";
import ChartSpark from "@/components/chart-spark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEarn } from "@/hooks/use-earn";
import { formatPercent, formatUsd } from "@/lib/format";

export default function EarnPage() {
  const { state, deposit, withdraw } = useEarn();
  const [depositAmount, setDepositAmount] = useState("50");
  const [withdrawAmount, setWithdrawAmount] = useState("20");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Earn</h2>
          <p className="text-sm text-muted-foreground">
            Savings with daily simulated yield.
          </p>
        </div>
        <Badge variant="secondary">Simulated</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BalanceCard
          title="Savings balance"
          balance={state.balance}
          subtitle={`${formatPercent(state.apy)} APY`}
          badge="Simulated"
          delta={`+${formatUsd(state.earned)} earned`}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <PiggyBank className="h-4 w-4 text-primary" />
              Growth curve
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold">{formatUsd(state.balance)}</p>
              <p className="text-xs text-muted-foreground">
                Simulated hourly accrual
              </p>
            </div>
            <ChartSpark points={state.points} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Deposit to savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <ArrowUpRight className="h-4 w-4" />
                  Deposit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm deposit</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Add {formatUsd(Number(depositAmount) || 0)} to your savings?
                </p>
                <DialogClose asChild>
                  <Button onClick={() => deposit(Number(depositAmount) || 0)}>
                    Yes, deposit
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Withdraw anytime
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <ArrowDownRight className="h-4 w-4" />
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm withdrawal</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Withdraw {formatUsd(Number(withdrawAmount) || 0)} from savings?
                </p>
                <DialogClose asChild>
                  <Button onClick={() => withdraw(Number(withdrawAmount) || 0)}>
                    Yes, withdraw
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
