"use client";

import React from "react";
import { FilePenLine } from "lucide-react";

interface DailyLogCardProps {
  companyName: string;
  projectName: string;
  workers: string;
  totalHours: string;
  dateRange: string;
  status: "pending" | "approved" | "rejected";
  secondaryStatus?: "missing" | "duplicate" | null;
  isSelected?: boolean;
  onClick?: () => void;
}

const DailyLogCard: React.FC<DailyLogCardProps> = ({
  companyName,
  projectName,
  workers,
  totalHours,
  dateRange,
  status,
  secondaryStatus,
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

  const secondaryStatusColors = {
    missing: {
      bg: "#FFF6E6",
      text: "#F59E0B",
    },
    duplicate: {
      bg: "#FFEDED",
      text: "#EF4444",
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
            ? "border-[1.5px] border-[#1F6F66] bg-white shadow-medium"
            : "border border-[#DEE0E3] bg-white hover:border-primary/30"
        }
      `}
    >
      {/* Header with Icon and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F3F5F7] flex items-center justify-center">
            <FilePenLine className="w-4 h-4 text-primary" />
          </div>
          <span className="text-supporting text-primary font-sf-pro">
            Daily Log
          </span>
        </div>
        <div className="flex items-center gap-1">
          {secondaryStatus && (
            <div
              className="px-2 h-6 flex items-center justify-center rounded-full"
              style={{
                backgroundColor: secondaryStatusColors[secondaryStatus].bg,
              }}
            >
              <span
                className="text-xs font-normal font-sf-pro capitalize"
                style={{ color: secondaryStatusColors[secondaryStatus].text }}
              >
                {secondaryStatus}
              </span>
            </div>
          )}
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
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Log Details */}
      <div className="flex flex-col gap-1.5">
        <span className="text-label text-primary font-sf-pro">
          {companyName}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-supporting text-primary font-sf-pro">
            {projectName}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-small text-[#2E3338] font-sf-pro">
              {workers}
            </span>
            <div className="w-1 h-1 rounded-full bg-primary"></div>
            <span className="text-label text-[#2E3338] font-sf-pro">
              {totalHours}
            </span>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <span className="text-small text-[#6F7A85] font-sf-pro">{dateRange}</span>
    </div>
  );
};

export default DailyLogCard;

