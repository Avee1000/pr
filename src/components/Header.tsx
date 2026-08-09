import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AuthHeaderActions } from "./AuthHeaderActions";
import ThemeToggleIcon from "./ThemeIconButton";
import IsMobileOrderNavLinks from "./dashboard/IsMobileDashboardNavigation";
import NotificationIcon from "./notifications/NotificationIcon";

// Server component: reads the auth session so the header can show a sign-out
// button for signed-in users, or a sign-in link for visitors.
export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="shrink-0 h-19 w-full z-20 border-b border-border bg-white dark:bg-ink dark:text-white">
      <div className="mx-auto flex items-center justify-between px-4 py-4">
        <div className="max-sm:block hidden">
          <IsMobileOrderNavLinks />
        </div>
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-ink dark:text-white">
          <Image
            src="/android-chrome-512x512.png"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
            alt="PriceRight Logo"
          />
          {/* <span className="rounded-lg bg-brand px-1.5 py-0.5 text-black shadow-sm">Price</span>
          Right */}
        </Link>
        <div className="flex flex-row justify-center items-center gap-3">
          {!user && <ThemeToggleIcon />}
          {user && <NotificationIcon />}
          <AuthHeaderActions isSignedIn={!!user} user={user} />
        </div>
      </div>
    </header>
  );
}