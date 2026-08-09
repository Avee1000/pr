'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { Bell, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { playSuccessChime } from '@/utils/playBeep'

interface Notification {
  id: string
  message: string
  link: string
}

const fetcher = async (url: string): Promise<Notification[]> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export default function NotificationIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const prevCountRef = useRef<number | null>(null)
  const { mutate } = useSWRConfig()

  const { data: notifications = [], error } = useSWR<Notification[]>(
    '/api/notifications',
    fetcher
  )

  // 1. Establish SSE Connection for Real-Time SWR Updates (Runs once on mount)
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/sse')

    // When server sends a message, revalidate SWR cache
    eventSource.onmessage = (event: MessageEvent) => {
      console.log('SSE Received event:', event.data)
      mutate('/api/notifications')
    }

    eventSource.onerror = (err) => {
      console.error('SSE Connection Error:', err)
    }

    // Clean up connection when component unmounts
    return () => {
      eventSource.close()
    }
  }, [mutate])

  // // 2. Sound Trigger: Play chime whenever notification count increases
  // useEffect(() => {
  //   if (prevCountRef.current !== null && notifications.length > prevCountRef.current) {
  //     playSuccessChime()
  //   }
  //   prevCountRef.current = notifications.length
  // }, [notifications.length])

  // 2. Lock Body Scroll on Drawer Open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // 3. Escape Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const hasNotifications = notifications.length > 0

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
        aria-label="Toggle Notifications"
        aria-expanded={isOpen}
        aria-controls="notification-drawer"
      >
        <Bell strokeWidth={1.5} className="size-5 text-gray-700 dark:text-gray-200" />

        {hasNotifications && (
          <span className="absolute top-0 right-1 flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-action opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-action" />
          </span>
        )}
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 top-19 bg-black/20 dark:bg-black/40 z-40 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <aside
        id="notification-drawer"
        role="dialog"
        aria-label="Notifications Panel"
        aria-hidden={!isOpen}
        className={`fixed top-19 right-0 bottom-0 z-50 w-80 sm:w-96 m-1 ml-0 rounded-2xl bg-white dark:bg-ink border-l border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-[101%]'
          }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-ink dark:text-white">
              Notifications
            </h3>
            {hasNotifications && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-action/10 text-action dark:bg-red-950 dark:text-red-300">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close notifications panel"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Notifications Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error ? (
            <div className="p-3 text-center text-sm text-red-500">
              Unable to load notifications.
            </div>
          ) : !hasNotifications ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="size-8 mb-2 stroke-1 text-gray-400 dark:text-gray-500" />
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          ) : (
            notifications.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                onClick={() => setIsOpen(false)}
                className="block p-3 rounded-xl border border-border bg-gray-50 dark:bg-neutral-900/60 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-4 text-action shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                    {item.message}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </aside>
    </>
  )
}