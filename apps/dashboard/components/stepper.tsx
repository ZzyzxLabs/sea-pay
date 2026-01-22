import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        const Icon = isComplete ? CheckCircle2 : Circle;
        return (
          <div key={step} className="flex items-center gap-3 text-sm">
            <Icon
              className={cn(
                "h-4 w-4",
                isComplete
                  ? "text-emerald-500"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                isActive ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
