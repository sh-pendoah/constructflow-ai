"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Lightbulb } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";

interface CustomExportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: ExportFilters) => void;
}

interface ExportFilters {
  exportType: "invoices" | "daily-logs" | "compliance";
  timeRange: string;
  documentStatus: string;
  format: string;
  fromDate?: string;
  toDate?: string;
}

const CustomExportFilterModal: React.FC<CustomExportFilterModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [filters, setFilters] = useState<ExportFilters>({
    exportType: "invoices",
    timeRange: "This Month",
    documentStatus: "Approved Only",
    format: "CSV (Excel/ERP Import)",
    fromDate: "",
    toDate: "",
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = {
    timeRange: useRef<HTMLDivElement>(null),
    status: useRef<HTMLDivElement>(null),
    format: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const clickedOutside = Object.values(dropdownRefs).every((ref) => {
          return ref.current && !ref.current.contains(event.target as Node);
        });
        if (clickedOutside) {
          setOpenDropdown(null);
        }
      }
    };

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const timeRangeOptions = [
    "Today",
    "This Week",
    "This Month",
    "This Quarter",
    "This Year",
    "All time",
    "Custom Date Range",
  ];

  const documentStatusOptions = ["Approved Only", "Pending Only", "Rejected Only", "All Statuses"];

  const formatOptions = [
    "CSV (Excel/ERP Import)",
    "JSON (API/Database)",
    "PDF Report",
  ];

  const exportTypes = [
    {
      id: "invoices",
      label: "Invoices",
      description: "All approved invoices with line items and cost codes.",
    },
    {
      id: "daily-logs",
      label: "Daily Logs",
      description: "Worker hours by comp code for insurance audit.",
    },
    {
      id: "compliance",
      label: "Compliance Documents",
      description: "All vendor COIs with expiration status",
    },
  ];

  const handleExport = () => {
    onExport(filters);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-8 w-full">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Custom Export Filter
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* What to Export */}
        <div className="flex flex-col gap-3">
          <h3 className="text-h6 text-primary font-poppins font-semibold">
            What to Export
          </h3>
          <div className="flex flex-col gap-2">
            {exportTypes.map((type, index) => (
              <button
                key={type.id}
                onClick={() => setFilters({ ...filters, exportType: type.id as any })}
                className={`
                  flex items-center justify-between px-4 py-4 rounded-lg border transition-colors
                  ${index > 0 ? "mt-0" : ""}
                  ${
                    filters.exportType === type.id
                      ? "bg-[#F9FFFE] border-[#1F6F66]"
                      : "bg-white border-[#DEE0E3]"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${
                        filters.exportType === type.id
                          ? "border-[#1F6F66]"
                          : "border-[#DEE0E3]"
                      }
                    `}
                  >
                    {filters.exportType === type.id && (
                      <div className="w-3 h-3 rounded-full bg-[#1F6F66]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-button text-[#03111F] font-poppins text-start font-semibold">
                      {type.label}
                    </span>
                    <span className="text-supporting text-[#03111F] font-sf-pro">
                      {type.description}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Settings */}
        <div className="flex flex-col gap-6 ">
          <div className="flex flex-col gap-6">
            {/* Time Range Dropdown */}
            <div className="relative" ref={dropdownRefs.timeRange}>
              <label className="text-supporting text-primary font-sf-pro mb-2 block">
                Time Range
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === "timeRange" ? null : "timeRange")
                  }
                  className="w-full flex items-center justify-between px-3 py-4 rounded-lg border border-[#DEE0E3] bg-white backdrop-blur-[30px]"
                >
                  <span className="text-body-copy text-primary font-sf-pro">
                    {filters.timeRange}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-primary transition-transform ${
                      openDropdown === "timeRange" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdown === "timeRange" && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#DEE0E3] rounded-lg shadow-medium max-h-[200px] overflow-y-auto hide-scrollbar">
                    {timeRangeOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilters({ ...filters, timeRange: option });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-body-copy text-primary font-sf-pro hover:bg-gray-50 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Custom Date Range UI */}
              {filters.timeRange === "Custom Date Range" && (
                <div className="mt-4 flex flex-col gap-6 pt-5 px-4 pb-3 bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)]">
                  <h4 className="text-supporting text-primary font-sf-pro">
                    Select Custom Date Range
                  </h4>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        label="From Date"
                        type="date"
                        value={filters.fromDate || ""}
                        onChange={(e) =>
                          setFilters({ ...filters, fromDate: e.target.value })
                        }
                        labelStyle="supporting"
                        inputStyle="body-copy"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="To Date"
                        type="date"
                        value={filters.toDate || ""}
                        onChange={(e) =>
                          setFilters({ ...filters, toDate: e.target.value })
                        }
                        labelStyle="supporting"
                        inputStyle="body-copy"
                      />
                    </div>
                  </div>
                  {/* Tips Alert */}
                  <div className="flex flex-col gap-2 py-3 px-3 pl-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                      <span className="text-supporting text-primary font-sf-pro font-semibold">
                        Tips
                      </span>
                    </div>
                    <p className="text-supporting text-primary font-sf-pro">
                      Leave dates empty to export all documents of selected Type.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Document Status Dropdown */}
            <div className="relative" ref={dropdownRefs.status}>
              <label className="text-supporting text-primary font-sf-pro mb-2 block">
                Document Status
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === "status" ? null : "status")
                  }
                  className="w-full flex items-center justify-between px-3 py-4 rounded-lg border border-[#DEE0E3] bg-white backdrop-blur-[30px]"
                >
                  <span className="text-body-copy text-primary font-sf-pro">
                    {filters.documentStatus}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-primary transition-transform ${
                      openDropdown === "status" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdown === "status" && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#DEE0E3] rounded-lg shadow-medium max-h-[200px] overflow-y-auto hide-scrollbar">
                    {documentStatusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilters({ ...filters, documentStatus: option });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-body-copy text-primary font-sf-pro hover:bg-gray-50 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Format Dropdown */}
            <div className="relative" ref={dropdownRefs.format}>
              <label className="text-supporting text-primary font-sf-pro mb-2 block">
                Format
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === "format" ? null : "format")
                  }
                  className="w-full flex items-center justify-between px-3 py-4 rounded-lg border border-[#DEE0E3] bg-white backdrop-blur-[30px]"
                >
                  <span className="text-body-copy text-primary font-sf-pro">
                    {filters.format}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-primary transition-transform ${
                      openDropdown === "format" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdown === "format" && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#DEE0E3] rounded-lg shadow-medium max-h-[200px] overflow-y-auto hide-scrollbar">
                    {formatOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilters({ ...filters, format: option });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-body-copy text-primary font-sf-pro hover:bg-gray-50 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Export Now Button */}
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center h-[50px] cursor-pointer gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors"
        >
          <span className="text-button font-poppins font-semibold">Export Now</span>
        </button>
      </div>
    </Modal>
  );
};

export default CustomExportFilterModal;

