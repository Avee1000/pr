'use client';

import { useState } from 'react';
import { useOnboarding } from './PersonalOnboardingProvider';
import { ChecklistItem } from '../checklistItem';
import { ChecklistProgress } from '../checklistProgress';
import { CompletionModal } from '../completionModal';
import { take } from 'pdfkit';

const TASKS = [
  { id: 'personal_details', title: 'Complete personal details', href: '/account/profile', ctaText: 'Edit Profile' },
  { id: 'customer_details', title: 'Add your first customer', href: '/dashboard/customers', ctaText: 'Add customers' },
  { id: 'first_quote', title: 'Create your first draft quote', href: '/dashboard/orders', ctaText: 'Create Quote' },
  { id: 'export_pdf', title: 'Export or send a quote PDF', href: '/quotes', ctaText: 'View Quotes' },
] as const;

export function OnboardingWidget() {
  const { completedTaskIds = [], isDismissed } = useOnboarding();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isDismissed) return null;

  const completedCount = completedTaskIds?.length ?? 0;
  const isAllCompleted = completedCount === TASKS.length;
  const progressPercentage = Math.round((completedCount / TASKS.length) * 100);

  return (
    <>
    {isAllCompleted && <CompletionModal />}
    <aside
      className={`fixed bottom-6 right-6 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isCollapsed ? 'w-64' : 'w-96'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="whitespace-nowrap font-semibold text-sm">Getting Started</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? 'Expand' : 'Minimize'}
        </button>
      </div>

      <div className="mt-3">
        <ChecklistProgress percentage={progressPercentage} />
      </div>

      {/* Accordion container */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="w-88 pt-4">
            <ul className="space-y-3">
              {TASKS.map((task) => (
                <ChecklistItem
                  key={task.id}
                  task={task}
                  isCompleted={completedTaskIds.includes(task.id)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}