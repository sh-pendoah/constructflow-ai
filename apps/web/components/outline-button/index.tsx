import React from "react";
import { Download } from "lucide-react";

interface OutlineButtonProps {
  label: string;
  onClick?: () => void;
  showIcon?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const OutlineButton: React.FC<OutlineButtonProps> = ({
  label,
  onClick,
  showIcon = true,
  icon,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-4 px-3 group rounded-lg border border-primary bg-transparent hover:text-white hover:bg-black/80 transition-colors text-button text-primary cursor-pointer ${className}`}
    >
      <span>{label}</span>
      {showIcon && (icon || <Download className="w-5 h-5" />)}
    </button>
  );
};

export default OutlineButton;
