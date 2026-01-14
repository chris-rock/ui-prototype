"use client";

import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <svg
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Full page loading spinner
 */
export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Inline loading state for content areas
 */
export interface ContentLoaderProps {
  text?: string;
  className?: string;
}

export function ContentLoader({ text = "Loading...", className }: ContentLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="text-center">
        <Spinner size="md" />
        <p className="mt-3 text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
