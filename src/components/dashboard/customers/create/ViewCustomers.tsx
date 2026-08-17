'use client';

import { Suspense, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/global/AnimateSpin';
import { Customer } from '@/lib/types/dashBoardTypes';
import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function ViewCustomers({
    customersPromise,
}: {
    customersPromise: Promise<Customer[]>;
    onDelete?: () => void;
}) {
    return (
        <main>
            {/* Orders Table — only this section suspends while data loads.
                    `use(promise)` triggers the Suspense fallback until the data resolves. */}
            <Suspense fallback={<Loading />}>
                <CustomersTable customersPromise={customersPromise} />
            </Suspense>
        </main>
    );
}

function CustomersTable({
    customersPromise,
}: {
    customersPromise: Promise<Customer[]>;
}) {
    const customers = use(customersPromise);

    return (
        <div className="rounded-xl border border-ink/10 shadow-sm box-border max-h-170 flex flex-col overflow-hidden">
            <div className=" box-border">
                {/* <DataTable
                    columns={columns}
                    data={customers}
                    searchQuery={searchQuery}
                    visibleColumns={visibleColumns} // { name: true, country: true, ... }
                /> */} 
                <DataTable columns={columns} data={customers} />
            </div>
        </div>
    );
}