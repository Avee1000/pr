"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { OrderRowsProps, Customer, OrderStatus, PaymentStatus } from "@/lib/types/dashBoardTypes"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KebabMenu } from "@/components/global/KebabMenu"
import Delete from "./DeleteOrder"
import { ShareQuoteButton } from "@/components/quote/ShareQuoteButton"
import { cn } from "@/lib/utils"
import { Edit2, Check, X, ChevronsUpDown, LucideInfo } from "lucide-react"
import { orderStatusColors, paymentStatusColors } from "@/lib/types/dashBoardTypes"
import { DataTableFeatures } from "@/components/dashboard/orders/edit/data-table"
import { FormattedPrice } from "@/components/context/FormattedPrice"

const columnHelper = createColumnHelper<DataTableFeatures, OrderRowsProps>()

export type EditFormState = {
    customerName: string
    description: string
    price: string
    status: string
    paymentStatus: string
}

type GetColumnsProps = {
    editingId: string | null
    setEditingId: (id: string | null) => void
    editForm: EditFormState
    handleChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
    handleSelectChange: (field: string, value: string | null) => void
    customerOpen: boolean
    setCustomerOpen: (open: boolean) => void
    customerId: string
    setCustomerId: (id: string) => void
    allCustomers: Customer[] | null
    handleSave: (id: string, initialCustomerId: string) => void
    setSelectedOrder: (order: OrderRowsProps | null) => void
    handleEditClick: (order: OrderRowsProps) => void
    selectedCustomer: Customer | undefined
}

