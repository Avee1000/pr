// components/feedback/alert.tsx
import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  type LucideIcon,
} from "lucide-react";

export type AlertVariant = "success" | "error" | "warning" | "info" | "loading";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const variantConfig: Record<
  AlertVariant,
  {
    icon: LucideIcon;
    containerClass: string;
    iconClass: string;
    spin?: boolean;
  }
> = {
  success: {
    icon: CheckCircle2,
    containerClass:
      "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    containerClass:
      "flex flex-row bg-red-50 text-red-600 border-red-200 dark:bg-action/40 dark:text-red-600 dark:border-red-800",
    iconClass: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    containerClass:
      "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: Info,
    containerClass:
      "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  loading: {
    icon: Loader2,
    containerClass:
      "bg-slate-50 text-slate-900 border-slate-200 dark:bg-slate-900/50 dark:text-slate-200 dark:border-slate-800",
    iconClass: "text-slate-600 dark:text-slate-400",
    spin: true,
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
  ...props
}: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`relative flex gap-3 w-full p-2 px-4 text-sm rounded-lg border ${config.containerClass} ${className}`}
      {...props}
    >
      <Icon
        className={`size-5 mt-0.5 ${config.iconClass} ${
          config.spin ? "animate-spin" : ""
        }`}
      />

      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1"
          aria-label="Dismiss alert"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}