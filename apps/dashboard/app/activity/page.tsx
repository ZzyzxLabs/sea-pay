"use client";

import ActivityFeed from "@/components/activity-feed";
import StatusPill from "@/components/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/hooks/use-activity";
import { useChain } from "@/hooks/use-chain";
import { usePrivyAddress } from "@/hooks/use-privy-address";
import { formatDateTime } from "@/lib/format";

export default function ActivityPage() {
  const address = usePrivyAddress();
  const { chainKey } = useChain();
  const { items, lastUpdated, status, refresh } = useActivity(address, chainKey);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Activity</h2>
          <p className="text-sm text-muted-foreground">
            Simulated + onchain events in one feed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            label={status === "ok" ? "RPC healthy" : "RPC degraded"}
            status={status}
          />
          <Badge variant="outline" className="text-xs">
            {lastUpdated ? `Updated ${formatDateTime(lastUpdated)}` : "Loading"}
          </Badge>
          <Button size="sm" variant="outline" onClick={refresh}>
            Retry
          </Button>
        </div>
      </div>

      <ActivityFeed items={items} />
    </div>
  );
}
