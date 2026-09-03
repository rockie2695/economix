"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/LocaleContext";
import type { Indicator } from "@/types";

interface IndicatorSelectorProps {
  indicators: Indicator[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loadingIds?: Set<string>;
  errors?: Map<string, string>;
}

interface GroupedIndicators {
  type: "country" | "global";
  typeLabel: string;
  groups: { label: string; items: Indicator[] }[];
}

function groupIndicators(
  indicators: Indicator[],
  t: (key: string) => string
): GroupedIndicators[] {
  const countryIndicators = indicators.filter(
    (i) => i.categoryType === "country"
  );
  const globalIndicators = indicators.filter(
    (i) => i.categoryType === "global"
  );

  const countryMap = new Map<string, Indicator[]>();
  for (const ind of countryIndicators) {
    const key = ind.country ?? "Other";
    const arr = countryMap.get(key) ?? [];
    arr.push(ind);
    countryMap.set(key, arr);
  }

  const countryOrder = [
    "US", "EuroArea", "Japan", "China", "UK",
    "India", "Brazil", "SouthKorea", "Canada", "Australia",
  ];
  const countryGroups = countryOrder
    .filter((c) => countryMap.has(c))
    .map((c) => ({
      label: t(`country_${c}`),
      items: countryMap.get(c)!,
    }));

  const globalMap = new Map<string, Indicator[]>();
  for (const ind of globalIndicators) {
    const arr = globalMap.get(ind.category) ?? [];
    arr.push(ind);
    globalMap.set(ind.category, arr);
  }

  const globalGroups = Array.from(globalMap.entries()).map(([cat, items]) => ({
    label: t(cat),
    items,
  }));

  return [
    { type: "country", typeLabel: t("countrySpecific"), groups: countryGroups },
    { type: "global", typeLabel: t("global"), groups: globalGroups },
  ];
}

export function IndicatorSelector({
  indicators,
  selectedIds,
  onSelectionChange,
  loadingIds = new Set(),
  errors = new Map(),
}: IndicatorSelectorProps) {
  const { t } = useLocale();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = indicators.filter(
    (ind) =>
      ind.name.toLowerCase().includes(search.toLowerCase()) ||
      ind.category.toLowerCase().includes(search.toLowerCase()) ||
      (ind.description &&
        ind.description.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = groupIndicators(filtered, t);

  const selectedIndicators = indicators.filter((i) =>
    selectedIds.includes(i.id)
  );

  const toggleIndicator = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const removeIndicator = (id: string) => {
    onSelectionChange(selectedIds.filter((i) => i !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <div
          className="flex items-center justify-between h-auto min-h-[40px] py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted cursor-pointer"
          role="combobox"
          aria-expanded={open}
        >
          <div className="flex flex-wrap gap-1">
            {selectedIndicators.length === 0 ? (
              <span className="text-muted-foreground">
                {t("selectIndicators")}
              </span>
            ) : (
              selectedIndicators.map((ind) => (
                <Badge
                  key={ind.id}
                  variant="secondary"
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeIndicator(ind.id);
                  }}
                >
                  {ind.name}
                  <X className="ml-1 h-3 w-3 cursor-pointer" />
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="border-b p-2">
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={t("searchIndicators")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t("noIndicatorsFound")}
            </div>
          ) : (
            grouped.map((section) => {
              if (section.groups.length === 0) return null;
              return (
                <div key={section.type}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.typeLabel}
                  </div>
                  {section.groups.map((group) => (
                    <div key={group.label}>
                      <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                        {group.label}
                      </div>
                      {group.items.map((indicator) => {
                        const isLoading = loadingIds.has(indicator.id);
                        const errorMsg = errors.get(indicator.id);
                        return (
                          <div
                            key={indicator.id}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm pl-4",
                              "hover:bg-accent hover:text-accent-foreground",
                              "outline-none",
                              selectedIds.includes(indicator.id) && "bg-accent"
                            )}
                            onClick={() => toggleIndicator(indicator.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedIds.includes(indicator.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate flex items-center gap-1">
                                {indicator.name}
                                {isLoading && (
                                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                )}
                                {errorMsg && (
                                  <span
                                    className="text-red-500 cursor-help"
                                    title={errorMsg}
                                  >
                                    <AlertCircle className="h-3 w-3 inline" />
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {t(indicator.category)} · {indicator.unit}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="ml-2 shrink-0 text-[10px]"
                            >
                              {indicator.source.toUpperCase()}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
