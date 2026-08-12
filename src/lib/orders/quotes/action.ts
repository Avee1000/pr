'use server'

import { createClient } from "../../supabase/server";
import crypto from "node:crypto";
import { sendQuoteEmail } from '@/lib/email/quote';
import { setVerifiedQuoteCookie } from "@/lib/cookies/auth-cookie";
import { getBaseUrl } from "@/utils/url";


//  Define the interface matching your RPC output
export interface QuoteOrderInfo {
    quote_status: string;
    share_token: string;
    approved_at: string | null;
    order_description: string;
    order_id: string;
    quote_id: string;
    order_price: string;
    order_due_date: string;
    order_status: string;
    customer_name: string;
    customer_email: string;
    expires_at: string;
}

export interface QuoteValidateinfo {
    quote_status: string;
    share_token: string;
    approved_at: string | null;
    order_status: string;
    customer_name: string;
    customer_email: string;
    expires_at: string;
}

export async function sendTokenEmail(orderId: string) {
    const supabase = await createClient();

    // 2. Authentication Check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized: you must be logged in." };
    }

    // 3. Fetch data via RPC with TypeScript generic typing
    const { data, error } = await supabase.rpc("get_allinfo_by_id", {
        p_order_id: orderId,
    });

    if (error || !data) {
        console.error("Supabase RPC Error:", error);
        return { error: "Quote information not found or access denied." };
    }

    // Handle case if RPC returns an array vs single object
    const info: QuoteOrderInfo = (Array.isArray(data) ? data[0] : data) as QuoteOrderInfo;

    if (!info) {
        return { error: "No quote data found for this order ID." };
    }

    // 4. Format price & dynamic quote URL
    const formattedPrice = `$${parseFloat(info.order_price).toFixed(2)}`;
    const baseUrl = await getBaseUrl();
    const quoteUrl = `${baseUrl}/quote/${info.share_token}`;

    // Calculate human-readable expiration (e.g., "14 days")
    const expiryDate = new Date(info.expires_at);
    const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    // 5. Trigger email template
    try {
        await sendQuoteEmail({
            toEmail: info.customer_email,
            toName: info.customer_name,
            quoteNumber: info.quote_id.substring(0, 8).toUpperCase(), 
            amount: formattedPrice,
            quoteUrl: quoteUrl,
            expiresAt: formattedExpiry,
        });

        return { success: true, message: "Quote email sent successfully." };
    } catch (emailError: any) {
        console.error("Failed to send quote email:", emailError);
        return { error: emailError.message || "Failed to deliver quote email." };
    }
}

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


export type VerifyQuoteResult =
  | { success: true; status: "VALID"; quoteId: string }
  | { success: false; status: "COMPLETED"; quoteStatus: string; message: string; error?: string }
  | { success: false; status: "EXPIRED" | "INVALID_TOKEN" | "EMAIL_MISMATCH" | "ERROR"; error: string };

export async function verifyQuoteAccess(
  token: string, 
  email: string
): Promise<VerifyQuoteResult> {
  try {
    const supabase = await createClient();

    // 1. Fetch quote by share token
    const { data, error } = await supabase.rpc("get_allinfo_by_share_token", {
      p_share_token: token,
    });

    if (error) {
      console.error("Supabase RPC error (get_allinfo_by_share_token):", error.message);
      return { success: false, status: "ERROR", error: "Failed to validate quote token." };
    }

    // Handle array or single-object return from Supabase RPC
    const quoteData = Array.isArray(data) ? data[0] : data as QuoteValidateinfo;

    if (!quoteData) {
      return { success: false, status: "INVALID_TOKEN", error: "This quote link is invalid or does not exist." };
    }

    // 2. Normalize and check email match
    const normalizedInputEmail = email?.trim().toLowerCase();
    const normalizedCustomerEmail = quoteData.customer_email?.trim().toLowerCase();

    if (!normalizedCustomerEmail || normalizedCustomerEmail !== normalizedInputEmail) {
      return { success: false, status: "EMAIL_MISMATCH", error: "Email address does not match this quote link." };
    }

    // 3. Check expiration
    const isExpired = quoteData.expires_at && new Date(quoteData.expires_at) < new Date();
    if (isExpired) {
      return { success: false, status: "EXPIRED", error: "This quote link has expired. Please request a new link from the vendor." };
    }
    // 4. Check completion status
    if (quoteData.quote_status !== "pending") {
        console.log(quoteData.status)
      return { 
        success: false,
        status: "COMPLETED", 
        quoteStatus: quoteData.quote_status, 
        message: "This quote has already been finalized.",
        error: "This quote has already been finalized."
      };
    }

    // 5. Set HTTP-only verification cookie
    await setVerifiedQuoteCookie(token);
    return { success: true, status: "VALID", quoteId: quoteData.share_token };
  } catch (err) {
    console.error("Unexpected error in verifyQuoteAccess:", err);
    return { success: false, status: "ERROR", error: "An unexpected error occurred during verification." };
  }
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
