import { getMaskedEmailFromSession, getOTPTTL } from "../../actions";
import { OtpVerificationForm } from "@/components/auth/OtpVerificationForm";
import { redirect } from "next/navigation";
import { NextResponse } from 'next/server';

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

    return <OtpVerificationForm session_Id={sessionId} maskedEmail={maskedEmail.maskedEmail} timeToLive={timeToLive.ttl as number}/>;
}