import React from "react";
import { createClient } from "@/lib/supabase/server";
import { CurrencyProvider } from "@/components/context/currencyContext";
import { init } from "next/dist/compiled/webpack/webpack";

interface ProfilePreferences {
  currency: string;
  country?: string;
  locale: string;
}

// Keep `async` - This makes it a Next.js Server Component!
export async function ProfileProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Fetch user on server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile: ProfilePreferences | null = null;

  if (user) {
    // 2. Fetch profile directly on server before HTML renders
    const { data } = await supabase
      .from("profiles")
      .select("currency, country, locale")
      .eq("id", user.id)
      .single();

    if (data) {
      initialProfile = data as ProfilePreferences;
      console.log(initialProfile)
    }
  }

  // 3. Render client provider pre-populated with server data
  return (
    <CurrencyProvider initialProfile={initialProfile}>
      {children}
    </CurrencyProvider>
  );
}