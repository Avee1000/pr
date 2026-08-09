'use client'

import { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function TopLoaderComponent() {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Reset progress bar when navigation finishes
  useEffect(() => {
    setIsLoading(false)
    setProgress(100)

    const timer = setTimeout(() => {
      setProgress(0)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // Simulate incremental progress animation while page is loading
  useEffect(() => {
    if (!isLoading) return

    setProgress(20)

    const timer1 = setTimeout(() => setProgress(45), 100)
    const timer2 = setTimeout(() => setProgress(70), 300)
    const timer3 = setTimeout(() => setProgress(90), 800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isLoading])

  // Global link listener to detect navigation start
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a')

      if (!anchor) return

      const href = anchor.getAttribute('href')
      const targetAttr = anchor.getAttribute('target')

      // Ignore external, hash, new tab, or special scheme links
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        targetAttr === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      try {
        const targetUrl = new URL(href, window.location.href)
        const currentUrl = new URL(window.location.href)

        // Only start loader if target URL is different from current URL
        if (
          targetUrl.pathname !== currentUrl.pathname ||
          targetUrl.search !== currentUrl.search
        ) {
          setIsLoading(true)
        }
      } catch {
        // Ignore invalid URLs
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  if (progress === 0) return null

  return (
    <div
      className="absolute h-0.5 bg-ink pointer-events-none transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
    >
      {/* Glowing trailing edge effect */}
      {/* <div className="absolute right-0 top-0 bottom-0 w-20 shadow-[0_0_10px_var(--tw-shadow-color),0_0_5px_var(--tw-shadow-color)] shadow-brand transform rotate-3 translate-x-1 -translate-y-1" /> */}
    </div>
  )
}

export default function TopLoader() {
  return (
    <Suspense fallback={null}>
      <TopLoaderComponent />
    </Suspense>
  )
}