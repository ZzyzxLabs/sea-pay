'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/container";

const faqs = [
  {
    question: "Is Seapay valid?",
    answer: "Yes!",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-20">
      <Container className="flex max-w-3xl flex-col gap-6 sm:gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            FAQ
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 px-5 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <AccordionTrigger className="py-4 text-left text-base font-semibold text-slate-900 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
