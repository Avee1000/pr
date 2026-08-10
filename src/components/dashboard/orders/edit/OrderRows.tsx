'use client';

import Link from 'next/link';
import { OrderRowsProps, Customer } from '@/lib/supabase/types';
import { Edit2, Check, X, ChevronsUpDown, LucideInfo } from 'lucide-react';
import Delete from '../edit/DeleteOrder';
import { orderStatusColors, paymentStatusColors } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { selectAllCustomers } from '@/lib/customers/action';
import { cn } from "@/lib/utils";
import { OrderState, updateOrder } from '@/lib/orders/action';
import { ShareQuoteButton } from '@/components/orders/ShareQuoteButton';
import { toast } from 'sonner';

export default function OrderRows({
    orders,
    searchQuery,
    statusFilterValue,
    paymentFilterValue,
    visibleColumns,
    onViewOrder,
}: {
    orders: OrderRowsProps[];
    searchQuery: string;
    statusFilterValue: string | undefined;
    paymentFilterValue: string | undefined;
    visibleColumns: {
        customer: boolean,
        description: boolean,
        price: boolean,
        dueDate: boolean,
        status: boolean,
        paymentStatus: boolean,
        actions: boolean,
        createdAt: boolean,
    };
    onViewOrder: (order: OrderRowsProps) => void;
}) {
    const q = searchQuery.trim().toLowerCase();
    const statusFilter = statusFilterValue?.trim().toLowerCase();
    const paymentFilter = paymentFilterValue?.trim().toLowerCase();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [customerOpen, setCustomerOpen] = useState(false);
    const [customerId, setCustomerId] = useState("");
    const [allCustomers, setAllCustomers] = useState<Customer[] | null>(null);
    const initialState: OrderState = { message: null, errors: {} };

    const [editForm, setEditForm] = useState({
        customerName: '',
        description: '',
        price: '',
        status: '',
        paymentStatus: '',
    });


    const selectedCustomer = allCustomers?.find((c) => c.id === customerId);

    // let filtered;
    // filtered = q
    //     ? orders.filter((item) => {
    //         const order = item.allOrders;
    //         const dateString = order.created_at
    //             ? new Date(order.created_at).toLocaleDateString('en-US')
    //             : '';

    //         return (
    //             order.description?.toLowerCase().includes(q) ||
    //             order.status?.toLowerCase().includes(q) ||
    //             dateString.toLowerCase().includes(q) ||
    //             item.customer.name?.toLowerCase().includes(q)
    //         );
    //     })
    //     : orders;
    const filtered = orders.filter((item) => {
        const order = item.allOrders;
        const dateString = order.created_at
            ? new Date(order.created_at).toLocaleDateString('en-US')
            : '';

        // Search query match
        const matchesSearch = !q || (
            order.description?.toLowerCase().includes(q) ||
            order.status?.toLowerCase().includes(q) ||
            dateString.toLowerCase().includes(q) ||
            item.customer.name?.toLowerCase().includes(q)
        );

        // Filter value match
        const matchesStatus = statusFilter === 'all' || (order.status && order.status.toLowerCase() === statusFilter);
        const matchesPayment = paymentFilter === 'all' || (order.payment_status && order.payment_status.toLowerCase() === paymentFilter);

        const matchesFilter = matchesStatus && matchesPayment;

        return matchesSearch && matchesFilter;
    });


    // Fetch customers on mount
    useEffect(() => {
        const fetchCustomers = async () => {
            const data = await selectAllCustomers();
            setAllCustomers(data);
        };
        fetchCustomers();
    }, []);

    // Handle entering edit mode
    const handleEditClick = (order: OrderRowsProps) => {
        setEditingId(order.allOrders.id);
        setCustomerId(order.customer?.id || "");
        setEditForm({
            customerName: order.customer?.name || '',
            description: order.allOrders.description || '',
            price: order.allOrders.price?.toString() || '',
            status: order.allOrders.status || '',
            paymentStatus: order.allOrders.payment_status || '',
        });
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: string, value: string | null) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    // Handle saving row updates explicitly on user action
    const handleSave = async (id: string, initialCustomerId: string, prevState: OrderState = initialState) => {
        const formData = new FormData();
        formData.append('description', editForm.description);
        formData.append('price', editForm.price);
        formData.append('status', editForm.status);
        formData.append('payment_status', editForm.paymentStatus);

        const targetCustomerId = customerId || initialCustomerId;
        formData.append('customer_id', targetCustomerId);
        formData.append('due_date', " ");
        const toastId = toast.loading("Updating order...");

        try {
            // Pass prevState here instead of null as any
            const result = await updateOrder(id, prevState, formData);

            if (result?.success) {
                toast.success("Order updated successfully!", { id: toastId });
                setEditingId(null);
                setCustomerId("");
            } else {
                console.error("Validation Errors:", result?.errors);
                // if (result?.errors) {
                //     const errorList = Object.values(result.errors)
                //         .flat()
                //         .map(err => `• ${err}`)
                //         .join("\n");
                //     if (errorList) {
                //         errorMessage = `${errorMessage}\n${errorList}`;
                //     }
                // }
                const errorContent = (
                    <div>
                        <p className="font-semibold">{result?.message || "Failed to update order."}</p>
                        {result?.errors && (
                            <ul className="list-disc pl-4 mt-1 text-sm">
                                {Object.values(result.errors)
                                    .flat()
                                    .map((err, index) => (
                                        <li key={index}>{err}</li>
                                    ))}
                            </ul>
                        )}
                    </div>
                );
                toast.error(errorContent, { id: toastId });
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("An unexpected error occurred.", { id: toastId });
        }
    };

    if (filtered.length === 0) {
        return (
            <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="p-6 text-center">
                    No orders found matching your criteria.
                </td>
            </tr>
        );
    }

    return (
        <>
            {filtered.map((item) => {
                const orderId = item.allOrders.id;
                const isEditing = editingId === orderId;

                return (
                    <tr key={orderId} className="hover:bg-ink/5 transition-colors">
                        {/* Customer Column */}
                        {visibleColumns.customer && (
                            <td className="p-3">
                                {isEditing ? (
                                    <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                        <PopoverTrigger
                                            render={<Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={customerOpen}
                                                className="w-80 justify-between rounded-xl border-border bg-white px-3.5 text-sm font-normal shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20"
                                            >
                                                <span className="truncate">
                                                    {selectedCustomer?.name
                                                        ? `${selectedCustomer.name} ${selectedCustomer.email ? `(${selectedCustomer.email})` : ""}`
                                                        : editForm.customerName
                                                            ? editForm.customerName
                                                            : "Search or select a customer..."
                                                    }
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>}>
                                        </PopoverTrigger>
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
                                                                    handleSelectChange('customerName', customer.name);
                                                                    setCustomerId(customer.id);
                                                                    setCustomerOpen(false);
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
                                ) : (
                                    <div className="font-medium">
                                        <div className="text-ink dark:text-white font-semibold">{item.customer?.name}</div>
                                        {item.customer?.email && (
                                            <div className="text-ink/60 dark:text-gray-400 text-[10px]">{item.customer?.email}</div>
                                        )}
                                    </div>
                                )}
                            </td>
                        )}

                        {/* Description Column */}
                        {visibleColumns.description && (
                            <td className="p-3 text-ink/80 dark:text-gray-400 md:table-cell max-w-50 truncate">
                                {isEditing ? (
                                    <Popover>
                                        <PopoverTrigger
                                            render={<Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={customerOpen}
                                                className="w-full justify-between rounded-xl border-border bg-white px-3.5 text-sm font-normal shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20"
                                            >
                                                <span className="truncate">
                                                    {selectedCustomer?.name
                                                        ? editForm.description
                                                        : "Search or select a customer..."
                                                    }
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>}></PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border-none shadow-none rounded-xl">
                                            <textarea
                                                name="description"
                                                value={editForm.description}
                                                onChange={handleChange}
                                                rows={6}
                                                cols={40}
                                                className="scrollbar-none w-full p-1 px-2 border rounded-xl resize-none"
                                            ></textarea>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    item.allOrders.description
                                )}
                            </td>
                        )}

                        {/* Price Column */}
                        {visibleColumns.price && (
                            <td className="p-3 font-medium tabular-nums text-ink dark:text-gray-200">
                                {isEditing ? (
                                    <input
                                        type="number"
                                        name="price"
                                        value={editForm.price}
                                        onChange={handleChange}
                                        className="w-20 p-1 h-9 border rounded-xl dark:bg-gray-800 dark:text-white"
                                    />
                                ) : (
                                    `$${item.allOrders.price.toFixed(2)}`
                                )}
                            </td>
                        )}

                        {/* Due Date Column */}
                        {visibleColumns.dueDate && (
                            <td className="p-3 text-ink/80 tabular-nums sm:table-cell dark:text-gray-400">
                                {item.allOrders.due_date}
                            </td>
                        )}

                        {/* Status Column */}
                        {visibleColumns.status && (
                            <td className="p-3">
                                {isEditing ? (
                                    <Select
                                        value={editForm.status}
                                        onValueChange={(value) => handleSelectChange('status', value ?? '')}
                                    >
                                        <SelectTrigger className="h-12 w-full rounded-xl border-border bg-white pl-3.5 text-sm shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent alignItemWithTrigger={false}>
                                            <SelectItem value="quote_sent">Quote Sent</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${orderStatusColors[item.allOrders.status] || 'bg-gray-500/20 text-gray-700'}`}>
                                        {item.allOrders.status?.replace('_', ' ')}
                                    </span>
                                )}
                            </td>
                        )}

                        {/* Payment Status Column */}
                        {visibleColumns.paymentStatus && (
                            <td className="p-3">
                                {isEditing ? (
                                    <Select
                                        value={editForm.paymentStatus}
                                        onValueChange={(val) => handleSelectChange('paymentStatus', val ?? '')}
                                    >
                                        <SelectTrigger className="h-12 w-full rounded-xl border-border bg-white pl-3.5 text-sm shadow-xs transition-all hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20">
                                            <SelectValue placeholder="Payment status" />
                                        </SelectTrigger>
                                        <SelectContent alignItemWithTrigger={false}>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${item.allOrders.payment_status ? paymentStatusColors[item.allOrders.payment_status] : 'bg-gray-500/20 text-gray-700'}`}>
                                        {item.allOrders.payment_status?.replace('_', ' ') || 'N/A'}
                                    </span>
                                )}
                            </td>
                        )}

                        {/* Created At Column */}
                        {visibleColumns.createdAt && (
                            <td className="p-3 text-ink/80 truncate tabular-nums dark:text-gray-400 sm:table-cell">
                                {item.allOrders.created_at
                                    ? new Date(item.allOrders.created_at).toLocaleDateString('en-US')
                                    : 'N/A'}
                            </td>
                        )}

                        {/* Actions Column */}
                        {visibleColumns.actions && (
                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                                {isEditing ? (
                                    <div className="inline-flex space-x-1">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => handleSave(orderId, item.customer?.id)}
                                            className="size-7 rounded-md border border-ink/20 bg-white hover:bg-ink/10 text-green-600 transition-all"
                                            title="Save"
                                        >
                                            <Check className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setEditingId(null)}
                                            className="size-7 rounded-md border border-ink/20 bg-white hover:bg-ink/10 text-red-500 transition-all"
                                            title="Cancel"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <ShareQuoteButton orderId={orderId} />
                                        <Button
                                            type="button"
                                            onClick={() => handleEditClick(item)}
                                            className="inline-flex items-center justify-center size-7 rounded-lg border border-ink/20 bg-white hover:bg-ink/10 text-ink dark:text-gray-400 transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 className="size-3.5" />
                                        </Button>
                                        <Delete id={orderId} />
                                        <Button
                                            type="button"
                                            onClick={() => onViewOrder(item)}
                                            className="inline-flex items-center justify-center size-7 rounded-lg border border-ink/20 bg-white hover:bg-ink/10 text-ink dark:text-gray-400 transition-all"
                                            aria-label="View Order Details"
                                            title="View Details"
                                        >
                                            <LucideInfo className="size-3.5 text-ink dark:text-gray-400" />
                                        </Button>
                                    </>
                                )}
                            </td>
                        )}
                    </tr>
                );
            })}
        </>
    );
}