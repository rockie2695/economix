"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/LocaleContext";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { StatsData } from "@/types";

interface StatsCardsProps {
  stats: StatsData[];
  isLoading?: boolean;
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isPositive = stat.change > 0;
        const isNeutral = stat.change === 0;

        return (
          <Card key={stat.indicatorId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
<CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.indicatorName}
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    {t(stat.countryOrCategoryKey)}
                  </span>
                </CardTitle>
              <div
                className={`flex items-center gap-1 text-xs ${
                  isNeutral
                    ? "text-muted-foreground"
                    : isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isNeutral ? (
                  <Minus className="h-3 w-3" />
                ) : isPositive ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                <span>{Math.abs(stat.changePercent).toFixed(2)}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stat.currentValue)}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {stat.unit}
                </span>
              </div>
              <p
                className={`text-xs ${
                  isNeutral
                    ? "text-muted-foreground"
                    : isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatNumber(stat.change)} {t("fromPrevious")}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
