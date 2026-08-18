import OrderFormPage from "@/components/dashboard/orders/create/ViewPage";
import Link from "next/link";

export default async function OrderPage() {

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-sm:py-5">
      <div className="mb-8 max-sm:ml-2 max-sm:text-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 max-sm:text-xs!">
          <span><Link href={"/dashboard"} className="underline underline-offset-2">Dashboard</Link></span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Create Orders</span>
        </div>
        <h1 className="font-heading text-3xl max-sm:text-2xl font-bold tracking-tight text-foreground">
          Create New Order
        </h1>
        <p className="text-muted-foreground">
          Capture client requirements and generate a quote.
        </p>
      </div>

      <div className="rounded-2xl sm:border sm:border-border sm:shadow-sm">
        <div className="px-2 sm:px-8 py-6">
          <OrderFormPage />
        </div>
      </div>
    </div>
  );
}
