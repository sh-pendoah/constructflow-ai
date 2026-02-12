"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/modal";
import DisableCompanyConfirmationModal from "@/components/disable-company-confirmation-modal";
import ActivateCompanyConfirmationModal from "@/components/activate-company-confirmation-modal";

interface Company {
  id: string;
  companyName: string;
  companyUrl: string;
  status: "Active" | "Inactive";
  plan: string;
  workflows: string[];
  users: number;
}

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onDisable?: (companyId: string) => void;
  onActivate?: (companyId: string) => void;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  isOpen,
  onClose,
  company,
  onDisable,
  onActivate,
}) => {
  const [isDisableConfirmationOpen, setIsDisableConfirmationOpen] = useState(false);
  const [isActivateConfirmationOpen, setIsActivateConfirmationOpen] = useState(false);

  if (!company) return null;

  // Mock data - replace with actual data from props or API
  const companyInfo = {
    status: company.status,
    plan: company.plan,
    totalUsers: company.users,
    monthlyRevenue: 1499, // This should come from actual data
  };

  const usageStats = {
    documentsProcessed: 847,
    storageUsed: "2.4 GB",
  };

  const handleAction = () => {
    if (company.status === "Active") {
      setIsDisableConfirmationOpen(true);
    } else if (company.status === "Inactive") {
      setIsActivateConfirmationOpen(true);
    }
  };

  const handleDisableConfirm = () => {
    if (onDisable) {
      onDisable(company.id);
    }
    setIsDisableConfirmationOpen(false);
    onClose();
  };

  const handleActivateConfirm = () => {
    if (onActivate) {
      onActivate(company.id);
    }
    setIsActivateConfirmationOpen(false);
    onClose();
  };

  const isActive = company.status === "Active";

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div className="flex flex-col" style={{ padding: "24px 32px 32px", gap: "32px" }}>
        {/* Header */}
        <div className="flex items-center" style={{ gap: "32px" }}>
          <div className="flex flex-col flex-1" style={{ gap: "2px" }}>
            <h2 className="text-h3 text-primary font-poppins font-semibold">
              {company.companyName}
            </h2>
            <p className="text-body-copy text-primary font-sf-pro">
              {company.companyUrl}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ width: "44px", height: "44px", padding: "12px" }}
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex flex-col" style={{ gap: "16px" }}>
          {/* Company Information Section */}
          <div
            className="bg-white border border-[#DEE0E3] rounded-xl shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] flex flex-col"
            style={{ padding: "32px", gap: "16px" }}
          >
            <h3 className="text-h6 text-primary font-poppins font-semibold">
              Company Information
            </h3>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <div className="flex items-center" style={{ gap: "12px" }}>
                <span className="text-supporting text-[#6F7A85] font-sf-pro flex-1">
                  Status
                </span>
                <span
                  className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-sf-pro border ${
                    companyInfo.status === "Active"
                      ? "bg-white border-[#10B981] text-[#10B981]"
                      : "bg-white border-[#EF4444] text-[#EF4444]"
                  }`}
                  style={{ padding: "4px 8px" }}
                >
                  {companyInfo.status}
                </span>
              </div>
              <div className="flex items-center" style={{ gap: "12px" }}>
                <span className="text-supporting text-[#6F7A85] font-sf-pro flex-1">
                  Plan
                </span>
                <span className="text-body-copy text-primary font-sf-pro">
                  {companyInfo.plan}
                </span>
              </div>
              <div className="flex items-center" style={{ gap: "12px" }}>
                <span className="text-supporting text-[#6F7A85] font-sf-pro flex-1">
                  Total Users
                </span>
                <span className="text-body-copy text-primary font-sf-pro">
                  {companyInfo.totalUsers}
                </span>
              </div>
              <div className="flex items-center" style={{ gap: "12px" }}>
                <span className="text-supporting text-[#6F7A85] font-sf-pro flex-1">
                  Monthly Revenue
                </span>
                <span className="text-body-copy text-primary font-sf-pro">
                  ${companyInfo.monthlyRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Active Workflows Section */}
          <div
            className="bg-white border border-[#DEE0E3] rounded-xl shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] flex flex-col"
            style={{ padding: "32px", gap: "16px" }}
          >
            <h3 className="text-h6 text-primary font-poppins font-semibold">
              Active Workflows
            </h3>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              {company.workflows.length > 0 ? (
                company.workflows.map((workflow, index) => (
                  <div key={index} className="flex items-center" style={{ gap: "12px" }}>
                    <span className="text-body-copy text-primary font-sf-pro flex-1">
                      {workflow}
                    </span>
                    <span
                      className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-sf-pro border bg-white border-[#10B981] text-[#10B981]"
                      style={{ padding: "4px 8px" }}
                    >
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-body-copy text-[#6F7A85] font-sf-pro">
                  No active workflows
                </span>
              )}
            </div>
          </div>

          {/* Usage This Month Section */}
          <div
            className="bg-white border border-[#DEE0E3] rounded-xl shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] flex flex-col"
            style={{ padding: "32px", gap: "16px" }}
          >
            <h3 className="text-h6 text-primary font-poppins font-semibold">
              Usage This Month
            </h3>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <div className="flex items-center" style={{ gap: "12px" }}>
                <span className="text-supporting text-[#6F7A85] font-sf-pro flex-1">
                  Documents Processed
                </span>
                <span className="text-body-copy text-primary font-sf-pro">
                  {usageStats.documentsProcessed.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center" style={{ gap: "12px" }}>
                <span className="text-supporting text-[#6F7A85] font-sf-pro flex-1">
                  Storage Used
                </span>
                <span className="text-body-copy text-primary font-sf-pro">
                  {usageStats.storageUsed}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-stretch" style={{ gap: "32px" }}>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center border border-[#8A949E] rounded-lg bg-transparent text-[#2E3338] hover:bg-black/80 hover:text-white transition-colors cursor-pointer"
            style={{ padding: "20px 12px", height: "50px" }}
          >
            <span className="text-button font-poppins font-semibold">Cancel</span>
          </button>
          <button
            onClick={handleAction}
            className={`flex-1 flex items-center justify-center border rounded-lg transition-colors cursor-pointer ${
              isActive
                ? "border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white"
                : "border-[#1ECB7E] bg-[#1ECB7E] text-white hover:opacity-90"
            }`}
            style={{ padding: "20px 12px", height: "50px" }}
          >
            <span className="text-button font-poppins font-semibold">
              {isActive ? "Disable Company" : "Activate Company"}
            </span>
          </button>
        </div>
      </div>

      </Modal>

      {/* Disable Company Confirmation Modal */}
      <DisableCompanyConfirmationModal
        isOpen={isDisableConfirmationOpen}
        onClose={() => setIsDisableConfirmationOpen(false)}
        onConfirm={handleDisableConfirm}
      />

      {/* Activate Company Confirmation Modal */}
      <ActivateCompanyConfirmationModal
        isOpen={isActivateConfirmationOpen}
        onClose={() => setIsActivateConfirmationOpen(false)}
        onConfirm={handleActivateConfirm}
      />
    </>
  );
};

export default CompanyDetailsModal;
