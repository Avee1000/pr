import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ThemeToggleIcon from "@/components/global/ThemeIconButton";
import IsMobileOrderNavLinks from "../dashboard/IsMobileDashboardNavigation";
import SettingsNavLinksMobile from "@/components/accounts/SettingsNavigationMobile";
import NotificationIcon from "../notifications/NotificationIcon";
import { headers } from "next/headers";
import { cn } from '@/lib/utils';

interface headerProps {
  className?: string;
}

export default async function Header({ className }: headerProps) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Evaluate routing logic on the server via x-pathname
  const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);
  const onAuthPage = AUTH_ROUTES.has(pathname) || pathname.startsWith("/quote");
  
  const isAccountPage = pathname.startsWith("/account");
  const isDashboardPage = pathname.startsWith("/dashboard");
  
  const showDashboard = !isAccountPage;
  const showAccount = !isDashboardPage;

  return (
      <header className={cn("shrink-0 h-19 w-full z-20 border-b border-border bg-white dark:bg-ink dark:text-white", className)}>
        <div className="mx-auto flex items-center justify-between px-4 py-4">

          <Link href="/" className="flex items-center gap-1 text-lg font-semibold text-ink dark:text-white">
            <Image
              src="/android-chrome-512x512.png"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
              alt="PriceRight Logo"
            />
            PriceRight
          </Link>
          <div className="flex flex-row justify-center items-center gap-2">
            <div className="flex flex-row justify-center items-center gap-1">
              {!user ? <ThemeToggleIcon /> : <NotificationIcon />}
            </div>
          </div>
        </div>
      </header>
  );
}