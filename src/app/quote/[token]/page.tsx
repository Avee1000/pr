import { createClient } from "@/lib/supabase/server";
import { QuoteView, type QuoteData } from "@/components/orders/QuoteView";
import { ApproveQuoteButton } from "@/components/orders/ApproveQuoteButton";

interface QuotePageProps {
  params: Promise<{ token: string }>;
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_quote_by_token", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center">
        <p className="text-ink/70">Quote not found or link expired.</p>
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

  return (
    <QuoteView quote={quote}>
      <ApproveQuoteButton token={token} />
    </QuoteView>
  );
}
