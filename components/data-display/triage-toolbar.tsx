"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Button, Input, Badge } from "@/components/ui";
import {
  XMarkIcon,
  ShieldExclamationIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  TrashIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface TriageToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onCreateException: (data: ExceptionFormData) => void;
  onExport?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface ExceptionFormData {
  justification: string;
  expiresAt?: string;
  scope: "selected" | "all_matching";
}

const JUSTIFICATION_PRESETS = [
  { label: "False Positive", value: "This finding has been verified as a false positive and does not represent a real security risk." },
  { label: "Accepted Risk", value: "The risk associated with this finding has been reviewed and accepted by the security team." },
  { label: "Compensating Control", value: "A compensating control is in place that mitigates the risk of this finding." },
  { label: "In Remediation", value: "This finding is currently being addressed as part of planned remediation work." },
  { label: "Not Applicable", value: "This finding does not apply to this asset or configuration." },
];

export function TriageToolbar({
  selectedCount,
  onClearSelection,
  onCreateException,
  onExport,
  onDelete,
  className,
}: TriageToolbarProps) {
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [justification, setJustification] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [scope, setScope] = useState<"selected" | "all_matching">("selected");

  const handleCreateException = () => {
    onCreateException({
      justification,
      expiresAt: expiresAt || undefined,
      scope,
    });
    setShowExceptionModal(false);
    setJustification("");
    setExpiresAt("");
    setScope("selected");
    onClearSelection();
  };

  const handlePresetClick = (preset: string) => {
    setJustification(preset);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Toolbar */}
      <div
        className={cn(
          "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform",
          "flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-lg",
          "dark:border-gray-700 dark:bg-gray-800",
          className
        )}
      >
        <div className="flex items-center gap-2 border-r border-gray-200 pr-3 dark:border-gray-700">
          <Badge variant="primary">{selectedCount}</Badge>
          <span className="text-sm text-gray-600 dark:text-gray-400">selected</span>
          <button
            onClick={onClearSelection}
            className="ml-1 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowExceptionModal(true)}
          >
            <ShieldExclamationIcon className="mr-2 h-4 w-4" />
            Create Exception
          </Button>

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}

          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:bg-red-50">
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Exception Modal */}
      <Transition show={showExceptionModal}>
        <Dialog onClose={() => setShowExceptionModal(false)} className="relative z-50">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create Exception
                  </DialogTitle>
                  <button
                    onClick={() => setShowExceptionModal(false)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Create an exception for {selectedCount} selected finding{selectedCount !== 1 ? "s" : ""}.
                </p>

                <div className="mt-6 space-y-4">
                  {/* Scope Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Scope
                    </label>
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => setScope("selected")}
                        className={cn(
                          "flex-1 rounded-lg border p-3 text-left transition-colors",
                          scope === "selected"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Selected Only</span>
                          {scope === "selected" && <CheckIcon className="h-4 w-4" />}
                        </div>
                        <span className="mt-1 block text-xs opacity-70">
                          Apply to {selectedCount} selected item{selectedCount !== 1 ? "s" : ""}
                        </span>
                      </button>
                      <button
                        onClick={() => setScope("all_matching")}
                        className={cn(
                          "flex-1 rounded-lg border p-3 text-left transition-colors",
                          scope === "all_matching"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">All Matching</span>
                          {scope === "all_matching" && <CheckIcon className="h-4 w-4" />}
                        </div>
                        <span className="mt-1 block text-xs opacity-70">
                          Apply to all matching findings
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Justification Presets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quick Justification
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {JUSTIFICATION_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => handlePresetClick(preset.value)}
                          className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-400"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Justification Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Justification <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      rows={3}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Explain why this exception is being created..."
                    />
                  </div>

                  {/* Expiration Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Expiration Date (Optional)
                    </label>
                    <div className="relative mt-2">
                      <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Leave empty for a permanent exception
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowExceptionModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateException}
                    disabled={!justification.trim()}
                  >
                    Create Exception
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
