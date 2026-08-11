"use client";

import { useState, useTransition } from "react";
import { Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { generateQuoteLink } from "@/lib/orders/quotes/action";
import { Alert } from "@/components/feedback/alert";
import { LoadingState } from "../feedback/loading-state";

interface ShareQuoteButtonProps {
  label?: string;
  orderId: string;
}

export function ShareQuoteButton({ orderId, label }: ShareQuoteButtonProps) {
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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <button
              type="button"
              className={`inline-flex items-center justify-start w-full gap-1.5 rounded-lg border border-ink/20 bg-white hover:bg-ink/10 text-ink dark:text-gray-400 transition-all disabled:opacity-50 text-xs font-medium ${
                label ? "h-7 px-2.5" : "size-7"
              }`}
              title="Share quote"
              disabled={isPending}
            >
              <Share2 className="size-3.5 shrink-0" />
              {label && <span>{label}</span>}
            </button>
          }
        />
        <DialogContent className="sm:max-w-md space-y-1" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Share quote</DialogTitle>
            <DialogDescription>
              Send this link so the customer can view and approve the quote.
            </DialogDescription>
          </DialogHeader>
          {isPending && !link ? (
            <LoadingState iconOnly />
          ) : error ? (
            <Alert variant="warning">{error}</Alert>
          ) : link ? (
            <div className="flex items-center gap-2">
              <Input readOnly value={link} className="h-8 text-xs" />
              <Button type="button" size="sm" onClick={handleCopy} className="h-8 shrink-0">
                {copied ? (
                  "Copied!"
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}