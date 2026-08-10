import { StatusBadge } from "@/components/ui/StatusBadge";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";


export interface QuoteData {
  quoteStatus: "pending" | "approved";
  approvedAt: string | null;
  description: string;
  quoteId: string | number;
  price: number;
  dueDate: string;
  orderStatus: string;
  customerName: string;
}

interface QuoteViewProps {
  quote: QuoteData;
  children?: React.ReactNode;
}

export function QuoteView({ quote, children }: QuoteViewProps) {
  return (
    <div className="w-full h-[calc(100vh-20rem)] flex items-center max-w-2xl mx-auto p-6 sm:p-10">
      <div className="w-full rounded-xl border dark:border-ink-dark border-ink/10 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex flex-row w-full justify-between">
            <p className="text-sm text-ink/60 dark:text-muted-foreground/60">Quote for</p>
            <span title="Download Quote" className="cursor-pointer">
              <Link href={`/api/downloads/download-receipt/${quote.quoteId}`}
                target="_blank" rel="noopener noreferrer">
                <Download className="size-5" />
              </Link>
            </span>
          </div>
          <h1 className="font-heading max-w-[60%] text-2xl font-bold text-ink dark:text-muted-foreground">{quote.customerName}</h1>
        </div>

        <p className="text-ink/80  dark:text-muted-foreground">{quote.description}</p>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t dark:border-ink-dark border-ink/10 pt-6">
          <div>
            <p className="text-sm text-ink/60  dark:text-muted-foreground/60">Total price</p>
            <p className="text-2xl font-bold tabular-nums text-ink  dark:text-muted-foreground">${quote.price.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-ink/60  dark:text-muted-foreground/60">Due date</p>
            <p className="font-medium text-ink  dark:text-muted-foreground">{quote.dueDate}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t dark:border-ink-dark border-ink/10 pt-6">
          <StatusBadge status={quote.quoteStatus} />
          {quote.quoteStatus === "approved" ? (
            <p className="text-sm text-ink/60">
              Approved{quote.approvedAt ? ` on ${new Date(quote.approvedAt).toLocaleDateString()}` : ""}
            </p>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
