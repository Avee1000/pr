"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface CurrencyContextType {
  currency: string
  rates: Record<string, number>
  setCurrency: (curr: string) => void
  formatPrice: (amountInUSD: number) => string
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD")
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Fetch rates from your Python FastAPI server
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v2/rates?base=USD")
        const data = await res.json()
        setRates(data.rates)
      } catch (err) {
        console.error("Failed to load exchange rates:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  // Helper to format any USD base price into the selected currency
  const formatPrice = (amountInUSD: number) => {
    const rate = rates[currency] || 1
    const converted = amountInUSD * rate

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(converted)
  }

  return (
    <CurrencyContext.Provider
      value={{ currency, rates, setCurrency, formatPrice, loading }}
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