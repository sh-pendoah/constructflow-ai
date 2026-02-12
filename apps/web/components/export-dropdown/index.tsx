"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Receipt, FilePenLine, FileCheck2, FileCheck, SlidersHorizontal } from "lucide-react";

interface ExportDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  onCustomExportClick?: () => void;
}

interface ExportOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ isOpen, onClose, buttonRef, onCustomExportClick }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 557;
      const viewportWidth = window.innerWidth;
      
      // Calculate right position to align with button's right edge
      let rightPosition = viewportWidth - buttonRect.right;
      
      // Ensure dropdown doesn't go off-screen on the left
      if (buttonRect.right - dropdownWidth < 0) {
        rightPosition = viewportWidth - dropdownWidth - 16; // 16px margin from edge
      }
      
      setPosition({
        top: buttonRect.bottom + 8, // 8px gap below button
        right: rightPosition,
      });
    }
  }, [isOpen, buttonRef]);

  const group1: ExportOption[] = [
    {
      id: "today-invoices",
      label: "Today's Approved Invoices",
      icon: <Receipt className="w-6 h-6 text-[#09090B]" />,
    },
    {
      id: "today-logs",
      label: "Today's Approved Daily Logs",
      icon: <FilePenLine className="w-6 h-6 text-[#09090B]" />,
    },
    {
      id: "compliance",
      label: "All Compliance Documents",
      icon: <FileCheck2 className="w-6 h-6 text-[#09090B]" />,
    },
  ];

  const group2: ExportOption[] = [
    {
      id: "week-approved",
      label: "All Approved (This Week)",
      icon: <FileCheck className="w-6 h-6 text-[#09090B]" />,
    },
    {
      id: "month-approved",
      label: "All Approved (This Month)",
      icon: <FileCheck className="w-6 h-6 text-[#09090B]" />,
    },
  ];

  const handleOptionClick = (optionId: string) => {
    if (optionId === "custom") {
      onClose(); // Close the dropdown when opening modal
      onCustomExportClick?.(); // Open the custom export modal
    } else {
      // Add your export logic here
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Dropdown */}
      <div
        className="fixed z-50"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
      >
        <div
          ref={dropdownRef}
          className="bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] w-[557px] max-w-[calc(100vw-2rem)] flex flex-col gap-8 px-8 pt-6 pb-8"
        >
        {/* Header */}
        <div className="flex items-center justify-between gap-8 w-full">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Export Current Document
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Export Options */}
        <div className="flex flex-col gap-3">
          <h3 className="text-h6 text-primary font-poppins font-semibold">
            Batch Export Options
          </h3>

          {/* Group 1 */}
          <div className="flex flex-col border-b border-[#DEE0E3] pb-3">
            {group1.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full"
              >
                <div className="flex items-center justify-center w-8 h-8 p-[2px] rounded-full bg-[#F4F5F6]">
                  {option.icon}
                </div>
                <span className="text-supporting text-primary font-sf-pro">
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* Group 2 */}
          <div className="flex flex-col border-b border-[#DEE0E3] pb-3">
            {group2.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full"
              >
                <div className="flex items-center justify-center w-8 h-8 p-[2px] rounded-full bg-[#F4F5F6]">
                  {option.icon}
                </div>
                <span className="text-supporting text-primary font-sf-pro">
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Export Filter */}
          <button
            onClick={() => handleOptionClick("custom")}
            className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full"
          >
            <div className="flex items-center justify-center w-8 h-8 p-[2px] rounded-full bg-[#F4F5F6]">
              <SlidersHorizontal className="w-6 h-6 text-[#09090B]" />
            </div>
            <span className="text-supporting text-primary font-sf-pro">
              Custom Export Filter
            </span>
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default ExportDropdown;

