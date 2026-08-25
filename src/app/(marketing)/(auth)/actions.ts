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
  return { success: true, message: "Account created successfully"}
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
      });

      await redis.set(redisSessionKey, sessionData, { EX: 60 });
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

    // 1. Check brute-force attempts limit (e.g., max 3 failed tries)
    const currentAttempts = await redis.get(redisAttemptsKey);
    if (currentAttempts && parseInt(currentAttempts, 10) >= 3) {
      await redis.del(redisAttemptsKey);
      return { error: "Too many failed attempts. Please request a new OTP.", locked: true };
    } else {
      // 2. Retrieve session data from Redis
      const sessionDataRaw = await redis.get(redisSessionKey);
      if (!sessionDataRaw) {
        return { error: "OTP has expired or the session is invalid." };
      }

      // Parse your stored session object
      const sessionData = JSON.parse(sessionDataRaw);
      const storedHashedOtp = sessionData.otp;

      // 3. Hash the user's input to compare securely
      const inputHashedOtp = crypto.createHash('sha256').update(rawInputOtp).digest('hex');

      // 4. Constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(storedHashedOtp, 'hex'),
        Buffer.from(inputHashedOtp, 'hex')
      );

      if (!isValid) {
        await redis.incr(redisAttemptsKey);
        await redis.expire(redisAttemptsKey, 60);
        return { error: "Invalid OTP code." };
      }

      await redis.del(redisSessionKey);
      await redis.del(redisAttemptsKey);

      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            },
          },
        }
      );

      // 6. Establish the Supabase Session (This sets the encrypted cookies automatically)
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: sessionData.accessToken,
        refresh_token: sessionData.refreshToken,
      });

      if (sessionError) {
        console.error("Failed to write Supabase cookies:", sessionError);
        return { error: "Could not establish a secure session." };
      }

      await redis.del(redisSessionKey);
      await redis.del(redisAttemptsKey);

      return { success: true, message: "OTP verified successfully." };

    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { error: "Internal server error during verification." };
  }
}

export async function getOTPTTL(sessionId: string) {
  if (!sessionId) {
    return { error: "Session ID is required." };
  }

  if (!redis.isOpen) {
    await redis.connect();
  }

  const redisSessionKey = `session:${sessionId}`;
  const redisSessionTTL = await redis.ttl(redisSessionKey);

  if (redisSessionTTL < 0) {
    return { error: "Session has expired or does not exist." };
  }

  return { success: true, ttl: redisSessionTTL };
}

export async function resendOTPCode(sessionId: string) {
  try {
    if (!redis.isOpen) await redis.connect();

    const redisSessionKey = `session:${sessionId}`;
    const redisAttemptsKey = `otp_attempts:${sessionId}`;

    const sessionDataRaw = await redis.get(redisSessionKey);

    if (!sessionDataRaw) {
      return { error: "Session has expired completely. Please sign in again." };
    }

    await redis.del(redisAttemptsKey);

    const newPlainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(newPlainOtp).digest('hex');

    const sessionData = JSON.parse(sessionDataRaw);
    sessionData.otp = hashedOtp;
    const email = sessionData.email;

    const timeToLive = 60;
    await redis.set(redisSessionKey, JSON.stringify(sessionData), { EX: timeToLive });

    await sendOtpEmail({
      toEmail: email,
      toName: sessionData.userName,
      otpCode: newPlainOtp,
    });

    return { success: true, newSessionId: sessionId, timeToLive };
  } catch (error) {
    console.error("Error resending OTP:", error);
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