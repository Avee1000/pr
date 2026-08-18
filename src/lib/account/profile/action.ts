'use server'

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types/profileTypes";
import { revalidatePath } from "next/cache";

export type ProfileResponse = {
  data: Profile | null;
  error: string | null;
  status?: number;
};

export async function getUserProfile(): Promise<ProfileResponse> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            data: null,
            error: authError?.message || "No active session found.",
            status: 401
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
            error: profileError.message,
            status: profileError.code === 'PGRST116' ? 404 : 500 
        };
    }

    return {
        data: profile as Profile,
        error: null,
        status: 200
    };
}

export async function removeProfilePicture() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("No active session found. Please log in again.");
    }

    const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)
        .select();

    if (error) {
        return {
            data: null,
            error: error.message || 'Failed to remove profile picture from database.'
        };
    }

    if (!data) {
        throw new Error("Failed to remove profile picture.");
    }

    return { success: true }
}

export async function updateProfilePicture(imageUrl: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("No active session found. Please log in again.");
    }

    const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('id', user.id)
        .select();

    if (error) {
        return {
            data: null,
            error: error.message || 'Failed to update profile picture in database.'
        };
    }

    if (!data) {
        throw new Error("Failed to update profile picture.");
    }

    return { success: true }
}

export async function uploadBlob(fileName: string, blob: Blob) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("No active session found. Please log in again.");
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/webp', upsert: true })

    if (uploadError) throw new Error(uploadError.message)

    const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)

    if (!publicUrlData || !publicUrlData.publicUrl) throw new Error('Failed to get public URL')
    const publicUrl = publicUrlData.publicUrl;

    const { error } = await updateProfilePicture(publicUrl)

    if (error) throw new Error(error)

    revalidatePath('/account/profile');
    revalidatePath('/dashboard', 'layout'); 
    return { success: true, publicUrl };
}