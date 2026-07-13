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
import type { Pagination as PaginationType } from "@/types/api"
import { cn } from "@/lib/utils"

export interface ColumnDef<T> {
  header: string | React.ReactNode
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string

  // Pagination Props
  pagination?: PaginationType | null
  onPageChange?: (page: number) => void
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyMessage = "No data found.",
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col, index) => (
              <TableHead key={index} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
                  <p>Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-destructive"
              >
                {error}
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className="group cursor-default transition-colors hover:bg-muted/50"
              >
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

      {/* Pagination Section */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="border-t px-4 py-4">
          <Pagination>
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
