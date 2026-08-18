"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { SUPPORTED_CURRENCIES } from "@/data/currencies"
import { useQuery } from '@tanstack/react-query'
import { useAuth } from "@/components/providers/AuthProvider"

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
    const { profile } = useAuth()
    const [currency, setCurrency] = useState<string>(initialProfile?.currency ?? profile?.currency ?? "USD")
    const [rates, setRates] = useState<Record<string, number>>({})
    const [country, setCountry] = useState<string>(initialProfile?.country ?? profile?.country ?? "US")

    useEffect(() => {
        if (profile?.currency) {
            setCurrency(profile.currency)
        } else if (initialProfile?.currency) {
            setCurrency(initialProfile.currency)
        }

        if (profile?.country) {
            setCountry(profile.country)
        } else if (initialProfile?.country) {
            setCountry(initialProfile.country)
        }
    }, [initialProfile, profile])

    const { data, isLoading: loading, isError, error } = useQuery({
        queryKey: ['currency-rates'],
        queryFn: fetchRates,
    })
    useEffect(() => {
        if (data) {
            setRates(data.rates)
        }
    }, [data])
    useEffect(() => {
        if (isError) {
            console.error(error)
        }
    }, [isError, error])

    const currencySymbol =
        SUPPORTED_CURRENCIES.find((item) => item.code === (currency || "USD"))?.symbol || "$"

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