"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CostCodeOption {
  value: string;
  label: string;
  isSuggested?: boolean;
}

interface CostCodeDropdownProps {
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
  options?: CostCodeOption[];
  label: string;
  name: string;
  readOnly?: boolean;
}

const CostCodeDropdown: React.FC<CostCodeDropdownProps> = ({
  placeholder = "Select Cost Code",
  value,
  onChange,
  options = [],
  label,
  name,
  readOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default options if none provided
  const defaultOptions: CostCodeOption[] = [
    { value: "06 - 1000", label: "06 - 1000" },
    { value: "5022", label: "5022", isSuggested: true },
    { value: "5020", label: "5020" },
    { value: "5024", label: "5024" },
    { value: "5026", label: "5026" },
  ];

  const dropdownOptions = options.length > 0 ? options : defaultOptions;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col gap-2">
        <label className="text-supporting text-primary font-sf-pro">
          {label}
        </label>
        <div className="relative">
          <div
            onClick={() => !readOnly && setIsOpen(!isOpen)}
            className={`
              flex items-center justify-between w-full px-3 py-4 rounded-lg border border-custom bg-white-custom backdrop-blur-custom
              ${readOnly ? "cursor-default" : "cursor-pointer hover:border-primary/30"}
            `}
          >
            <span className={`text-body-copy ${value ? "text-primary" : "text-placeholder"} font-sf-pro`}>
              {value || placeholder}
            </span>
            {!readOnly && (
              <ChevronDown
                className={`w-5 h-5 text-primary transition-transform duration-200 ${
                  isOpen ? "transform rotate-180" : ""
                }`}
              />
            )}
          </div>

          {/* Dropdown Menu */}
          {isOpen && !readOnly && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-[#DEE0E3] rounded-lg shadow-medium max-h-[200px] overflow-y-auto hide-scrollbar">
              {dropdownOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-3 py-2 text-left text-body-copy text-primary font-sf-pro
                    hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg
                    ${value === option.value ? "bg-[#F9FFFE]" : ""}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={option.isSuggested ? "font-semibold" : "font-normal"}>
                      {option.label}
                    </span>
                    {option.isSuggested && (
                      <span className="text-xs text-[#6F7A85] font-normal ml-2">
                        (Suggested)
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostCodeDropdown;

