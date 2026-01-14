"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  enableRowSelection = false,
  enableSorting = true,
  enableFiltering = false,
  onRowSelectionChange,
  emptyMessage = "No results found",
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      onRowSelectionChange?.(newSelection);
    },
    enableRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400",
                      header.column.getCanSort() && "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="flex flex-col">
                          <ChevronUpIcon
                            className={cn(
                              "h-3 w-3",
                              header.column.getIsSorted() === "asc"
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-300 dark:text-gray-600"
                            )}
                          />
                          <ChevronDownIcon
                            className={cn(
                              "-mt-1 h-3 w-3",
                              header.column.getIsSorted() === "desc"
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-300 dark:text-gray-600"
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
                    row.getIsSelected() && "bg-primary/5"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{" "}
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, data.length)} of{" "}
            {data.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Selection info */}
      {enableRowSelection && Object.keys(rowSelection).length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {Object.keys(rowSelection).length} row(s) selected
        </div>
      )}
    </div>
  );
}

// Selection checkbox column helper
export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    ),
  };
}
