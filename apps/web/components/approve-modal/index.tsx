"use client";

import React from "react";
import Modal from "@/components/modal";

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center gap-8 px-11 pt-11 pb-8">
        {/* Title Container */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-h3 text-primary font-poppins font-semibold text-center w-full">
            Approve Invoice
          </h2>
          <p className="text-body-copy text-primary font-sf-pro text-center w-[409px]">
            Are you sure you want to approve this invoice?
          </p>
        </div>

        {/* Buttons Container */}
        <div className="flex items-stretch w-full gap-4">
          <button
            onClick={onClose}
            className="flex-1 flex items-center max-h-[50px] hover:bg-black/80 hover:text-white cursor-pointer justify-center gap-2 py-5 px-3 border border-[#8A949E] rounded-lg transition-colors"
          >
            <span className="text-button  font-poppins font-semibold">
              Cancel
            </span>
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center max-h-[50px] cursor-pointer justify-center gap-2 py-5 px-3 bg-[#10B981] text-[#F3F5F7] rounded-lg hover:bg-[#0ea572] transition-colors"
          >
            <span className="text-button font-poppins font-semibold">
              Approve
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveModal;

