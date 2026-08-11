"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ApproveQuoteButton({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {

      // toast.promise handles the loading, success, and error states cleanly in one notification
      toast.promise(
        fetch(`/api/quotes/${token}/approve`, { method: "POST" }).then(async (res) => {
          if (!res.ok) throw new Error("Failed to approve");
          const data = await res.json();
          return data;
        }),
        {
          loading: "Approving quote...",
          success: () => {
            router.refresh();
            return "Quote approved!";
          },
          error: () => {
            const msg = "Could not approve this quote. Please try again.";
            setIsLoading(false);
            setError(msg);
            return msg;
          },
        }
      );
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" onClick={() => {
        setIsLoading(true);
        handleApprove();
      }} disabled={isLoading} className="bg-action text-action-foreground">
        {isLoading ? "Approving..." : "Approve quote"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
