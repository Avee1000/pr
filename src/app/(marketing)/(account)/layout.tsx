import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsNavLinks from "@/components/accounts/SettingsNavigation";
import SettingsNavLinksMobile from "@/components/accounts/SettingsNavigationMobile";
import Footer from "@/components/global/Footer";
import Header from "@/components/global/Header";

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
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-ink dark:scrollbar-thumb-white">
        <div className="min-h-screen w-full overflow-x-hidden text-base bg-gray-100 dark:bg-ink ">
          <div className="flex flex-col sm:flex-row w-full min-w-0">
            <div className="hidden sm:block">
              <SettingsNavLinks />
            </div>
            <div className="flex-1 min-w-0 bg-white dark:bg-ink-darker h-fit min-h-screen *:scrollbar-thin sm:m-1.5 ml-0 sm:rounded-md shadow-[0_0_10px_rgba(0,0,0,0.15)] max-sm:mx-0">{children}</div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
