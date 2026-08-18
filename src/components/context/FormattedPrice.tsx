"use client";

import { useCurrency } from "@/components/context/currencyContext";
import { LoadingState } from "../feedback/loading-state";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormattedPriceProps {
  amountInUSD: number;
  className?: string;
  showLoaderIcon?: boolean;
  showSkeleton?: boolean;
}

export function FormattedPrice({ 
  amountInUSD, 
  className, 
  showLoaderIcon = false, 
  showSkeleton = true 
}: FormattedPriceProps) {
  const { formatPrice, loading } = useCurrency();

  const shouldUseLoader = showLoaderIcon;
  const shouldUseSkeleton = !showLoaderIcon && showSkeleton;

  if (loading) {
    if (shouldUseLoader) {
      return (
        <span className={className}>
          <LoadingState icon={<Loader className="size-5 animate-spin" />} />
        </span>
      );
    }

    if (shouldUseSkeleton) {
      return (
        <span className={cn('inline-block animate-pulse', className)}>
          <span className="inline-block h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </span>
      );
    }

    return null;
  }

  return <span className={className}>{formatPrice(amountInUSD)}</span>;
}