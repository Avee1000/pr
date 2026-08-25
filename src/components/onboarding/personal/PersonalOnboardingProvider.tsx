'use client';

import React, { createContext, useContext, useOptimistic, useTransition, useState } from 'react';
import { updateOnboardingProgress } from '@/lib/onboarding/action';
import { TaskId, OnboardingState } from '@/lib/types/onboarding';
import { dismissOnboarding } from '@/lib/onboarding/action';

interface OnboardingContextType {
  completedTaskIds: TaskId[];
  isDismissed: boolean;
  toggleTask: (taskId: TaskId) => void;
  dismissChecklist: () => void;
  isPending: boolean;
  pendingTaskId: TaskId | null;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({
  initialState,
  children,
}: {
  initialState: OnboardingState;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingTaskId, setPendingTaskId] = useState<TaskId | null>(null);

  const [optimisticState, setOptimisticState] = useOptimistic(
    initialState,
    (state, action: { type: 'TOGGLE_TASK'; taskId: TaskId } | { type: 'DISMISS' }) => {
      if (action.type === 'DISMISS') {
        return { ...state, isDismissed: true };
      }
      console.log(state)

      const exists = state.completedTaskIds.includes(action.taskId);
      const nextCompleted = exists
        ? state.completedTaskIds.filter((id: string) => id !== action.taskId)
        : [...state.completedTaskIds, action.taskId];

      return { ...state, completedTaskIds: nextCompleted };
    }
  );

  const toggleTask = (taskId: TaskId) => {
    setPendingTaskId(taskId);
    startTransition(async () => {
      setOptimisticState({ type: 'TOGGLE_TASK', taskId });
      try {
        await updateOnboardingProgress(taskId);
      } finally {
        setPendingTaskId(null);
      }
    });
  };

  const dismissChecklist = () => {
    startTransition(async () => {
      setOptimisticState({ type: 'DISMISS' });
      await dismissOnboarding();
    });
  };

  return (
    <OnboardingContext.Provider
      value={{
        completedTaskIds: optimisticState.completedTaskIds,
        isDismissed: optimisticState.isDismissed,
        toggleTask,
        dismissChecklist,
        isPending,
        pendingTaskId,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};