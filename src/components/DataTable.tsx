"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/LocaleContext";
import type { ChartDataPoint, ValueMode } from "@/types";

interface DataTableProps {
  data: ChartDataPoint[];
  indicators: { id: string; name: string; color: string }[];
  rightIndicators?: { id: string; name: string; color: string }[];
  valueMode: ValueMode;
}

const formatValue = (value: number | undefined | null, mode: ValueMode): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }
  if (mode === "percentage" || mode === "percentageChange" || mode === "yoyGrowth") {
    return `${value.toFixed(2)}%`;
  }
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export function DataTable({
  data,
  indicators,
  rightIndicators = [],
  valueMode,
}: DataTableProps) {
  const { t } = useLocale();
  const [page, setPage] = React.useState(0);
  const pageSize = 20;

  const allIndicators = React.useMemo(
    () => [...indicators, ...rightIndicators],
    [indicators, rightIndicators]
  );

  // Sort data by date descending (most recent first)
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => (b.date as string).localeCompare(a.date as string));
  }, [data]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pageData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  if (allIndicators.length === 0 || data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("dataTable")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                  {t("date")}
                </th>
                {allIndicators.map((ind) => (
                  <th
                    key={ind.id}
                    className="text-right py-2 px-3 font-medium text-muted-foreground"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: ind.color }}
                      />
                      {ind.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row) => (
                <tr key={row.date} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 px-3 font-mono text-xs">{row.date as string}</td>
                  {allIndicators.map((ind) => (
                    <td key={ind.id} className="text-right py-2 px-3 font-mono text-xs">
                      {formatValue(row[ind.id] as number | null | undefined, valueMode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
            <span>
              {t("showing")} {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sortedData.length)} {t("of")} {sortedData.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                {t("previous")}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
