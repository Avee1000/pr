import { OrderRowsProps } from '@/lib/types/dashBoardTypes';
import { selectAllOrders } from '@/lib/orders/action';


// 1. Pure data-fetching function
export default async function getOrders(): Promise<OrderRowsProps[]> {
    const orders = await selectAllOrders();
    return orders ?? [] as OrderRowsProps[];
}