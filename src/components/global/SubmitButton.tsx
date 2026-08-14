"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon, Loader } from "lucide-react";
import { cn } from "@/lib/utils"; // Standard in shadcn/ui setups

interface IconButtonProps {
  Icon: LucideIcon; 
  label: string;
  className?: string; // 1. Add optional className here
}

export function SubmitButton({ label, Icon, className }: IconButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className={cn("w-full flex items-center justify-center gap-2", className)} 
      disabled={pending} 
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}