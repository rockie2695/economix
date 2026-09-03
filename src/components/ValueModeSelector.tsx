"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/LocaleContext";
import type { ValueMode } from "@/types";
import { cn } from "@/lib/utils";

interface ValueModeSelectorProps {
  value: ValueMode;
  onChange: (mode: ValueMode) => void;
}

export function ValueModeSelector({ value, onChange }: ValueModeSelectorProps) {
  const { t } = useLocale();

  const modes: { value: ValueMode; label: string }[] = [
    { value: "value", label: t("value") },
    { value: "valueChange", label: t("change") },
    { value: "percentage", label: t("percent") },
    { value: "percentageChange", label: t("percentChange") },
  ];

  return (
    <div className="flex rounded-lg border bg-muted p-1">
      {modes.map((mode) => (
        <Button
          key={mode.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(mode.value)}
          className={cn(
            "flex-1",
            value === mode.value && "bg-background shadow-sm text-foreground"
          )}
        >
          {mode.label}
        </Button>
      ))}
    </div>
  );
}
