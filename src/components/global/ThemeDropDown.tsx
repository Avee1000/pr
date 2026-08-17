'use client'

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"

export default function ThemeToggleDropDown({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Matches component container height to eliminate layout shift during hydration
    if (!mounted) {
        return <div className={cn("flex flex-col border-b p-2 gap-2 h-26", className)} />
    }

    return (
        <div className={cn("flex flex-col border-b p-2 gap-1 text-ink-dark dark:text-muted-foreground", className)}>
            <p className="text-xs text-muted-foreground">Theme</p>

            <button
                type="button"
                onClick={() => setTheme('dark')}
                className={cn(
                    "flex items-center  gap-2 w-full px-3 py-2 rounded-md text-xs transition-colors hover:text-ink  dark:hover:text-muted-foreground text-left",
                    "hover:bg-muted dark:hover:bg-muted",
                    resolvedTheme === 'dark' && "bg-muted dark:bg-muted font-medium"
                )}
                aria-label="Switch to dark theme"
            >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
            </button>

            <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs transition-colors text-left hover:text-ink  dark:hover:text-muted-foreground",
                    "hover:bg-muted dark:hover:bg-muted",
                    resolvedTheme === 'light' && "bg-muted dark:bg-muted font-medium"
                )}
                aria-label="Switch to light theme"
            >
                <Sun className="w-4 h-4" />
                <span>Light</span>
            </button>
        </div>
    )
}