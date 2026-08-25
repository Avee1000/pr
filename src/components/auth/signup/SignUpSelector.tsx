'use client'

import { AccountType, AccountTypeSelector } from "./AccountType";
import { PersonalSignUpForm } from "./forms/PersonalSignup";
import { OrganizationSignUpForm } from "./forms/OrgSignUp";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { success } from "zod";

export function SignUpPageSelector() {
    const [step, setStep] = useState<1 | 2>(1);
    const [accountType, setAccountType] = useState<AccountType>('organization');
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
        <div className="relative overflow-hidden w-full py-4 min-h-128">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step-1"
                        variants={step1Variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                    >
                        <AccountTypeSelector
                            selectedType={accountType}
                            onSelect={(value) => setAccountType(value)}
                            onContinue={() => setStep(2)}
                        />
                    </motion.div>
                )}

                {step === 2 && accountType === 'organization' && (
                    <motion.div
                        key="step-2"
                        variants={step2Variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="space-y-1"
                    >
                        <OrganizationSignUpForm />
                        <div>
                            <Button
                                variant={"ghost"}
                                onClick={() => setStep(1)}
                                className={'border border-muted-foreground/30 dark:border-muted-foreground/60 ml-2'}
                            >
                                <ArrowLeft className="size-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && accountType === 'personal' && (
                    <motion.div
                        key="step-2"
                        variants={step2Variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="space-y-1"
                    >
                        <PersonalSignUpForm onSuccess={(val: boolean) => setPersonalSuccess(val)}/>

                        <div className={personalSuccess ? 'hidden' : ''}>
                            <Button
                                variant={"ghost"}
                                onClick={() => setStep(1)}
                                className={'border border-muted-foreground/30 dark:border-muted-foreground/60 ml-1'}
                            >
                                <ArrowLeft className="size-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}