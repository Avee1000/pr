import Link from "next/link";
import OrderBoard, { BoardCard } from "@/components/dashboard/orders/board/OrderBoard";
import { selectAllOrders } from "@/lib/orders/action";
import { OrderStatus, PaymentStatus, Order } from "@/lib/types/dashBoardTypes";
import Information from "@/components/global/Information";

export default async function OrderBoardPage() {
  const orders = await selectAllOrders();

  const cards: BoardCard[] = (orders ?? []).map((order: any) => ({
    id: String(order.allOrders.id),
    description: order.allOrders.description ?? "Untitled order",
    price: Number(order.allOrders.price ?? 0),
    dueDate: order.allOrders.due_date ?? null,
    paymentStatus: (order.allOrders.payment_status as PaymentStatus) ?? null,
    customerName: order.customer?.name ?? "Unknown customer",
    status: (order.allOrders.status as OrderStatus) ?? "quote_sent",
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-sm:px-5 max-sm:py-5">
      <div className="mb-8 max-sm:text-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground max-sm:text-xs! mb-2">
          <span>
            <Link href="/dashboard" className="underline underline-offset-2">
              Dashboard
            </Link>
          </span>
          <span className="text-border">/</span>
          <span>
            <Link href="/dashboard/orders" className="underline underline-offset-2">
              Orders
            </Link>
          </span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Board</span>
        </div>
        <h1 className="font-heading text-3xl max-sm:text-2xl  font-bold tracking-tight text-foreground">
          Order board <Information className="inline" detail={"Changes are saved right away and stay in place after a refresh."} />
        </h1>
        <p className="text-muted-foreground">
          Drag an order card to another stage to update its status.
        </p>
      </div>

      <OrderBoard initialCards={cards} />
    </div>
  );
}
