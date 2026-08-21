"use client";

import Link from "next/link";
import UserMenu from "../profile/UserMenu";
import { usePathname } from "next/navigation";

interface AuthHeaderActionsProps {
  isSignedIn: boolean;
  user: any;
  onAuthPage: boolean;
  showDashboard: boolean;
  showAccount: boolean;
}

export function AuthHeaderActions({ 
  isSignedIn, 
  user, 
}: AuthHeaderActionsProps) {
  const pathname = usePathname();
  
  const isAccountPage = pathname.startsWith("/account");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);
  const onAuthPage = AUTH_ROUTES.has(pathname) || pathname.startsWith("/quote");

  const showDashboard = !isAccountPage;
  const showAccount = !isDashboardPage;

  if (isSignedIn) {
    return (
      <UserMenu 
        user={user} 
        showDashboard={showDashboard} 
        showAccount={showAccount} 
      />
    );
  }

  // Already on login/signup/quote — don't show a redundant Sign in link
  if (onAuthPage) {
    return null;
  }

  return (
    <Link
      href="/login"
      className="rounded-md px-3 py-1.5 text-sm font-semibold text-ink hover:bg-secondary dark:text-white"
    >
      Sign in
    </Link>
  );
}