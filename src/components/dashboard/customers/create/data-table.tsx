"use client"

import * as React from "react"
import {
    flexRender,
    useTable,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type RowData,
    type Row,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, RefreshCcw, Loader } from "lucide-react"
import { features, type DataTableFeatures } from "./data-table-features"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[]
    data: TData[]
}

export function DataTable<TData extends RowData>({
    columns,
    data,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = React.useState<string>("")
    const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({
        actions: true,
    })
    const [isRefreshing, setIsRefreshing] = useState(false)
    const router = useRouter()

    const table = useTable<DataTableFeatures, TData>({
        features,
        data,
        columns,
        defaultColumn: {
            size: 150,
            minSize: 100,
            maxSize: 320,
        },
        enableColumnResizing: true,
        columnResizeMode: "onChange",
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        globalFilterFn: (row: Row<DataTableFeatures, TData>, _columnId: string, filterValue: unknown) => {
            const query = String(filterValue ?? "").toLowerCase().trim()
            if (!query) return true

            const record = row.original as Record<string, unknown>
            const name = String(record.name ?? "").toLowerCase()
            const email = String(record.email ?? "").toLowerCase()
            const country = String(record.country ?? "").toLowerCase()

            return name.includes(query) || email.includes(query) || country.includes(query)
        },
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
        },
    })

    const handleRefresh = async () => {
        setIsRefreshing(true)
        router.refresh()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    useEffect(() => {
        if (isRefreshing) {
            toast("Refreshing data...", {
                icon: <Loader className='animate-spin size-5' />
            })
        }
    }, [isRefreshing])

    return (
        <div className="space-y-4 dark:border">
            {/* Toolbar: Search Input and Columns Dropdown */}
            <div className="flex justify-between items-center m-2">
                <Input
                    placeholder="Filter name, email, country..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm dark:bg-ink"
                />
                <div className="flex flex-row gap-2 items-center">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-ink/5 dark:bg-muted text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCcw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={
                            <Button variant="outline" className="ml-auto">
                                Columns
                                <ChevronDown className="size-5" />
                            </Button>
                        }>

                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={"w-(--radix-popover-content-width)"}>
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize cursor-pointer"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id === "dateCreated" ? "Date Created" : column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-hidden lg:rounded-md border lg:m-2 px-1">
                {/* table-fixed enforces strict cell width behavior */}
                <Table className="table-fixed w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{
                                            width: `${header.getSize()}px`,
                                            minWidth: `${header.getSize()}px`,
                                        }}
                                        className="relative group truncate select-none"
                                    >
                                        {header.isPlaceholder ? null : (
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                        )}

                                        {/* Render the Resizer Drag Handle */}
                                        {header.column.getCanResize() && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-ink-dark opacity-0 group-hover:opacity-100 ${header.column.getIsResizing() ? "opacity-100" : ""
                                                    }`}
                                            />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-ink/5 dark:hover:bg-ink/10 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{
                                                width: `${cell.column.getSize()}px`,
                                                minWidth: `${cell.column.columnDef.minSize ?? 50}px`,
                                                maxWidth: `${cell.column.columnDef.maxSize ?? 500}px`,
                                            }}
                                            className="truncate"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No Customers found. Refresh or create a new Customer.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}