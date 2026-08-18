'use client'

import { useState, useRef, useEffect } from 'react'
import { SignOutButton } from '../auth/SignOutButton'
import Name from '../global/Names'
import { User2 } from 'lucide-react'
import ThemeToggleDropDown from "../global/ThemeDropDown"
import CurrencySelector from './CurrencySelector'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingState } from '../feedback/loading-state'

export default function UserMenu({ user, children }: { user: any; children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageError, setImageError] = useState(false) 
  const menuRef = useRef<HTMLDivElement>(null)
  const { profile, isLoadingProfile: isLoading } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!document.body.contains(target)) return

      if (target.closest('.prevent-menu-close')) {
        return
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  if (!user) return null

  // Grab the avatar URL from either the auth metadata or your fetched profile state
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  const initials = user?.user_metadata?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open user menu"
        type="button"
        className="group flex items-center p-1 rounded-full -mr-2 dark:bg-white/20 hover:bg-brand/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 dark:focus:ring-white/50 focus:ring-brand/50"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/10 dark:bg-zinc-800 text-sm font-bold shadow-sm overflow-hidden relative">
          {isLoading ? (<LoadingState className='size-4 opacity-50'/>) : (
            avatarUrl && !imageError ? (
              <img
                src={avatarUrl}
                alt={user?.user_metadata?.name || "User avatar"}
                className="h-full w-full object-cover"
                sizes='100px'
                onError={() => setImageError(true)} // Triggers fallback to initials if image fails/errors out
              />
            ) : (
              <span>{initials}</span>
            )
          )}
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-w-xs opacity-100 sm:pl-2 sm:pr-3" : "max-w-0 opacity-0 px-0"
            }`}
        >
          <span className="text-sm hidden font-medium sm:block truncate sm:max-w-20 whitespace-nowrap">
            <Name username={user?.user_metadata?.name || "Guest"} fullname={false} />
          </span>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 -mr-3 w-56 rounded-xl bg-white dark:bg-ink shadow-xl border py-2 z-50 animate-in fade-in zoom-in-50 duration-300"
          role="menu"
        >
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold truncate">
              {user?.user_metadata?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>

          <div className="border-b px-2 py-1 flex items-center text-ink-dark dark:text-muted-foreground">
            <Link href="/account/profile" className="py-2 px-3 hover:bg-muted hover:text-ink dark:hover:text-muted-foreground dark:hover:bg-muted flex items-center gap-2 w-full rounded-md text-xs transition-colors text-left">
              <User2 className="w-4 h-4" />
              <span>Account</span>
            </Link>
          </div>

          <div className="py-1 border-b border-zinc-100 dark:border-zinc-800">
            <ThemeToggleDropDown />
            <CurrencySelector />
          </div>

          <div className="pt-1 px-2 border-t">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  )
}