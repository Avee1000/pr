"use client";

import Link from "next/link";
import { useActionState, useState, useEffect, useRef } from "react"
import { signIn, type AuthFormState } from "@/app/(marketing)/(auth)/actions";
import { sendOTP } from "@/lib/security/action";
import { LogIn, AlertCircle, Eye, EyeOff, Loader } from "lucide-react";
import { SubmitButton } from "@/components/global/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from 'sonner';
import SocialAuthButtons from "./otherAuth/SocialAuth";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  const fieldErrors = state.errors;
  const rootError = fieldErrors?._form?.[0];
  const prevIsPendingRef = useRef(isPending);

  useEffect(() => {
    const wasPending = prevIsPendingRef.current;
    prevIsPendingRef.current = isPending;

    if (wasPending && !isPending) {
      const hasErrors = fieldErrors && Object.keys(fieldErrors).length > 0;

      if (!hasErrors) {
        toast.success("Redirecting to  verification page...", {
          classNames: { success: "!bg-background !text-foreground !border-border" },
          description: "Redirecting to  verification page...",
        });
      } else if (rootError) {
        toast.error(rootError, {
          classNames: { error: "!bg-background !text-foreground !border-border" }
        });
      }
    }
  }, [isPending, fieldErrors, rootError]);

  useEffect(() => {
    let loadingToastId: string | number | undefined;
    if (isPending) {
      loadingToastId = toast.loading("Signing in...");
    }
    return () => {
      if (loadingToastId) toast.dismiss(loadingToastId);
    };
  }, [isPending]);

  return (
    <div className="space-y-7 ">
      <Card className="max-sm:border-0 max-sm:shadow-none max-sm:ring-0 max-sm:w-full  max-sm:outline-none max-sm:bg-transparent">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your PriceRight workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-6  max-sm:space-y-2" noValidate>
            {rootError && (
              <div
                role="alert"
                aria-live="polite"
                className="flex flex-row gap-2 items-center rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive ring-1 ring-destructive/20"
              >
                <AlertCircle className="size-4 shrink-0" />
                <p>{rootError}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors?.email)}
                aria-describedby={fieldErrors?.email ? "email-error" : undefined}
                className={fieldErrors?.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {fieldErrors?.email && (
                <p id="email-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  aria-invalid={Boolean(fieldErrors?.password)}
                  aria-describedby={fieldErrors?.password ? "password-error" : undefined}
                  className={`pr-10 ${fieldErrors?.password ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors?.password && (
                <p id="password-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            <SubmitButton label="Sign in" Icon={LogIn} />
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-foreground underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <SocialAuthButtons />
      </div>
    </div>
  );
}