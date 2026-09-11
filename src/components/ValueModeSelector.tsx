"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useLocale } from "@/lib/LocaleContext";
import type { ValueMode } from "@/types";
import { cn } from "@/lib/utils";

interface ValueModeSelectorProps {
  value: ValueMode;
  onChange: (mode: ValueMode) => void;
}

export function ValueModeSelector({ value, onChange }: ValueModeSelectorProps) {
  const { t } = useLocale();

  const modes: {
    value: ValueMode;
    label: string;
    description: string;
  }[] = [
    { value: "value", label: t("value"), description: t("valueDescription") },
    {
      value: "valueChange",
      label: t("change"),
      description: t("changeDescription"),
    },
    {
      value: "percentage",
      label: t("percent"),
      description: t("percentDescription"),
    },
    {
      value: "percentageChange",
      label: t("percentChange"),
      description: t("percentChangeDescription"),
    },
    {
      value: "yoyGrowth",
      label: t("yoyGrowth"),
      description: t("yoyGrowthDescription"),
    },
  ];

  return (
    <div className="flex rounded-lg border bg-muted p-1">
      {modes.map((mode) => (
        <Tooltip key={mode.value}>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(mode.value)}
                className={cn(
                  "flex-1",
                  value === mode.value &&
                    "bg-background shadow-sm text-foreground"
                )}
              >
                {mode.label}
              </Button>
            }
          />
          <TooltipContent side="bottom">{mode.description}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
