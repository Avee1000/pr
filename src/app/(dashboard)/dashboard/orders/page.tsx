import OrdersPage from "@/components/dashboard/orders/edit/ViewPage";
import Link from "next/link";
import { GripVertical } from "lucide-react";
import Information from "@/components/global/Information";

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-sm:px-5 max-sm:py-5">
      <div className="flex flex-row justify-between w-full max-sm:text-sm">
        <div className="mb-8 max-sm:ml-2">
          <div className="flex items-center gap-2 max-sm:text-xs! sm:text-sm text-muted-foreground mb-2">
            <span>
              <Link href="/dashboard" className="underline underline-offset-2">
                Dashboard
              </Link>
            </span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Orders</span>
          </div>
          <h1 className="font-heading text-3xl max-sm:text-2xl font-bold tracking-tight text-foreground">
            View & Adjust orders <Information detail={"While owners can edit price and payment status, customers will always have the most absolute control over their orders with the most accurate pricing and status information irrespective of future edits made by you or your organization."} />
          </h1>
          <p className="text-muted-foreground">
            Review active client orders, monitor <span>PriceRight</span> automated pricing
            rules, and manage adjustments.
          </p>
        </div>
      </div>

      <div className="inline-flex">
        <Link
          href="/dashboard/orders/board"
          className="mb-3 text-sm flex items-center underline underline-offset-3"
        >
          <GripVertical className="inline size-5 mr-1" /> Adjust Order Status
        </Link>
      </div>

      <div className="pt-2">
        <OrdersPage />
      </div>
    </div>
  );
}
