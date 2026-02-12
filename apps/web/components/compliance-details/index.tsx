"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Download,
  Bot,
  CircleCheckBig,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Input from "@/components/input";
// import SendAlertModal from "@/components/send-alert-modal"; // Old Send Alert Modal - kept for reference
import SendAlertPreviewModal from "@/components/send-alert-preview-modal";
import MarkReviewedModal from "@/components/mark-reviewed-modal";
import { Compliance } from "@/components/compliance-sidebar";

interface ComplianceDetailsProps {
  compliance?: Compliance | null;
}

const ComplianceDetails: React.FC<ComplianceDetailsProps> = ({
  compliance,
}) => {
  // Default compliance data if none selected
  const complianceData = compliance || {
    id: "1",
    documentType: "Property Insurance",
    companyName: "MHX, LLC",
    expiration: "2026-06-01",
    date: "2024-12-16",
    status: "compliant" as const,
  };

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

  const statusColor = statusColors[complianceData.status];

  // Calculate days remaining or overdue
  const daysInfo = useMemo(() => {
    const expirationDate = new Date(complianceData.expiration);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);

    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        days: Math.abs(diffDays),
        isOverdue: true,
      };
    } else {
      return {
        days: diffDays,
        isOverdue: false,
      };
    }
  }, [complianceData.expiration]);

  // Get alert configuration based on status
  const alertConfig = useMemo(() => {
    if (complianceData.status === "expired") {
      return {
        bg: "#FFEDED",
        border: "#EF4444",
        icon: AlertTriangle,
        iconColor: "#EF4444",
        text: `Expired (${daysInfo.days} days overdue)`,
      };
    } else if (complianceData.status === "expiring-soon") {
      return {
        bg: "#FFF6E6",
        border: "#F59E0B",
        icon: Clock,
        iconColor: "#F59E0B",
        text: `Expiring soon (${daysInfo.days} days remaining)`,
      };
    } else {
      return {
        bg: "#ECFFF8",
        border: "#10B981",
        icon: CircleCheckBig,
        iconColor: "#10B981",
        text: `Compliance (${daysInfo.days} days remaining)`,
      };
    }
  }, [complianceData.status, daysInfo.days]);

  // const [alertSchedule, setAlertSchedule] = useState("Notify 7 Days Before");
  // const [isSendAlertModalOpen, setIsSendAlertModalOpen] = useState(false);
  const [isSendAlertPreviewModalOpen, setIsSendAlertPreviewModalOpen] = useState(false);
  const [isMarkReviewedModalOpen, setIsMarkReviewedModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const alertScheduleOptions = [
    { value: "Notify 7 Days Before", label: "Notify 7 Days Before" },
    { value: "Notify 14 Days Before", label: "Notify 14 Days Before" },
    { value: "Notify 30 Days Before", label: "Notify 30 Days Before" },
    { value: "Notify 60 Days Before", label: "Notify 60 Days Before" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      // You can add file upload logic, validation, etc.
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#DEE0E3] border-l-0 rounded-tr-xl">
      {/* Sticky Header */}
      <div className="flex items-center justify-between gap-2 p-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-h4 text-primary font-poppins font-semibold">
            Compliance Details
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
              {statusLabels[complianceData.status]}
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
          {/* Worklighter confidence - Only show when status is compliant or pending */}
          {complianceData.status !== "expired" &&
            complianceData.status !== "expiring-soon" && (
              <div className="flex items-center gap-2 p-3 pl-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-[#3B82F6]" />
                    <span className="text-label text-primary font-sf-pro">
                      Worklighter confidence
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
                      strokeDasharray={`${(96 * 2 * Math.PI * 22) / 100} ${
                        2 * Math.PI * 22
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-h6 text-[#3B82F6] font-poppins font-semibold">
                      96%
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Compliance Status Alert */}
          {complianceData.status !== "pending" && (
            <div
              className="flex items-center gap-2 p-3 pl-4 rounded-lg"
              style={{
                backgroundColor: alertConfig.bg,
                borderColor: alertConfig.border,
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              {complianceData.status === "expired" ? (
                <AlertTriangle
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: alertConfig.iconColor }}
                />
              ) : complianceData.status === "expiring-soon" ? (
                <Clock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: alertConfig.iconColor }}
                />
              ) : (
                <CircleCheckBig
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: alertConfig.iconColor }}
                />
              )}
              <span className="text-supporting text-primary font-sf-pro">
                {alertConfig.text}
              </span>
            </div>
          )}

          {/* Input Fields */}
          <div className="flex flex-col gap-3">
            <Input
              label="Vendor"
              value="MHX,LLC"
              readOnly
              name="vendor"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <Input
              label="Certificate #"
              value="570115108424"
              readOnly
              name="certificateNumber"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <Input
              label="Document Type"
              value="Certificate of Property Insurance"
              readOnly
              name="documentType"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <Input
              label="Insurer"
              value="Swiss Re Corp Solution Elite Ins Corp"
              readOnly
              name="insurer"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <Input
              label="Policy Number"
              value="NAP200349006"
              readOnly
              name="policyNumber"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <div className="flex gap-3">
              <Input
                label="Effective"
                value="06/01/2025"
                readOnly
                name="effective"
                labelStyle="supporting"
                inputStyle="body-copy"
                className="flex-1 max-w-[146px]"
              />
              <Input
                label="Expiration"
                value="06/01/2026"
                readOnly
                name="expiration"
                labelStyle="supporting"
                inputStyle="body-copy"
                className="flex-1 max-w-[146px]"
              />
            </div>
            <Input
              label="Coverage"
              value="All Risk Property Insurance: 425,000,000, $500,686,267, Included"
              readOnly
              name="coverage"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            {/* <div className="relative">
              <label className="text-supporting text-primary font-sf-pro mb-2 block">
                Alert Schedule
              </label>
              <CostCodeDropdown
                label=""
                value={alertSchedule}
                onChange={(value) => {
                  setAlertSchedule(value);
                }}
                options={alertScheduleOptions}
                name="alertSchedule"
                readOnly={false}
                placeholder="Select Alert Schedule"
              />
            </div> */}
          </div>

          {/* Save Changes Button */}
          {/* <button className="w-full flex items-center justify-center max-h-[50px] cursor-pointer hover:bg-black/80 gap-2 py-5 px-6 border border-[#8A949E] text-[#2E3338] rounded-lg hover:text-white transition-colors">
            <span className="text-button font-poppins font-semibold">Save Changes</span>
          </button> */}
        </div>
      </div>

      {/* Sticky Footer */}
      {complianceData.status !== "pending" ? (
        <div className="flex flex-col items-center w-full gap-2 p-4 pt-4 pb-4 px-2 border-t border-[#C3CCD5] flex-shrink-0">
          <button
            onClick={() => setIsSendAlertPreviewModalOpen(true)}
            className="flex-1 cursor-pointer w-full max-h-12 flex items-center justify-center gap-2 py-5 px-6 bg-[#0E1114] text-[#F3F5F7] rounded-lg hover:bg-[#1a1a1a]/80 transition-colors"
          >
            <span className="text-button font-poppins font-semibold">
              Send Alert to Vendor
            </span>
          </button>
          <button
            onClick={handleUploadClick}
            className="flex-1 w-full max-h-12 flex items-center justify-center hover:bg-black/80 cursor-pointer gap-2 py-5 px-6 border border-[#8A949E] text-[#2E3338] rounded-lg hover:text-white transition-colors"
          >
            <span className="text-button font-poppins font-semibold">
              Upload Updated Document
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center w-full gap-2 p-4 pt-4 pb-4 px-2 border-t border-[#C3CCD5] flex-shrink-0">
          <button
            onClick={() => setIsMarkReviewedModalOpen(true)}
            className="flex-1 cursor-pointer w-full max-h-12 flex items-center justify-center gap-2 py-5 px-6 bg-[#0E1114] text-[#F3F5F7] rounded-lg hover:bg-[#1a1a1a]/80 transition-colors"
          >
            <span className="text-button font-poppins font-semibold">
              Mark as Reviewed
            </span>
          </button>
        </div>
      )}

      {/* Send Alert Modal (Old - kept for reference) */}
      {/* <SendAlertModal
        isOpen={isSendAlertModalOpen}
        onClose={() => setIsSendAlertModalOpen(false)}
        onSend={() => {
          console.log("Alert sent");
        }}
      /> */}

      {/* Send Alert Preview Modal (New - Preview Only) */}
      <SendAlertPreviewModal
        isOpen={isSendAlertPreviewModalOpen}
        onClose={() => setIsSendAlertPreviewModalOpen(false)}
        onSend={() => {
          // Alert sent from preview modal
        }}
      />

      {/* Mark as Reviewed Modal */}
      <MarkReviewedModal
        isOpen={isMarkReviewedModalOpen}
        onClose={() => setIsMarkReviewedModalOpen(false)}
        onConfirm={() => {
          // Add your logic here to mark the document as reviewed
        }}
      />
    </div>
  );
};

export default ComplianceDetails;
