import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
  colorClass?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  trend,
  description,
  colorClass = "text-primary",
}) => {
  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={cn("h-4 w-4", colorClass)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {(change || description) && (
              <p className="text-xs text-muted-foreground mt-1">
                {change && (
                  <span
                    className={cn(
                      "font-medium mr-1",
                      trend === "up"
                        ? "text-emerald-600"
                        : trend === "down"
                        ? "text-red-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {change}
                  </span>
                )}
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
