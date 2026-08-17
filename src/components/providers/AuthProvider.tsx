"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query'
import { Profile } from "@/lib/types/profileTypes";
import { getUserProfile } from "@/lib/account/profile/action";

interface AuthContextType {
  profile: Profile | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  user: User | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const supabase = createClient();
  const router = useRouter();

  const { data: queryResult, isLoading: isLoadingProfile, error: queryError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => getUserProfile(),
    enabled: !!user?.id,
  });

  const profile = queryResult?.data || null;
  let profileError: string | null = null;

  if (queryError) {
    profileError = queryError.message; // React-query error
  } else if (queryResult?.error) {
    profileError = queryResult.error; // Backend error from getUserProfile
  }
  
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoadingProfile,
      profileError,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming auth state in client components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};