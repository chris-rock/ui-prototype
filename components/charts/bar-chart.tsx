"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  items: BarChartItem[];
  className?: string;
  maxValue?: number;
  showValues?: boolean;
  horizontal?: boolean;
  height?: number;
}

export function BarChart({
  items,
  className,
  maxValue: providedMax,
  showValues = true,
  horizontal = true,
  height = 24,
}: BarChartProps) {
  const maxValue = useMemo(
    () => providedMax ?? Math.max(...items.map((item) => item.value), 1),
    [items, providedMax]
  );

  if (horizontal) {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                {showValues && (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div
                className="overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                style={{ height }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || "var(--color-primary)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bar chart
  const barWidth = 100 / items.length;

  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height: 200 }}>
      {items.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div
            key={index}
            className="flex flex-1 flex-col items-center gap-2"
            style={{ maxWidth: `${barWidth}%` }}
          >
            <div className="relative w-full flex-1">
              <div
                className="absolute bottom-0 w-full rounded-t transition-all duration-500"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: item.color || "var(--color-primary)",
                }}
              />
            </div>
            {showValues && (
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {item.value}
              </span>
            )}
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
