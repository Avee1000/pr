export type TaskId = 'personal_details' | 'customer_details' | 'first_quote' | 'export_pdf';

export interface OnboardingTask {
  id: TaskId;
  title: string;
  description: string;
  isCompleted: boolean;
  href: string;
  ctaText: string;
}

export interface OnboardingState {
  completedTaskIds: TaskId[];
  isDismissed: boolean;
}