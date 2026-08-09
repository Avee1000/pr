import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCashFlowSummary } from "@/lib/dashboard/cashflow";

export default async function CashFlowSummary() {
  const summary = await getCashFlowSummary();

  if (!summary.hasAnyOrders) {
    return (
      <Card className="sm:max-w-7xl mx-auto mb-6">
        <CardContent className="text-sm text-muted-foreground">
          No orders yet. Cash flow summaries will show up here once you create your first order.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:max-w-7xl mx-auto mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue this month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums text-ink dark:text-white">
            ${summary.monthlyRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">From orders paid this month.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receivables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums text-ink dark:text-white">
            ${summary.receivablesTotal.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            {summary.receivablesCount === 0
              ? "Nothing pending right now."
              : `${summary.receivablesCount} order${summary.receivablesCount === 1 ? "" : "s"} awaiting payment.`}
          </p>
        </CardContent>
      </Card>

      <Card className={summary.overdueCount > 0 ? "ring-2 ring-red-500/60" : undefined}>
        <CardHeader>
          <CardTitle>Overdue payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold tabular-nums ${
              summary.overdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-ink dark:text-white"
            }`}
          >
            ${summary.overdueTotal.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            {summary.overdueCount === 0
              ? "No overdue payments."
              : `${summary.overdueCount} order${summary.overdueCount === 1 ? "" : "s"} past due date.`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
