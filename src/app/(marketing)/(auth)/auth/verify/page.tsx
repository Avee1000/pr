import { getMaskedEmailFromSession, getOTPTTL } from "../../actions";
import { OtpVerificationForm } from "@/components/auth/login/forms/OtpVerificationForm";
import { redirect } from "next/navigation";
import { NextResponse } from 'next/server';
import ThemeToggleIcon from "@/components/global/ThemeIconButton";
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils'
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function VerifyPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>;
}) {
    const { session_id: sessionId } = await searchParams;
    const maskedEmail = sessionId ? await getMaskedEmailFromSession(sessionId) : null;
    const timeToLive = await getOTPTTL(sessionId as string);

    if (!maskedEmail || !sessionId) {
        redirect('/login?error=session_expired');
    }

    return (
        <>
            <div className="absolute top-6 right-6  z-10">
                <ThemeToggleIcon />
            </div>
            <LogoLink className={'max-xl:hidden absolute top-6 left-8'} />
            <OtpVerificationForm session_Id={sessionId} maskedEmail={maskedEmail.maskedEmail} timeToLive={timeToLive.ttl as number} />;
        </>
    )
}

function LogoLink({ className }: { className: string }) {
    return (
        <div className={cn("flex flex-row items-center justify-between", className)}>
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src="/android-chrome-512x512.png"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    priority
                    alt="PriceRight Logo"
                />
            </Link>
        </div>
    )
}
