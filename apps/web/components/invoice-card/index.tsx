"use client";

import React from "react";
import { Receipt } from "lucide-react";

interface InvoiceCardProps {
  invoiceNumber: string;
  companyName: string;
  vendorName: string;
  amount: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  isSelected?: boolean;
  onClick?: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoiceNumber,
  companyName,
  vendorName,
  amount,
  date,
  status,
  isSelected = false,
  onClick,
}) => {
  const statusColors = {
    pending: {
      text: "#F59E0B",
      border: "#F59E0B",
    },
    approved: {
      text: "#10B981",
      border: "#10B981",
    },
    rejected: {
      text: "#EF4444",
      border: "#EF4444",
    },
  };

  const statusColor = statusColors[status];

  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col gap-2 p-4 rounded-xl cursor-pointer transition-all
        ${
          isSelected
            ? "border-1 border-primary-color bg-white shadow-medium"
            : "border border-[#DEE0E3] bg-white hover:border-primary/30"
        }
      `}
    >
      {/* Header with Icon and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F3F5F7] flex items-center justify-center">
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <span className="text-supporting text-primary font-sf-pro">
            Invoice
          </span>
        </div>
        <div
          className="px-2 h-6 flex items-center justify-center  rounded-full border"
          style={{
            borderColor: statusColor.border,
          }}
        >
          <span
            className="text-xs font-normal font-sf-pro capitalize"
            style={{ color: statusColor.text }}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="flex flex-col gap-1.5">
        <span className="text-label text-primary font-sf-pro">
          {invoiceNumber}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-supporting text-primary font-sf-pro">
            {companyName}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-small text-[#2E3338] font-sf-pro">
              {vendorName}
            </span>
            <div className="w-1 h-1 rounded-full bg-primary"></div>
            <span className="text-label text-[#2E3338] font-sf-pro">
              {amount}
            </span>
          </div>
        </div>
      </div>

      {/* Date */}
      <span className="text-small text-[#6F7A85] font-sf-pro">{date}</span>
    </div>
  );
};

export default InvoiceCard;

