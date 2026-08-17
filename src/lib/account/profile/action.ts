'use server'

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types/profileTypes";

// Define a structured result type
export type ProfileResponse = {
    data: Profile | null;
    error: string | null;
};

export async function getUserProfile(): Promise<ProfileResponse> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            data: null,
            error: authError?.message || "No active session found. Please log in again."
        };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, avatar_url, bio, currency, locale, timezone, date_format, time_format, updated_at, created_at, country')
        .eq('id', user.id)
        .single();

    if (profileError) {
        return {
            data: null,
            error: profileError.message || "Failed to retrieve user profile."
        };
    }

    return {
        data: profile as Profile,
        error: null
    };
}