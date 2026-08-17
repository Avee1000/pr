import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderNavLinks from "@/components/dashboard/DashboardNavigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Protect the whole dashboard group: an unauthenticated visitor is sent to
  // login before they can see any dashboard or orders content.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-base dark:bg-white!">
      <div className="flex flex-col sm:flex-row w-full min-w-0 border-border">
          <OrderNavLinks />
        <div className="flex-1  min-w-0 *:scrollbar-thin ">{children}</div>
      </div>
    </div>
  );
}
