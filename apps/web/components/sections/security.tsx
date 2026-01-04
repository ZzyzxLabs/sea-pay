import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldHalf, SignalHigh, Workflow } from "lucide-react";
import { Container } from "@/components/container";
import { SectionHeading } from "./section-heading";

const items = [
  {
    title: "Compliance-ready",
    description: "Risk rules, travel rule fields, and configurable KYC flows for higher limits.",
    icon: Workflow,
  },
  {
    title: "Encryption by default",
    description: "Keys and secrets encrypted at rest and in transit with scoped access policies.",
    icon: ShieldHalf,
  },
  {
    title: "Access controls",
    description: "Role-based permissions, SSO/SAML support, and approval flows for sensitive actions.",
    icon: ShieldCheck,
  },
  {
    title: "Reliability",
    description: "Multi-region monitoring, synthetic tests, and alerting on webhook latency and retries.",
    icon: SignalHigh,
  },
];

export function Security() {
  return (
    <section id="security" className="scroll-mt-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Security"
          title="Non-custodial by design with operational controls"
          description="Built to earn trust with your finance, security, and compliance teams."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {items.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="glass border-slate-200/70">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  Always on
                </Badge>
              </CardHeader>
              <CardContent className="text-slate-600">{description}</CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

