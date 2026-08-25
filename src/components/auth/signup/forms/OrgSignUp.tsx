"use client";

import Link from "next/link";
import { useActionState, useState, useEffect, useRef } from "react";
import { organizationSignUp, type OrganizationAuthFormState } from "@/app/(marketing)/(auth)/actions";
import { SubmitButton } from "@/components/global/SubmitButton";
import { ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle, ArrowLeft, Building2, User, Lock, Code } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner";

const passwordRequirements = [
    "At least 6 characters",
    "At least one uppercase letter",
    "At least one lowercase letter",
    "At least one number",
    "At least one special character",
];

const initialState: OrganizationAuthFormState = {};

export function OrganizationSignUpForm() {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);

    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction, isPending] = useActionState(organizationSignUp, initialState);

    // Form field states
    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companySize, setCompanySize] = useState("1-10");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const isMobile = useMediaQuery("(max-width: 1280px)");
    const [country, setSelectedCountry] = useState("");
    // Password validation state
    const [validations, setValidations] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });
    const fieldErrors = state.errors;
    const rootError = fieldErrors?._form?.[0];

    useEffect(() => {
        setValidations({
            minLength: password.length >= 6,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[^A-Za-z0-9]/.test(password),
        });
    }, [password]);

    useEffect(() => {
        if (!fieldErrors) return;

        const hasStep1Errors =
            (fieldErrors.name?.length ?? 0) > 0 ||
            (fieldErrors.company_name?.length ?? 0) > 0 ||
            (fieldErrors.company_size?.length ?? 0) > 0 ||
            (fieldErrors.country?.length ?? 0) > 0;

        if (hasStep1Errors) {
            setDirection(-1);
            setStep(1);
        }
    }, [fieldErrors]);

    useEffect(() => {
        let toastId: string | number;

        if (isPending) {
            toastId = toast.loading("Creating your account...", {
                id: "signup-toast",
                className: "!bg-background !text-foreground !border-border"
            });
        }
        if (state?.errors?._form?.[0]) {
            toast.error("Sign up failed", {
                id: "signup-toast",
                description: state.errors._form[0],
            });
        }
        if (state?.success) {
            toast.success("Account created successfully!", {
                id: "signup-toast",
                description: "Please check your email to verify your organization account.",
                className: "!bg-background !text-foreground !border-border",
            });
        }

        return () => {
            if (toastId) toast.dismiss(toastId);
        };
    }, [isPending, state]);

    const requirementChecks = [
        validations.minLength,
        validations.hasUppercase,
        validations.hasLowercase,
        validations.hasNumber,
        validations.hasSpecialChar,
    ];

    const isPasswordValid = requirementChecks.every(Boolean);

    const canGoNext = name.trim() !== "" && companyName.trim() !== "" && country.trim() !== "";

    const handleNext = () => {
        if (!canGoNext) return;
        setDirection(1);
        setStep(2);
    };

    const handleBack = () => {
        setDirection(-1);
        setStep(1);
    };

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
        <Card className="ring-0 border-none shadow-none px-1 w-full max-w-lg mx-auto bg-transparent overflow-hidden">
            <CardHeader className="px-0 mb-4">
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span className={step === 1 ? "text-brand" : ""}>Step 1: Details</span>
                    <span>•</span>
                    <span className={step === 2 ? "text-brand" : ""}>Step 2: Security</span>
                </div>

                <CardTitle className="font-heading text-2xl px-0! font-semibold">
                    {step === 1 ? "Tell us about your business" : "Secure your account"}
                </CardTitle>
                <CardDescription>
                    {step === 1
                        ? "Set up your workspace to manage team orders and pricing."
                        : "Enter your company/work email and create a password to protect your organization profile."}
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
                <form
                    action={formAction}
                    className="flex min-h-82.75 flex-col px-0! gap-6 max-sm:my-3" noValidate>
                    <input type="hidden" name="account_type" value="organization" />
                    {/* 
                    {rootError && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="flex flex-row gap-2 items-center rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive ring-1 ring-destructive/20"
                        >
                            <AlertCircle className="size-4 shrink-0" />
                            <p>{rootError}</p>
                        </div>
                    )} */}
                    <motion.div
                        animate={{ height: "auto" }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 grid-rows-1 relative overflow-hidden">
                            <AnimatePresence key={step} mode="popLayout" custom={customProps}>
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        custom={customProps}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="flex flex-col gap-4 px-1"
                                    >
                                        {/* Full Name Field */}
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                placeholder="First Name, Middle Name, Last Name"
                                                autoComplete="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                aria-invalid={Boolean(fieldErrors?.name)}
                                                className={fieldErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}
                                            />
                                            {fieldErrors?.name && (
                                                <p className="text-xs font-medium text-destructive">{fieldErrors.name[0]}</p>
                                            )}
                                        </div>

                                        {/* Company Name Field */}
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="companyName">Company / Organization Name</Label>
                                            <Input
                                                id="companyName"
                                                name="company_name"
                                                type="text"
                                                placeholder="Acme Inc."
                                                autoComplete="organization"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                required
                                                aria-invalid={Boolean(fieldErrors?.company_name)}
                                                className={fieldErrors?.company_name ? "border-destructive focus-visible:ring-destructive" : ""}
                                            />
                                            {fieldErrors?.company_name && (
                                                <p className="text-xs font-medium text-destructive">{fieldErrors.company_name[0]}</p>
                                            )}
                                        </div>

                                        {/* Company Size Field */}
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="companySize">Company Size</Label>
                                            <Select value={companySize} onValueChange={(value) => setCompanySize(value as string)} name="company_size" id="companySize" required
                                                aria-invalid={Boolean(fieldErrors?.company_size)}
                                            >
                                                <SelectTrigger
                                                    className={fieldErrors?.company_size ? "border-destructive focus-visible:ring-destructive flex h-9 w-full rounded-md px-3 py-1 text-base  transition-colors" : "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base  transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-xs focus-visible:border-ring  focus-visible:ring-3 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/35 dark:focus-within:ring-brand/40"}>
                                                    <SelectValue>{companySize} employees</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent alignItemWithTrigger={false}>
                                                    <SelectGroup>
                                                        <SelectLabel>Company Size</SelectLabel>
                                                        <SelectItem key='1-10' value="1-10">1-10 employees</SelectItem>
                                                        <SelectItem key='11-50' value="11-50">11-50 employees</SelectItem>
                                                        <SelectItem key='51-200' value="51-200">51-200 employees</SelectItem>
                                                        <SelectItem key='+200' value="+200">+200 employees</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {fieldErrors?.company_size && (
                                                <p className="text-xs font-medium text-destructive">{fieldErrors.company_size[0]}</p>
                                            )}
                                        </div>

                                        {/* Country and Phone Form Component */}
                                        <div >
                                            <CountryAndPhoneForm
                                                error={fieldErrors?.country?.[0]}
                                                value={country}
                                                onCountryChange={(code) => setSelectedCountry(code)} />
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={!canGoNext}
                                            className="w-full mt-2"
                                        >
                                            Continue <ArrowRight className="inline size-5" />
                                        </Button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <>
                                        <input type="hidden" name="name" value={name} />
                                        <input type="hidden" name="company_name" value={companyName} />
                                        <input type="hidden" name="company_size" value={companySize} />
                                        <input type="hidden" name="country" value={country} />
                                    </>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        custom={customProps}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="flex flex-col gap-4 px-1"
                                    >
                                        {/* Work Email Field */}
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="email">Work Email</Label>
                                            <Input
                                                id="email"
                                                name="work_email"
                                                type="email"
                                                placeholder="name@company.com"
                                                autoComplete="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                aria-invalid={Boolean(fieldErrors?.work_email)}
                                                className={fieldErrors?.work_email ? "border-destructive focus-visible:ring-destructive" : ""}
                                            />
                                            {fieldErrors?.work_email && (
                                                <p className="text-xs font-medium text-destructive">{fieldErrors.work_email[0]}</p>
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
                                                    className={`pr-10 ${fieldErrors?.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>

                                            {/* Password Checklist */}
                                            <p id="password-hint" className="text-xs text-muted-foreground flex flex-col items-start gap-1 mt-1">
                                                {passwordRequirements.map((requirement, index) => {
                                                    const isMet = requirementChecks[index];
                                                    return (
                                                        <span
                                                            key={index}
                                                            className={`flex items-center gap-1.5 transition-colors ${isMet
                                                                ? "text-emerald-600 font-medium"
                                                                : fieldErrors?.password
                                                                    ? "text-destructive"
                                                                    : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            <CheckCircle
                                                                className={`size-3.5 ${isMet && isPasswordValid ? "text-emerald-600" : "text-muted-foreground/50"
                                                                    }`}
                                                            />
                                                            {requirement}
                                                        </span>
                                                    );
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex gap-3 mt-2">
                                            <Button type="button" variant="outline" onClick={handleBack} className="w-1/3">
                                                <ArrowLeft className="mr-2 size-4" /> Back
                                            </Button>
                                            <div className="w-2/3">
                                                <SubmitButton label="Create account" Icon={ArrowRight} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </form>
            </CardContent>
        </Card >
    );
}