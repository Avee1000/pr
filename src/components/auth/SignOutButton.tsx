'use client';

import { signOut } from "@/app/(auth)/actions";
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        role="menuitem"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </form>
  );
}