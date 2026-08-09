import Name from '@/components/Names';
import Link from 'next/link'
import { createClient } from "@/lib/supabase/server";
import CashFlowSummary from "@/components/dashboard/CashFlowSummary";

const QUICK_LINKS = [
  { href: "/dashboard/orders", label: "All orders", hint: "Review and adjust existing orders." },
  { href: "/dashboard/orders/create", label: "Create order", hint: "Price a new job for a client." },
  { href: "/dashboard/customers", label: "Customers", hint: "Manage your client list." },
  { href: "/dashboard/costs/materials", label: "Costs", hint: "Keep materials, labor and profit up to date." },
];

export default async function OrdersDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div
      className="dark:bg-ink min-h-screen text-ink dark:white  flex-1 w-auto m-1 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.2)] bg-white"
    >

      <main className="p-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-heading text-ink dark:text-white">
            {/* If full_name is undefined, it will pass "Guest" instead */}
            Welcome, <Name username={user?.user_metadata?.name || "Guest"} fullname={false} />
          </h1>
          <p className="text-sm text-muted-foreground">
            This is your private workspace. Your data is visible only to you.
          </p>
        </div>
        <span className='border-t border-gray-200 my-4  block'></span>

        <CashFlowSummary />

        <nav
          aria-label="Dashboard shortcuts"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:max-w-7xl mx-auto"
        >
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-border p-4 shadow-sm transition-colors hover:border-brand hover:bg-muted/50"
            >
              <span className="block text-sm font-semibold text-foreground">{link.label}</span>
              <span className="block text-xs text-muted-foreground">{link.hint}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
