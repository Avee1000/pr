import { Customer } from "@/lib/types/dashBoardTypes";
import { selectOneCustomer, updateCustomer } from "@/lib/customers/action";
import EditCustomerForm from "@/components/dashboard/customers/edit/EditCustomerForm";

interface PageProps {
    params: Promise<{ id?: string }>;
}

async function fetchCustomers(params: PageProps['params']): Promise<Customer | null> {
    const resolvedParams = await params;
    const customerId = resolvedParams?.id;
    if (!customerId) return null;
    const customer = await selectOneCustomer(customerId);
    return customer as Customer;
}

export default async function EditCustomersPage({ params }: PageProps) {
    // Pass the params promise into your fetch function
    const customer = await fetchCustomers(params);

    return (
    <div className="max-w-full">
        {customer ? (
            <EditCustomerForm action={updateCustomer.bind(null, customer.id)} customer={customer} />
        ) : (
            <p>Customer not found.</p>
        )}
    </div>
    );
}