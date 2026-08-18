import { Customer } from '@/lib/types/dashBoardTypes';
import { selectAllCustomers } from '@/lib/customers/action';

export default async function getCustomers(): Promise<Customer[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const customers = await selectAllCustomers();
    return (customers ?? []) as Customer[];
}