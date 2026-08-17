'use client'

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from 'react'

export default function ThemeToggleIcon({ className }: { className?: string }) {
    const { theme, resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true)
    }, [])

    // Return a placeholder of the same size to prevent layout shift before hydration
    if (!mounted) return <div className="w-9 h-9" />

    // Use resolvedTheme (the theme actually applied) instead of `theme` (the user's
    // stored setting). When the user has set "light" but their OS is dark and
    // defaultTheme is "system", `theme` is "light" while `resolvedTheme` is "dark" —
    // showing the wrong icon.
    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-ink-dark"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-white" />
            ) : (
                <Moon className="w-5 h-5 text-black" />
            )}
        </button>
    )
}