import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { Pagination as PaginationType } from "@/types/api"
import { cn } from "@/lib/utils"

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { ErrorMessage } from "./error-message"

export interface ColumnDef<T> {
  header: string | React.ReactNode
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  className?: string
  sortable?: boolean
  sortKey?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  showIndex?: boolean

  // Pagination Props
  pagination?: PaginationType | null
  onPageChange?: (page: number) => void

  // Sorting Props
  sortColumn?: string
  sortOrder?: "asc" | "desc"
  onSort?: (column: string) => void
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyMessage = "No data found.",
  showIndex = false,
  pagination,
  onPageChange,
  sortColumn,
  sortOrder,
  onSort,
}: Readonly<DataTableProps<T>>) {
  const getRowIndex = (rowIndex: number) => {
    if (pagination) {
      return (
        (pagination.currentPage - 1) * pagination.itemsPerPage + rowIndex + 1
      )
    }
    return rowIndex + 1
  }
  return (
    <div className="flex flex-col overflow-hidden rounded-md border bg-card shadow-xs">
      <ScrollArea className="w-full">
        <Table wrapperClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-xs after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-border">
            <TableRow className="border-none hover:bg-transparent">
              {showIndex && (
                <TableHead className="w-12.5 border-b pl-4 text-center font-semibold">
                  #
                </TableHead>
              )}
              {columns.map((col, index) => {
                const isCurrentSortColumn =
                  sortColumn === (col.sortKey || col.accessorKey)
                let titleText: string | undefined
                if (col.sortable) {
                  if (isCurrentSortColumn) {
                    titleText =
                      sortOrder === "asc"
                        ? "Click to sort descending"
                        : "Click to sort ascending"
                  } else {
                    titleText = "Click to sort ascending"
                  }
                }

                return (
                  <TableHead
                    key={index + 1}
                    className={cn(
                      col.className,
                      col.sortable &&
                        "cursor-pointer transition-colors select-none hover:bg-muted/50",
                      "border-b"
                    )}
                    onClick={() =>
                      col.sortable &&
                      onSort?.(col.sortKey || (col.accessorKey as string))
                    }
                    title={titleText}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable &&
                        isCurrentSortColumn &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                      {col.sortable && !isCurrentSortColumn && (
                        <ChevronsUpDown className="h-4 w-4 opacity-30" />
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {/* Skeleton table rows */}
                {Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index} className="hover:bg-transparent">
                    {showIndex && (
                      <TableCell className="w-12.5 pl-4">
                        <Skeleton className="h-6 w-6" />
                      </TableCell>
                    )}
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex + 1}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-destructive"
                >
                  <ErrorMessage
                    message={error || "An error occurred while loading data."}
                  />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  <p>{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="group cursor-default transition-colors hover:bg-muted/50"
                >
                  {showIndex && (
                    <TableCell className="w-[50px] pl-4 text-center text-xs font-medium text-muted-foreground">
                      {getRowIndex(rowIndex)}
                    </TableCell>
                  )}
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] ?? "—")
                          : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination Section */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row sm:gap-0">
          <div className="text-sm whitespace-nowrap text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} entries
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={cn(
                    pagination.hasPrevPage
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  )}
                  onClick={() =>
                    pagination.hasPrevPage &&
                    onPageChange(Math.max(1, pagination.currentPage - 1))
                  }
                  aria-disabled={!pagination.hasPrevPage}
                />
              </PaginationItem>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((p) => {
                if (
                  p === 1 ||
                  p === pagination.totalPages ||
                  (p >= pagination.currentPage - 1 &&
                    p <= pagination.currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        className="cursor-pointer"
                        isActive={p === pagination.currentPage}
                        onClick={() => {
                          if (p !== pagination.currentPage) {
                            onPageChange(p)
                          }
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }

                if (
                  p === pagination.currentPage - 2 ||
                  p === pagination.currentPage + 2
                ) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return null
              })}

              <PaginationItem>
                <PaginationNext
                  className={cn(
                    pagination.hasNextPage
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  )}
                  onClick={() =>
                    pagination.hasNextPage &&
                    onPageChange(
                      Math.min(
                        pagination.totalPages,
                        pagination.currentPage + 1
                      )
                    )
                  }
                  aria-disabled={!pagination.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
