"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface TabItem {
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

export function Tabs({
  items,
  defaultIndex = 0,
  onChange,
  className,
  variant = "default",
}: TabsProps) {
  const tabListClasses = {
    default: "border-b border-gray-200 dark:border-gray-700",
    pills: "gap-2",
    underline: "border-b border-gray-200 dark:border-gray-700",
  };

  const tabClasses = {
    default: (selected: boolean) =>
      cn(
        "px-4 py-2.5 text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-b-2 border-primary text-primary"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      ),
    pills: (selected: boolean) =>
      cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "bg-primary text-white"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      ),
    underline: (selected: boolean) =>
      cn(
        "px-4 py-2.5 text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-b-2 border-primary text-primary -mb-px"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      ),
  };

  return (
    <TabGroup defaultIndex={defaultIndex} onChange={onChange} className={className}>
      <TabList className={cn("flex", tabListClasses[variant])}>
        {items.map((item, idx) => (
          <Tab
            key={idx}
            disabled={item.disabled}
            className={({ selected }) =>
              cn(
                tabClasses[variant](selected),
                item.disabled && "cursor-not-allowed opacity-50"
              )
            }
          >
            <span className="flex items-center gap-2">
              {item.icon}
              {item.label}
              {item.count !== undefined && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {item.count}
                </span>
              )}
            </span>
          </Tab>
        ))}
      </TabList>
      <TabPanels className="mt-4">
        {items.map((item, idx) => (
          <TabPanel key={idx} className="focus:outline-none">
            {item.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
