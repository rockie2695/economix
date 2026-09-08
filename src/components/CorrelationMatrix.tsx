"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/LocaleContext";
import { computeCorrelationMatrix, type CorrelationResult } from "@/lib/correlation";
import type { ChartDataPoint } from "@/types";

interface CorrelationMatrixProps {
  data: ChartDataPoint[];
  indicators: { id: string; name: string; color: string }[];
  rightIndicators?: { id: string; name: string; color: string }[];
}

const RELATIONSHIP_COLORS: Record<CorrelationResult["relationship"], string> = {
  strong_positive: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  moderate_positive: "bg-emerald-500/10 text-emerald-600/80 dark:text-emerald-400/80",
  weak_positive: "bg-emerald-500/5 text-emerald-600/60 dark:text-emerald-400/60",
  none: "bg-muted/50 text-muted-foreground",
  weak_negative: "bg-red-500/5 text-red-600/60 dark:text-red-400/60",
  moderate_negative: "bg-red-500/10 text-red-600/80 dark:text-red-400/80",
  strong_negative: "bg-red-500/20 text-red-600 dark:text-red-400",
};

const RELATIONSHIP_ICONS: Record<CorrelationResult["relationship"], string> = {
  strong_positive: "↗↗",
  moderate_positive: "↗",
  weak_positive: "→",
  none: "—",
  weak_negative: "↘",
  moderate_negative: "↘↘",
  strong_negative: "↘↘",
};

export function CorrelationMatrix({
  data,
  indicators,
  rightIndicators = [],
}: CorrelationMatrixProps) {
  const { t } = useLocale();

  const allIndicators = React.useMemo(() => {
    return [...indicators, ...rightIndicators];
  }, [indicators, rightIndicators]);

  const correlations = React.useMemo(() => {
    if (allIndicators.length < 2) return [];

    const dataMap: Record<string, (number | null | undefined)[]> = {};
    for (const indicator of allIndicators) {
      dataMap[indicator.id] = data.map((point) => point[indicator.id] as number | null | undefined);
    }

    return computeCorrelationMatrix(dataMap, allIndicators.map((i) => i.id));
  }, [data, allIndicators]);

  const indicatorNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const ind of allIndicators) {
      map.set(ind.id, ind.name);
    }
    return map;
  }, [allIndicators]);

  const getIndicatorName = (id: string) => {
    return indicatorNameMap.get(id) ?? id;
  };

  if (allIndicators.length < 2 || correlations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("correlationAnalysis")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500/20" />
              {t("strongPositive")} (r &gt; 0.7)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500/10" />
              {t("moderatePositive")} (0.4–0.7)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500/10" />
              {t("moderateNegative")} (-0.7–-0.4)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500/20" />
              {t("strongNegative")} (r &lt; -0.7)
            </span>
          </div>

          {/* Correlation pairs */}
          <div className="grid gap-2">
            {correlations.map((result) => (
              <div
                key={`${result.indicatorA}-${result.indicatorB}`}
                className={`flex items-center justify-between p-3 rounded-lg ${RELATIONSHIP_COLORS[result.relationship]}`}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{getIndicatorName(result.indicatorA)}</span>
                  <span className="text-muted-foreground">{t("vs")}</span>
                  <span className="font-medium">{getIndicatorName(result.indicatorB)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono font-semibold">
                    {result.coefficient >= 0 ? "+" : ""}
                    {result.coefficient.toFixed(3)}
                  </span>
                  <span className="text-lg" title={t(result.relationship)}>
                    {RELATIONSHIP_ICONS[result.relationship]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
