"use client";

import React from "react";
import Modal from "@/components/modal";

interface VerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({
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
      <div className="flex flex-col items-center gap-8 px-11 pt-11 pb-8">
        {/* Title Container */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-h3 text-primary font-poppins font-semibold text-center h-[39px] flex items-center justify-center">
            Verification Email Sent
          </h2>
          <p className="text-body-copy text-primary font-sf-pro text-center max-w-[409px]">
            A verification link has been sent to your email. Please verify to continue.
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className="w-full max-w-[427px] h-[50px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors"
        >
          <span className="text-button font-poppins font-semibold">Confirm</span>
        </button>
      </div>
    </Modal>
  );
};

export default VerificationSuccessModal;

