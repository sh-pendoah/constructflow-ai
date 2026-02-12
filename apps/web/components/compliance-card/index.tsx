"use client";

import React from "react";
import { FileCheck2 } from "lucide-react";

interface ComplianceCardProps {
  documentType: string;
  companyName: string;
  expiration: string;
  date: string;
  status: "compliant" | "expiring-soon" | "expired" | "pending";
  isSelected?: boolean;
  onClick?: () => void;
}

const ComplianceCard: React.FC<ComplianceCardProps> = ({
  documentType,
  companyName,
  expiration,
  date,
  status,
  isSelected = false,
  onClick,
}) => {
  const statusColors = {
    compliant: {
      text: "#10B981",
      border: "#10B981",
    },
    "expiring-soon": {
      text: "#F59E0B",
      border: "#F59E0B",
    },
    expired: {
      text: "#EF4444",
      border: "#EF4444",
    },
    pending: {
      text: "#F59E0B",
      border: "#F59E0B",
    },
  };

  const statusLabels = {
    compliant: "Compliant",
    "expiring-soon": "Expiring soon",
    expired: "Expired",
    pending: "Pending",
  };

  const statusColor = statusColors[status];

  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col gap-2 p-4 rounded-xl cursor-pointer transition-all
        ${
          isSelected
            ? "border-[1.5px] border-[#1F6F66] bg-white shadow-medium"
            : "border border-[#DEE0E3] bg-white hover:border-primary/30"
        }
      `}
    >
      {/* Header with Icon and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F3F5F7] flex items-center justify-center">
            <FileCheck2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-supporting text-primary font-sf-pro">
            Compliance
          </span>
        </div>
        <div
          className="px-2 h-6 flex items-center justify-center rounded-full border"
          style={{
            borderColor: statusColor.border,
          }}
        >
          <span
            className="text-xs font-normal font-sf-pro capitalize"
            style={{ color: statusColor.text }}
          >
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Compliance Details */}
      <div className="flex flex-col gap-1.5">
        <span className="text-label text-primary font-sf-pro">
          {documentType}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-supporting text-primary font-sf-pro">
            {companyName}
          </span>
          <span className="text-supporting text-primary font-sf-pro">
            Expiration: {expiration}
          </span>
        </div>
      </div>

      {/* Date */}
      <span className="text-small text-[#6F7A85] font-sf-pro">{date}</span>
    </div>
  );
};

export default ComplianceCard;

