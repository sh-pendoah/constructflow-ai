"use client";

import React, { useState, useEffect } from "react";
import { X, Settings } from "lucide-react";
import Modal from "@/components/modal";
import AlertSentModal from "@/components/alert-sent-modal";

interface SendAlertPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: () => void;
}

const SendAlertPreviewModal: React.FC<SendAlertPreviewModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [isAlertSentModalOpen, setIsAlertSentModalOpen] = useState(false);

  // Default values for preview
  const to = "Vendoremail@gmail.com";
  const ccRecipients = ["Additional@gmail.com", "Additional@gmail.com"];
  const subject = "Insurance Renewal Required - MHX, LLC";
  const template = "Standard Vendor Reminder";
  const emailPreview = `Dear MHX, LLC,


Your Certificate of Property Insurance is approaching expiration:


Certificate #: 570115108424

Policy #: NAP200349006

Current Expiration: 06/01/2026

Days Remaining: 167


To maintain compliance with Rogue Forest Products, LLC, please provide an updated certificate at least 30 days before expiration.


Required Coverage:

• ALL RISK Property Insurance

• Minimum Coverage: $25,000,000

• Certificate Holder: Rogue Forest Products, LLC


Submit To: compliance@worklighter.com


⚠️ Important: Outstanding invoices may be held if insurance expires without renewal.


Questions? Contact: admin@worklighter.com


Best regards,

Worklighter Compliance Team`;

  const handleSend = () => {
    onSend?.();
    onClose();
    
    // Open success modal after a short delay
    setTimeout(() => {
      setIsAlertSentModalOpen(true);
    }, 100);
  };

  // Reset AlertSentModal state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsAlertSentModalOpen(false);
    }
  }, [isOpen]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
        <div className="flex flex-col gap-8 pt-6 px-8 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-h3 text-primary font-poppins font-semibold">
              Send Alert to Vendor
            </h2>
            <div className="flex items-center gap-2">
              <button className="h-[44px] cursor-pointer flex items-center gap-2 px-4 py-3 hover:bg-black/80 border border-[#8A949E] text-[#2E3338] rounded-lg hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
                <span className="text-button font-poppins font-semibold">Configure</span>
              </button>
              <button
                onClick={onClose}
                className="w-[44px] h-[44px] cursor-pointer flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content - Preview Only */}
          <div className="flex flex-col gap-5 overflow-y-auto hide-scrollbar" style={{ maxHeight: "542px" }}>
            {/* To Field */}
            <div className="flex flex-col gap-3">
              <label className="text-button text-primary font-poppins font-semibold">
                To
              </label>
              <p className="text-body-copy text-[#2E3338] font-sf-pro">
                {to}
              </p>
            </div>

            {/* CC Recipients */}
            <div className="flex flex-col gap-3">
              <label className="text-button text-primary font-poppins font-semibold">
                CC Recipients
              </label>
              <div className="flex flex-col gap-2">
                {ccRecipients.map((email, index) => (
                  <p key={index} className="text-body-copy text-[#2E3338] font-sf-pro">
                    {email}
                  </p>
                ))}
              </div>
            </div>

            {/* Subject Field */}
            <div className="flex flex-col gap-3">
              <label className="text-button text-primary font-poppins font-semibold">
                Subject
              </label>
              <p className="text-body-copy text-[#2E3338] font-sf-pro">
                {subject}
              </p>
            </div>

            {/* Template */}
            <div className="flex flex-col gap-3">
              <label className="text-button text-primary font-poppins font-semibold">
                Template
              </label>
              <p className="text-body-copy text-[#2E3338] font-sf-pro">
                {template}
              </p>
            </div>

            {/* Email Preview */}
            <div className="flex flex-col gap-3">
              <label className="text-button text-primary font-poppins font-semibold">
                Email Preview
              </label>
              <div className="border border-[#DEE0E3] rounded-lg p-3 bg-white">
                <p className="text-body-copy text-[#2E3338] font-sf-pro whitespace-pre-wrap">
                  {emailPreview}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-stretch gap-4">
            <button
              onClick={onClose}
              className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors"
            >
              <span className="text-button font-poppins font-semibold">Cancel</span>
            </button>
            <button
              onClick={handleSend}
              className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors"
            >
              <span className="text-button font-poppins font-semibold">Send Alert Now</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Alert Sent Success Modal */}
      <AlertSentModal
        isOpen={isAlertSentModalOpen}
        onClose={() => setIsAlertSentModalOpen(false)}
        to={to}
        cc={ccRecipients}
        subject={subject}
      />
    </>
  );
};

export default SendAlertPreviewModal;

