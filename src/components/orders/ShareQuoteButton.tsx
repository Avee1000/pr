"use client";

import { useState, useTransition } from "react";
import { Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { generateQuoteLink } from "@/lib/orders/quotes/action";

interface ShareQuoteButtonProps {
  orderId: string;
}

export function ShareQuoteButton({ orderId }: ShareQuoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen || link || isPending) return;

    setError(null);
    startTransition(async () => {
      const result = await generateQuoteLink(orderId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setLink(`${window.location.origin}/quote/${result.token}`);
    });
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex items-center justify-center size-7 rounded-lg border border-ink/20 bg-white hover:bg-ink/10 text-ink dark:text-gray-400 transition-all disabled:opacity-50"
              title="Share quote"
              disabled={isPending}
            >
              <Share2 className="size-3.5" />
            </button>
          }
        />
        <PopoverContent align="end" className="w-80 space-y-3">
          <PopoverHeader>
            <PopoverTitle>Share quote</PopoverTitle>
            <PopoverDescription>
              Send this link so the customer can view and approve the quote.
            </PopoverDescription>
          </PopoverHeader>
          {isPending && !link ? (
            <p className="text-sm text-ink/60">Generating link...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : link ? (
            <div className="flex items-center gap-2">
              <Input readOnly value={link} className="h-8 text-xs" />
              <Button type="button" size="sm" onClick={handleCopy} className="h-8 shrink-0">
                {copied ? "Copied!" : (
                  <>
                    <Copy className="size-3.5" />Copy
                  </>
                )}
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
