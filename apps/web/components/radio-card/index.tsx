import React from "react";

interface RadioCardProps {
  label: string;
  supportingText?: string;
  value: string;
  selected?: boolean;
  onChange: (value: string) => void;
  className?: string;
}

const RadioCard: React.FC<RadioCardProps> = ({
  label,
  supportingText,
  value,
  selected = false,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
        selected
          ? "bg-card-selected border-primary-color"
          : "bg-white-custom border-custom hover:border-primary-color/50"
      } ${className}`}
      onClick={() => onChange(value)}
    >
      {/* Radio Button */}
      <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? "border-primary-color" : "border-radio-inactive"
          }`}
        >
          {selected && (
            <div className="w-4 h-4 rounded-full bg-primary-color" />
          )}
        </div>
      </div>

      {/* Label and Supporting Text */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <span className="text-button text-dark">{label}</span>
        {supportingText && (
          <span className="text-supporting text-dark">{supportingText}</span>
        )}
      </div>
    </div>
  );
};

export default RadioCard;
