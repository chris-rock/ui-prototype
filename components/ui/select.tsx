"use client";

import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select<T = string>({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  error,
  disabled,
  className,
}: SelectProps<T>) {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton
            className={cn(
              "relative w-full cursor-pointer rounded-md py-2.5 pl-3 pr-10 text-left text-sm",
              "bg-white dark:bg-gray-900",
              "border transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-error"
                : "border-gray-300 dark:border-gray-600"
            )}
          >
            <span className={cn("block truncate", !selectedOption && "text-gray-400")}>
              {selectedOption?.label ?? placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              className={cn(
                "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1",
                "bg-white dark:bg-gray-800",
                "shadow-lg ring-1 ring-black ring-opacity-5",
                "focus:outline-none"
              )}
            >
              {options.map((option, idx) => (
                <ListboxOption
                  key={idx}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected }) =>
                    cn(
                      "relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm",
                      active && "bg-primary/10 text-primary",
                      selected && "font-semibold",
                      option.disabled && "cursor-not-allowed opacity-50"
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block truncate text-xs text-gray-500">
                          {option.description}
                        </span>
                      )}
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  );
}
