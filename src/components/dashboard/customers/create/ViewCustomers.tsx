'use client';

import { Suspense, use, useState } from 'react';
import Loading from '@/components/global/AnimateSpin';
import { Customer } from '@/lib/types/dashBoardTypes';
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { MobileCustomerCard } from './MobileCustomerCard';
import { MobileCustomerCardSkeleton } from './MobileCustomerCard';
import { Input } from "@/components/ui/input";

export default function ViewCustomers({
    customersPromise,
}: {
    customersPromise: Promise<Customer[]>;
}) {
    return (
        <main>
            <Suspense fallback={<ViewCustomersSkeleton />}>
                <CustomersContent customersPromise={customersPromise} />
            </Suspense>
        </main>
    );
}

// 1. The main data consumer component (fetches/unwraps once)
function CustomersContent({ customersPromise }: { customersPromise: Promise<Customer[]>; }) {
    const customers = use(customersPromise);
    const [mobileSearchQuery, setMobileSearchQuery] = useState("");

    const filteredCustomers = customers.filter((customer) => {
        const query = mobileSearchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            customer.name?.toLowerCase().includes(query) ||
            customer.email?.toLowerCase().includes(query) ||
            customer.country?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="sm:rounded-xl sm:border sm:border-ink/10 sm:dark:border-muted-foreground/40 sm:shadow-sm box-border flex flex-col overflow-hidden">
            <div className="hidden md:block">
                <DataTable columns={columns} data={customers} />
            </div>

            <div className="block md:hidden sm:p-4 space-y-4">
                <div className="w-full hidden">
                    <Input
                        placeholder="Filter name, email, country..."
                        value={mobileSearchQuery}
                        onChange={(event) => setMobileSearchQuery(event.target.value)}
                        className="w-full dark:bg-ink"
                    />
                </div>

                <div className="space-y-3">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                            <MobileCustomerCard key={customer.id} customer={customer} />
                        ))
                    ) : (
                        <div className="h-24 flex items-center justify-center text-center text-muted-foreground text-sm border rounded-xl p-4">
                            No Customers found. Refresh or create a new Customer.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ViewCustomersSkeleton() {
    return (
        <div className="rounded-xl border border-ink/10 dark:border-muted-foreground p-4  md:p-2 space-y-4 overflow-hidden">
            <div className='block md:flex md:flex-row md:justify-between'>
                <div className="h-9 bg-ink/10 dark:bg-white/10 rounded-lg w-full max-w-sm animate-pulse" />
                <div className=' w-70 flex flex-row justify-end space-x-2  max-sm:hidden'>
                    <div className="h-9 w-10.5 bg-ink/10 dark:bg-white/10 rounded-lg max-w-sm animate-pulse"/>
                    <div className="h-9 w-26.5 bg-ink/10 dark:bg-white/10 rounded-lg max-w-sm animate-pulse"/>
                </div>
            </div>

            <div className="hidden md:block space-y-2 mb-0">
                <div className="h-8 bg-ink/10 dark:bg-white/10 rounded-lg w-full animate-pulse" />
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 bg-ink/5 dark:bg-white/5 rounded-lg w-full animate-pulse flex items-center px-4 gap-2">
                        <div className="h-4 bg-ink/10 dark:bg-white/10 rounded w-1/4" />
                        <div className="h-4 bg-ink/10 dark:bg-white/10 rounded w-1/4" />
                        <div className="h-4 bg-ink/10 dark:bg-white/10 rounded w-1/4" />
                        <div className="h-4 bg-ink/10 dark:bg-white/10 rounded w-1/4" />
                    </div>
                ))}
            </div>

            <div className="block md:hidden space-y-3">
                {[...Array(3)].map((_, i) => (
                    <MobileCustomerCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}