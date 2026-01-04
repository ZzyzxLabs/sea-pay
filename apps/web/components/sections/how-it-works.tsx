import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/container";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    title: "Create an invoice or payment link",
    description: "Define amount, currency, expiration, and allowed networks. Share as a link or QR.",
  },
  {
    title: "Customer pays in stablecoins",
    description: "We validate address formats, fees, and confirmations so you can skip network edge cases.",
  },
  {
    title: "You receive settlement + webhook",
    description: "Get signed webhooks, reconciliation-ready metadata, and payout routing of your choice.",
  },
];

const webhookSample = `{
  "event": "payment.confirmed",
  "payment_id": "pay_8a1fc4",
  "amount": "250.00",
  "currency": "USDC",
  "network": "base",
  "customer": {
    "email": "samir@northwind.co",
    "wallet": "0x8a9c...42bf"
  },
  "metadata": {
    "invoice": "INV-2048",
    "channel": "qr-pos"
  },
  "delivered_at": "2024-11-05T12:45:10.120Z",
  "signature": "0x94f8a3...c2d"
}`;

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="How it works"
          title="Launch stablecoin payments in three steps"
          description="Keep your stack lean with hosted flows, predictable webhooks, and operations guardrails."
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => (
              <Card key={step.title} className="glass border-slate-200/70">
                <CardContent className="space-y-3 p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sm font-semibold text-sky-700 ring-1 ring-sky-100">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass border-slate-200/70">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Webhook sample</p>
                  <p className="text-sm text-slate-600">Signed JSON payload you can trust.</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  99.99% uptime
                </span>
              </div>
              <Separator className="bg-slate-200/80" />
              <pre className="max-h-[340px] overflow-auto rounded-xl border border-slate-200 bg-slate-900/90 p-4 text-[13px] leading-6 text-slate-50 shadow-inner shadow-slate-900/20">
{webhookSample}
              </pre>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}

