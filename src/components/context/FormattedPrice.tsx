"use client";

import { useCurrency } from "@/components/context/currencyContext";
import { LoadingState } from "../feedback/loading-state"
import { Loader } from "lucide-react";

interface FormattedPriceProps {
  amountInUSD: number;
  className?: string;
}

export function FormattedPrice({ amountInUSD, className }: FormattedPriceProps) {
  const { formatPrice, loading } = useCurrency();

  if (loading) {
    return <span className={className}>
      <LoadingState icon={<Loader className="size-5 animate-spin"/>}/>
    </span>;
  }

  return <span className={className}>{formatPrice(amountInUSD)}</span>;
}