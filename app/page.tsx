"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PageLoader } from "@/components/ui";

/**
 * Root page - redirects based on auth state.
 * Authenticated users go to the dashboard.
 * Unauthenticated users go to login.
 */
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Check if email is verified
    if (user && !user.emailVerified) {
      router.replace("/verify-email");
      return;
    }

    // For now, redirect to a placeholder dashboard
    // TODO: Replace with actual dashboard route once implemented
    router.replace("/dashboard");
  }, [isAuthenticated, isLoading, user, router]);

  return <PageLoader />;
}
