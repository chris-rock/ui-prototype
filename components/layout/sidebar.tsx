"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import {
  HomeIcon,
  ShieldExclamationIcon,
  ServerStackIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon,
  ChevronUpDownIcon,
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useViewer } from "@/lib/viewer";
import { useScope } from "@/lib/scope";
import { useAuth } from "@/lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  name?: string;
  items: NavItem[];
}

function getNavigation(spaceId: string | null): NavGroup[] {
  const spacePrefix = spaceId ? `/space/${spaceId}` : "";

  return [
    {
      items: [
        {
          name: "Dashboard",
          href: spaceId ? spacePrefix : "/",
          icon: HomeIcon,
        },
      ],
    },
    {
      name: "Security",
      items: [
        {
          name: "Findings",
          href: `${spacePrefix}/findings`,
          icon: ShieldExclamationIcon,
        },
        {
          name: "Inventory",
          href: `${spacePrefix}/inventory`,
          icon: ServerStackIcon,
        },
        {
          name: "Compliance",
          href: `${spacePrefix}/compliance`,
          icon: ClipboardDocumentCheckIcon,
        },
      ],
    },
    {
      name: "Configure",
      items: [
        {
          name: "Integrations",
          href: `${spacePrefix}/integrations`,
          icon: PuzzlePieceIcon,
        },
        {
          name: "Settings",
          href: `${spacePrefix}/settings`,
          icon: Cog6ToothIcon,
        },
      ],
    },
  ];
}

function SpaceSelector() {
  const { viewer } = useViewer();
  const { spaceScope } = useScope();

  const spaces = viewer?.organizations?.flatMap((org) => {
    // For now, we'll use firstSpace as a placeholder
    // In reality, you'd fetch all spaces for each org
    return viewer.firstSpace ? [viewer.firstSpace] : [];
  }) || [];

  const currentSpace = spaceScope?.space || viewer?.firstSpace;

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BuildingOfficeIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 truncate">
          <p className="truncate font-medium">{currentSpace?.name || "Select Space"}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {currentSpace?.organization?.name || "Organization"}
          </p>
        </div>
        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute left-0 right-0 z-10 mt-1 max-h-60 origin-top-left overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 dark:ring-white/10">
          {viewer?.organizations?.map((org) => (
            <div key={org.id}>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                {org.name}
              </div>
              {viewer.firstSpace?.organization?.id === org.id && (
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href={`/space/${viewer.firstSpace?.id}`}
                      className={cn(
                        "flex items-center gap-x-3 px-3 py-2 text-sm",
                        focus ? "bg-gray-100 dark:bg-gray-700" : ""
                      )}
                    >
                      <span className="truncate">{viewer.firstSpace?.name}</span>
                    </Link>
                  )}
                </MenuItem>
              )}
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <MenuItem>
              {({ focus }) => (
                <Link
                  href="/space/new"
                  className={cn(
                    "flex items-center gap-x-2 px-3 py-2 text-sm text-primary",
                    focus ? "bg-gray-100 dark:bg-gray-700" : ""
                  )}
                >
                  <PlusIcon className="h-4 w-4" />
                  Create new space
                </Link>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

function UserMenu() {
  const { viewer } = useViewer();
  const { signOut } = useAuth();

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="flex-1 truncate">
          <p className="truncate font-medium text-gray-900 dark:text-white">
            {viewer?.name || "User"}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {viewer?.email}
          </p>
        </div>
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute bottom-full left-0 right-0 z-10 mb-1 origin-bottom-left rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 dark:ring-white/10">
          <MenuItem>
            {({ focus }) => (
              <Link
                href="/settings/profile"
                className={cn(
                  "flex items-center gap-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300",
                  focus ? "bg-gray-100 dark:bg-gray-700" : ""
                )}
              >
                <UserCircleIcon className="h-4 w-4" />
                Profile
              </Link>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={() => signOut()}
                className={cn(
                  "flex w-full items-center gap-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300",
                  focus ? "bg-gray-100 dark:bg-gray-700" : ""
                )}
              >
                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                Sign out
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 shrink-0",
          isActive
            ? "text-primary"
            : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
        )}
      />
      <span className="flex-1">{item.name}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { spaceId } = useScope();
  const navigation = getNavigation(spaceId);

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <Link href="/" className="flex items-center gap-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Mondoo
          </span>
        </Link>
      </div>

      {/* Space Selector */}
      <div className="px-2">
        <SpaceSelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navigation.map((group, groupIdx) => (
          <div key={groupIdx} className={groupIdx > 0 ? "pt-4" : ""}>
            {group.name && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {group.name}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return <NavLink key={item.name} item={item} isActive={isActive} />;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Menu */}
      <div className="shrink-0 border-t border-gray-200 p-2 dark:border-gray-800">
        <UserMenu />
      </div>
    </div>
  );
}
