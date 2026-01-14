"use client";

import { Fragment, type ReactNode } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className }: DropdownProps) {
  return (
    <Menu as="div" className={cn("relative inline-block text-left", className)}>
      <MenuButton as={Fragment}>{trigger}</MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            "absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          <div className="py-1">
            {items.map((item, idx) => (
              <MenuItem key={idx} disabled={item.disabled}>
                {({ active }) => {
                  const className = cn(
                    "flex w-full items-center gap-2 px-4 py-2 text-sm",
                    active && "bg-gray-100 dark:bg-gray-700",
                    item.disabled && "cursor-not-allowed opacity-50",
                    item.destructive
                      ? "text-error"
                      : "text-gray-700 dark:text-gray-300"
                  );

                  if (item.href) {
                    return (
                      <a href={item.href} className={className}>
                        {item.icon}
                        {item.label}
                      </a>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className={className}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                }}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

/**
 * Simple dropdown button with chevron icon
 */
export interface DropdownButtonProps {
  label: string;
  items: DropdownItem[];
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
}

export function DropdownButton({
  label,
  items,
  variant = "outline",
  size = "md",
  align = "right",
}: DropdownButtonProps) {
  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const variantClasses = {
    default: "bg-primary text-white hover:bg-primary-dark",
    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  return (
    <Dropdown
      align={align}
      items={items}
      trigger={
        <button
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            sizeClasses[size],
            variantClasses[variant]
          )}
        >
          {label}
          <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      }
    />
  );
}
