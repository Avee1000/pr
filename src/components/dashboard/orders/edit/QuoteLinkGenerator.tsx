'use client'

import { useState, useEffect, useTransition, useCallback } from "react";
import { Copy, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { shareToken } from '@/lib/orders/quotes/action'
import { LoadingState } from '@/components/feedback/loading-state'
import { Alert } from '@/components/feedback/alert'
import Information from "@/components/global/Information";

export default function QuoteLinkGenerator({ orderId }: { orderId: string }) {
    const [link, setLink] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [expiry, setExpiry] = useState<Date | null>(null);


    // 1. Extract generation logic into a reusable callback
    const generateLink = useCallback(() => {
        startTransition(async () => {
            setError(null);
            const result = await shareToken(orderId);
            if ("error" in result) {
                setError(result.error);
                return;
            }
            setLink(`${window.location.origin}/quote/${result.token}`);
            setExpiry(new Date(result.expiresAt))
        });
    }, [orderId]);

    // 2. Trigger initial load on mount or when orderId changes
    useEffect(() => {
        generateLink();
    }, [generateLink]);

    const handleCopy = () => {
        if (!link) return;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast("Quote link copied to clipboard!", {
            duration: 1500,
            icon: <CheckCircle2 className="size-4" />,
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="pt-2">
            {isPending && !link ? (
                <LoadingState iconClassName='text-ink' className='p-0 [all:unset]' />
            ) : error ? (
                <div className="flex flex-col items-center gap-2">
                    <Alert variant='warning' className="flex-1">{error} or try refreshing.</Alert>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={generateLink}
                        disabled={isPending}
                        className="h-8 shrink-0 gap-1.5 "
                    >
                        <RefreshCw className={`size-3.5 ${isPending ? 'animate-spin' : ''}`} />Refresh
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <input
                        readOnly
                        value={link || ''}
                        className="h-8 text-xs w-full px-2 rounded-md border border-input bg-background font-mono select-all focus:outline-none"
                    />
                    {/* Copy Button */}
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 shrink-0 gap-1.5"
                        disabled={!link || isPending}
                    >
                        <Copy className="size-3.5" />
                        {/* <span className="text-xs">{copied ? "Copied" : "Copy"}</span> */}
                    </Button>
                </div>
            )}
            <div className="flex flex-row items-center mt-2 gap-2 ">
                {expiry &&
                    <>
                        <p className="text-xs text-muted-foreground">
                            Link expires: {expiry.toLocaleString()}
                        </p>
                        <Information detail="Generate a new link after the link expiration date (links become inactive after expiry)" />
                    </>
                }
            </div>
        </div>
    );
}
