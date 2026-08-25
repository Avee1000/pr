'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { OnboardingState } from '../types/onboarding';
import { create } from 'domain';

export async function getOnboardingProgress(): Promise<OnboardingState> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        throw new Error("Unauthorized: User not logged in.");
    }
    const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) console.error('Error fetching onboarding:', error);

    return {
        completedTaskIds: data?.completed_tasks ?? [],
        isDismissed: data?.is_dismissed ?? false,
        ...data
    };
}

export async function updateOnboardingProgress(taskId: string) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
        console.error(error);
        throw new Error("Unauthorized: User not logged in.");
    }

    const { data: onboarding } = await supabase
        .from('user_onboarding')
        .select('completed_tasks')
        .eq('user_id', user.id)
        .single();

    if (!onboarding) return ("No onboarding tasks");

    const currentTasks: string[] = onboarding?.completed_tasks ?? [];

    // if (currentTasks.length === 4) {
    //     await supabase
    //         .from('user_onboarding')
    //         .update({
    //             status: 'completed',
    //             completed_at: new Date().toISOString(),
    //         })
    //         .eq('user_id', user.id)
    // }

    const updatedTasks = currentTasks.includes(taskId)
        ? currentTasks.filter((id) => id !== taskId)
        : [...currentTasks, taskId];

    const isFullyCompleted = updatedTasks.length === 4;

    await supabase
        .from('user_onboarding')
        .update({
            completed_tasks: updatedTasks,
            status: isFullyCompleted ? 'completed' : 'in_progress',
            completed_at: isFullyCompleted ? new Date().toISOString() : null, 
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

    revalidatePath('/(dashboard)', 'layout');
}

export async function dismissOnboarding() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        throw new Error('Unauthorized: User not logged in.');
    }

    const { error: dismissError } = await supabase
        .from('user_onboarding')
        .update({
            is_dismissed: true,
            dismissed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

    if (dismissError) {
        console.error('Failed to dismiss onboarding:', dismissError);
        throw new Error('Error dismissing onboarding checklist');
    }

    revalidatePath('/(dashboard)', 'layout');
}