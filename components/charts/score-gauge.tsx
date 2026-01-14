"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type ScoreGrade = "A" | "B" | "C" | "D" | "F" | "U";

export interface ScoreGaugeProps {
  score: number;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

function getGrade(score: number): { grade: ScoreGrade; label: string; color: string } {
  if (score >= 80) return { grade: "A", label: "Excellent", color: "var(--color-success)" };
  if (score >= 60) return { grade: "B", label: "Good", color: "var(--color-low)" };
  if (score >= 40) return { grade: "C", label: "Fair", color: "var(--color-medium)" };
  if (score >= 20) return { grade: "D", label: "Poor", color: "var(--color-high)" };
  if (score >= 0) return { grade: "F", label: "Critical", color: "var(--color-critical)" };
  return { grade: "U", label: "Unknown", color: "var(--color-unknown)" };
}

export function ScoreGauge({
  score,
  size = 120,
  className,
  showLabel = true,
}: ScoreGaugeProps) {
  const { grade, label, color } = useMemo(() => getGrade(score), [score]);

  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const center = size / 2;
  const percentage = Math.max(0, Math.min(100, score)) / 100;
  const strokeLength = circumference * percentage;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Score arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${strokeLength} ${circumference}`}
          className="transition-all duration-700"
        />
      </svg>

      {/* Score display */}
      <div className="relative -mt-10 flex flex-col items-center">
        <span
          className="text-4xl font-bold"
          style={{ color }}
        >
          {grade}
        </span>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {score}
        </span>
        {showLabel && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
