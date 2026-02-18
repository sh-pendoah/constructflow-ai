"use client";

import React, { useState } from "react";
import { Download, Bot } from "lucide-react";
import Input from "@/components/input";
import CostCodeDropdown from "@/components/cost-code-dropdown";
import ApproveModal from "@/components/approve-modal";
import RejectModal from "@/components/reject-modal";
import { Invoice } from "@/components/invoice-sidebar";

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  price: string;
  costCode: string;
}

interface InvoiceDetailsProps {
  invoice?: Invoice | null;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice }) => {
  // Default invoice data if none selected
  const invoiceData = invoice || {
    id: "",
    invoiceNumber: "Invoice #2016645",
    companyName: "Rogue Forest Products - Phoenix Project",
    vendorName: "Hampton Lumber Sales",
    amount: "$14,974.56",
    date: "2025-12-08",
    status: "pending" as const,
  };

  const statusColors = {
    pending: {
      text: "#F59E0B",
      border: "#F59E0B",
      bg: "#FFEDED",
    },
    approved: {
      text: "#10B981",
      border: "#10B981",
      bg: "#ECFFF8",
    },
    rejected: {
      text: "#EF4444",
      border: "#EF4444",
      bg: "#FFEDED",
    },
  };

  const statusColor = statusColors[invoiceData.status];
  const showActions = invoiceData.status === "pending";

  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description:
        "DOUGLAS FIR GRN #1 & BTR S45 4×8 (144/12)- Size: 3-9/16\"X7-1/2\"",
      quantity: "4.608 MBF @ $795",
      price: "$3663.36",
      costCode: "06 - 1000",
    },
    {
      id: "2",
      description:
        "DOUGLAS FIR GRN #1 & BTR S45 4×10 (40/12')- Size: 3-9/16\"X9-1/2\"",
      quantity: "1.6 MBF @ $795",
      price: "$1272.00",
      costCode: "06 - 1000",
    },
    {
      id: "3",
      description:
        "DOUGLAS FIR GRN #1 & BTR S45 6×6 (64/12')- Size: 5-5/8\"X5-5/8\"",
      quantity: "2.304 MBF @ $175",
      price: "$403.20",
      costCode: "06 - 1000",
    },
    {
      id: "4",
      description:
        "DOUGLAS FIR GRN #1 & BTR S45 6×8 (48/12')- Size: 5-5/8\"X7-1/2\"",
      quantity: "2.304 MBF @ $1375",
      price: "$3168.00",
      costCode: "06 - 1000",
    },
    {
      id: "5",
      description:
        "DOUGLAS FIR GRN #1 & BTR S45 6×10 (40/12')- Size: 5-5/8\"X9-1/2\"",
      quantity: "2.4 MBF @ $1375",
      price: "$3300.00",
      costCode: "06 - 1000",
    },
    {
      id: "6",
      description:
        "DOUGLAS FIR GRN #1 & BTR S45 6×10 (40/12')- Size: 5-5/8\"X9-1/2\"",
      quantity: "2.4 MBF @ $1375",
      price: "$3168.00",
      costCode: "06 - 1000",
    },
  ]);

  const handleCostCodeChange = (itemId: string, newCostCode: string) => {
    setLineItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, costCode: newCostCode } : item
      )
    );
  };

  // Cost code dropdown options
  const costCodeOptions = [
    { value: "06 - 1000", label: "06 - 1000" },
    { value: "5022", label: "5022", isSuggested: true },
    { value: "5020", label: "5020" },
    { value: "5024", label: "5024" },
    { value: "5026", label: "5026" },
  ];

  // Modal handlers
  const handleApprove = () => {
    // Handle approve logic here
    setIsApproveModalOpen(false);
    // You can add your approve logic here, e.g., update invoice status
  };

  const handleReject = () => {
    // Handle reject logic here
    setIsRejectModalOpen(false);
    // You can add your reject logic here, e.g., update invoice status
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#DEE0E3] border-l-0  rounded-tr-xl">
      {/* Sticky Header */}
      <div className="flex items-center justify-between gap-2 p-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-h6 text-primary font-poppins font-semibold">
            Invoice Details
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
              {invoiceData.status}
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
                High confidence - AI extraction verified
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
                <span className="text-h5 text-[#3B82F6] font-poppins font-semibold">
                  96%
                </span>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col gap-3">
            <Input
              label="Vendor"
              value={invoiceData.vendorName}
              readOnly
              name="vendor"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <Input
              label="Invoice #"
              value={invoiceData.invoiceNumber.replace("Invoice #", "")}
              readOnly
              name="invoiceNumber"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <div className="flex gap-3">
              <Input
                label="Date"
                value={invoiceData.date}
                readOnly
                name="date"
                labelStyle="supporting"
                inputStyle="body-copy"
                className="max-w-[146px]"
              />
              <Input
                label="Due Date"
                value={invoiceData.date}
                readOnly
                name="dueDate"
                labelStyle="supporting"
                inputStyle="body-copy"
                className="max-w-[146px]"
              />
            </div>
            <Input
              label="Amount"
              value={invoiceData.amount}
              readOnly
              name="amount"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
            <Input
              label="Job"
              value={invoiceData.companyName}
              readOnly
              name="job"
              labelStyle="supporting"
              inputStyle="body-copy"
            />
          </div>

          {/* Line Items & Cost Codes */}
          <div className="flex flex-col gap-3">
            <h3 className="text-supporting text-primary font-sf-pro">
              Line Items & Cost Codes
            </h3>
            <div className="flex flex-col gap-3">
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-3 bg-[#F3F5F7] border border-[#DEE0E3] rounded-xl"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <p className="text-supporting text-primary !font-bold">
                        {item.description}
                      </p>
                      <p className="text-small text-[#6F7A85] font-sf-pro">
                        {item.quantity}
                      </p>
                    </div>
                    <span className="text-supporting text-primary !font-bold">
                      {item.price}
                    </span>
                  </div>
                  <CostCodeDropdown
                    label="Cost Code"
                    value={item.costCode}
                    onChange={(value) => handleCostCodeChange(item.id, value)}
                    options={costCodeOptions}
                    name={`costCode-${item.id}`}
                    readOnly={invoiceData.status !== "pending"}
                    placeholder="Select Cost Code"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="pb-2">
            <Input
              label="Notes"
              value="DOUGLAS FIR lumber order - 15.520 MBF total. Payment terms: 1%"
              readOnly
              name="notes"
              labelStyle="supporting"
              inputStyle="body-copy"
              multiline
              rows={3}
              className="h-[100px]"
            />
          </div>

        </div>
      </div>

      {/* Sticky Footer - Only show for pending invoices */}
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

export default InvoiceDetails;

