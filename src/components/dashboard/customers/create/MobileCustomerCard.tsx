'use client'

import Link from 'next/link'
import { Edit2, Globe, Phone, Calendar, Mail, UserCheck } from "lucide-react"
import { Customer } from '@/lib/types/dashBoardTypes'
import Delete from '../edit/DeleteCustomer'
import { KebabMenu } from '@/components/global/KebabMenu'

interface MobileCustomerCardProps {
  customer: Customer
}

export function MobileCustomerCard({ customer }: MobileCustomerCardProps) {
  const initials = customer.name
    ? customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'C'

  return (
    <div className="bg-white dark:bg-ink/5 border border-ink/10 dark:border-muted-foreground/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3.5">
      {/* Top Row: Avatar, Name, Email, & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Professional Avatar Badge */}
          <div className="size-10 rounded-xl bg-action/10 text-action dark:bg-action/20 dark:text-white font-bold flex items-center justify-center shrink-0 text-sm tracking-wide">
            {initials}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-ink dark:text-white font-semibold text-sm sm:text-base truncate">
                {customer.name}
              </h3>
            </div>
            {customer.email ? (
              <a 
                href={`mailto:${customer.email}`}
                className="text-muted-foreground hover:text-action text-xs flex items-center gap-1 truncate transition-colors"
              >
                <Mail className="size-3 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </a>
            ) : (
              <span className="text-muted-foreground/60 text-xs italic">No email provided</span>
            )}
          </div>
        </div>

        {/* Action Kebab Menu */}
        <div className="shrink-0 -mr-1">
          <KebabMenu 
            groupClassName='flex flex-col gap-1'
            afterSeparator={<Delete label='Delete' id={customer.id} />}
          >
            <Link
              href={`/dashboard/customers/edit/${customer.id}`}
              className="h-7 px-3 inline-flex items-center justify-start gap-1.5 rounded-lg dark:bg-ink dark:hover:bg-muted-foreground/20 hover:bg-ink/10 text-ink dark:text-muted-foreground transition-all disabled:opacity-50 text-xs font-medium"
              title="View / Edit"
            >
              <Edit2 className="size-3.5" />
              <span>Edit</span>
            </Link>
          </KebabMenu>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="h-px bg-ink/5 dark:bg-white/5 w-full" />

      {/* Middle Grid: Detailed Metadata Attributes */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
        {/* Country Property */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">Country</span>
          <div className="flex items-center gap-1.5 text-ink dark:text-gray-200 font-medium truncate" title={customer.country}>
            <Globe className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{customer.country || 'N/A'}</span>
          </div>
        </div>

        {/* Date Created Property */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">Registered</span>
          <div className="flex items-center gap-1.5 text-ink dark:text-gray-200 font-medium truncate">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">
              {customer.created_at
                ? new Date(customer.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Phone Details & System Status Tag */}
      <div className="flex items-center justify-between pt-1 border-t border-ink/5 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          <UserCheck className="size-3.5 text-emerald-500" />
          <span className="text-[11px] text-muted-foreground font-medium">Active Profile</span>
        </div>

        {customer.phone ? (
          <a 
            href={`tel:${customer.phone}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            <Phone className="size-3 shrink-0" />
            <span>{customer.phone}</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground/60 italic">No phone</span>
        )}
      </div>
    </div>
  )
}

export function MobileCustomerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-ink/5 border border-ink/10 rounded-2xl p-4 dark:border-muted-foreground/40 shadow-sm flex flex-col gap-3.5 animate-pulse">
      {/* Top Row Skeleton */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar Skeleton */}
          <div className="size-10 rounded-xl bg-ink/10 dark:bg-white/10 shrink-0" />
          
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 bg-ink/10 dark:bg-white/10 rounded-md w-3/4" />
            <div className="h-3 bg-ink/10 dark:bg-white/10 rounded-md w-1/2" />
          </div>
        </div>

        {/* Action Kebab Skeleton */}
        <div className="size-7 rounded-lg bg-ink/10 dark:bg-white/10 shrink-0" />
      </div>

      {/* Subtle Divider */}
      <div className="h-px bg-ink/5 dark:bg-white/5 w-full" />

      {/* Middle Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="h-2.5 bg-ink/10 dark:bg-white/10 rounded w-1/3" />
          <div className="h-3.5 bg-ink/10 dark:bg-white/10 rounded w-2/3" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 bg-ink/10 dark:bg-white/10 rounded w-1/3" />
          <div className="h-3.5 bg-ink/10 dark:bg-white/10 rounded w-2/3" />
        </div>
      </div>

      {/* Bottom Row Skeleton */}
      <div className="flex items-center justify-between pt-1 border-t border-ink/5 dark:border-white/5">
        <div className="h-3 bg-ink/10 dark:bg-white/10 rounded w-1/4" />
        <div className="h-5 bg-ink/10 dark:bg-white/10 rounded-full w-24" />
      </div>
    </div>
  )
}