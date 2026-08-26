'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export function GlobalAlert() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [alertData, setAlertData] = useState<{
        title: string;
        message: string;
        variant: 'destructive' | 'default' | 'success';
    } | null>(null);

    useEffect(() => {
        const errorType = searchParams.get('error');

        if (errorType === 'session_expired') {
            setAlertData({
                title: 'Session Expired',
                message: 'Your verification session has expired. Please sign in again.',
                variant: 'destructive',
            });
        } else if (errorType === 'unauthorized') {
            setAlertData({
                title: 'Access Denied',
                message: 'You must be logged in to view this page.',
                variant: 'destructive',
            });
        } else if ( errorType === 'too_many_attempts') {
            setAlertData({
                title: 'Max attempts exceeded',
                message: 'You have reach your maximum attempts',
                variant: 'destructive',
            })
        }
    }, [searchParams]);

    useEffect(() => {
        if (!alertData) return;

        const timer = setTimeout(() => {
            setAlertData(null);
            
            router.replace(window.location.pathname, { scroll: false });
        }, 4000);

        return () => clearTimeout(timer);
    }, [alertData, router]);

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
            <AnimatePresence>
                {alertData && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="pointer-events-auto"
                    >
                        <Alert 
                            variant={alertData.variant === 'destructive' ? 'destructive' : 'default'} 
                            className="bg-background/95 "
                        >
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{alertData.title}</AlertTitle>
                            <AlertDescription>{alertData.message}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}