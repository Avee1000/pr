import Link from "next/link";
import LaborCostsForm from "@/components/dashboard/costs/labor/LaborCostsForm";
import { selectLaborCost } from "@/lib/costs/action";

export default async function LaborCostsPage() {
  const laborCost = await selectLaborCost();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-8 max-sm:ml-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span><Link href="/dashboard" className="underline underline-offset-2">Dashboard</Link></span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Costs Registration</span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Labor Costs</span>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Labor Costs
        </h1>
        <p className="text-muted-foreground">
          Save and update your hourly labor cost.
        </p>
      </div>

      <div className="rounded-2xl border border-border shadow-sm">
        <div className="px-6 sm:px-8 py-6">
          <LaborCostsForm laborCost={laborCost} />
        </div>
      </div>
    </div>
  );
}
