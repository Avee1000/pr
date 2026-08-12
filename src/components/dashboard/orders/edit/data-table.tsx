"use client"

import * as React from "react"
import {
  flexRender,
  useTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ColumnSizingState,
  type RowData,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  tableFeatures,
  columnFilteringFeature,
  globalFilteringFeature,
  columnVisibilityFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_text,
} from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Columns, ChevronDown, ChevronsUpDown, Pin, PinOff, RefreshCw, Search } from "lucide-react"

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  columnResizingFeature,
  columnPinningFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
})

export type DataTableFeatures = typeof features

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  globalFilterFn?: (row: any, columnId: any, filterValue: any) => boolean
  initialColumnPinning?: ColumnPinningState
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  globalFilterFn,
  initialColumnPinning,
  onRefresh,
  isRefreshing,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({})
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(() =>
    (initialColumnPinning ?? {}) as ColumnPinningState
  )

  const table = useTable<DataTableFeatures, TData>({
    features,
    data,
    columns,
    defaultColumn: {
      size: 150,
      minSize: 80,
      maxSize: 500,
    },
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onColumnSizingChange: setColumnSizing,
    globalFilterFn: globalFilterFn,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnPinning,
      columnSizing,
    },
  })

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-2 shadow-sm transition-colors dark:bg-ink">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search orders by customer, description, status..."
            className="h-10 pl-10 text-sm shadow-xs"
          />
        </div>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={!onRefresh || isRefreshing}
            className="h-10 rounded-lg px-3.5"
          >
            <RefreshCw className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="h-10 rounded-lg px-3.5">
                  <Columns className="mr-2 size-4" />
                  Columns
                  <ChevronDown className="ml-2 size-4 opacity-60" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56 z-50">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const headerTitle =
                    typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize cursor-pointer"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="truncate">{headerTitle}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              column.pin(column.getIsPinned() === "start" ? false : "start")
                            }}
                            className={
                              column.getIsPinned() === "start"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground"
                            }
                            title="Pin Left"
                          >
                            <Pin className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              column.pin(column.getIsPinned() === "end" ? false : "end")
                            }}
                            className={
                              column.getIsPinned() === "end"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground"
                            }
                            title="Pin Right"
                          >
                            <PinOff className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="relative overflow-x-auto rounded-lg border border-border shadow-xs">
        {/* Updated Table classes: removed w-max, using explicit width calculation */}
        <Table className="table-fixed w-full">
          <TableHeader className="bg-muted/40 dark:bg-zinc-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned()
                  const pinStyle: React.CSSProperties = isPinned
                    ? {
                      position: "sticky",
                      left: isPinned === "start" ? `${header.column.getStart("start")}px` : "auto",
                      right: isPinned === "end" ? `${header.column.getAfter("end")}px` : "auto",
                      zIndex: 15,
                    }
                    : {}

                  const colSize = header.getSize()

                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        ...pinStyle,
                        width: `${colSize}px`,
                        minWidth: `${header.column.columnDef.minSize ?? 80}px`,
                        maxWidth: `${header.column.columnDef.maxSize ?? 500}px`,
                      }}
                      className={`relative group select-none bg-background dark:bg-ink font-semibold ${isPinned === "end"
                        ? "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.5)]"
                        : isPinned === "start"
                          ? "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]"
                          : ""
                        }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 truncate py-3 pl-1 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-foreground" : ""
                            }`}
                          onClick={
                            header.column.getCanSort()
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <ChevronsUpDown
                              className={`size-3.5 shrink-0 transition-opacity ${header.column.getIsSorted()
                                ? "opacity-100 text-foreground"
                                : "opacity-40 text-muted-foreground group-hover:opacity-70"
                                }`}
                            />
                          )}
                        </div>
                      )}
                      {/* Resize Handle: Increased target width (w-2) and improved hover feedback */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 w-1 h-full cursor-col-resize select-none touch-none hover:bg-ink/50 z-20 ${header.column.getIsResizing()
                            ? "bg-ink dark:bg-primary opacity-100"
                            : "bg-border opacity-0 group-hover:opacity-100"
                            }`}
                        />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/40 transition-colors dark:hover:bg-zinc-800/40"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned()
                    const pinStyle: React.CSSProperties = isPinned
                      ? {
                        position: "sticky",
                        left: isPinned === "start" ? `${cell.column.getStart("start")}px` : "auto",
                        right: isPinned === "end" ? `${cell.column.getAfter("end")}px` : "auto",
                        zIndex: 10,
                      }
                      : {}

                    const colSize = cell.column.getSize()

                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...pinStyle,
                          width: `${colSize}px`,
                          minWidth: `${cell.column.columnDef.minSize ?? 80}px`,
                          maxWidth: `${cell.column.columnDef.maxSize ?? 500}px`,
                        }}
                        className={`bg-background dark:bg-ink p-3 text-sm align-middle overflow-hidden ${isPinned === "end"
                            ? "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.5)]"
                            : isPinned === "start"
                              ? "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]"
                              : ""
                          }`}
                      >
                        <div className="w-full truncate overflow-hidden">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}