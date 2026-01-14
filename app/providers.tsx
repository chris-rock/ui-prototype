"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root providers wrapper for the application.
 * Wraps children with all necessary context providers.
 */
export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
