import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/container";
import { SectionHeading } from "./section-heading";

export function FinalCTA() {
  return (
    <section id="cta" className="scroll-mt-24">
      <Container>
        <Card className="mx-auto max-w-4xl border-slate-200/70 bg-white/80 glass">
        <CardContent className="space-y-8 px-6 py-10 sm:px-10">
          <div className="flex items-center justify-between gap-4">
            <SectionHeading
              eyebrow="Get started"
              title="Start accepting stablecoin payments today"
              description="Spin up your first payment link and receive settlement in minutes."
            />
            <Badge variant="secondary" className="hidden sm:inline-flex bg-sky-50 text-sky-800">
              Under 10 minute setup
            </Badge>
          </div>

          <form className="grid gap-3 sm:grid-cols-[1.2fr_auto]">
            <Input
              type="email"
              placeholder="Work email"
              aria-label="Work email"
              className="h-12 border-slate-200/80 bg-white/80"
              required
            />
            <div className="flex gap-3 sm:flex-row">
              <Button type="submit" className="h-12 w-full shadow-sm shadow-sky-100">
                Get started
              </Button>
              <Button variant="outline" className="h-12 w-full border-slate-200" asChild>
                <a href="mailto:sales@seapay.finance">Talk to sales</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </Container>
    </section>
  );
}

