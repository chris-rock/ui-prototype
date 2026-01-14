"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        success: "bg-success/10 text-success-dark dark:text-success",
        warning: "bg-warning/10 text-warning-dark dark:text-warning",
        error: "bg-error/10 text-error",
        critical: "bg-critical/10 text-critical",
        high: "bg-high/10 text-high",
        medium: "bg-medium/10 text-medium",
        low: "bg-low/10 text-low",
        none: "bg-none/10 text-none-dark dark:text-none",
        unknown: "bg-unknown/10 text-unknown-dark dark:text-unknown",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            variant === "default" && "bg-gray-500",
            variant === "primary" && "bg-primary",
            variant === "secondary" && "bg-secondary",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "error" && "bg-error",
            variant === "critical" && "bg-critical",
            variant === "high" && "bg-high",
            variant === "medium" && "bg-medium",
            variant === "low" && "bg-low",
            variant === "none" && "bg-none",
            variant === "unknown" && "bg-unknown"
          )}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Severity badge with predefined styling for security findings
 */
export type SeverityLevel = "critical" | "high" | "medium" | "low" | "none" | "unknown";

export interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const labels: Record<SeverityLevel, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    none: "None",
    unknown: "Unknown",
  };

  return (
    <Badge variant={severity} className={className} dot>
      {labels[severity]}
    </Badge>
  );
}

/**
 * Score badge for displaying score ratings
 */
export type ScoreRating = "fail" | "poor" | "fair" | "good" | "excellent";

export interface ScoreBadgeProps {
  rating: ScoreRating;
  score?: number;
  className?: string;
}

export function ScoreBadge({ rating, score, className }: ScoreBadgeProps) {
  const variants: Record<ScoreRating, VariantProps<typeof badgeVariants>["variant"]> = {
    fail: "critical",
    poor: "high",
    fair: "medium",
    good: "low",
    excellent: "none",
  };

  const labels: Record<ScoreRating, string> = {
    fail: "F",
    poor: "D",
    fair: "C",
    good: "B",
    excellent: "A",
  };

  return (
    <Badge variant={variants[rating]} className={className}>
      {labels[rating]}
      {score !== undefined && <span className="ml-1">({score})</span>}
    </Badge>
  );
}
