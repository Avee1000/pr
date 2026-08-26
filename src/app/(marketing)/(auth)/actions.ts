"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { success, z } from "zod";
import { COUNTRIES } from "@/data/countries";
import { redis } from "@/lib/redis/redis"
import { sendOtpEmail } from '@/lib/email/quote';
import { createClient } from "@/lib/supabase/server";
import crypto from "node:crypto";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { maskEmail } from "@/utils/action";
import { cookies } from "next/headers";
import { createServerClient } from '@supabase/ssr';
import { headers } from 'next/headers';

export interface AuthFormState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    country?: string[];
    _form?: string[];
  };
  success?: boolean;
  sessionId?: string;
  message?: string;
}

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  country: z.string().min(2, "Country is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export interface OrganizationAuthFormState {
  errors?: {
    name?: string[];
    company_name?: string[];
    company_size?: string[];
    work_email?: string[];
    country?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
  sessionId?: string;
  message?: string;
}

const organizationSignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  company_name: z.string().min(2, "Company name must be at least 2 characters."),
  company_size: z.enum(['1-10', '11-50', '51-200', '+200'], "Choose a valid option"),
  work_email: z.string().regex(
    /^(?!\.)(?!.*\.\.)[a-z0-9_+'\.-]+[a-z0-9_+-]@(?!(?:gmail|yahoo|hotmail|outlook|icloud|aol|proton|protonmail|live|gmx|yandex|mail)\.)(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i,
    "Please enter a valid work email address (free email providers like Gmail or Yahoo are not allowed)."
  ),
  country: z.string().min(2, "Country is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validatedFields = signUpSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, country } = validatedFields.data;
  let isEmailConfirmationRequired = false;

  const countryData = COUNTRIES.find((c) => c.code === country);

  if (!countryData) {
    return { errors: { country: ["Invalid country selected"] } };
  }

  const locale = `${countryData.language}-${countryData.code}`;
  const currency = countryData.currency;

  try {
    // const profileCountry = await getClientCountry() || country;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          country,
          locale,
          currency,
        },
      },
    });

    if (error) {
      return {
        errors: {
          _form: [error.message],
        },
      };
    }

    if (!data.session) {
      isEmailConfirmationRequired = true;
    }

    // const { data: profileData, error: profileError } = await supabase
    //   .from('profiles')
    //   .insert({currency: currency, locale: locale})
    //   .select()
    //   .single();

    // if (profileError) {
    //   console.error("Supabase insert error:", profileError);
    //   return {
    //     errors: {
    //       _form: ["An unexpected error occurred. Please try again."],
    //     },
    //   };
    // }


  } catch (error) {
    // Return unhandled exceptions as a root form error
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        ],
      },
    };
  }

  // Handle successful sign up states outside try/catch
  if (isEmailConfirmationRequired) {
    return {
      message: "Please check your email to confirm your account.",
    };
  }

  revalidatePath("/", "layout");
  // redirect("/dashboard");
  return { success: true, message: "Account created successfully" }
}

export async function organizationSignUp(
  _prevState: OrganizationAuthFormState,
  formData: FormData
): Promise<OrganizationAuthFormState> {
  const validatedFields = organizationSignUpSchema.safeParse({
    name: String(formData.get("name")).trim(),
    company_name: String(formData.get("company_name")).trim(),
    company_size: String(formData.get("company_size")).trim(),
    work_email: String(formData.get("work_email")).trim(),
    country: String(formData.get("country") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  })


  if (!validatedFields.success) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors
    }
  }

  const { name, company_name, company_size, work_email, password, country } = validatedFields.data;

  const countryData = COUNTRIES.find((c) => c.code === country);

  if (!countryData) {
    return { errors: { country: ["Invalid country selected"] } };
  }

  const locale = `${countryData.language}-${countryData.code}`;
  const currency = countryData.currency;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: work_email,
      password: password,
      options: {
        data: {
          name,
          country,
          locale,
          currency,
        },
      },
    })

    if (error) {
      console.error("Error signing up " + error)
      return {
        errors: {
          _form: [error.message],
        }
      }
    }

    const { error: InsertError } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        account_type: 'organization',
        company_name: company_name,
        company_size: company_size,
        work_email: work_email,
      })
      .eq("id", data.user?.id);

    if (InsertError) {
      console.error("Error inserting into profiles (organization)", InsertError)
      return { success: false, message: InsertError.message }
    }
  } catch (error) {
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        ],
      },
    };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validatedFields = signInSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { email, password } = validatedFields.data;

  let sessionIdToRedirect: string | null = null;

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error)
      return {
        errors: {
          _form: ["Invalid email or password. Please try again."],
        },
      };
    }

    try {
      if (!redis.isOpen) await redis.connect();

      function hasher(code: string) {
        return crypto.createHash('sha256').update(code).digest('hex');
      }

      if (!authData.user) {
        console.error("User not found");
        return { errors: { _form: ["User session could not be established."] } };
      }

      const { session } = authData;
      const user = authData.user;
      const userEmail = user.email!;
      const userName = user.user_metadata?.name || "User";

      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = hasher(rawOtp);

      sessionIdToRedirect = crypto.randomBytes(32).toString('hex');

      const redisSessionKey = `session:${sessionIdToRedirect}`;
      const redisAttemptsKey = `otp_attempts:${sessionIdToRedirect}`;

      const sessionData = JSON.stringify({
        userId: user.id,
        userName: user.user_metadata?.name,
        email: userEmail,
        otp: hashedOtp,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        otpExpiresAt: Date.now() + 30 * 1000,
      });

      await redis.set(redisSessionKey, sessionData, { EX: 300 });
      await redis.del(redisAttemptsKey);

      await sendOtpEmail({
        toEmail: userEmail,
        toName: userName,
        otpCode: rawOtp,
      });

    } catch (error) {
      console.error(error);
      return { errors: { _form: ["Redis or email service failed."] } };
    }

  } catch (error) {
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        ],
      },
    };
  }

  if (sessionIdToRedirect) {
    redirect(`/auth/verify?session_id=${sessionIdToRedirect}`);
  }

  return { errors: { _form: ["Failed to generate verification session."] } };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getMaskedEmailFromSession(
  sessionId: string
): Promise<{ maskedEmail: string; email: string } | null> {
  if (!sessionId) return null;

  try {
    if (!redis.isOpen) await redis.connect();

    const sessionDataRaw = await redis.get(`session:${sessionId}`);
    if (!sessionDataRaw) return null;

    const sessionData = JSON.parse(sessionDataRaw);
    if (!sessionData.email) return null;

    // Returns the object matching the new Promise type
    return {
      maskedEmail: maskEmail(sessionData.email),
      email: sessionData.email,
    };
  } catch (error) {
    console.error("Error fetching email from Redis session:", error);
    return null;
  }
}

