import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CurrencyProvider } from "@/components/context/currencyContext";
import type { Profile } from "@/lib/types/profileTypes";

interface ProfilePreferences {
  currency: string;
  country?: string;
  locale: string;
}

export async function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile: Profile | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select(
        "*",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      initialProfile = data as Profile;
    }
  }
  
  return (
    <AuthProvider initialUser={user} initialProfile={initialProfile}>
      <CurrencyProvider initialProfile={initialProfile}>
        {children}
      </CurrencyProvider>
    </AuthProvider>
  );
}