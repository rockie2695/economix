"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/LocaleContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLocale(locale === "en" ? "zh-TW" : "en")}
      className="text-sm font-medium"
    >
      {locale === "en" ? "繁中" : "EN"}
    </Button>
  );
}
