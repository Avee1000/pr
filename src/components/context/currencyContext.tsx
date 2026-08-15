"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { SUPPORTED_CURRENCIES } from "@/data/currencies"
import { useQuery } from '@tanstack/react-query'
import { getBaseUrl } from "@/utils/url"

interface ProfilePreferences {
  currency: string;
  country?: string;
  locale: string;
}

interface CurrencyContextType {
    country: string
    currency: string
    currencySymbol: string
    rates: Record<string, number>
    setCurrency: (curr: string) => void
    formatPrice: (amountInUSD: number) => string
    loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Standalone fetch function
async function fetchRates() {
    const res = await fetch("/api/v2/rates?base=USD")
    if (!res.ok) {
        throw new Error("Failed to fetch exchange rates")
    }
    return res.json()
}

export function CurrencyProvider({ children, initialProfile }: { children: React.ReactNode; initialProfile: ProfilePreferences | null}) {
    const [currency, setCurrency] = useState<string>(initialProfile?.currency ?? "USD")
    const [rates, setRates] = useState<Record<string, number>>({})
    const [country, setCountry] = useState<string>(initialProfile?.country ?? "EUR")

    useEffect(() => {
        if (initialProfile?.currency) {
            setCurrency(initialProfile.currency)
        }
        if (initialProfile?.country) {
            setCountry(initialProfile.country)
        }
    }, [initialProfile])

    // Let TanStack Query handle state, caching, loading, and error handling
    const { data, isLoading: loading, isError, error } = useQuery({
        queryKey: ['currency-rates'],
        queryFn: fetchRates,
    })
    useEffect(() => {
        if (data) {
            setRates(data.rates)
        }
    }, [data])
    // Show toast error when fetching fails
    useEffect(() => {
        if (isError) {
            // toast.error("Failed to load exchange rates")
            console.error(error)
        }
    }, [isError, error])

    // Corrected object property lookup with fallback
    const currencySymbol =
        SUPPORTED_CURRENCIES.find((item) => item.code === (currency || "USD"))?.symbol || "$"

    // Format function matching the interface return type
    const formatPrice = (amountInUSD: number): string => {
        const rate = rates[currency] || 1
        const converted = amountInUSD * rate

        const fractionDigits = Math.abs(converted) >= 1_000_000 ? 0 : 2

        const formattedNumber = new Intl.NumberFormat(undefined, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(converted)

        return `${currencySymbol}${formattedNumber}`
    }

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                country,
                currencySymbol,
                rates,
                setCurrency,
                formatPrice,
                loading,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    )
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext)
    if (!context) throw new Error("useCurrency must be used within CurrencyProvider")
    return context
}