"use client";

import { useState } from "react";
import { CreditCard, Plus, ShoppingBag, Utensils } from "lucide-react";
import Stepper from "@/components/stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCard } from "@/hooks/use-card";
import { formatDateTime, formatUsd } from "@/lib/format";

const steps = ["Apply", "Verify", "Shipping", "Activate"];

export default function CardPage() {
  const { state, advance, spend } = useCard();
  const [amount, setAmount] = useState("12.5");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Stablecoin Card</h2>
          <p className="text-sm text-muted-foreground">
            Get a card, track your campus spending.
          </p>
        </div>
        <Badge variant="secondary">Simulated</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              Card onboarding
            </CardTitle>
            <Button size="sm" variant="outline" onClick={advance}>
              Next step
            </Button>
          </CardHeader>
          <CardContent>
            <Stepper steps={steps} currentStep={state.step} />
            <p className="mt-4 text-xs text-muted-foreground">
              You are on step {state.step + 1} of {steps.length}
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Spending snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">
              {formatUsd(state.spent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly limit {formatUsd(state.limit)}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => spend(6.8, "Night Market", "Food")}
              >
                <Utensils className="h-4 w-4" />
                Food
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => spend(18.4, "Bookstore", "Campus")}
              >
                <ShoppingBag className="h-4 w-4" />
                Campus
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">
            Simulated spending
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="0"
              step="0.1"
              className="w-24"
            />
            <Button
              size="sm"
              onClick={() => spend(Number(amount) || 0, "Study Snacks", "Food")}
            >
              <Plus className="h-4 w-4" />
              Add spend
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{txn.merchant}</p>
                <p className="text-xs text-muted-foreground">
                  {txn.category} · {formatDateTime(txn.timestamp)}
                </p>
              </div>
              <p className="font-semibold">-{formatUsd(txn.amount)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
