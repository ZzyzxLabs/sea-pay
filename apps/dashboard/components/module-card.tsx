import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  tone?: "primary" | "secondary";
}

export default function ModuleCard({
  title,
  description,
  href,
  icon,
  badge = "Simulated",
  tone = "primary",
}: ModuleCardProps) {
  return (
    <Link href={href} className="group">
      <Card
        className={cn(
          "h-full transition hover:-translate-y-1 hover:shadow-lg",
          tone === "secondary" ? "border-secondary/40" : "border-primary/20"
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {icon}
            </span>
            {title}
          </CardTitle>
          <Badge variant="secondary">{badge}</Badge>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>{description}</p>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
        </CardContent>
      </Card>
    </Link>
  );
}
