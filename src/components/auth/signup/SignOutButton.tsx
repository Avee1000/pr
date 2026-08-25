'use client';

import { useState } from 'react';
import { LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider'

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await toast.promise(signOut(), {
        loading: 'Signing out...',
        success: {
          message: 'Successfully signed out.',
          // icon: <CheckCircle2 className="size-5 fill-ink text-white animate-spin" />,
        },
        error: 'Failed to sign out. Please try again.',
        classNames: { success: "!bg-background !text-foreground !border-border" }
        },
      );
    } catch {
      setIsLoading(false);
    } 
  };

  return (
    <form onSubmit={handleSignOut}>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
        role="menuitem"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        {isLoading ? "Signing out..." : "Sign out"}
      </button>
    </form>
  );
}