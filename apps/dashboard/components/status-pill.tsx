import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StatusPill({
  label,
  status,
}: {
  label: string;
  status: "ok" | "degraded";
}) {
  const Icon = status === "ok" ? CheckCircle2 : AlertTriangle;
  return (
    <Badge
      variant={status === "ok" ? "secondary" : "outline"}
      className={status === "ok" ? "text-emerald-600" : "text-amber-600"}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
