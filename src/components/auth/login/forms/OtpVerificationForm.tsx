"use client";

import React, { useState, useRef, ClipboardEvent, useEffect } from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from '@/components/global/SubmitButton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { verifyOTPCode, resendOTPCode } from '@/app/(marketing)/(auth)/actions';
import { es } from 'date-fns/locale';

interface OtpFormProps {
    session_Id: string;
    maskedEmail: string;
    timeToLive: number;
}

export function OtpVerificationForm({ session_Id, maskedEmail, timeToLive }: OtpFormProps) {
    const router = useRouter();
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isPending, setIsPending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [count, setCount] = useState(Math.round(timeToLive / 2));
    const [isResendActive, setIsResendActive] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(session_Id);

    useEffect(() => {
        if (count <= 0) {
            setIsResendActive(true);
            return;
        }
        const timer = setInterval(() => {
            setCount((prevCount) => prevCount - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [count]);

    const handleChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim().slice(0, 6);
        if (!/^\d+$/.test(pasteData)) return;

        const newOtp = [...otp];
        pasteData.split('').forEach((char, idx) => {
            if (idx < 6) newOtp[idx] = char;
        });
        setOtp(newOtp);

        const nextIndex = Math.min(pasteData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalOtp = otp.join('');

        if (finalOtp.length < 6) {
            toast.error("Please enter the complete 6-digit code.", {
                classNames: { error: "!bg-background !text-foreground !border-border" }
            });
            return;
        }

        setIsPending(true);
        try {
            const res = await verifyOTPCode(currentSessionId, finalOtp);

            if (res?.error) {
                toast.error(res.error, {
                    classNames: { error: "!bg-background !text-foreground !border-border" }
                });
            } else if (res?.success) {
                toast.success("Verification successful!", {
                    classNames: { success: "!bg-background !text-foreground !border-border" }
                });
                router.push("/dashboard");
            }
            if (res?.locked) {
                setIsLocked(true);
                setIsResendActive(true);
                toast.error("Too many failed attempts. Please request a new code.", {
                    classNames: { error: "!bg-background !text-foreground !border-border" }
                });
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsPending(false);
        }
    };

    const handleResend = async () => {
        setIsPending(true);
        try {
            const res = await resendOTPCode(currentSessionId);

            if (res.error) {
                toast.error(res.error);
                return;
            }

            if (res.success && res.newSessionId) {
                setCurrentSessionId(res.newSessionId);
                // setCount(res.newSessionId ? timeToLive);
                setIsResendActive(false);
                setIsLocked(false);
                setOtp(['', '', '', '', '', '']); // Clear inputs
                toast.success("A new code has been sent to your email.", {
                    classNames: { success: "!bg-background !text-foreground !border-border" }
                });
            }
        } catch (error) {
            toast.error("Failed to resend code.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-105 w-full p-2 py-7! md:p-4 rounded-xl shadow-sm max-sm:border-0 max-sm:shadow-none max-sm:bg-transparent">
                <CardHeader className="text-center space-y-3">
                    <div className="w-12 h-12 bg-primary/15 text-foreground rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <CardTitle className="font-heading text-2xl font-bold">Enter verification code</CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                        We&apos;ve sent a 6-digit code to your email <span className="font-semibold text-foreground">{maskedEmail}</span>.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <Input
                                    disabled={isLocked || isPending}
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    aria-label={`Digit ${index + 1} of 6`}
                                    className="w-12 h-14 text-center text-xl font-semibold tabular-nums border-2 border-slate-200 rounded-lg bg-white focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25 transition-all"
                                    required
                                />
                            ))}
                        </div>

                        <SubmitButton disabled={isLocked || isPending} label={isPending ? "Verifying..." : "Verify"} Icon={CheckCircle} />
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Didn&apos;t receive the code?{' '}
                        {!isResendActive ? (<span className='text-ink dark:text-white font-semibold'>00:{String(count).padStart(2, '0')}</span>) : (
                            <button
                                disabled={isPending}
                                type="button"
                                onClick={handleResend}
                                className="text-foreground font-semibold underline hover:text-[#E0B200] transition-colors cursor-pointer"
                            >
                                Resend
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}