import { createClient } from "@/lib/supabase/server";

export interface CashFlowSummary {
  monthlyRevenue: number;
  receivablesTotal: number;
  receivablesCount: number;
  overdueTotal: number;
  overdueCount: number;
  hasAnyOrders: boolean;
}

const EMPTY_SUMMARY: CashFlowSummary = {
  monthlyRevenue: 0,
  receivablesTotal: 0,
  receivablesCount: 0,
  overdueTotal: 0,
  overdueCount: 0,
  hasAnyOrders: false,
};

export async function getCashFlowSummary(): Promise<CashFlowSummary> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return EMPTY_SUMMARY;
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("price, payment_status, due_date, paid_at")
    .eq("user_id", user.id);

  if (error || !orders) {
    console.error("Supabase select orders error (cash flow):", error);
    console.error(error)
    return EMPTY_SUMMARY;
  }

  if (orders.length === 0) {
    return EMPTY_SUMMARY;
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthlyRevenue = 0;
  let receivablesTotal = 0;
  let receivablesCount = 0;
  let overdueTotal = 0;
  let overdueCount = 0;

  for (const order of orders) {
    const price = Number(order.price ?? 0);

    if (order.payment_status === "paid") {
      if (order.paid_at) {
        const paidAt = new Date(order.paid_at);
        if (paidAt.getMonth() === currentMonth && paidAt.getFullYear() === currentYear) {
          monthlyRevenue += price;
        }
      }
      continue;
    }

    const dueDate = order.due_date ? new Date(order.due_date) : null;
    const isPastDue = dueDate !== null && dueDate.getTime() < now.getTime();

    if (order.payment_status === "overdue" || isPastDue) {
      overdueTotal += price;
      overdueCount += 1;
      continue;
    }

    receivablesTotal += price;
    receivablesCount += 1;
  }

  return {
    monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
    receivablesTotal: Number(receivablesTotal.toFixed(2)),
    receivablesCount,
    overdueTotal: Number(overdueTotal.toFixed(2)),
    overdueCount,
    hasAnyOrders: true,
  };
}
