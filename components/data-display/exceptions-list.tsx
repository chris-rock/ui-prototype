"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Card, Badge, Button } from "@/components/ui";
import { DataTable } from "./data-table";
import { type ColumnDef } from "@tanstack/react-table";
import {
  XMarkIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  ShieldExclamationIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface Exception {
  id: string;
  findingId: string;
  findingType: "cve" | "advisory" | "check";
  findingTitle: string;
  justification: string;
  createdAt: string;
  expiresAt?: string;
  createdBy: {
    name: string;
    email: string;
  };
  status: "active" | "expired" | "pending";
}

interface ExceptionsListProps {
  spaceId: string;
  exceptions?: Exception[];
  onDelete?: (id: string) => void;
}

// Mock data
const mockExceptions: Exception[] = [
  {
    id: "1",
    findingId: "CVE-2024-1234",
    findingType: "cve",
    findingTitle: "Remote Code Execution in OpenSSL",
    justification: "This finding has been verified as a false positive. The affected code path is not reachable in our configuration.",
    createdAt: "2024-01-10T14:30:00Z",
    expiresAt: "2024-04-10T14:30:00Z",
    createdBy: { name: "John Doe", email: "john@example.com" },
    status: "active",
  },
  {
    id: "2",
    findingId: "CVE-2024-2345",
    findingType: "cve",
    findingTitle: "Privilege Escalation in Linux Kernel",
    justification: "The risk associated with this finding has been reviewed and accepted. Compensating controls are in place.",
    createdAt: "2024-01-08T10:00:00Z",
    createdBy: { name: "Jane Smith", email: "jane@example.com" },
    status: "active",
  },
  {
    id: "3",
    findingId: "check-1",
    findingType: "check",
    findingTitle: "Ensure SSH root login is disabled",
    justification: "This check is not applicable for this bastion host as root access is required for emergency recovery.",
    createdAt: "2023-12-15T09:00:00Z",
    expiresAt: "2024-01-15T09:00:00Z",
    createdBy: { name: "Bob Wilson", email: "bob@example.com" },
    status: "expired",
  },
];

export function ExceptionsList({ spaceId, exceptions = mockExceptions, onDelete }: ExceptionsListProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedException, setSelectedException] = useState<Exception | null>(null);

  const handleDeleteClick = (exception: Exception) => {
    setSelectedException(exception);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedException && onDelete) {
      onDelete(selectedException.id);
    }
    setShowDeleteModal(false);
    setSelectedException(null);
  };

  const columns: ColumnDef<Exception>[] = [
    {
      accessorKey: "findingId",
      header: "Finding",
      cell: ({ row }) => {
        const findingUrl =
          row.original.findingType === "cve"
            ? `/space/${spaceId}/findings/cve/${row.original.findingId}`
            : row.original.findingType === "advisory"
              ? `/space/${spaceId}/findings/advisory/${row.original.findingId}`
              : `/space/${spaceId}/findings/check/${row.original.findingId}`;

        return (
          <div className="max-w-xs">
            <Link href={findingUrl} className="font-medium text-primary hover:underline">
              {row.original.findingId}
            </Link>
            <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
              {row.original.findingTitle}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const variants: Record<string, "success" | "secondary" | "medium"> = {
          active: "success",
          expired: "secondary",
          pending: "medium",
        };
        return (
          <Badge variant={variants[row.original.status]} className="capitalize">
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "justification",
      header: "Justification",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-sm text-sm text-gray-600 dark:text-gray-400">
          {row.original.justification}
        </span>
      ),
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <UserIcon className="h-3 w-3 text-gray-500" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.createdBy.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => (
        <span
          className={cn(
            "text-sm",
            row.original.expiresAt && new Date(row.original.expiresAt) < new Date()
              ? "text-red-500"
              : "text-gray-500 dark:text-gray-400"
          )}
        >
          {row.original.expiresAt
            ? new Date(row.original.expiresAt).toLocaleDateString()
            : "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteClick(row.original)}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (exceptions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
            <ShieldExclamationIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No exceptions found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create exceptions from the findings list to suppress specific vulnerabilities or checks.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <DataTable columns={columns} data={exceptions} pageSize={10} />

      {/* Delete Confirmation Modal */}
      <Transition show={showDeleteModal}>
        <Dialog onClose={() => setShowDeleteModal(false)} className="relative z-50">
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
              <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Delete Exception
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                {selectedException && (
                  <div className="mt-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedException.findingId}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedException.findingTitle}
                    </p>
                  </div>
                )}

                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Deleting this exception will re-enable the finding in reports and dashboards.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  >
                    Delete Exception
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
