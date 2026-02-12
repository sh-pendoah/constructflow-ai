"use client";

import React from "react";
import Modal from "@/components/modal";

interface AlertSentModalProps {
  isOpen: boolean;
  onClose: () => void;
  to?: string;
  cc?: string[];
  subject?: string;
}

const AlertSentModal: React.FC<AlertSentModalProps> = ({
  isOpen,
  onClose,
  to = "contact@mhx.com",
  cc = [],
  subject = "Insurance Renewal Required - MHX, LLC",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="648px">
      <div className="flex flex-col items-center gap-8 pt-11 px-11 pb-8">
        {/* Content */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Title */}
          <h2 className="text-h3 text-primary font-poppins font-semibold text-center h-[39px]">
            Alert Sent Successfully
          </h2>

          {/* Details */}
          <div className="flex flex-col gap-3 w-full">
            <p className="text-body-copy text-primary font-sf-pro">
              To: {to}
            </p>
            {cc.length > 0 && (
              <p className="text-body-copy text-primary font-sf-pro">
                CC: {cc.join(", ")}
              </p>
            )}
            <p className="text-body-copy text-primary font-sf-pro">
              Subject: {subject}
            </p>
            <p className="text-body-copy text-primary font-sf-pro">
              The vendor has been notified about their insurance expiration.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-stretch gap-8 w-full">
          <button
            onClick={onClose}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors"
          >
            <span className="text-button font-poppins font-semibold">Cancel</span>
          </button>
          <button
            onClick={onClose}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-white rounded-lg hover:bg-[#1a5d55] transition-colors"
          >
            <span className="text-button font-poppins font-semibold">Got It</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertSentModal;

