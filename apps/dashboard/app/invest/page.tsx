"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { useInvest } from "@/hooks/use-invest";
import { formatPercent, formatUsd } from "@/lib/format";

export default function InvestPage() {
  const { state, buy, sell } = useInvest();
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState("0.1");

  const portfolioValue = state.positions.reduce((sum, position) => {
    const asset = state.assets.find((item) => item.symbol === position.symbol);
    return sum + (asset?.price ?? 0) * position.quantity;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Tokenized Stocks</h2>
          <p className="text-sm text-muted-foreground">
            Explore beta tokenized equities.
          </p>
        </div>
        <Badge variant="secondary">Simulated • Beta</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Portfolio value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">{formatUsd(portfolioValue)}</p>
            <p className="text-xs text-muted-foreground">
              Local positions, simulated fills
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.positions.map((position) => {
              const asset = state.assets.find((item) => item.symbol === position.symbol);
              const value = (asset?.price ?? 0) * position.quantity;
              const allocation = portfolioValue ? (value / portfolioValue) * 100 : 0;
              return (
                <div key={position.symbol} className="flex items-center justify-between text-sm">
                  <span>{position.symbol}</span>
                  <span className="text-muted-foreground">{formatPercent(allocation)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.positions.map((position) => {
            const asset = state.assets.find((item) => item.symbol === position.symbol);
            const currentValue = (asset?.price ?? 0) * position.quantity;
            const costValue = position.averageCost * position.quantity;
            const pnl = currentValue - costValue;
            return (
              <div
                key={position.symbol}
                className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{position.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    {position.quantity.toFixed(2)} shares
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatUsd(currentValue)}</p>
                  <p
                    className={
                      pnl >= 0
                        ? "text-xs text-emerald-500"
                        : "text-xs text-rose-500"
                    }
                  >
                    {pnl >= 0 ? "+" : ""}
                    {formatUsd(pnl)}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-sm text-muted-foreground">
            Market watch
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={selectedSymbol}
              onChange={(event) => setSelectedSymbol(event.target.value.toUpperCase())}
              className="w-20"
            />
            <Input
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              className="w-24"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">Trade</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm trade</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Trade {Number(quantity) || 0} {selectedSymbol}?
                  </p>
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button
                        onClick={() => buy(selectedSymbol, Number(quantity) || 0)}
                      >
                        Buy
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        onClick={() => sell(selectedSymbol, Number(quantity) || 0)}
                      >
                        Sell
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.assets.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground">{asset.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatUsd(asset.price)}</p>
                <p
                  className={
                    asset.change >= 0
                      ? "text-xs text-emerald-500"
                      : "text-xs text-rose-500"
                  }
                >
                  {asset.change >= 0 ? "+" : ""}
                  {asset.change.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
