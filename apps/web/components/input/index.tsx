import React from "react";
import { LucideIcon } from "lucide-react";

interface InputProps {
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "date";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  showLabel?: boolean;
  className?: string;
  name?: string;
  id?: string;
  labelStyle?: "supporting" | "default";
  inputStyle?: "body-copy" | "default";
  leftIcon?: LucideIcon;
  error?: string;
  readOnly?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  inputClassV2?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onBlur,
  onKeyDown,
  required = false,
  showLabel = true,
  className = "",
  name,
  id,
  labelStyle = "default",
  inputStyle = "default",
  leftIcon: LeftIcon,
  error,
  readOnly = false,
  disabled = false,
  multiline = false,
  rows = 3,
  inputClassV2 = "",
}) => {
  const inputId =
    id || name || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const labelClass =
    labelStyle === "supporting"
      ? "text-supporting text-primary"
      : "text-[15px] leading-[1.193359375em] font-normal text-primary font-sf-pro";

  const inputClass =
    inputStyle === "body-copy"
      ? "flex-1 text-body-copy text-primary placeholder:text-placeholder outline-none bg-transparent"
      : "flex-1 text-[17px] leading-[1.193359375em] font-normal text-primary placeholder:text-placeholder outline-none bg-transparent font-sf-pro";

  const containerClass = multiline
    ? `flex items-start w-full px-3 py-4 rounded-lg border border-custom bg-white-custom backdrop-blur-custom ${disabled ? "opacity-60 cursor-not-allowed" : ""}`
    : `flex items-center w-full px-3 py-4 h-[50px] rounded-lg border border-custom bg-white-custom backdrop-blur-custom ${disabled ? "opacity-60 cursor-not-allowed" : ""}`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label htmlFor={inputId} className={labelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={containerClass}>
        {LeftIcon && (
          <LeftIcon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        )}
        {multiline ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange as any}
            onBlur={onBlur as any}
            onKeyDown={onKeyDown as any}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            rows={rows}
            className={`${inputClass} ${LeftIcon ? "ml-3" : ""} resize-none`}
          />
        ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
            onChange={onChange as any}
            onBlur={onBlur as any}
            onKeyDown={onKeyDown as any}
          placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            className={`${inputClass} ${LeftIcon ? "ml-3" : ""} ${inputClassV2}`}
        />
        )}
      </div>
      {error && (
        <span className="text-sm text-red-500 font-sf-pro">{error}</span>
      )}
    </div>
  );
};

export default Input;
