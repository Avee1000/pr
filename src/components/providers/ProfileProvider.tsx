import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CurrencyProvider } from "@/components/context/currencyContext";

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

  // 1. Single Auth Call on the Server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile: ProfilePreferences | null = null;

  // 2. Fetch profile only if user exists
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("currency, country, locale")
      .eq("id", user.id)
      .single();

    if (data) {
      initialProfile = data as ProfilePreferences;
    }
  }

  // 3. Nest Client Providers with pre-hydrated server state
  return (
    <AuthProvider initialUser={user}>
      <CurrencyProvider initialProfile={initialProfile}>
        {children}
      </CurrencyProvider>
    </AuthProvider>
  );
}