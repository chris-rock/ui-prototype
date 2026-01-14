"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  DialogBackdrop,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ShieldExclamationIcon,
  ServerStackIcon,
  ClipboardDocumentCheckIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useViewer } from "@/lib/viewer";
import { useScope } from "@/lib/scope";

interface CommandItem {
  id: string;
  name: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  category: "navigation" | "spaces" | "actions";
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { viewer } = useViewer();
  const { spaceId } = useScope();
  const [query, setQuery] = useState("");

  // Build command items
  const getCommands = useCallback((): CommandItem[] => {
    const spacePrefix = spaceId ? `/space/${spaceId}` : "";
    const commands: CommandItem[] = [];

    // Navigation commands
    commands.push(
      {
        id: "nav-dashboard",
        name: "Dashboard",
        description: "Go to dashboard",
        icon: HomeIcon,
        href: spaceId ? spacePrefix : "/",
        category: "navigation",
      },
      {
        id: "nav-findings",
        name: "Findings",
        description: "View security findings",
        icon: ShieldExclamationIcon,
        href: `${spacePrefix}/findings`,
        category: "navigation",
      },
      {
        id: "nav-inventory",
        name: "Inventory",
        description: "Browse asset inventory",
        icon: ServerStackIcon,
        href: `${spacePrefix}/inventory`,
        category: "navigation",
      },
      {
        id: "nav-compliance",
        name: "Compliance",
        description: "View compliance frameworks",
        icon: ClipboardDocumentCheckIcon,
        href: `${spacePrefix}/compliance`,
        category: "navigation",
      },
      {
        id: "nav-integrations",
        name: "Integrations",
        description: "Manage integrations",
        icon: PuzzlePieceIcon,
        href: `${spacePrefix}/integrations`,
        category: "navigation",
      },
      {
        id: "nav-settings",
        name: "Settings",
        description: "Configure settings",
        icon: Cog6ToothIcon,
        href: `${spacePrefix}/settings`,
        category: "navigation",
      }
    );

    // Space commands
    if (viewer?.firstSpace) {
      commands.push({
        id: `space-${viewer.firstSpace.id}`,
        name: viewer.firstSpace.name,
        description: viewer.firstSpace.organization?.name || "Space",
        icon: FolderIcon,
        href: `/space/${viewer.firstSpace.id}`,
        category: "spaces",
      });
    }

    // Organization commands
    viewer?.organizations?.forEach((org) => {
      commands.push({
        id: `org-${org.id}`,
        name: org.name,
        description: `Organization with ${org.spacesCount} spaces`,
        icon: BuildingOfficeIcon,
        href: `/org/${org.id}`,
        category: "spaces",
      });
    });

    return commands;
  }, [spaceId, viewer]);

  const commands = getCommands();

  // Filter commands based on query
  const filteredCommands =
    query === ""
      ? commands
      : commands.filter((command) => {
          const searchText = `${command.name} ${command.description || ""}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });

  // Group commands by category
  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === "navigation"),
    spaces: filteredCommands.filter((c) => c.category === "spaces"),
    actions: filteredCommands.filter((c) => c.category === "actions"),
  };

  // Handle selection
  const handleSelect = (command: CommandItem | null) => {
    if (!command) return;

    if (command.action) {
      command.action();
    } else if (command.href) {
      router.push(command.href);
    }

    onClose();
  };

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Reset query when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (
    <Dialog
      as="div"
      className="relative z-50"
      open={open}
      onClose={onClose}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/25 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
      />

      <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel
          transition
          className="mx-auto max-w-xl transform divide-y divide-gray-200 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:divide-gray-700 dark:bg-gray-800 dark:ring-white/10"
        >
          <Combobox<CommandItem | null>
            onChange={handleSelect}
          >
            <div className="relative">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <ComboboxInput
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm dark:text-white"
                placeholder="Search commands..."
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </div>

            {filteredCommands.length > 0 && (
              <ComboboxOptions
                static
                className="max-h-80 scroll-pb-2 scroll-pt-11 space-y-2 overflow-y-auto p-2"
              >
                {groupedCommands.navigation.length > 0 && (
                  <li>
                    <h2 className="mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Navigation
                    </h2>
                    <ul>
                      {groupedCommands.navigation.map((command) => (
                        <ComboboxOption
                          key={command.id}
                          value={command}
                          className="group flex cursor-pointer select-none items-center gap-x-3 rounded-lg px-3 py-2 data-focus:bg-gray-100 dark:data-focus:bg-gray-700"
                        >
                          <command.icon className="h-5 w-5 text-gray-400 group-data-focus:text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {command.name}
                            </p>
                            {command.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {command.description}
                              </p>
                            )}
                          </div>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}

                {groupedCommands.spaces.length > 0 && (
                  <li>
                    <h2 className="mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Spaces & Organizations
                    </h2>
                    <ul>
                      {groupedCommands.spaces.map((command) => (
                        <ComboboxOption
                          key={command.id}
                          value={command}
                          className="group flex cursor-pointer select-none items-center gap-x-3 rounded-lg px-3 py-2 data-focus:bg-gray-100 dark:data-focus:bg-gray-700"
                        >
                          <command.icon className="h-5 w-5 text-gray-400 group-data-focus:text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {command.name}
                            </p>
                            {command.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {command.description}
                              </p>
                            )}
                          </div>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}
              </ComboboxOptions>
            )}

            {query !== "" && filteredCommands.length === 0 && (
              <div className="px-6 py-14 text-center text-sm sm:px-14">
                <FolderIcon
                  className="mx-auto h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
                <p className="mt-4 font-semibold text-gray-900 dark:text-white">
                  No results found
                </p>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  No commands found for this search term. Try searching for something else.
                </p>
              </div>
            )}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
