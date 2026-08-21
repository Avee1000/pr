'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface FlashData {
    title: string
    message: string
    path: string
}

export default function RedirectAlert() {
    const [flash, setFlash] = useState<FlashData | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        const match = document.cookie.match(
            new RegExp('(^| )auth_flash_message=([^;]+)')
        )

        if (match) {
            try {
                const firstDecode = decodeURIComponent(match[2])
                const finalDecode = decodeURIComponent(firstDecode)

                const parsedData: FlashData = JSON.parse(finalDecode)

                if (pathname === parsedData.path) {
                    setFlash(parsedData)
                }

                document.cookie = 'auth_flash_message=; Max-Age=0; path=/;'
            } catch (e) {
                console.error('Failed to parse auth flash message cookie', e)
                document.cookie = 'auth_flash_message=; Max-Age=0; path=/;'
            }
        }
    }, [pathname])

    useEffect(() => {
        if (!flash) return

        const timer = setTimeout(() => {
            setFlash(null)
        }, 3000)

        return () => clearTimeout(timer)
    }, [flash,])

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="pointer-events-auto"
                    >
                        <Alert variant="destructive" className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{flash.title}</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}