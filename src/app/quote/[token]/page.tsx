import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import QuoteAccessGate from "@/components/quote/CustomerVerification";
import { QuoteView, type QuoteData } from "@/components/quote/QuoteView";
import { ApproveQuoteButton } from "@/components/quote/ApproveQuoteButton";
import { EmptyState } from "@/components/feedback/empty";
import { FilePlus, Loader2 } from "lucide-react";
import { isQuoteVerified } from "@/lib/cookies/auth-cookie";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function QuotePage({ params }: PageProps) {
  const { token } = await params;
  const isVerified = await isQuoteVerified(token);

  // 1. Unverified -> Render Access Gate
  if (!isVerified) {
    return <QuoteAccessGate token={token} />;
  }

  // 2. Verified -> Stream quote details behind Suspense
  return (
    <Suspense fallback={<QuoteLoader />}>
      <QuoteContent token={token} />
    </Suspense>
  );
}

// Inner async component that performs the DB query
async function QuoteContent({ token }: { token: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_quote_by_token", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;

  if (error || !row) {
    return (
      <div className="max-w-2xl flex items-center justify-center mx-auto text-center in-[body_&]:h-[60dvh]">
        <EmptyState
          icon={<FilePlus className="size-6 text-ink dark:text-muted-foreground/50" />}
          title={error?.message || "Quote not found or link expired."}
          description="Reach out to the vendor for a new link or assistance"
        />
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

// Suspense Fallback Loader
function QuoteLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
      <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" />
      <p className="text-sm font-medium text-muted-foreground">
        Verification successful! Fetching quote details...
      </p>
    </div>
  );
}