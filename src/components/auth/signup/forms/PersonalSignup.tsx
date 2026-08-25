"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState, useEffect } from "react";
import { signUp, type AuthFormState } from "@/app/(marketing)/(auth)/actions";
import { SubmitButton } from "@/components/global/SubmitButton";
import { ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle, ArrowLeft, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { CountryAndPhoneForm } from "../../CountrySelect";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "@/components/global/useMediaQuery";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const passwordRequirements = [
    "At least 6 characters",
    "At least one uppercase letter",
    "At least one lowercase letter",
    "At least one number",
    "At least one special character",
];

const initialState: AuthFormState = {};

interface PersonalSignUpFormProps {
    onSuccess?: (success: boolean) => void;
}

export function PersonalSignUpForm({ onSuccess }: PersonalSignUpFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction, isPending] = useActionState(signUp, initialState);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [step, setStep] = useState<1 | 2>(1);
    const [direction, setDirection] = useState(1);
    const [password, setPassword] = useState("");
    const isMobile = useMediaQuery("(max-width: 1280px)");

    const [validations, setValidations] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    const fieldErrors = state?.errors;
    const rootError = fieldErrors?._form?.[0];

    useEffect(() => {
        let toastId: string | number;

        if (isPending) {
            toastId = toast.loading("Creating account...")
        }

        if (state?.success) {
            if (typeof onSuccess === "function") {
                onSuccess(state.success)
            }
            toast.success(state.message || "Account created successfully!", {
                className: "!bg-background !text-foreground !border-border"
            });
            redirect('/dashboard');
        } else if (state?.success === false) {
            toast.error(state.message || "Failed to create account. Please try again.");
        }
        return () => {
            if (toastId) toast.dismiss(toastId);
        };
    }, [isPending, state, onSuccess]);

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

    const isPasswordValid = requirementChecks.every(Boolean);

    const slideVariants = {
        enter: ({ dir, isMobile }: { dir: number; isMobile: boolean }) => ({
            x: isMobile ? (dir > 0 ? "100%" : "-100%") : 0,
            y: isMobile ? 0 : (dir > 0 ? 50 : -50),
            opacity: 0,
        }),
        center: {
            x: 0,
            y: 0,
            opacity: 1,
        },
        exit: ({ dir, isMobile }: { dir: number; isMobile: boolean }) => ({
            x: isMobile ? (dir > 0 ? "-100%" : "100%") : 0,
            y: isMobile ? 0 : (dir > 0 ? -50 : 50),
            opacity: 0,
        }),
    };

    const customProps = { dir: direction, isMobile };

    return (
        <Card className="ring-0 border-none shadow-none px-1 w-full max-w-lg mx-auto bg-transparent">
            <CardHeader className="px-0 mb-4">
                <CardTitle className="font-heading text-2xl px-0! font-semibold">
                    {step === 1 ? "Create your account" : "Check your email"}
                </CardTitle>
                <CardDescription>
                    {step === 1
                        ? "Start pricing your work and tracking your orders."
                        : `We've sent a confirmation link to ${email || "your email address"}.`}
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
                <motion.div
                    animate={{ height: "auto" }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className="grid grid-cols-1 grid-rows-1 relative overflow-hidden">
                        <AnimatePresence key={step} mode="popLayout" custom={customProps}>
                            <motion.form
                                key="step-1"
                                custom={customProps}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                action={formAction}
                                className="flex flex-col  gap-6 max-sm:my-3 px-1"
                                noValidate
                            >
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

                                {/* Country & Phone Selector */}
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
                                            aria-describedby={fieldErrors?.password ? "password-error" : "password-hint"}
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
                                </div>
                                <SubmitButton label="Create account" Icon={ArrowRight} />
                            </motion.form>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </CardContent>
        </Card>
    );
}

{/* <motion.div
    key="step-2"
    custom={customProps}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="flex flex-col items-center text-center py-6 gap-4"
>
    <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
        <MailCheck className="size-10" />
    </div>

    <div className="space-y-1 max-w-sm">
        <h3 className="font-semibold text-lg">Verification Email Sent</h3>
        <p className="text-sm text-muted-foreground">
            Please check your inbox and follow the link to verify your email and activate your account.
        </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
        <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
                setDirection(-1);
                setStep(1);
            }}
        >
            <ArrowLeft className="size-4" />
            Back to register
        </Button>
        <Button className="w-full">
            <Link href="/login">Go to Login</Link>
        </Button>
    </div>
</motion.div> */}

// <motion.div
//     key="step-2"
//     custom={customProps}
//     variants={slideVariants}
//     initial="enter"
//     animate="center"
//     exit="exit"
//     transition={{ duration: 0.3, ease: "easeInOut" }}
//     className="flex flex-col items-center text-center py-6 gap-4"
// >
//     <div className="relative size-30 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
//         {/* {isLoadingProfile ? (
//             <LoadingState className="opacity-50" />
//         ) : profile?.avatar_url && !imageError ? (
//             <div className="relative w-full h-full cursor-pointer group overflow-hidden rounded-full" title="Profile Photo">
//                 <Image
//                     src={profile.avatar_url}
//                     alt={user?.user_metadata?.name ?? user?.email ?? "User avatar"}
//                     fill
//                     sizes="400px"
//                     priority
//                     // onError={}
//                     className="object-cover transition-transform duration-200 group-hover:scale-103"
//                 />
//                 <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
//             </div>
//         ) : (
//             <User strokeWidth={1} className="size-18 text-muted-foreground" />
//         )} */}
//         <User strokeWidth={1} className="size-18 text-muted-foreground" />
//     </div>

//     <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
//         <Button
//             type="button"
//             variant="outline"
//             className="w-full gap-2"
//             onClick={() => {
//                 setDirection(-1);
//                 setStep(1);
//             }}
//         >
//             <ArrowLeft className="size-4" />
//             Back to register
//         </Button>
//         <Button className="w-full">
//             <Link href="/login">Go to Login</Link>
//         </Button>
//     </div>
// </motion.div>