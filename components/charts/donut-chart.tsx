"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface DonutChartSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutChartSegment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  segments,
  size = 160,
  strokeWidth = 24,
  className,
  showLegend = true,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = useMemo(
    () => segments.reduce((sum, segment) => sum + segment.value, 0),
    [segments]
  );

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate segment positions
  const segmentData = useMemo(() => {
    let currentOffset = 0;
    return segments.map((segment) => {
      const percentage = total > 0 ? segment.value / total : 0;
      const length = circumference * percentage;
      const offset = currentOffset;
      currentOffset += length;
      return {
        ...segment,
        percentage,
        length,
        offset,
      };
    });
  }, [segments, total, circumference]);

  if (total === 0) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          {(centerLabel || centerValue !== undefined) && (
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400 text-sm"
            >
              No data
            </text>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-800"
          />

          {/* Segments */}
          {segmentData.map((segment, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.length} ${circumference - segment.length}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
              className="transition-all duration-300"
            />
          ))}
        </svg>

        {/* Center text */}
        {(centerLabel || centerValue !== undefined) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue !== undefined && (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {segmentData.map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {segment.label}
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {segment.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