export async function verifyOTPCode(sessionId: string, rawInputOtp: string) {
  if (!sessionId || !rawInputOtp) {
    return { error: "Session ID and OTP code are required." };
  }

  try {
    if (!redis.isOpen) await redis.connect();

    const redisSessionKey = `session:${sessionId}`;
    const redisAttemptsKey = `otp_attempts:${sessionId}`;

    const sessionDataRaw = await redis.get(redisSessionKey);
    if (!sessionDataRaw) {
      return { error: "Verification session expired. Please sign in again." };
    }

    const sessionData = JSON.parse(sessionDataRaw);

    // Check 30-second OTP window
    if (Date.now() > sessionData.otpExpiresAt) {
      return { error: "OTP code has expired. Please click Resend Code.", codeExpired: true };
    }

    const currentAttempts = await redis.get(redisAttemptsKey);
    const attemptsCount = currentAttempts ? parseInt(currentAttempts, 10) : 0;

    if (attemptsCount >= 3) {
      await redis.del([redisSessionKey, redisAttemptsKey]);
      return { error: "Too many failed attempts. Session invalidated.", locked: true };
    }

    const inputHashedOtp = crypto.createHash('sha256').update(rawInputOtp).digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(sessionData.otp, 'hex'),
      Buffer.from(inputHashedOtp, 'hex')
    );

    if (!isValid) {
      const newAttempts = await redis.incr(redisAttemptsKey);
      if (newAttempts === 1) await redis.expire(redisAttemptsKey, 30);

      if (newAttempts >= 3) {
        await redis.del([redisSessionKey, redisAttemptsKey]);
        return { error: "Too many failed attempts. Session invalidated.", locked: true };
      }

      return { error: `Invalid OTP code. ${3 - newAttempts} attempt(s) remaining.` };
    }

    await redis.del([redisSessionKey, redisAttemptsKey]);

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: sessionData.accessToken,
      refresh_token: sessionData.refreshToken,
    });

    if (sessionError) {
      console.error("Failed to write Supabase cookies:", sessionError);
      return { error: "Could not establish a secure session." };
    }
    return { success: true, message: "OTP verified successfully." };
  } catch (error) {
    return { error: "Internal server error during verification." };
  }
}

export async function getOTPTTL(sessionId: string) {
  if (!sessionId) return { error: "Session ID is required." };

  try {
    if (!redis.isOpen) await redis.connect();

    const sessionDataRaw = await redis.get(`session:${sessionId}`);
    if (!sessionDataRaw) return { error: "Session expired." };

    const sessionData = JSON.parse(sessionDataRaw);
    const remainingMs = sessionData.otpExpiresAt - Date.now();
    const ttlSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    return { success: true, ttl: ttlSeconds };
  } catch (error) {
    return { error: "Failed to read TTL." };
  }
}

export async function resendOTPCode(sessionId: string) {
  try {
    if (!redis.isOpen) await redis.connect();

    const oldSessionKey = `session:${sessionId}`;
    const oldAttemptsKey = `otp_attempts:${sessionId}`;

    const sessionDataRaw = await redis.get(oldSessionKey);
    if (!sessionDataRaw) {
      return { error: "Session expired completely. Please sign in again." };
    }

    const sessionData = JSON.parse(sessionDataRaw);

    // Delete old session and attempts
    await redis.del([oldAttemptsKey]);

    const newPlainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(newPlainOtp).digest('hex');
    const newSessionId = crypto.randomBytes(32).toString('hex');

    sessionData.otp = hashedOtp;
    sessionData.otpExpiresAt = Date.now() + 30 * 1000; // Reset 30s OTP window

    const newSessionKey = `session:${newSessionId}`;
    // Preserve 5-minute Redis session lifetime
    await redis.set(newSessionKey, JSON.stringify(sessionData), { EX: 300 });

    await sendOtpEmail({
      toEmail: sessionData.email,
      toName: sessionData.userName,
      otpCode: newPlainOtp,
    });

    return { success: true, newSessionId, timeToLive: 30 };
  } catch (error) {
    return { error: "Failed to resend code. Please try again." };
  }
}

export async function signInWithGoogle() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const origin = `${protocol}://${host}`;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'custom:google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error.message);
    return;
  }

  console.log(error)
  if (data.url) {
    redirect(data.url);
  }
}