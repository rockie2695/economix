"use client";

import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";

interface USDConvertToggleProps {
  enabled: boolean;
  onToggle: () => void;
  visible: boolean;
}

export function USDConvertToggle({
  enabled,
  onToggle,
  visible,
}: USDConvertToggleProps) {
  const { t } = useLocale();

  if (!visible) return null;

  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="gap-1.5 text-sm font-medium"
      title={t("convertToUSDDescription")}
    >
      <DollarSign className="h-4 w-4" />
      {t("convertToUSD")}
    </Button>
  );
}
