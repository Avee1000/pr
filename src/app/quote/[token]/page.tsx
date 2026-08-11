import { createClient } from "@/lib/supabase/server";
import { QuoteView, type QuoteData } from "@/components/orders/QuoteView";
import { ApproveQuoteButton } from "@/components/orders/ApproveQuoteButton";
import { EmptyState } from "@/components/feedback/empty";
import { FilePlus, SearchX, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCache, setCache, CacheKeys, TTL_SECONDS } from "@/lib/redis/cache";
interface QuotePageProps {
  params: Promise<{ token: string }>;
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const cacheKey = CacheKeys.quote(token);

  const cached = await getCache<QuoteData>(cacheKey);
  if (cached) {
    return (
      <QuoteView quote={cached}>
        <ApproveQuoteButton token={token} />
      </QuoteView>
    );
  }

  const { data, error } = await supabase.rpc("get_quote_by_token", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) {
    return (
      <div className="max-w-2xl flex items-center justify-center mx-auto text-center in-[body_&]:h-[60dvh] ">
        <div>
          <EmptyState
            icon={<FilePlus className="size-6 text-ink dark:text-muted-foreground/50" />}
            title="Quote not found or link expired."
            description="Reach out to the vendor for a new link or assistance"
          />
        </div>
      </div>
    );
  }

  const quote: QuoteData = {
    quoteId: row.order_id,
    quoteStatus: row.quote_status,
    approvedAt: row.approved_at,
    description: row.order_description,
    price: row.order_price,
    dueDate: row.order_due_date,
    orderStatus: row.order_status,
    customerName: row.customer_name,
  };

  await setCache(cacheKey, quote, TTL_SECONDS.LONG);

  return (
    <QuoteView quote={quote}>
      <ApproveQuoteButton token={token} />
    </QuoteView>
  );
}
