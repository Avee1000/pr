"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { signUp, type AuthFormState } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/global/SubmitButton";
import { ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { CountryAndPhoneForm } from "./CountrySelect";
import { ro } from "date-fns/locale";

const passwordRequirements = [
    "At least 6 characters",
    "At least one uppercase letter",
    "At least one lowercase letter",
    "At least one number",
    "At least one special character",
]

const initialState: AuthFormState = {};

export function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction] = useActionState(signUp, initialState);
    const [error, setError] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    console.log(formAction)
    // Password validation state
    const [password, setPassword] = useState("");
    const [validations, setValidations] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    // Helper flags
    const fieldErrors = state.errors;
    const rootError = fieldErrors?._form?.[0];
    useEffect(() => {
        if (fieldErrors) {
            // setError(true);
            // const timer = setTimeout(() => setError(false), 5000);
            // return () => clearTimeout(timer);
        }
    }, [fieldErrors, rootError]);

    // Validate password as the user types
    useEffect(() => {
        setValidations({
            minLength: password.length >= 6,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[^A-Za-z0-9]/.test(password),
        });
    }, [password]);

    const requirementChecks = [
        validations.minLength,
        validations.hasUppercase,
        validations.hasLowercase,
        validations.hasNumber,
        validations.hasSpecialChar,
    ];

    // Dynamic Validation checks
    const isNameValid = name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = requirementChecks.every(Boolean);

    // Helper to generate dynamic styles
    const getFieldStyles = (hasError: boolean, isValid: boolean, value: string) => {
        if (hasError) {
            return "border-destructive focus-visible:ring-destructive";
        }
        if (isValid && value.trim().length > 0) {
            return "border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-500/5";
        }
        return "";
    };

    return (
        <Card className="w-lg mx-auto">
            <CardHeader>
                <CardTitle className="font-heading text-2xl font-bold">Create your account</CardTitle>
                <CardDescription>
                    Start pricing your work and tracking your orders.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="flex flex-col gap-6" noValidate>
                    {/* Root / Global Error Banner */}
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

                    {/* Name Field */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            aria-invalid={Boolean(fieldErrors?.name)}
                            aria-describedby={fieldErrors?.name ? "name-error" : undefined}
                            className={fieldErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {fieldErrors?.name && (
                            <p id="name-error" className="text-xs font-medium text-destructive">
                                {fieldErrors.name[0]}
                            </p>
                        )}
                    </div>
                    {/* <Input
                                id="country"
                                name="country"
                                type="text"
                                placeholder="John Doe"
                                autoComplete="name"
                                required
                                aria-invalid={Boolean(fieldErrors?.name)}
                                aria-describedby={fieldErrors?.name ? "name-error" : undefined}
                                className={fieldErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {fieldErrors?.name && (
                                <p id="name-error" className="text-xs font-medium text-destructive">
                                    {fieldErrors.name[0]}
                                </p>
                            )} */}

                    {/* <Label htmlFor="phone">Phone No</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="text"
                                placeholder="John Doe"
                                autoComplete="name"
                                required
                                aria-invalid={Boolean(fieldErrors?.name)}
                                aria-describedby={fieldErrors?.name ? "name-error" : undefined}
                                className={fieldErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {fieldErrors?.name && (
                                <p id="name-error" className="text-xs font-medium text-destructive">
                                    {fieldErrors.name[0]}
                                </p>
                            )} */}

                    <div>
                        <div className="flex flex-col gap-1.5">
                            <CountryAndPhoneForm error={fieldErrors?.country?.[0]} />
                        </div>
                    </div>


                    {/* Email Field */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                autoComplete="new-password"
                                placeholder="••••••••"
                                minLength={6}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-invalid={Boolean(fieldErrors?.password)}
                                aria-describedby={
                                    fieldErrors?.password ? "password-error" : "password-hint"
                                }
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
                        {/* {fieldErrors?.password ? (
                            <p id="password-error" className="text-xs font-medium text-destructive">
                                {fieldErrors.password[0]}
                            </p>
                        ) : ( */}
                        <p id="password-hint" className="text-xs text-muted-foreground flex flex-col items-start gap-1 mt-1">
                            {passwordRequirements.map((requirement, index) => {
                                const isMet = requirementChecks[index];
                                return (
                                    <span
                                        key={index}
                                        className={`flex items-center gap-1.5 transition-colors ${isMet
                                            ? "text-emerald-600 font-medium"
                                            : fieldErrors?.password
                                                ? "text-destructive!"
                                                : "text-muted-foreground"
                                            }`}
                                    >
                                        <CheckCircle className={`size-3.5 ${isMet && isPasswordValid ? "text-emerald-600" : "text-muted-foreground/50"}`} />
                                        {requirement}
                                    </span>
                                );
                            })}
                        </p>
                        {/* )} */}
                    </div>

                    <SubmitButton label="Create account" Icon={ArrowRight} />
                </form>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-foreground underline">
                        Sign in
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}