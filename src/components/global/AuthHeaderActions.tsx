"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// import { signOut } from "@/app/(auth)/actions";
import UserMenu from "../profile/UserMenu";


export function AuthHeaderActions({ isSignedIn, user }: { isSignedIn: boolean; user: any }) {
  const pathname = usePathname();
  const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);
  const onAuthPage = AUTH_ROUTES.has(pathname) || pathname.startsWith("/quote");

  if (isSignedIn) {
    return (
      // <form action={signOut}>
      //   <button
      //     type="submit"
      //     className="rounded-md px-3 py-1.5 text-sm font-semibold text-ink hover:bg-secondary dark:text-white"
      //   >
      //     Sign out
      //   </button>
      // </form>
      <UserMenu user={user} />
    );
  }

  // Already on login/signup — don't show a redundant Sign in link (Sunny).
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
