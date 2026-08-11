import { createClient } from '@/lib/supabase/server';
import { getCache, setCache, CacheKeys, TTL_SECONDS } from '@/lib/redis/cache';

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

export const getQuoteByQuoteId = async (quoteId: string): Promise<QuoteData | null> => {
  const cacheKey = CacheKeys.quote(quoteId);

  const cached = await getCache<QuoteData>(cacheKey);
  if (cached !== null) return cached;

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_quote_by_id', { p_quote_id: quoteId })
    .maybeSingle<RpcQuoteRow>();

  if (error) throw error;
  if (!data) return null;

  const result = {
    quoteStatus: data.quote_status,
    approvedAt: data.approved_at,
    quoteId: data.quote_id,
    orderDescription: data.order_description ?? '',
    price: Number(data.order_price) || 0,
    dueDate: data.order_due_date ?? '',
    orderStatus: data.order_status ?? '',
    customerName: data.customer_name ?? 'N/A',
  };

  await setCache(cacheKey, result, TTL_SECONDS.LONG);
  return result;
};