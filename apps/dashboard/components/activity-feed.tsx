import { ArrowDownLeft, ArrowUpRight, CreditCard, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd, formatDateTime } from "@/lib/format";
import { ActivityItem } from "@/services/mock/activity";

const iconMap = {
  earn: ArrowUpRight,
  card: CreditCard,
  invest: Sparkles,
  onchain: ArrowDownLeft,
};

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nothing here yet. Try a simulated action to get started.
          </div>
        ) : (
          items.map((item) => {
            const Icon = iconMap[item.source];
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatUsd(item.amount)}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {item.source === "onchain" ? "Onchain" : "Simulated"}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
