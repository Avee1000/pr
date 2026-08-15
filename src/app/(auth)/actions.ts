"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import { getClientCountry } from "@/lib/geo/geo";
import { z } from "zod";
import { COUNTRIES } from "@/data/countries";

export interface AuthFormState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    country?: string[];
    _form?: string[]; // Global/root errors
  };
  message?: string;
}

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  country: z.string().min(2, "Country is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

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
          _form: [error.message], // Fixed: wrapped string in array
        },
      };
    }

    // If session is null, email confirmation is enabled in Supabase
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

  const { email, password } = validatedFields.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        errors: {
          _form: ["Invalid email or password. Please try again."],
        },
      };
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

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
