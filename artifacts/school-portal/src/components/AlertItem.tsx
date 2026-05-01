import React from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertItemProps {
  type: "warning" | "danger" | "info" | "success";
  message: string;
}

export const AlertItem: React.FC<AlertItemProps> = ({ type, message }) => {
  const config = {
    warning: {
      icon: AlertTriangle,
      className: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900/50",
      iconClass: "text-amber-500",
    },
    danger: {
      icon: AlertCircle,
      className: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900/50",
      iconClass: "text-red-500",
    },
    info: {
      icon: Info,
      className: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900/50",
      iconClass: "text-blue-500",
    },
    success: {
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900/50",
      iconClass: "text-emerald-500",
    },
  };

  const { icon: Icon, className, iconClass } = config[type];

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border", className)}>
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconClass)} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
