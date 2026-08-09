// server/src/models/pdf-model.ts
import { createSupabaseClient } from '../database';

export interface QuoteData {
    quoteStatus: 'pending' | 'approved';
    approvedAt: string | null;
    orderDescription: string;
    quoteId: string;
    price: number;
    dueDate: string;
    orderStatus: string;
    customerName: string;
}

// Shape returned by the get_quote_by_id SQL function
interface RpcQuoteRow {
    quote_status: 'pending' | 'approved';
    approved_at: string | null;
    order_description: string | null;
    quote_id: string;
    order_price: number | string;
    order_due_date: string | null;
    order_status: string | null;
    customer_name: string | null;
}

export const getQuoteByQuoteId = async (
    quoteId: string,
    accessToken: string
) => {
    const supabase = createSupabaseClient(accessToken);
    const { data, error } = await supabase
        .rpc('get_quote_by_id', { p_quote_id: quoteId })
        .maybeSingle<RpcQuoteRow>();

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    return {
        quoteStatus: data.quote_status,
        approvedAt: data.approved_at,
        quoteId: data.quote_id,
        orderDescription: data.order_description ?? '',
        price: Number(data.order_price) || 0,
        dueDate: data.order_due_date ?? '',
        orderStatus: data.order_status ?? '',
        customerName: data.customer_name ?? 'N/A',
    };
};

export interface Customer {
    id: string;
    name: string;
    email?: string;
    created_at: string;
    user_id: string;
}

export const getAllCustomers = async (userId: string, accessToken: string): Promise<Customer[]> => {
    const supabase = createSupabaseClient(accessToken);
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }

    return (data as Customer[]) ?? [];
};
