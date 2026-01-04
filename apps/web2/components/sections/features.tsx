'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ActivitySquare,
  BarChart3,
  Globe2,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { Container } from "@/components/container";
import { SectionHeading } from "./section-heading";

const featureCards = [
  {
    title: "Payment links & QR",
    description: "Share a hosted checkout or print QR for POS in seconds with branding controls.",
    icon: QrCode,
  },
  {
    title: "Webhooks that stick",
    description: "Signed payloads with retries, versioning, and clear event types for your backend.",
    icon: Webhook,
  },
  {
    title: "Refunds built-in",
    description: "One-click or API-driven refunds with audit trails and optional approval rules.",
    icon: RefreshCcw,
  },
  {
    title: "Multi-chain stablecoins",
    description: "USDC, USDT across Base, Arbitrum, and Polygon with circuit-breaker controls.",
    icon: Globe2,
  },
  {
    title: "Analytics you trust",
    description: "Revenue, authorization, and settlement dashboards with export-ready views.",
    icon: BarChart3,
  },
  {
    title: "Payouts to bank or crypto",
    description: "Move stablecoin to bank or onchain wallets with approval workflows and limits.",
    icon: ActivitySquare,
  },
];

const tabs = [
  {
    value: "checkout",
    label: "Checkout",
    badge: "Most used",
    title: "Hosted checkout that feels native",
    body: "Embed or link a PCI-light experience with network-aware fees, address validation, and payment request expiration.",
    highlights: ["Dynamic fees per chain", "Smart expiration", "Email + wallet receipts"],
  },
  {
    value: "payouts",
    label: "Payouts",
    badge: "Ops-friendly",
    title: "Operator-friendly payouts",
    body: "Schedule stablecoin payouts, route to wallets or bank accounts, and require dual approval for larger transfers.",
    highlights: ["Dual approval", "ACH + onchain", "Role-based actions"],
  },
  {
    value: "monitoring",
    label: "Monitoring",
    badge: "Reliability",
    title: "Live observability",
    body: "Receive alerts for stuck transactions, webhook retries, and SLA thresholds with Slack + email targets.",
    highlights: ["Slack & email", "Replay webhooks", "Latency metrics"],
  },
];

export function Features() {
  return (
    <section id="product" className="scroll-mt-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Product"
          title="Everything you need to run stablecoin payments"
          description="Move faster with hosted experiences, predictable settlement, and controls your finance team will trust."
        />

        <Tabs defaultValue="checkout" className="w-full">
          <div className="flex flex-col gap-6 rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-sm shadow-sky-50 lg:flex-row lg:items-start lg:gap-10">
            <TabsList className="grid w-full grid-cols-3 bg-sky-50/70 text-slate-700 lg:w-[280px] lg:flex lg:flex-col">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.label}</span>
                    <Badge variant="outline" className="border-sky-200 text-[11px] font-semibold text-sky-700">
                      {tab.badge}
                    </Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex-1">
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">{tab.label}</p>
                    <h3 className="text-2xl font-semibold text-slate-900">{tab.title}</h3>
                    <p className="text-base text-slate-600">{tab.body}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {tab.highlights.map((item) => (
                        <Badge key={item} variant="secondary" className="bg-sky-100 text-sky-800">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="glass border-slate-200/70">
              <CardHeader className="space-y-3 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">{description}</CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

