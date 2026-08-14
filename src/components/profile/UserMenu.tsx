'use client'

import { useState, useRef, useEffect } from 'react'
import { SignOutButton } from '../accounts/SignOutButton'
import Name from '../global/Names'
import ThemeToggleDropDown from "../global/ThemeDropDown"
import CurrencySelector from './CurrencySelector' // <--- 1. Import Here

export default function UserMenu({ user, children }: { user: any; children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (!document.body.contains(target)) return;

      // Ignore clicks inside elements with the custom class
      if (target.closest('.prevent-menu-close')) {
        return;
      }
      // 2. Standard outside check
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  if (!user) return null

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
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/10 dark:bg-zinc-800 text-sm font-bold shadow-sm">
          {initials}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-w-xs opacity-100 pl-2 pr-3" : "max-w-0 opacity-0 px-0"
            }`}
        >
          <span className="text-sm font-medium sm:block truncate max-w-20 whitespace-nowrap">
            <Name username={user?.user_metadata?.name || "Guest"} fullname={false} />
          </span>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 -mr-3 w-56 rounded-xl bg-white dark:bg-ink shadow-xl border py-2 z-50 animate-in fade-in zoom-in-50 duration-300"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm font-semibold truncate">
              {user?.user_metadata?.name || 'User'}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {user?.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1 border-b border-zinc-100 dark:border-zinc-800">
            {/* Theme Toggle */}
            <ThemeToggleDropDown />

            {/* 2. Currency Switcher Component */}
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