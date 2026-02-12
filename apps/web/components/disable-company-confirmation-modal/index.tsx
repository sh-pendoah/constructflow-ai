"use client";

import React from "react";
import Modal from "@/components/modal";

interface DisableCompanyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

const DisableCompanyConfirmationModal: React.FC<DisableCompanyConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="515px">
      <div
        className="flex flex-col items-center justify-center"
        style={{ padding: "44px 44px 32px", gap: "32px" }}
      >
        {/* Title Container */}
        <div className="flex flex-col items-center" style={{ gap: "16px" }}>
          <h2
            className="text-h3 text-primary font-poppins font-semibold text-center"
            style={{ height: "39px" }}
          >
            Disable Company
          </h2>
          <p
            className="text-body-copy text-primary font-sf-pro text-center"
            style={{ width: "409px" }}
          >
            Are you sure you want to disable this company? This action cannot be undone.
          </p>
        </div>

        {/* Button Container */}
        <div className="flex items-stretch w-full" style={{ gap: "16px" }}>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center border border-[#8A949E] rounded-lg bg-transparent text-[#2E3338] hover:bg-black/80 hover:text-white transition-colors cursor-pointer"
            style={{ padding: "20px 12px", height: "50px" }}
          >
            <span className="text-button font-poppins font-semibold">Cancel</span>
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center bg-[#EF4444] text-[#F3F5F7] rounded-lg hover:bg-[#dc2626] transition-colors cursor-pointer"
            style={{ padding: "20px 12px", height: "50px" }}
          >
            <span className="text-button font-poppins font-semibold">
              Disable Company
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DisableCompanyConfirmationModal;

