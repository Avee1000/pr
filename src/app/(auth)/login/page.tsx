"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, type AuthFormState } from "../actions";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Image from "next/image";
import ThemeToggleIcon from "@/components/ThemeIconButton";

const initialState: AuthFormState = {};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <main className="mx-auto sm:min-h-screen max-sm:h-dvh flex w-full max-w-md flex-1 flex-col justify-center px-4 sm:py-12">
      <div className="absolute top-0 left-0 m-4">
        <Link href="/" className="flex items-center gap-1 text-lg font-semibold text-ink dark:text-white">
          <Image
            src="/android-chrome-512x512.png"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
            alt="PriceRight Logo"
          />
          PriceRight
        </Link>
      </div>
      <div className="absolute top-0 right-0 m-4">
        <ThemeToggleIcon />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your PriceRight workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4" noValidate>
            {state.error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex flex-row gap-2 items-center rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-600/20"
              >
                <AlertCircle className="size-4" />
                <p>{state.error}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                minLength={6}
                required
                aria-describedby="password-hint"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[50%] translate-y-[-50%] cursor-pointer"
              >
                {showPassword ? (
                  <Eye className="size-4 text-gray-400" />
                ) : (
                  <EyeOff className="size-4 text-gray-400" />
                )}
              </span>
              <p id="password-hint" className="text-xs text-muted-foreground">
                At least 6 characters.
              </p>
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
    </main>
  );
}
