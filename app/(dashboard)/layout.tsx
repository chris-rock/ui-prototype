"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Sidebar, Header, CommandPalette } from "@/components/layout";
import { useAuth } from "@/lib/auth";
import { ApolloProvider } from "@/lib/apollo/provider";
import { ViewerProvider } from "@/lib/viewer";
import { ScopeProvider } from "@/lib/scope";
import { PageLoader } from "@/components/ui";
import type { ReactNode } from "react";

// Check if auth is disabled for development
const DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar */}
      <Dialog
        as="div"
        className="relative z-50 lg:hidden"
        open={sidebarOpen}
        onClose={setSidebarOpen}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            {/* Close button */}
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                type="button"
                className="relative ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>

            <Sidebar />
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSearchClick={() => setCommandPaletteOpen(true)}
        />

        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

function AuthenticatedShell({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider>
      <ViewerProvider>
        <ScopeProvider>
          <DashboardShell>{children}</DashboardShell>
        </ScopeProvider>
      </ViewerProvider>
    </ApolloProvider>
  );
}

/**
 * Dashboard layout - full app shell with sidebar and header.
 * Requires authentication (unless DISABLE_AUTH is set).
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Skip auth checks when disabled
    if (DISABLE_AUTH) return;
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
  }, [isAuthenticated, isLoading, user, router]);

  // Skip loading state when auth is disabled
  if (!DISABLE_AUTH && (isLoading || !isAuthenticated)) {
    return <PageLoader />;
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
