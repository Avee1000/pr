"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Monitor } from "lucide-react";

export function HeaderDashboardButton() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <Link
      href="/dashboard"
      title="Workspace"
      aria-label="Workspace"
      className="flex items-center justify-center gap-2 border border-muted-foreground/50 rounded-full hover:bg-gray-100 hover:border-ink dark:hover:border-muted-foreground dark:hover:bg-neutral-800 transition-all focus:outline-none focus-visible:ring-2 h-8 px-2"
    >
      <Monitor
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-gray-700 dark:text-gray-200"
      />
      {!isDashboard && (
        <span className="text-xs font-medium pr-1 text-gray-700 dark:text-gray-200 whitespace-nowrap">
          Workspace
        </span>
      )}
    </Link>
  );
}