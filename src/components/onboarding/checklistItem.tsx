'use client';

import Link from 'next/link';
import { useOnboarding } from './personal/PersonalOnboardingProvider';
import { TaskId } from '@/lib/types/onboarding';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '../feedback/loading-state';
import { Check } from 'lucide-react';

interface Task {
  id: TaskId;
  title: string;
  href: string;
  ctaText: string;
}

interface ChecklistItemProps {
  task: Task;
  isCompleted: boolean;
}

export function ChecklistItem({ task, isCompleted }: ChecklistItemProps) {
  const { toggleTask, pendingTaskId } = useOnboarding();
  const isPending = pendingTaskId === task.id;

  return (
    <li className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted-foreground/10">
      <div className="flex items-center gap-3">
        <Checkbox
          id={task.id}
          checked={isCompleted}
          disabled={isPending}
          onCheckedChange={() => toggleTask(task.id)}
          className={"rounded-full border-muted-foreground data-checked:bg-ink! dark:data-checked:bg-white! data-checked:text-white! dark:data-checked:text-ink! data-checked:border-ink dark:data-checked:border-white"}
        />
        <label
          htmlFor={task.id}
          className={`cursor-pointer text-xs font-normal transition-all select-none ${isCompleted
            ? 'text-ink/20 dark:text-muted-foreground/30'
            : ''
            }`}
        >
          {task.title}
        </label>
      </div>

      {!isCompleted && (
        <Link
          href={task.href}
          className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
        >
          {task.ctaText} →
        </Link>
      )}
      {isPending && (
        <LoadingState id={task.id} className='size-4' />
      )}
      {isCompleted && (<Check className='size-4' />
      )}
    </li>
  );
}