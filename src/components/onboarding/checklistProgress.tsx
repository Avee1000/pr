'use client';

interface ChecklistProgressProps {
  percentage: number;
}

export function ChecklistProgress({ percentage }: ChecklistProgressProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/15">
        <div
          className="h-full bg-ink dark:bg-white transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}