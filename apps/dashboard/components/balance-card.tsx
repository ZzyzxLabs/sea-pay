import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/format";

interface BalanceCardProps {
  title: string;
  balance: number;
  subtitle?: string;
  badge?: string;
  delta?: string;
}

export default function BalanceCard({
  title,
  balance,
  subtitle,
  badge,
  delta,
}: BalanceCardProps) {
  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </div>
        {badge && <Badge variant="secondary">{badge}</Badge>}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold">{formatUsd(balance)}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {subtitle && <span>{subtitle}</span>}
          {delta && <span className="text-emerald-500">{delta}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
