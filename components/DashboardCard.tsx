import { LucideIcon } from "lucide-react";
import React from "react";
import clsx from "clsx";

interface DashboardCardProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
  disabled,
}) => (
  <button
    className={clsx(
      "flex flex-col items-center justify-center aspect-square rounded-xl bg-muted/50 hover:bg-muted transition shadow-md p-6",
      disabled ? "cursor-not-allowed opacity-60 grayscale" : "cursor-pointer",
      className
    )}
    onClick={disabled ? undefined : onClick}
    type="button"
    disabled={disabled}
  >
    <Icon className="w-10 h-10 mb-2 text-primary" />
    <span className="text-lg font-medium">{label}</span>
  </button>
); 