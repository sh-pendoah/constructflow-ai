import React from "react";
import { Info, Lightbulb, CircleCheck } from "lucide-react";

interface AlertProps {
  heading?: string;
  bodyText: string;
  variant?: "info" | "warning" | "error" | "success" | "tip";
  showIcon?: boolean;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  heading,
  bodyText,
  variant = "warning",
  showIcon = true,
  className = "",
}) => {
  const variantStyles = {
    warning: {
      bg: "bg-[#FFF6E6]",
      border: "border-[#F59E0B]",
      icon: "text-[#F59E0B]",
      iconComponent: Info,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      icon: "text-blue-500",
      iconComponent: Info,
    },
    tip: {
      bg: "bg-blue-info",
      border: "border-blue-info",
      icon: "text-blue-info",
      iconComponent: Lightbulb,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      icon: "text-red-500",
      iconComponent: Info,
    },
    success: {
      bg: "bg-green-light",
      border: "border-green",
      icon: "text-green",
      iconComponent: CircleCheck,
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.iconComponent;

  return (
    <div
      className={`flex flex-col gap-2 py-3 px-3 pl-4 rounded-lg border ${styles.bg} ${styles.border} ${className}`}
    >
      {heading ? (
        <div className="flex items-center gap-2">
          {showIcon && (
            <IconComponent className={`w-4 h-4 ${styles.icon} flex-shrink-0`} />
          )}
          <span className="text-supporting text-primary !font-bold">
            {heading}
          </span>
        </div>
      ) : showIcon ? (
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${styles.icon} flex-shrink-0`} />
        </div>
      ) : null}
      <p
        className={`text-supporting ${heading ? "text-primary" : "text-primary"} whitespace-pre-line`}
      >
        {bodyText}
      </p>
    </div>
  );
};

export default Alert;