export const getColumns = ({
    editingId,
    setEditingId,
    editForm,
    handleChange,
    handleSelectChange,
    customerOpen,
    setCustomerOpen,
    customerId,
    setCustomerId,
    allCustomers,
    handleSave,
    setSelectedOrder,
    handleEditClick,
    selectedCustomer,
}: GetColumnsProps): ColumnDef<DataTableFeatures, OrderRowsProps, any>[] => [
        columnHelper.accessor("customer", {
            id: "customer",
            header: "Customer",
            cell: (info) => {
                const item = info.row.original
                const isEditing = editingId === item.allOrders.id
                if (isEditing) {
                    return (
                        <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={customerOpen}
                                        className="w-full min-w-0 justify-between rounded-xl border-border bg-white dark:bg-black px-3.5 text-sm font-normal shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20"
                                    >
                                        <span className="truncate">
                                            {selectedCustomer?.name
                                                ? `${selectedCustomer.name} ${selectedCustomer.email ? `(${selectedCustomer.email})` : ""}`
                                                : editForm.customerName
                                                    ? editForm.customerName
                                                    : "Search or select a customer..."}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-80 p-0 rounded-xl shadow-lg border-border">
                                <Command>
                                    <CommandInput placeholder="Search customer by name or email..." className="h-10 text-sm" />
                                    <CommandList>
                                        <CommandEmpty>
                                            {allCustomers?.length === 0 ? "No customers found. Add one first." : "No matching customer found."}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {allCustomers?.map((customer) => (
                                                <CommandItem
                                                    key={customer.id}
                                                    value={`${customer.name} ${customer.email || ""}`}
                                                    onSelect={() => {
                                                        handleSelectChange("customerName", customer.name)
                                                        setCustomerId(customer.id)
                                                        setCustomerOpen(false)
                                                    }}
                                                    className="cursor-pointer text-sm py-2.5"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            customerId === customer.id ? "opacity-100 text-brand" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{customer.name}</span>
                                                        {customer.email && <span className="text-xs text-muted-foreground">{customer.email}</span>}
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )
                }
                return (
                    <div className="font-medium truncate text-ellipsis min-w-0">
                        <div className="text-ink dark:text-white font-semibold truncate text-ellipsis">{item.customer?.name}</div>
                        {item.customer?.email && (
                            <div className="text-ink/60 dark:text-gray-400 text-[10px] truncate text-ellipsis">{item.customer?.email}</div>
                        )}
                    </div>
                )
            },
            size: 150,
            minSize: 100,
            maxSize: 250,
            enableResizing: true,
        }),
        columnHelper.accessor("allOrders.description", {
            id: "description",
            header: "Description",
            cell: (info) => {
                const item = info.row.original
                const isEditing = editingId === item.allOrders.id
                if (isEditing) {
                    return (
                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between rounded-xl border-border bg-white dark:bg-black px-3.5 text-sm font-normal shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20"
                                    >
                                        <span className="truncate">
                                            {editForm.description || "Enter description"}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-2 shadow-lg rounded-xl border border-border bg-popover">
                                <textarea
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleChange}
                                    rows={6}
                                    cols={40}
                                    className="w-full p-2 border border-input rounded-lg resize-none text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </PopoverContent>
                        </Popover>
                    )
                }
                const text = info.getValue() ?? ""
                return (
                    <div className="truncate text-ellipsis min-w-0" title={text}>
                        {text}
                    </div>
                )
            },
            size: 100,
            minSize: 100,
            maxSize: 300,
            enableResizing: true,
        }),
        columnHelper.accessor("allOrders.price", {
            id: "price",
            header: "Price",
            cell: (info) => {
                const item = info.row.original
                const isEditing = editingId === item.allOrders.id
                if (isEditing) {
                    return (
                        <input
                            type="number"
                            name="price"
                            value={editForm.price}
                            onChange={handleChange}
                            className="w-20 p-1 h-9 border border-input rounded-xl bg-background text-foreground text-sm px-2 outline-none focus:ring-2 focus:ring-ring"
                        />
                    )
                }
                return <FormattedPrice amountInUSD={info.getValue().toFixed(2)} />

            },
            size: 120,
            minSize: 80,
            maxSize: 150,
        }),
        columnHelper.accessor("allOrders.due_date", {
            id: "dueDate",
            header: "Due Date",
            cell: (info) => info.getValue(),
            size: 120,
            minSize: 100,
            maxSize: 180,
        }),
        columnHelper.accessor("allOrders.status", {
            id: "status",
            header: "Status",
            cell: (info) => {
                const item = info.row.original
                const isEditing = editingId === item.allOrders.id
                if (isEditing) {
                    return (
                        <Select
                            value={editForm.status}
                            onValueChange={(value) => handleSelectChange("status", value ?? "")}
                        >
                            <SelectTrigger className="h-9 w-full rounded-xl border-border bg-white dark:bg-black pl-3.5 text-sm shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                                <SelectItem value="quote_sent">Quote Sent</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                        </Select>
                    )
                }
                const status = info.getValue() as OrderStatus
                return (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${orderStatusColors[status] || "bg-gray-500/20 text-gray-700"
                            }`}
                    >
                        {status?.replace("_", " ")}
                    </span>
                )
            },
            size: 130,
            minSize: 100,
            maxSize: 200,
        }),
        columnHelper.accessor("allOrders.payment_status", {
            id: "paymentStatus",
            header: "Payment Status",
            cell: (info) => {
                const item = info.row.original
                const isEditing = editingId === item.allOrders.id
                if (isEditing) {
                    return (
                        <Select
                            value={editForm.paymentStatus}
                            onValueChange={(val) => handleSelectChange("paymentStatus", val ?? "")}
                        >
                            <SelectTrigger className="h-9 w-full rounded-xl border-border bg-white dark:bg-black pl-3.5 text-sm shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20">
                                <SelectValue placeholder="Payment status" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    )
                }
                const paymentStatus = info.getValue() as PaymentStatus
                return (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${paymentStatus ? paymentStatusColors[paymentStatus] : "bg-gray-500/20 text-gray-700"
                            }`}
                    >
                        {paymentStatus?.replace("_", " ") || "N/A"}
                    </span>
                )
            },
            size: 150,
            minSize: 120,
            maxSize: 220,
        }),
        columnHelper.accessor("allOrders.created_at", {
            id: "createdAt",
            header: "Date Created",
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString("en-US") : "N/A"
            },
            size: 150,
            minSize: 100,
            maxSize: 180,
            enableResizing: false,
        }),
        columnHelper.display({
            id: "actions",
            header: () => (
                <div className="text-right px-2 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.4)]">
                    Actions
                </div>
            ),
            cell: (info) => {
                const item = info.row.original
                const orderId = item.allOrders.id
                const isEditing = editingId === item.allOrders.id
                if (isEditing) {
                    return (
                        <div className="inline-flex justify-center gap-0">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleSave(orderId, item.customer?.id)}
                                className="size-7 rounded-md border border-ink/20 bg-white dark:bg-zinc-800 hover:bg-ink/10 text-green-600 transition-all"
                                title="Save"
                            >
                                <Check className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setEditingId(null)}
                                className="size-7 rounded-md border ml-1 border-ink/20 bg-white dark:bg-zinc-800 hover:bg-ink/10 text-red-500 transition-all"
                                title="Cancel"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    )
                }
                return (
                    <div className="text-right whitespace-nowrap px-1">
                        <KebabMenu
                            groupClassName="flex flex-col gap-1.5"
                            afterSeparator={<Delete label="Delete Order" id={orderId} />}
                        >
                            <ShareQuoteButton label="Share Quote" orderId={orderId} />
                            <Button
                                type="button"
                                onClick={() => handleEditClick(item)}
                                className="h-7 inline-flex items-center justify-start gap-1.5 rounded-lg bg-white dark:bg-ink dark:hover:bg-muted-foreground/20 hover:bg-ink/10 text-ink dark:text-muted-foreground transition-all disabled:opacity-50 text-xs font-medium w-full"
                                title="Edit"
                            >
                                <Edit2 className="size-3.5 shrink-0" />
                                <span>Edit Order</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setSelectedOrder(item)}
                                className="h-7 inline-flex items-center justify-start gap-1.5 rounded-lg bg-white dark:bg-ink dark:hover:bg-muted-foreground/20 hover:bg-ink/10 text-ink dark:text-muted-foreground transition-all disabled:opacity-50 text-xs font-medium w-full"
                                aria-label="View Order Details"
                                title="View Details"
                            >
                                <LucideInfo className="size-3.5 text-ink dark:text-gray-400" />
                                <span>Details</span>
                            </Button>
                        </KebabMenu>
                    </div>
                )
            },
            size: 84,
            minSize: 84,
            maxSize: 100,
            enableResizing: false,
            enableSorting: false,
            enablePinning: false,
        }),
    ]