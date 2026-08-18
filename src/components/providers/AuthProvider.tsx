"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile } from "@/lib/types/profileTypes";
import { getUserProfile, type ProfileResponse } from "@/lib/account/profile/action";

interface AuthContextType {
  profile: Profile | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  user: User | null;
  signOut: () => Promise<void>;
}

const PROFILE_CACHE_PREFIX = "profile-cache:";

function readCachedProfile(userId: string | null): Profile | null {
  if (!userId || typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${PROFILE_CACHE_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser: User | null;
  initialProfile: Profile | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeUserId = user?.id ?? initialUser?.id ?? null;
  const queryKey = activeUserId ? ["profile", activeUserId] : ["profile"];
  const cachedProfile = activeUserId ? readCachedProfile(activeUserId) : null;

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  useEffect(() => {
    if (!activeUserId) return;

    const saved = readCachedProfile(activeUserId);
    if (saved) {
      queryClient.setQueryData(queryKey, { data: saved, error: null });
    }
  }, [activeUserId, queryClient, queryKey]);

  useEffect(() => {
    let isMounted = true;

    async function syncSessionFromBrowser() {
      const {
        data: { user: sessionUser },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error) {
        setUser(null);
        return;
      }

      setUser(sessionUser ?? null);
    }

    syncSessionFromBrowser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (event === "SIGNED_OUT") {
        if (activeUserId && typeof window !== "undefined") {
          window.localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${activeUserId}`);
        }
        
        queryClient.removeQueries({ queryKey: ["profile"] });
        router.refresh();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, router, supabase]);

  const { data: queryResult, isLoading: isLoadingProfile, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getUserProfile();

      if (result.error && (result.status === 401 || result.status === 403)) {
        return (
          queryClient.getQueryData<ProfileResponse>(queryKey) ?? {
            data: initialProfile ?? cachedProfile,
            error: null,
          }
        );
      }

      return result;
    },
    staleTime: 60 * 1000 * 5,
    enabled: !!activeUserId,
    initialData:
      (initialProfile ?? cachedProfile) && activeUserId
        ? { data: initialProfile ?? cachedProfile, error: null }
        : undefined,
  });

  useEffect(() => {
    if (queryResult?.data && activeUserId) {
      window.localStorage.setItem(
        `${PROFILE_CACHE_PREFIX}${activeUserId}`,
        JSON.stringify(queryResult.data),
      );
    }
  }, [activeUserId, queryResult?.data]);

  const profile = queryResult?.data ?? initialProfile ?? cachedProfile ?? null;
  let profileError: string | null = null;

  if (queryError) {
    profileError = queryError.message;
  } else if (queryResult?.error) {
    profileError = queryResult.error;
  }

  const signOut = async () => {
    if (activeUserId && typeof window !== "undefined") {
      window.localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${activeUserId}`);
    }
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["profile"] });
    // router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoadingProfile,
        profileError,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};