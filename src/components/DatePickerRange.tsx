"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/LocaleContext";
import type { DateRange } from "@/types";

interface DatePickerRangeProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DatePickerRange({ value, onChange }: DatePickerRangeProps) {
  const { t } = useLocale();

  const handleChange = (range: DateRange) => {
    if (range.startDate > range.endDate) {
      onChange({ startDate: range.endDate, endDate: range.startDate });
    } else {
      onChange(range);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={value.startDate}
        onChange={(e) => handleChange({ ...value, startDate: e.target.value })}
        className="w-[160px]"
      />
      <span className="text-muted-foreground">{t("to")}</span>
      <Input
        type="date"
        value={value.endDate}
        onChange={(e) => handleChange({ ...value, endDate: e.target.value })}
        className="w-[160px]"
      />
      <div className="flex gap-1 ml-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            const start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            handleChange({
              startDate: start.toISOString().split("T")[0],
              endDate: now.toISOString().split("T")[0],
            });
          }}
        >
          1Y
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            const start = new Date();
            start.setFullYear(start.getFullYear() - 5);
            handleChange({
              startDate: start.toISOString().split("T")[0],
              endDate: now.toISOString().split("T")[0],
            });
          }}
        >
          5Y
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            const start = new Date();
            start.setFullYear(start.getFullYear() - 10);
            handleChange({
              startDate: start.toISOString().split("T")[0],
              endDate: now.toISOString().split("T")[0],
            });
          }}
        >
          10Y
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handleChange({
              startDate: "1960-01-01",
              endDate: new Date().toISOString().split("T")[0],
            });
          }}
        >
          {t("all")}
        </Button>
      </div>
    </div>
  );
}
