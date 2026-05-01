import React from "react";
import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
}

const typeMap: Record<string, StatusType> = {
  active: "success",
  present: "success",
  resolved: "success",
  paid: "success",
  completed: "success",
  
  warning: "warning",
  late: "warning",
  partial: "warning",
  "in progress": "warning",
  delayed: "warning",
  
  inactive: "danger",
  absent: "danger",
  overdue: "danger",
  unpaid: "danger",
  open: "danger",
  fail: "danger",
  
  info: "info",
  excused: "info",
  scheduled: "info",
  "at school": "info",
  
  neutral: "neutral",
  unread: "neutral",
  read: "neutral"
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const normalizedStatus = status.toLowerCase();
  const resolvedType = type || typeMap[normalizedStatus] || "neutral";

  const styles = {
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[resolvedType]
      )}
    >
      {status}
    </span>
  );
};
