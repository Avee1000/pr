// components/feedback/loading-state.tsx
import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean;
  text?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconClassName?: string;
}

const sizeClasses = {
  sm: {
    container: "min-h-[120px] p-4",
    icon: "size-4",
    text: "text-xs font-medium",
    desc: "text-[11px]",
  },
  md: {
    container: "min-h-[200px] p-6",
    icon: "size-6",
    text: "text-sm font-semibold",
    desc: "text-xs",
  },
  lg: {
    container: "min-h-[350px] p-8",
    icon: "size-8",
    text: "text-base font-semibold",
    desc: "text-sm",
  },
};

export function LoadingState({
  iconOnly = true,
  text,
  description,
  size = "md",
  icon,
  iconClassName,
  className,
  ...props
}: LoadingStateProps) {
  const styles = sizeClasses[size];

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        " flex justify-center items-center flex-col",
        // styles.container,
        className
      )}
      {...props}
    >
      {icon ?? (
        <Loader2
          className={cn(
            styles.icon,
            "animate-spin text-ink dark:text-muted-foreground",
            iconClassName
          )}
        />
      )}

      {iconOnly ? null : (
        <>
          {text ?? (
            <p className={cn("mt-3 text-ink dark:text-muted-foreground", styles.text)}>
              {text}
            </p>
          )}

          {description && (
            <p className={cn("max-w-xs ", styles.desc)}>
              {description}
            </p>
          )}</>
      )}


    </div>
  );
}