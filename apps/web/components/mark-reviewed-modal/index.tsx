"use client";

import React from "react";
import Modal from "@/components/modal";

interface MarkReviewedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

const MarkReviewedModal: React.FC<MarkReviewedModalProps> = ({
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
        {/* Title and Description */}
        <div className="flex flex-col gap-4 w-full">
          <h2 className="text-h3 text-primary font-poppins font-semibold text-center">
            Mark Document as reviewed
          </h2>
          <p className="text-body-copy text-primary font-sf-pro text-center">
            Please review the document carefully before proceeding.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-stretch gap-4 w-full">
          <button
            onClick={onClose}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors"
          >
            <span className="text-button font-poppins font-semibold">Cancel</span>
          </button>
          <button
            onClick={handleConfirm}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors"
          >
            <span className="text-button font-poppins font-semibold">Confirm</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MarkReviewedModal;

