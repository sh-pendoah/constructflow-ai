"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  required?: boolean;
  showLabel?: boolean;
  className?: string;
  name?: string;
  id?: string;
  labelStyle?: "supporting" | "default";
  options?: { value: string; label: string }[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  showLabel = true,
  className = "",
  name,
  id,
  labelStyle = "default",
  options = [],
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectId = id || name || `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // Ensure component is mounted before using portal
  useEffect(() => {
    setMounted(true);
  }, []);

  const labelClass =
    labelStyle === "supporting"
      ? "text-supporting text-primary"
      : "text-[15px] leading-[1.193359375em] font-normal text-primary font-sf-pro";

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && selectRef.current && mounted) {
      // Use requestAnimationFrame to ensure DOM is ready
      const calculatePosition = () => {
        if (!selectRef.current) return;
        
        const rect = selectRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = Math.min(300, options.length * 48 + 8); // Max 300px or calculated height

        // Determine if dropdown should open above or below
        const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        // Calculate position
        let top = openAbove ? rect.top - dropdownHeight : rect.bottom;
        let left = rect.left;
        let width = rect.width;
        
        // Ensure dropdown doesn't go outside viewport vertically
        if (top < 10) {
          top = 10;
        }
        if (top + dropdownHeight > viewportHeight - 10) {
          top = viewportHeight - dropdownHeight - 10;
        }
        
        // Ensure dropdown doesn't go outside viewport horizontally
        if (left + width > viewportWidth - 10) {
          width = viewportWidth - left - 10;
        }
        
        if (left < 10) {
          const adjustment = 10 - left;
          width = width - adjustment;
          left = 10;
        }

        // Ensure minimum width
        width = Math.max(width, 200);

        setDropdownPosition({
          top: top,
          left: left,
          width: width,
        });
      };

      // Multiple requestAnimationFrame calls to ensure all animations and DOM updates are complete
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            calculatePosition();
          });
        });
      }, 0);

      // Recalculate on scroll/resize
      const handleScroll = () => {
        if (isOpen && selectRef.current) {
          calculatePosition();
        }
      };

      const handleResize = () => {
        if (isOpen && selectRef.current) {
          calculatePosition();
        }
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen, options.length, mounted]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (onBlur) {
          // Create a synthetic blur event
          const blurEvent = {
            target: { name, value },
            currentTarget: { name, value },
          } as React.FocusEvent<HTMLSelectElement>;
          onBlur(blurEvent);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, name, value, onBlur]);

  const handleOptionSelect = (optionValue: string) => {
    if (onChange) {
      // Create a synthetic change event
      const changeEvent = {
        target: { name, value: optionValue },
        currentTarget: { name, value: optionValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(changeEvent);
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    // Close all other select dropdowns by dispatching a custom event
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('closeAllSelects', { detail: { excludeId: selectId } }));
    }
    setIsOpen(!isOpen);
  };

  // Listen for closeAllSelects event
  useEffect(() => {
    const handleCloseAll = (event: CustomEvent) => {
      if (event.detail?.excludeId !== selectId && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('closeAllSelects' as any, handleCloseAll);
    return () => {
      window.removeEventListener('closeAllSelects' as any, handleCloseAll);
    };
  }, [isOpen, selectId]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder || "";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label htmlFor={selectId} className={labelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          onClick={handleToggle}
          onBlur={(e) => onBlur?.(e as unknown as React.FocusEvent<HTMLSelectElement>)}
          className={`w-full flex items-center justify-between px-3 py-4 h-[50px] rounded-lg border ${
            error ? "border-red-500" : "border-custom"
          } bg-white-custom backdrop-blur-custom hover:border-[#1F6F66] transition-colors cursor-pointer text-left`}
        >
          <span className={`text-body-copy font-sf-pro ${!selectedOption ? "text-placeholder" : "text-primary"}`}>
            {displayValue}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-primary transition-transform flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {mounted && isOpen && dropdownPosition && createPortal(
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <div
              ref={dropdownRef}
              className="fixed z-[70] bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] overflow-hidden"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: "300px",
              }}
            >
              <div className="overflow-y-auto max-h-[300px] select-dropdown-scrollbar">
                {options.length === 0 ? (
                  <div className="px-3 py-3 text-body-copy text-[#6F7A85] font-sf-pro text-center">
                    No options available
                  </div>
                ) : (
                  options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionSelect(option.value)}
                      className={`w-full px-3 py-3 text-left text-body-copy font-sf-pro hover:bg-[#F3F5F7] transition-colors ${
                        value === option.value
                          ? "bg-[#EBF3FF] text-[#1F6F66] font-medium"
                          : "text-primary"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
      {error && (
        <span className="text-sm text-red-500 font-sf-pro">{error}</span>
      )}
      {/* Hidden select for form submission */}
      <select
        id={selectId}
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
