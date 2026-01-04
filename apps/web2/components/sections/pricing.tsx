import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import { Container } from "@/components/container";
import { SectionHeading } from "./section-heading";

type Tier = {
  name: string;
  price: string;
  subtext: string;
  highlight?: boolean;
  features: string[];
  cta: string;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "0.5% + network fees",
    subtext: "For teams piloting stablecoin payments.",
    features: [
      "Hosted checkout links",
      "USDC on Base & Arbitrum",
      "Webhook retries + signing",
      "Dashboard exports",
    ],
    cta: "Start free",
  },
  {
    name: "Growth",
    price: "0.35% + network fees",
    subtext: "Scale volumes with better economics.",
    highlight: true,
    features: [
      "Custom domains + theming",
      "QR POS mode with tipping",
      "Payouts to bank or crypto",
      "Slack & email alerts",
      "Priority support",
    ],
    cta: "Talk to us",
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtext: "Controls and uptime for regulated teams.",
    features: [
      "SAML/SSO + RBAC",
      "DLP + audit exports",
      "Dedicated region + SLOs",
      "Onboarding & compliance support",
    ],
    cta: "Book a review",
  },
];

export function Pricing() {
  return (
    <section id='pricing' className='scroll-mt-24'>
      <Container className='flex flex-col gap-10'>
        <SectionHeading
          eyebrow='Pricing'
          title='Simple fees that stay predictable'
          description='Keep more of every transaction with transparent pricing and clear settlement.'
        />

        <div className='grid gap-6 md:grid-cols-3'>
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex h-full flex-col border-slate-200/70 ${
                tier.highlight
                  ? "glass shadow-lg shadow-sky-100"
                  : "bg-white/90"
              }`}
            >
              <CardHeader className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-xl text-slate-900'>
                    {tier.name}
                  </CardTitle>
                  {tier.highlight ? (
                    <Badge className='bg-sky-600 text-white hover:bg-sky-600'>
                      Most popular
                    </Badge>
                  ) : null}
                </div>
                <p className='text-2xl font-semibold text-slate-900'>
                  {tier.price}
                </p>
                <p className='text-sm text-slate-600'>{tier.subtext}</p>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Separator className='bg-slate-200/80' />
                <ul className='space-y-2 text-sm text-slate-700'>
                  {tier.features.map((feature) => (
                    <li key={feature} className='flex items-start gap-2'>
                      <Check className='mt-[2px] h-4 w-4 text-emerald-600' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className='mt-auto'>
                <Button
                  className='w-full'
                  variant={tier.highlight ? "default" : "outline"}
                  asChild
                >
                  <a href='#cta'>{tier.cta}</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
