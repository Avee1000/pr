import Link from "next/link";
import MaterialCostsForm from "@/components/dashboard/costs/materials/MaterialCostsForm";
import { selectAllMaterials } from "@/lib/costs/action";

export default async function MaterialCostsPage() {
  const materials = await selectAllMaterials();

  return (
    <div className="dark:bg-ink min-h-screen flex-1 w-auto m-1 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span><Link href="/dashboard" className="underline underline-offset-2">Dashboard</Link></span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Costs Registration</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Material Costs</span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Material Costs
          </h1>
          <p className="text-muted-foreground">
            Register and update materials with name, unit, and value.
          </p>
        </div>

        <div className="rounded-2xl border border-border shadow-sm">
          <div className="px-6 sm:px-8 py-6">
            <MaterialCostsForm materials={materials} />
          </div>
        </div>
      </div>
    </div>
  );
}
