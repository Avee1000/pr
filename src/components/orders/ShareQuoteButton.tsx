"use client";

import { useState, useTransition } from "react";
import { Share2, Copy, Send } from "lucide-react";
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
import { sendTokenEmail } from "@/lib/orders/quotes/action";
import { toast }from "sonner";

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

  const handleSendEmail = () => {
    if (!link || isPending) return;

    setError(null);
    startTransition(async () => {
      const result = await sendTokenEmail(orderId);
      if ("error" in result) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(result.message, {
        duration: 1000,
        dismissible: true,
      });
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
              className={`inline-flex items-center justify-start w-full gap-1.5 rounded-lg dark:bg-ink dark:hover:bg-muted-foreground/20 hover:bg-ink/10 text-ink dark:text-muted-foreground transition-all disabled:opacity-50 text-xs font-medium ${label ? "h-7 px-2.5" : "size-7"
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
            <div className="flex items-center gap-1">
              <Input readOnly value={link} className="h-8 text-xs" />
              {/* Copy Button */}
              <Button type="button" size="sm" onClick={handleCopy} className="h-8 shrink-0 font-normal">
                {copied ? (
                  "Copied!"
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy
                  </>
                )}
              </Button>

              {/* Send Email Button */}
              <Button type="button" variant={"outline"} size="sm" onClick={handleSendEmail} className="h-8 w-10 shrink-0 font-normal">
                {isPending ? (
                  <LoadingState iconOnly iconClassName="size-4"/>
                ) : (
                  <>
                    <Send className="size-3.5" />
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