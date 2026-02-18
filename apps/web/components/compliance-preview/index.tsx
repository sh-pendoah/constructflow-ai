"use client";

import React, { useState } from "react";
import {
  Mail,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CompliancePreview = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#DEE0E3] overflow-y-auto relative hide-scrollbar">
      {/* Email Section */}
      <div className="w-full flex-shrink-0">
        <div className="flex flex-col gap-2 p-6">
          {/* Email Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="text-h6 text-primary font-poppins font-semibold">
                    Email from: billing@abcconcrete.com
                  </h3>
                </div>
                <p className="text-supporting text-[#6F7A85] font-sf-pro">
                  Invoice ABC-8472 - Mirror Valley Project
                </p>
              </div>
            </div>
            <button
              onClick={toggleExpanded}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 h-[30px] text-button hover:text-white text-primary font-sf-pro hover:bg-black/80 group rounded-lg transition-colors self-start"
            >
              <span className="transition-all duration-300 min-w-[100px]">
                {isExpanded ? "View Less" : "View More"}
              </span>
              <div className="transition-transform duration-300 ease-in-out">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 group-hover:text-white text-primary" />
                ) : (
                  <ChevronDown className="w-5 h-5 group-hover:text-white text-primary" />
                )}
              </div>
            </button>
          </div>
          {/* Email Preview Text - Collapsed */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-0 opacity-0" : "max-h-[20px] opacity-100"
            }`}
          >
            <p className="text-supporting text-[#2E3338] font-sf-pro line-clamp-2 h-[17px]">
              "Please find attached invoice for concrete delivery and labor
              services provided on 12/15. Payment services provided on 12/15. Payment  terms Net 30..."
            </p>
          </div>
          {/* Expanded Email Content */}
          <div
            className={`overflow-auto  hide-scrollbar transition-all duration-300 ease-in-out ${
              isExpanded
                ? "max-h-[400px] opacity-100 pt-2"
                : "max-h-0 opacity-0 pt-0"
            }`}
          >
            <div className="flex flex-col gap-5 overflow-y-auto hide-scrollbar pb-2 border-b border-[#DEE0E3]">
              {/* Email Metadata */}
              <div className="flex flex-col gap-3 pb-4 border-b border-[#DEE0E3]">
                <p className="text-button text-primary font-poppins font-semibold">
                  From: billing@abcconcrete.com
                </p>
                <p className="text-button text-primary font-poppins font-semibold">
                  To: invoices@docflow-360.com
                </p>
                <p className="text-button text-primary font-poppins font-semibold">
                  Subject: Invoice ABC-8472 - Mirror Valley Project
                </p>
              </div>
              {/* Email Body */}
              <div className="flex flex-col gap-5">
                <p className="text-body-copy text-[#2E3338] font-sf-pro">
                  Dear Accounts Payable,
                </p>
                <p className="text-body-copy text-[#2E3338] font-sf-pro">
                  Please find attached invoice ABC-8472 for concrete delivery and labor
                  services provided on December 15, 2024 for the Mirror Valley
                  Apartments project.
                </p>
                <p className="text-body-copy text-[#2E3338] font-sf-pro">
                  This invoice covers: <br />
                  - 45 cubic yards of 3000 PSI concrete mix <br />
                  - Labor for pour and finishing work <br />
                  - Delivery and pump fees
                </p>
                <p className="text-body-copy text-[#2E3338] font-sf-pro">
                  Payment terms: <br />
                  <br />
                  Net 30 days Due date: January 14, 2025 Please contact us if you have
                  any questions.
                </p>
                <p className="text-body-copy text-[#2E3338] font-sf-pro">
                  Thank you, <br />
                  ABC Concrete Supply <br />
                  billing@abcconcrete.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[#F3F5F7] ">
        {/* Document Preview */}
        <div className="flex-1 flex items-center justify-center p-6 pb-11">
          <div className="relative w-full max-w-[549px] h-[633px] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src="/images/Document.png"
              alt="Compliance Document"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Preview Actions - Fixed Position */}
        <div className="absolute top-[20px] right-6 flex flex-col gap-1 z-10">
          <button className="p-2 bg-white border border-[#DEE0E3] rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <ZoomIn className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 bg-white border border-[#DEE0E3] rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <ZoomOut className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 bg-white border border-[#DEE0E3] rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <RotateCw className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 bg-white border border-[#DEE0E3] rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompliancePreview;


