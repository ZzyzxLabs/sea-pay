import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/container";

const logos = ["Merchants", "SaaS", "Events", "Hotels", "E-commerce"];

export function SocialProof() {
  return (
    <section aria-labelledby="social-proof">
      <Container>
        <Card className="flex max-w-5xl flex-col items-center gap-4 border-sky-100 bg-white/80 px-6 py-5 shadow-sm shadow-sky-50 sm:flex-row sm:justify-between">
        <div className="space-y-2 text-center sm:text-left">
          <p id="social-proof" className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Trusted by builders
          </p>
          <p className="text-sm text-slate-600">
            Teams shipping onchain payments without changing their core stack.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {logos.map((logo) => (
            <Badge key={logo} variant="outline" className="border-slate-200 bg-white/70 text-slate-700">
              {logo}
            </Badge>
          ))}
        </div>
      </Card>
      </Container>
    </section>
  );
}

