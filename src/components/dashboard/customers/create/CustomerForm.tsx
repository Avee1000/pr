"use client";

import { useActionState, useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { User, Mail, Globe, Phone, ArrowRight, AlertCircle, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { SubmitButton } from "../../../global/SubmitButton";
import { BiSolidCheckCircle } from "react-icons/bi";
import { updateOnboardingProgress } from "@/lib/onboarding/action";

const CustomerFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Customer's name must be at least 2 characters.")
        .max(100, "Name must be less than 100 characters."),
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address.")
        .max(50, "Email must be less than 50 characters."),
    country: z
        .string()
        .trim()
        .min(1, "Country is required.")
        .max(100, "Country must be less than 100 characters."),
    phone: z
        .string()
        .trim()
        .min(1, "Customer's phone number is required.")
        .max(20, "Phone number must be less than 20 characters."),
});

export type CustomerFormValues = z.infer<typeof CustomerFormSchema>;

export type CustomerFormState = {
    errors?: {
        name?: string[];
        email?: string[];
        country?: string[];
        phone?: string[];
    };
    message?: string | null;
    success?: boolean;
};

interface CustomerFormProps {
    onSuccess?: () => void;
    action: (prevState: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
}

const initialState: CustomerFormState = {};

export default function CustomerForm({ action, onSuccess }: CustomerFormProps) {
    const [name, setName] = useState(' ');
    const [email, setEmail] = useState(' ');
    const [state, formAction] = useActionState(async (prevState: CustomerFormState, formData: FormData) => {
        return await action(prevState, formData);
    }, initialState);
    const [showErrors, setShowErrors] = useState(false);


    useEffect(() => {
        if (state?.success) {
            toast(state.message || "Customer created successfully!", {
                icon: <BiSolidCheckCircle className="size-5" />
            });
            onSuccess?.();

            (async () => {
                try {
                    await updateOnboardingProgress("customer_details");
                } catch (error) {
                    console.error("Failed to update onboarding progress:", error);
                }
            })();

        } else if (state?.message && !state?.success) {
            setShowErrors(true);
            toast.error(state.message);
            const timeout = setTimeout(() => {
                setShowErrors(false);
                clearTimeout(timeout);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [state]);

    useEffect(() => {
        if (name) {
            setEmail(`${name.replace(/\s+/g, '').toLowerCase()}@gmail.com`);
        } else {
            setEmail("");
        }
    }, [name]);

    return (
        <Card
            style={{ border: "none", boxShadow: "none" }}
            className="py-6 px-3 w-full max-w-3xl">
            <CardHeader>
                <CardTitle className="font-heading text-2xl font-bold ">
                    Add New Customer
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Enter your customer's details to manage orders and quotes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="flex flex-col gap-8 max-sm:mt-5">
                    {/* {state.message && !state.success && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="flex flex-row gap-2 items-center rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-600/20"
                        >
                            <AlertCircle className="size-4" />
                            <p>{state.message}</p>
                        </div>
                    )} */}

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className=" font-medium">
                            <User className="size-4 text-muted-foreground" /> Name
                        </Label>
                        <div className="relative flex items-center">
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="First Name, Middle Name, Last Name"
                                autoComplete="name"
                                required
                                className="pl-5 rounded-xl max-sm:text-sm"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        {showErrors && state.errors?.name && (
                            <p className="text-xs text-red-600">{state.errors.name[0]}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email" className="font-medium max-sm:text-sm">
                            <Mail className="size-4 text-muted-foreground" /> Email
                        </Label>
                        <div className="relative flex items-center">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jane@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-5 rounded-xl max-sm:text-sm"
                            />
                        </div>
                        {showErrors && state.errors?.email && (
                            <p className="text-xs text-red-600">{state.errors.email[0]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="country" className="font-medium">
                                <Globe className="size-4 text-muted-foreground" /> Country </Label>
                            <div className="relative flex items-center">
                                <Input
                                    id="country"
                                    name="country"
                                    type="text"
                                    placeholder="United States"
                                    autoComplete="country-name"
                                    required
                                    className="pl-5 rounded-xl"
                                />
                            </div>
                            {showErrors && state.errors?.country && (
                                <p className="text-xs text-red-600">{state.errors.country[0]}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone" className="font-medium max-sm:text-sm">
                                <Phone className="size-4 text-muted-foreground" /> Phone Number</Label>
                            <div className="relative flex items-center">
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    autoComplete="tel"
                                    required
                                    className="pl-5 rounded-xl max-sm:text-sm"
                                />
                            </div>
                            {showErrors && state.errors?.phone && (
                                <p className="text-xs text-red-600">{state.errors.phone[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <SubmitButton label="Create Customer"
                            className="bg-action hover:bg-action rounded-xl w-auto h-11 mt-4 px-2 ml-auto max-sm:mt-0! max-sm:mb-4 max-sm:text-sm text-white"
                            Icon={PlusIcon} />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}