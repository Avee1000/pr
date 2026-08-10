// components/feedback/empty-state.tsx
import * as React from "react";
import { FolderOpen, type LucideIcon } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={`flex  w-125 min-h-70 flex-col items-center justify-center rounded-xl border border-dashed border-ink/40 dark:border-muted-foreground/50 p-8 text-center ${className}`}
      {...props}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted-foreground/20  mb-4">
        {typeof Icon === "function" ? (
          <Icon className="size-6 text-ink dark:text-muted-foreground" />
        ) : (
          Icon
        )}
      </div>

      <h3 className="text-base font-semibold ">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5 flex items-center gap-3">{action}</div>}
    </div>
  );
}