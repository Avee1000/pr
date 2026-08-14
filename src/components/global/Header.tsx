import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AuthHeaderActions } from "./AuthHeaderActions";
import ThemeToggleIcon from "./ThemeIconButton";
import IsMobileOrderNavLinks from "../dashboard/IsMobileDashboardNavigation";
import NotificationIcon from "../notifications/NotificationIcon";
import MobileHideWrapper from "./MobileHideWrapper";
import { ReceiptText } from "lucide-react";


export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

  return (
    <MobileHideWrapper routes={AUTH_ROUTES} breakpoint={768}>
      <header className="shrink-0 h-19 w-full z-20 border-b border-border bg-white dark:bg-ink dark:text-white">
        <div className="mx-auto flex items-center justify-between px-4 py-4">
          <div className="max-sm:block hidden">
            <IsMobileOrderNavLinks />
          </div>
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
              {user && <Link title="Orders" className="flex justify-center items-center size-8 border border-muted-foreground/50 rounded-full hover:bg-gray-100 hover:border-ink dark:hover:border-muted-foreground dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 " href="/dashboard/orders"><ReceiptText strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"className="size-4 text-gray-700 dark:text-gray-200"/>
              </Link>}
              {!user ? <ThemeToggleIcon /> : <NotificationIcon />}
            </div>
            <AuthHeaderActions isSignedIn={!!user} user={user} />
          </div>
        </div>
      </header>
    </MobileHideWrapper>

  );
}