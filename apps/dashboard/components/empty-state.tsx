import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
        <Sparkles className="h-6 w-6 text-primary" />
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p>{message}</p>
      </CardContent>
    </Card>
  );
}
