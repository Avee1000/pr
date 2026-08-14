'use client'

import { useState, useEffect, Suspense, use, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Filter from '@/components/global/Filter';
import { Loader } from 'lucide-react';
import { OrderRowsProps, Customer } from '@/lib/supabase/types';
import { toast } from 'sonner'
import Loading from '@/components/global/AnimateSpin';
import ViewSingleOrder from './ViewSingleOrder';
import { OrderState, updateOrder } from '@/lib/orders/action';
import { selectAllCustomers } from '@/lib/customers/action';
import { DataTable } from '@/components/dashboard/orders/edit/data-table';
import { getColumns, EditFormState } from './columns';

export const FilterList = [
    {
        title: "Order Status", label: "All Statuses", name: "status", id: "orderStatus",
        options: [
            { value: "all", label: "All Statuses" },
            { value: "quote_sent", label: "Quote Sent" },
            { value: "in_progress", label: "In Progress" },
            { value: "approved", label: "Approved" },
        ]
    },
    {
        title: "Payment Status", label: "All Payments", name: "payment_status", id: "paymentStatus",
        options: [
            { value: "all", label: "All Payments" },
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
        ]
    }
];


export default function ViewOrdersPage({ ordersPromise, }: {
    ordersPromise: Promise<OrderRowsProps[]>;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const statusFilterValue = searchParams.get('status') || 'all';
    const paymentFilterValue = searchParams.get('payment_status') || 'all';

    const handleRefresh = async () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    useEffect(() => {
        if (isRefreshing) {
            toast("Refreshing data...", {
                icon: <Loader className='animate-spin size-5' />
            })
        }
    }, [isRefreshing])

    return (
        <main className="">
            {/* <div className="rounded-lg mb-6 shadow-md/20 p-4 w-full box-border dark:bg-muted">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Orders</h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Review active client orders, monitor pricing adjustments, and update payment status from one place.
                        </p>
                    </div>
                </div>
            </div> */}

            <div className="shadow-md/20 rounded-lg w-full mb-6 p-2 box-border">
                <Filter filters={FilterList} />
            </div>

            <Suspense fallback={<Loading />}>
                <ViewOrders
                    ordersPromise={ordersPromise}
                    statusFilterValue={statusFilterValue}
                    paymentFilterValue={paymentFilterValue}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />
            </Suspense>
        </main >
    );
}

function ViewOrders({ ordersPromise, statusFilterValue, paymentFilterValue, onRefresh, isRefreshing }: {
    ordersPromise: Promise<OrderRowsProps[]>;
    statusFilterValue: string | undefined;
    paymentFilterValue: string | undefined;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}) {
    const orders = use(ordersPromise);
    const [selectedOrder, setSelectedOrder] = useState<OrderRowsProps | null>(null)

    const statusFilter = statusFilterValue?.trim().toLowerCase();
    const paymentFilter = paymentFilterValue?.trim().toLowerCase();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [customerOpen, setCustomerOpen] = useState(false);
    const [customerId, setCustomerId] = useState("");
    const [allCustomers, setAllCustomers] = useState<Customer[] | null>(null);
    const initialState: OrderState = { message: null, errors: {} };

    const [editForm, setEditForm] = useState<EditFormState>({
        customerName: '',
        description: '',
        price: '',
        status: '',
        paymentStatus: '',
    });

    const selectedCustomer = useMemo(() => allCustomers?.find((c) => c.id === customerId), [allCustomers, customerId]);

    useEffect(() => {
        const fetchCustomers = async () => {
            const data = await selectAllCustomers();
            setAllCustomers(data);
        };
        fetchCustomers();
    }, []);

    const handleEditClick = useCallback((order: OrderRowsProps) => {
        setEditingId(order.allOrders.id);
        setCustomerId(order.customer?.id || "");
        setEditForm({
            customerName: order.customer?.name || '',
            description: order.allOrders.description || '',
            price: order.allOrders.price?.toString() || '',
            status: order.allOrders.status || '',
            paymentStatus: order.allOrders.payment_status || '',
        });
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback((field: string, value: string | null) => {
        setEditForm((prev) => ({ ...prev, [field]: value ?? '' }));
    }, []);

    const handleSave = useCallback(async (id: string, initialCustomerId: string) => {
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
            const result = await updateOrder(id, initialState, formData);

            if (result?.success) {
                toast.success("Order updated successfully!", { id: toastId });
                setEditingId(null);
                setCustomerId("");
            } else {
                console.error("Validation Errors:", result?.errors);
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
    }, [editForm, customerId]);

    const filtered = useMemo(() => orders.filter((item) => {
        const order = item.allOrders;

        const matchesStatus = statusFilter === 'all' || (order.status && order.status.toLowerCase() === statusFilter);
        const matchesPayment = paymentFilter === 'all' || (order.payment_status && order.payment_status.toLowerCase() === paymentFilter);

        return matchesStatus && matchesPayment;
    }), [orders, statusFilter, paymentFilter]);

    const columns = useMemo(() => getColumns({
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
    }), [editingId, editForm, customerOpen, customerId, allCustomers, handleSave, handleEditClick, selectedCustomer, handleChange, handleSelectChange]);

    const globalFilterFn = useCallback((row: any, _columnId: any, filterValue: any) => {
        const query = String(filterValue ?? "").toLowerCase().trim()
        if (!query) return true

        const item = row.original
        const order = item.allOrders
        const dateString = order.created_at
            ? new Date(order.created_at).toLocaleDateString('en-US')
            : ''

        return (
            order.description?.toLowerCase().includes(query) ||
            order.status?.toLowerCase().includes(query) ||
            dateString.toLowerCase().includes(query) ||
            item.customer.name?.toLowerCase().includes(query)
        )
    }, []);

    return (
        <>
            <DataTable
                columns={columns}
                data={filtered}
                globalFilterFn={globalFilterFn}
                initialColumnPinning={{ start: [], end: ['actions'] }}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
            />
            <ViewSingleOrder
                orderData={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </>
    )
}
