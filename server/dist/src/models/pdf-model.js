"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCustomers = exports.getQuoteByQuoteId = void 0;
// server/src/models/pdf-model.ts
const database_1 = require("../database");
const getQuoteByQuoteId = async (quoteId, accessToken) => {
    const supabase = (0, database_1.createSupabaseClient)(accessToken);
    const { data, error } = await supabase
        .rpc('get_quote_by_id', { p_quote_id: quoteId })
        .maybeSingle();
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
exports.getQuoteByQuoteId = getQuoteByQuoteId;
const getAllCustomers = async (userId, accessToken) => {
    const supabase = (0, database_1.createSupabaseClient)(accessToken);
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
    return data ?? [];
};
exports.getAllCustomers = getAllCustomers;
