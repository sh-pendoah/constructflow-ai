import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = "",
}) => {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={handleClick}
    >
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-lg border transition-all ${
          checked
            ? "bg-primary-color border-checkbox-checked"
            : "bg-white-custom border-custom"
        } ${disabled ? "cursor-not-allowed" : ""}`}
      >
        {checked && (
          <Check className="w-4 h-4 text-primary-button" strokeWidth={3} />
        )}
      </div>
      {label && <span className="text-body-copy text-dark">{label}</span>}
    </div>
  );
};

export default Checkbox;
