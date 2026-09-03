"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ChartDataPoint } from "@/types";

interface ExportButtonProps {
  data: ChartDataPoint[];
  indicators: { id: string; name: string }[];
}

export function ExportButton({ data, indicators }: ExportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) return;

    const indicatorIds = indicators.map((i) => i.id);
    const headers = ["date", ...indicatorIds].join(",");
    const rows = data.map((row) =>
      [row.date, ...indicatorIds.map((id) => row[id] ?? "")].join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `economix-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={data.length === 0}
      className="h-8 w-8 p-0"
      title="Export CSV"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}
