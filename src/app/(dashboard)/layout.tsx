import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderNavLinks from "@/components/dashboard/DashboardNavigation";
import Header from "@/components/global/Header";
import { OnboardingProvider } from '@/components/onboarding/personal/PersonalOnboardingProvider';
import { OnboardingWidget } from '@/components/onboarding/personal/PersonalOnboardingWidget';
import { getOnboardingProgress } from '@/lib/onboarding/action';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {data: { user }, } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const onboardingState = await getOnboardingProgress();
  // console.log(onboardingState)

  return (
    <OnboardingProvider initialState={onboardingState}>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-ink">
        <div className="shrink-0">
          <Header />
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <OrderNavLinks />
          <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-white dark:bg-ink-darker h-auto sm:my-1.5 scrollbar-thumb-ink scrollbar-thin dark:scrollbar-thumb-muted-foreground sm:m-1.5 sm:ml-0 sm:rounded-md shadow-[0_0_10px_rgba(0,0,0,0.15)] max-sm:mx-0">
            {children}
          </main>
          {!onboardingState.isDismissed && <OnboardingWidget />}
        </div>
      </div>
    </OnboardingProvider >
  );
}
