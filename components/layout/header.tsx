"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useScope } from "@/lib/scope";
import { Button } from "@/components/ui";

interface BreadcrumbItem {
  name: string;
  href: string;
}

function generateBreadcrumbs(
  pathname: string,
  spaceId: string | null,
  spaceName: string | null
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with home
  breadcrumbs.push({ name: "Home", href: "/" });

  // If we're in a space context
  if (spaceId && spaceName) {
    breadcrumbs.push({
      name: spaceName,
      href: `/space/${spaceId}`,
    });
  }

  // Parse the rest of the path
  const pathParts = pathname.split("/").filter(Boolean);

  // Skip 'space' and spaceId from path parts if present
  let startIndex = 0;
  if (pathParts[0] === "space" && pathParts[1]) {
    startIndex = 2;
  }

  // Map common path segments to readable names
  const segmentNames: Record<string, string> = {
    findings: "Findings",
    inventory: "Inventory",
    compliance: "Compliance",
    integrations: "Integrations",
    settings: "Settings",
    cves: "CVEs",
    advisories: "Advisories",
    checks: "Checks",
    exceptions: "Exceptions",
    assets: "Assets",
    software: "Software",
    frameworks: "Frameworks",
  };

  for (let i = startIndex; i < pathParts.length; i++) {
    const segment = pathParts[i];
    const name = segmentNames[segment] || segment;
    const href = "/" + pathParts.slice(0, i + 1).join("/");

    breadcrumbs.push({ name, href });
  }

  return breadcrumbs;
}

interface HeaderProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

export function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  const pathname = usePathname();
  const { spaceId, spaceScope } = useScope();

  const breadcrumbs = generateBreadcrumbs(
    pathname,
    spaceId,
    spaceScope?.name || null
  );

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-300"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden dark:bg-gray-700" />

      {/* Breadcrumbs */}
      <nav className="flex flex-1" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon
                  className="mx-2 h-4 w-4 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
              )}
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              ) : index === breadcrumbs.length - 1 ? (
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Search button */}
        <button
          type="button"
          className="group flex items-center gap-x-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300"
          onClick={onSearchClick}
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 sm:inline dark:bg-gray-800 dark:text-gray-400">
            ⌘K
          </kbd>
        </button>

        {/* Separator */}
        <div className="hidden h-6 w-px bg-gray-200 lg:block dark:bg-gray-700" />

        {/* Notifications */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
