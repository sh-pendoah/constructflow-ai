"use client";

import React, { useState } from "react";
import { Download, Bot, FileWarning } from "lucide-react";
import Input from "@/components/input";
import CostCodeDropdown from "@/components/cost-code-dropdown";
import ApproveModal from "@/components/approve-modal";
import RejectModal from "@/components/reject-modal";
import { DailyLog } from "@/components/daily-log-sidebar";

interface WorkerEntry {
  id: string;
  name: string;
  description: string;
  hours: string;
  compCode: string;
}

interface DailyLogDetailsProps {
  dailyLog?: DailyLog | null;
}

const DailyLogDetails: React.FC<DailyLogDetailsProps> = ({ dailyLog }) => {
  // Default daily log data if none selected
  const dailyLogData = dailyLog || {
    id: "1",
    companyName: "Trailhead Design+Build",
    projectName: "Beverly Project",
    workers: "12 workers",
    totalHours: "70 hours total",
    dateRange: "2025-03-17 to 2025-03-28",
    status: "approved" as const,
  };

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

  const statusColor = statusColors[dailyLogData.status];
  const showActions = dailyLogData.status === "pending";

  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [workerEntries, setWorkerEntries] = useState<WorkerEntry[]>([
    {
      id: "1",
      name: "Theodore Berner - Week 1 Monday",
      description: "Clean up and demo work at beverly project",
      hours: "8 hrs",
      compCode: "5020",
    },
    {
      id: "2",
      name: "Theodore Berner - Week 2 Tuesday",
      description: "Deck framing, tear out radiators for floor",
      hours: "7 hrs",
      compCode: "5645",
    },
    {
      id: "3",
      name: "Theodore Berner - Week 2 Wednesday",
      description: "Framing and exterior siding installation",
      hours: "7 hrs",
      compCode: "5645",
    },
    {
      id: "4",
      name: "Theodore Berner - Week 2 Thursday",
      description: "Cleaning and Framing work at Brosada project",
      hours: "7 hrs",
      compCode: "5645",
    },
    {
      id: "5",
      name: "Theodore Berner - Week 2 Friday",
      description: "Framing, cleanup, Freezer electrical work at Brosada",
      hours: "7 hrs",
      compCode: "5403",
    },
    {
      id: "6",
      name: "Tom Wilson",
      description: "Equipment operation",
      hours: "6 hrs",
      compCode: "Equipment operation",
    },
  ]);

  const handleCompCodeChange = (entryId: string, newCompCode: string) => {
    setWorkerEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === entryId ? { ...entry, compCode: newCompCode } : entry
      )
    );
  };

  // Comp code dropdown options
  const compCodeOptions = [
    { value: "5020", label: "5020", isSuggested: true },
    { value: "5645", label: "5645", isSuggested: true },
    { value: "5403", label: "5403", isSuggested: true },
    { value: "5022", label: "5022" },
    { value: "5024", label: "5024" },
    { value: "5026", label: "5026" },
    { value: "Equipment operation", label: "Equipment operation" },
  ];

  const handleApprove = () => {
    setIsApproveModalOpen(false);
  };

  const handleReject = () => {
    setIsRejectModalOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#DEE0E3] border-l-0 rounded-tr-xl">
      {/* Sticky Header */}
      <div className="flex items-center justify-between gap-2 p-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-h6 text-primary font-poppins font-semibold">
            Daily Log Details
          </h2>
          <div
            className="px-2 h-6 flex items-center justify-center rounded-full border capitalize"
            style={{
              borderColor: statusColor.border,
            }}
          >
            <span
              className="text-xs font-normal font-sf-pro"
              style={{ color: statusColor.text }}
            >
              {dailyLogData.status}
            </span>
          </div>
        </div>
        <button className="flex items-center justify-center w-9 h-9 p-2 border border-[#8A949E] rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 hide-scrollbar">
        <div className="flex flex-col gap-5">
          {/* docflow-360 confidence */}
          <div className="flex items-center gap-2 p-3 pl-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-[#3B82F6]" />
                <span className="text-label text-primary font-sf-pro">
                  docflow-360 confidence
                </span>
              </div>
              <p className="text-small text-primary font-sf-pro">
                Good confidence - Review codes recommended
              </p>
            </div>
            <div className="relative w-[52px] h-[52px]">
              <svg className="w-[52px] h-[52px] transform -rotate-90">
                <circle
                  cx="26"
                  cy="26"
                  r="22"
                  fill="none"
                  stroke="#DEE0E3"
                  strokeWidth="4"
                />
                <circle
                  cx="26"
                  cy="26"
                  r="22"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  strokeDasharray={`${96 * 2 * Math.PI * 22 / 100} ${2 * Math.PI * 22}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-h6 text-[#3B82F6] font-poppins font-semibold">
                  96%
                </span>
              </div>
            </div>
          </div>

          {/* Status-based Alert */}
          {dailyLogData.status === "approved" && (
            <div className="flex items-center gap-2 p-3 pl-4 bg-[#FEF2E6] border border-[#F57C00] rounded-lg">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-label text-primary font-sf-pro font-semibold">
                  Workers Comp Code Assignment
                </span>
                <p className="text-small text-primary font-sf-pro">
                  Review and confirm suggested codes for each worker
                </p>
              </div>
            </div>
          )}

          {dailyLogData.status === "rejected" && (
            <div className="flex items-start gap-2 p-3 pl-4 bg-[#FEF2E6] border border-[#F57C00] rounded-lg">
              <FileWarning className="w-5 h-5 text-[#F57C00] flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-label text-primary font-sf-pro font-semibold">
                  Missing Fields Detected
                </span>
                <p className="text-small text-primary font-sf-pro">
                  Please fill in the highlighted fields below
                </p>
              </div>
            </div>
          )}

          {dailyLogData.status === "pending" && (
            <div className="flex items-start gap-2 p-3 pl-4 bg-[#FFEDED] border border-[#EF4444] rounded-lg">
              <FileWarning className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-label text-primary font-sf-pro font-semibold">
                  Possible Duplicate Invoice
                </span>
                <p className="text-small text-primary font-sf-pro">
                  This invoice may have been submitted before - please review carefully
                </p>
              </div>
            </div>
          )}

          {/* Input Fields */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Input
                label="Date"
                value="2025-13-17 to 20"
                readOnly
                name="date"
                labelStyle="supporting"
                inputStyle="body-copy"
                className="flex-1 max-w-[146px]"
              />
              <Input
                label="Total Hours"
                value="72 hrs"
                readOnly
                name="totalHours"
                labelStyle="supporting"
                inputStyle="body-copy"
                className="flex-1 max-w-[146px]"
              />
            </div>
            <Input
              label="Superintendent"
              value="Site Supervisor"
              readOnly
              name="superintendent"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <Input
              label="Job"
              value="Beverly Project (Primary), Brosada, Sterlin"
              readOnly
              name="job"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
          </div>

          {/* Workers & Comp Codes */}
          <div className="flex flex-col gap-3">
            <h3 className="text-supporting text-primary font-sf-pro">
              Workers & Comp Codes
            </h3>
            <div className="flex flex-col gap-3">
              {workerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 p-3 bg-[#F4F5F6] border border-[#DEE0E3] rounded-xl"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <p className="text-supporting text-primary !font-bold">
                        {entry.name}
                      </p>
                      <p className="text-small text-[#6F7A85] font-sf-pro">
                        {entry.description}
                      </p>
                    </div>
                    <span className="text-supporting text-primary !font-bold">
                      {entry.hours}
                    </span>
                  </div>
                  <CostCodeDropdown
                    label="Workers Comp Code"
                    value={entry.compCode}
                    onChange={(value) => handleCompCodeChange(entry.id, value)}
                    options={compCodeOptions}
                    name={`compCode-${entry.id}`}
                    readOnly={dailyLogData.status !== "pending"}
                    placeholder="Select Comp Code"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="pb-2">
            <Input
              label="Equipment"
              value="General construction tools, framing equipment"
              readOnly
              name="equipment"
              labelStyle="supporting"
              inputStyle="body-copy"
              multiline
              rows={3}
              className="h-[100px]"
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer - Only show for pending daily logs */}
      {showActions && (
        <div className="flex flex-col items-center w-full gap-2 p-4 pt-4 pb-4 px-2 border-t border-[#C3CCD5] flex-shrink-0">
          <button
            onClick={() => setIsApproveModalOpen(true)}
            className="flex-1 w-full max-h-12 flex items-center justify-center gap-2 py-5 px-6 bg-[#10B981] text-white rounded-lg hover:bg-[#0ea572] transition-colors"
          >
            <span className="text-button font-poppins font-semibold">Approve</span>
          </button>
          <button
            onClick={() => setIsRejectModalOpen(true)}
            className="flex-1 w-full max-h-12 flex items-center justify-center gap-2 py-5 px-6 bg-[#FFEDED] text-[#EF4444] rounded-lg hover:bg-[#FFE0E0] transition-colors"
          >
            <span className="text-button font-poppins font-semibold">Reject</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <ApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
      />
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
};

export default DailyLogDetails;

