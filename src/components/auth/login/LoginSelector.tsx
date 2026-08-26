'use client'

import { OtpVerificationForm } from "./forms/OtpVerificationForm";
import { LoginForm } from "./forms/Login";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { success } from "zod";

export function LoginPageSelector() {
    const [step, setStep] = useState<1 | 2>(1);
    const [isMobile, setIsMobile] = useState(false);
    const [personalSuccess, setPersonalSuccess] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1280);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const step1Variants = {
        initial: { opacity: 0, x: 0, y: 0 },
        animate: { opacity: 1, x: 0, y: 0 },
        exit: isMobile
            ? { opacity: 0, y: -100 }
            : { opacity: 0, y: -50 }
    };

    const step2Variants = {
        initial: isMobile
            ? { opacity: 0, y: 100 }
            : { opacity: 0, y: 50 },
        animate: { opacity: 1, x: 0, y: 0 },
        exit: isMobile
            ? { opacity: 0, y: 100 }
            : { opacity: 0, y: 50 }
    };

    return (
        <div className="relative overflow-hidden w-full py-4">
            <AnimatePresence mode="wait">
                    <div>
                        <LoginForm />
                    </div>
            </AnimatePresence>
        </div>
    );
}