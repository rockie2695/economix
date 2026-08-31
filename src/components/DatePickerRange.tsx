"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DateRange } from "@/types";

interface DatePickerRangeProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DatePickerRange({ value, onChange }: DatePickerRangeProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={value.startDate}
        onChange={(e) =>
          onChange({ ...value, startDate: e.target.value })
        }
        className="w-[160px]"
      />
      <span className="text-muted-foreground">to</span>
      <Input
        type="date"
        value={value.endDate}
        onChange={(e) =>
          onChange({ ...value, endDate: e.target.value })
        }
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
            onChange({
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
            onChange({
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
            onChange({
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
            onChange({
              startDate: "2000-01-01",
              endDate: new Date().toISOString().split("T")[0],
            });
          }}
        >
          All
        </Button>
      </div>
    </div>
  );
}
