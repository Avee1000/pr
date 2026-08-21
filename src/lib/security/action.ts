'use server'

import { redis } from "@/lib/redis/redis"
import { sendOtpEmail } from '@/lib/email/quote';
import { createClient } from "../supabase/server";
import crypto from "node:crypto";
import { signIn } from "@/app/(marketing)/(auth)/actions";

export async function sendOTP() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
        console.error(error);
        return { error: "Unauthorized: you must be logged in." };
    }

    try {
        if (!redis.isOpen) await redis.connect();

        function hasher(code: string) {
            return crypto.createHash('sha256').update(code).digest('hex');
        }

        const userEmail = user.email!;
        const userName = user.user_metadata?.full_name || "User";

        const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = hasher(rawOtp);

        const sessionId = crypto.randomBytes(32).toString('hex');

        const redisSessionKey = `session:${sessionId}`;
        const redisAttemptsKey = `otp_attempts:${sessionId}`;

        const sessionData = JSON.stringify({
            email: userEmail,
            otp: hashedOtp
        });

        await redis.set(redisSessionKey, sessionData, { EX: 120 });
        await redis.del(redisAttemptsKey);

        await sendOtpEmail({
            toEmail: userEmail,
            toName: userName,
            otpCode: rawOtp,
        });

        return { success: true, sessionId };

    } catch (error) {
        console.error(error);
        return { error: "Failed to send or generate OTP." };
    }
}