"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle, Info, Clock } from "lucide-react";
// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { verifyQuoteAccess } from "@/lib/orders/quotes/action";

interface QuoteAccessGateProps {
  token: string;
}

export default function QuoteAccessGate({ token }: QuoteAccessGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
    try {
      const result = await verifyQuoteAccess(token, email);
      console.log(result);
      if (!result.success) {
        if (result.status === "COMPLETED") {
          toast(result.message, {
            icon: <Info fill="black" className="size-5 text-white" />,
          });
          return;
        }
        setError(
          result.error || "Verification failed. Please check the email address."
        );
        toast.error(
          result.error || "Verification failed. Please check the email address."
        );
        setIsVerifying(false);
        return;
      }

      // Wrap router.refresh in startTransition to trigger Suspense on the server
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isLoading = isVerifying || isPending;

  return (
    <div className="mx-auto min-h-[60dvh] p-4 flex items-center justify-center">
      <Card className="rounded-xl w-full max-w-md border border-muted shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Lock className="h-6 w-6 text-slate-700" />
          </div>
          <CardTitle className="font-heading text-xl font-semibold text-ink dark:text-white">
            Verify Your Identity
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter the email address where you received this quote link to access
            and view the quote details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 24-Hour Expiration Banner */}
          <div className="flex items-start gap-2.5 mb-6 rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <span className="font-semibold">Important:</span> For security
              reasons, this access link will expire and be blocked 24 hours
              after issuance.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email-input"
                className="text-sm font-medium text-ink"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9 placeholder:text-muted-foreground dark:bg-black"
                />
              </div>
            </div>

            {/* {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )} */}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand font-medium mt-2  text-ink hover:bg-brand/90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "View Quote"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}