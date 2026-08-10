'use server'

import { createClient } from "../../supabase/server";
import crypto from "node:crypto";

export async function generateQuoteLink(
    orderId: string,
): Promise<{ token: string; expiresAt: string } | { error: string }> {

    // Verify authenticated user session
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized: you must be logged in." };
    }

    // 2. Verify order ownership
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

    if (orderError || !order) {
        return { error: "Order not found or access denied." };
    }

    // 3. Check for existing active (non-expired) quote token
    const { data: existingQuote, error: existingError } = await supabase
        .from("quotes")
        .select("share_token, expires_at, status")
        .eq("order_id", orderId)
        .maybeSingle();

    if (existingError) {
        console.error("Supabase select error (quotes):", existingError.message);
        return { error: "Failed to generate quote link." };
    }
    const now = new Date();

    // Return existing token if it exists, is still pending, and hasn't expired
    if (
        existingQuote &&
        existingQuote.status === "pending" &&
        new Date(existingQuote.expires_at) > now
    ) {
        return {
            token: existingQuote.share_token,
            expiresAt: existingQuote.expires_at,
        };
    }

    // If the quote is already approved or rejected, block new link generation
    if (existingQuote && existingQuote.status !== "pending") {
        return {
            error: `Cannot generate a link. This quote is already ${existingQuote.status}.`
        };
    }

    // 4. Generate high-entropy 256-bit token (64 hex characters)
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // 5. Atomic Upsert: Inserts or updates expired token on conflict
    const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .upsert(
            {
                order_id: orderId,
                share_token: token,
                expires_at: expiresAt,
                status: "pending",
                updated_at: new Date().toISOString(),
            },
            { onConflict: "order_id" },
        )
        .select("share_token, expires_at")
        .single();

    if (quoteError || !quote) {
        console.error("Supabase upsert error (quotes):", quoteError.message);
        return { error: "Failed to generate quote link." };
    }

    return {
        token: quote.share_token,
        expiresAt: quote.expires_at,
    };
}

export async function shareToken(
    orderId: string,
): Promise<{ token: string; expiresAt: string } | { error: string }> {

    // Verify authenticated user session
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized: you must be logged in." };
    }

    // 2. Verify order ownership
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

    if (orderError || !order) {
        return { error: "Order not found or access denied." };
    }

    // 3. Check for existing active (non-expired) quote token
    const { data: existingQuote, error: existingError } = await supabase
        .from("quotes")
        .select("share_token, expires_at, status")
        .eq("order_id", orderId)
        .maybeSingle();

    if (existingError) {
        console.error("Supabase select error (quotes):", existingError.message);
        return { error: "Failed to generate quote link." };
    }
    const now = new Date();

    // Return existing token if it exists, is still pending, and hasn't expired
    if (
        existingQuote &&
        existingQuote.status === "pending" &&
        new Date(existingQuote.expires_at) > now
    ) {
        return {
            token: existingQuote.share_token,
            expiresAt: existingQuote.expires_at,
        };
    }

    if (!existingQuote) {
        return {
            error: `No existing link found for this order. Generate a new link first`
        };
    }

    console.log(existingQuote.expires_at)
    return {
        token: existingQuote.share_token,
        expiresAt: existingQuote.expires_at,
    };
}

// export async function generateQuoteLink(
//   orderId: string,
// ): Promise<{ token: string } | { error: string }> {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return { error: "Unauthorized: you must be logged in." };
//   }

//   const { data: order, error: orderError } = await supabase
//     .from("orders")
//     .select("id")
//     .eq("id", orderId)
//     .eq("user_id", user.id)
//     .single();

//   if (orderError || !order) {
//     return { error: "Order not found." };
//   }

//   const { data: existingQuote, error: existingError } = await supabase
//     .from("quotes")
//     .select("share_token")
//     .eq("order_id", orderId)
//     .maybeSingle();

//   if (existingError) {
//     console.error("Supabase select error (quotes):", existingError.message);
//     return { error: "Failed to generate quote link." };
//   }

//   if (existingQuote) {
//     return { token: existingQuote.share_token };
//   }

//   const token = crypto.randomUUID();

//   const { data: inserted, error: insertError } = await supabase
//     .from("quotes")
//     .insert({ order_id: orderId, share_token: token, status: "pending" })
//     .select("share_token")
//     .single();

//   if (insertError) {
//     // Unique conflict: another request created the quote first ? return that token.
//     if (insertError.code === "23505") {
//       const { data: racedQuote } = await supabase
//         .from("quotes")
//         .select("share_token")
//         .eq("order_id", orderId)
//         .maybeSingle();

//       if (racedQuote?.share_token) {
//         return { token: racedQuote.share_token };
//       }
//     }

//     console.error("Supabase insert error (quotes):", insertError.message);
//     return { error: "Failed to generate quote link." };
//   }

//   return { token: inserted.share_token };
// }
