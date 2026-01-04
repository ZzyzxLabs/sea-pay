'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/container";
import { SectionHeading } from "./section-heading";

const faqs = [
  {
    question: "Which stablecoins and networks do you support?",
    answer: "USDC and USDT on Base, Arbitrum, and Polygon. Additional chains are available for enterprise accounts after network qualification.",
  },
  {
    question: "How do chargebacks work with stablecoins?",
    answer: "Stablecoin payments are final onchain. We provide refund tooling with approvals and audit logs so you can replicate a chargeback-like experience for your customers when needed.",
  },
  {
    question: "Can I issue refunds?",
    answer: "Yes. Refund via dashboard or API, optionally enforcing dual approval and reason codes. Webhooks notify your backend when funds leave.",
  },
  {
    question: "How fast is settlement?",
    answer: "Payments confirm in seconds. We stream status via webhooks and mark funds as available after finality per network (typically under 1 minute).",
  },
  {
    question: "How hard is the integration?",
    answer: "Most teams ship in a day using hosted links. Use API + webhooks for deeper integrations and reconciliation. We provide examples for Next.js, Node, and Python.",
  },
  {
    question: "Which wallets do you support?",
    answer: "Customers can pay from any EVM-compatible wallet. We render clear prompts for network selection and address checks to avoid mis-sends.",
  },
  {
    question: "Do you support POS or QR payments?",
    answer: "Yes. Generate QR codes for in-person checkout with tipping support and cashier notes. Payments land in the same ledger as online sales.",
  },
  {
    question: "Is pricing flexible at scale?",
    answer: "Yes. Volume-based pricing and dedicated support are available on the Growth and Enterprise plans.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24">
      <Container className="flex max-w-4xl flex-col gap-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Answers to common questions"
          description="Everything you need to know before you start accepting stablecoin payments."
          align="center"
        />

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 px-4"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-slate-600">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

