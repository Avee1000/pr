'use client';

import { useEffect } from 'react';
import confetti from "canvas-confetti";
import { useOnboarding } from './personal/PersonalOnboardingProvider';
import { Check } from 'lucide-react';

export function CompletionModal() {
  const { dismissChecklist } = useOnboarding();

  useEffect(() => {
    // Fire confetti effect on mount
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-ink-darker p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <Check className='size-6'/>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          You're all set!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You've completed all onboarding tasks and your workspace is fully configured.
        </p>
        <button
          onClick={dismissChecklist}
          className="mt-6 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink shadow-md hover:bg-brand focus:outline-none"
        >
          Continue to Workspace
        </button>
      </div>
    </div>
  );
}