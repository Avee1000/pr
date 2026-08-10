'use client'

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Filter from '@/components/Filter';
import { Loader, RefreshCw, Columns } from 'lucide-react';
import { OrderRowsProps } from '@/lib/supabase/types';
import { toast } from 'sonner'
import Loading from '@/components/AnimateSpin';
import OrderRows from './OrderRows';
import useMediaQuery from '@/components/useMediaQuery';
import ViewSingleOrder from './ViewSingleOrder';

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

export default function ViewOrders({ ordersPromise, onDelete, }: {
    ordersPromise: Promise<OrderRowsProps[]>;
    onDelete?: () => void;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statusFilterValue, seStatusFilterValue] = useState('all');
    const [paymentFilterValue, setPaymentFilterValue] = useState('all');

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
    // const handleNavigation = () => {
    //     router.push('/dashboard/orders');
    // };

    // const handleDelete = (id: string) => {
    //     setOrders(orders.filter(order => order.id !== id));
    // };

    // const filteredOrders = orders.filter(order =>
    //     order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     order.description.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.has('status') || params.has('payment_status')) {
            seStatusFilterValue(params.get('status') || 'all');
            setPaymentFilterValue(params.get('payment_status') || 'all');
        } else {
            seStatusFilterValue('all');
            setPaymentFilterValue('all');
        }
    }, [searchParams])

    return (
        <main className="">
            {/* Top Control Bar: Search & Refresh — renders immediately, never suspends */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center rounded-lg mb-6 shadow-md/20 p-4 w-full box-border dark:bg-muted">
                <div id="searchBoxContainer" className="w-full sm:flex-1 sm:max-w-[50%]">
                    <div className="searchContainer flex items-center justify-between gap-2 h-9 w-full">
                        <input
                            type="search"
                            id="search"
                            name="q"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, country, or date..."
                            className="dark:bg-ink w-full h-full text-xs rounded-lg border outline-none px-3 placeholder:opacity-40 focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm"
                        />
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-ink/20 bg-white hover:bg-ink/5 dark:bg-muted dark:border-muted-foreground text-sm font-medium disabled:opacity-50"
                >
                    <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>
            {/* Filter Component Section */}
            <div className="bg-muted shadow-md/20 rounded-lg w-full mb-6 p-2 box-border">
                <Filter filters={FilterList} />
            </div>

            <Suspense fallback={<Loading />}>
                <OrdersTable ordersPromise={ordersPromise} searchQuery={searchQuery} onDelete={() => onDelete} statusFilterValue={statusFilterValue} paymentFilterValue={paymentFilterValue} />
            </Suspense>
        </main >
    );
}

function OrdersTable({ ordersPromise, searchQuery, statusFilterValue, paymentFilterValue, onDelete }: {
    ordersPromise: Promise<OrderRowsProps[]>;
    searchQuery: string;
    statusFilterValue: string | undefined;
    paymentFilterValue: string | undefined;
    onDelete?: (orderId: string) => void;
}) {
    const orders = use(ordersPromise);
    const [selectedOrder, setSelectedOrder] = useState<OrderRowsProps | null>(null);
    const [visibleColumns, setVisibleColumns] = useState({
        customer: true,
        description: true,
        price: true,
        dueDate: true,
        status: true,
        paymentStatus: true,
        actions: true,
        createdAt: true,
    });
    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        if (isMobile) {
            setVisibleColumns((prev) => ({
                ...prev,
                description: false,
                dueDate: false,
                createdAt: false,
                // Keep actions visible so Share / Edit / Delete work on mobile.
                actions: true,
            }));
        }
    }, [isMobile]);

    const toggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
    };

    return (
        <div className="rounded-xl border border-ink/10 shadow-sm box-border flex flex-col">
            {/* Columns Toggle Bar - separated from overflow-hidden container */}
            <div className="p-3 border-b border-ink/10 dark:border dark:rounded-t-xl dark:border-muted-foreground relative">
                <details className="relative inline-block text-left">
                    <summary className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white dark:bg-muted shadow-sm px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand">
                        <Columns className='size-4' /> Columns
                    </summary>
                    <div className="absolute left-0 mt-2 w-56 rounded-md shadow-xl bg-white dark:bg-ink ring-1 ring-black ring-opacity-5 z-30 max-h-60 overflow-y-auto scrollbar-thin">
                        <div className="py-1" role="menu">
                            {Object.keys(visibleColumns).map((column) => (
                                <label key={column} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-muted cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mr-2 rounded border-gray-300 text-brand focus:ring-brand"
                                        checked={visibleColumns[column as keyof typeof visibleColumns]}
                                        onChange={() => toggleColumn(column as keyof typeof visibleColumns)}
                                    />
                                    {column.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                                </label>
                            ))}
                        </div>
                    </div>
                </details>
            </div>

            {/* Scrollable Table Container */}
            <div className="max-h-170 overflow-y-auto overflow-x-auto scroll-fade-x scrollbar-thin scroll-smooth">
                <table className="w-full text-left border-collapse text-sm table-auto">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-ink/10 dark:bg-muted dark:text-gray-400 bg-ink/5 font-semibold">
                            {visibleColumns.customer && <th className="p-3">Customer</th>}
                            {visibleColumns.description && <th className="p-3 md:table-cell truncate">Description</th>}
                            {visibleColumns.price && <th className="p-3 sm:table-cell truncate">Price</th>}
                            {visibleColumns.dueDate && <th className="p-3 truncate">Due Date</th>}
                            {visibleColumns.status && <th className="p-3">Status</th>}
                            {visibleColumns.paymentStatus && <th className="p-3 truncate">Payment Status</th>}
                            {visibleColumns.createdAt && <th className="p-3 text-left truncate">Date Created</th>}
                            {visibleColumns.actions && <th className="p-3 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10 truncate">
                        <OrderRows
                            orders={orders}
                            searchQuery={searchQuery}
                            visibleColumns={visibleColumns}
                            statusFilterValue={statusFilterValue}
                            paymentFilterValue={paymentFilterValue}
                            onViewOrder={(order) => setSelectedOrder(order)}
                        />
                    </tbody>
                </table>
            </div>
            {/* ViewSingleOrder Drawer rendered at top-level outside the table container */}
            <ViewSingleOrder
                orderData={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    )
}