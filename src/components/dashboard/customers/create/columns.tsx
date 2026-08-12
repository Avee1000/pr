"use client"

import Link from 'next/link'
import { createColumnHelper } from "@tanstack/react-table"
import { ChevronsUpDown, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Customer } from '@/lib/supabase/types'
import Delete from '../edit/DeleteCustomer'
import { type DataTableFeatures } from "./data-table-features"
import { KebabMenu } from '@/components/KebabMenu'

const columnHelper = createColumnHelper<DataTableFeatures, Customer>()

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className='py-1'>
        <div className="text-ink dark:text-white font-semibold truncate text-ellipsis">{row.original.name}</div>
        {row.original.email && (
          <div className="text-muted-foreground text-[10px]  truncate text-ellipsis">{row.original.email}</div>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("country", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Country
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div title={row.original.country} className="text-muted-foreground truncate text-ellipsis">
        {row.original.country}
      </div>
    ),
  }),
  columnHelper.accessor("created_at", {
    id: "dateCreated",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date Created
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground truncate">
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString('en-US')
          : 'N/A'}
      </div>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-300/20 border-2 border-blue-300/50 dark:text-gray-200 text-ink capitalize truncate">
        {row.original.phone}
      </span>
    ),
  }),
  columnHelper.display({
    header: () => <div className="text-right px-2">Actions</div>,
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right whitespace-nowrap px-2">
        <KebabMenu groupClassName='flex flex-col gap-1'
          afterSeparator={<Delete label='Delete' id={row.original.id} />}
        >
          <Link
            href={`/dashboard/customers/edit/${row.original.id}`}
            className="h-7 px-3 inline-flex items-center justify-start gap-1.5 rounded-lg dark:bg-ink dark:hover:bg-muted-foreground/20 hover:bg-ink/10 text-ink dark:text-muted-foreground transition-all disabled:opacity-50 text-xs font-medium"
            title="View / Edit"
          >
            <Edit2 className="size-3.5" />
            <span>Edit</span>
          </Link>
        </KebabMenu>
      </div>
    ),
  }),
])