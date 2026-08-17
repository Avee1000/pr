import { Customer } from '@/lib/types/dashBoardTypes';
import { selectAllCustomers } from '@/lib/customers/action';

export default async function getCustomers(): Promise<Customer[]> {
    const customers = await selectAllCustomers();
    return (customers ?? []) as Customer[];
}