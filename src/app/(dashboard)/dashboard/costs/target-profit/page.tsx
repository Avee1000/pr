import Link from "next/link";
import TargetProfitForm from "@/components/dashboard/costs/target-profit/TargetProfitForm";
import { selectTargetProfit } from "@/lib/costs/action";

export default async function TargetProfitPage() {
  const targetProfit = await selectTargetProfit();

  return (
    <div className="dark:bg-ink min-h-screen flex-1 w-auto m-1 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span><Link href="/dashboard" className="underline underline-offset-2">Dashboard</Link></span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Costs Registration</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Target Profit</span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Target Profit
          </h1>
          <p className="text-muted-foreground">
            Save and update your desired profit percentage.
          </p>
        </div>

        <div className="rounded-2xl border border-border shadow-sm">
          <div className="px-6 sm:px-8 py-6">
            <TargetProfitForm targetProfit={targetProfit} />
          </div>
        </div>
      </div>
    </div>
  );
}
