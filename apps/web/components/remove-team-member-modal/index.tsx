"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/modal";

interface RemoveTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  memberName?: string;
  isLoading?: boolean;
}

const RemoveTeamMemberModal: React.FC<RemoveTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  isLoading = false,
}) => {
  const handleConfirm = () => {
    if (isLoading) return; // Prevent confirming while API is in progress
    onConfirm?.();
    // Don't close modal here - let parent component handle it after API success
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="515px">
      <div className="flex flex-col items-center gap-8 px-11 pt-11 pb-8">
        {/* Title Container */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-h3 text-primary font-poppins font-semibold text-center h-[39px] flex items-center justify-center">
            Remove Team Member
          </h2>
          <p className="text-body-copy text-primary font-sf-pro text-center max-w-[409px]">
            Are you sure you want to Remove this Member?
          </p>
        </div>

        {/* Button Container */}
        <div className="flex items-stretch gap-4 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-button font-poppins font-semibold">Cancel</span>
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#EF4444] text-[#F3F5F7] rounded-lg hover:bg-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-button font-poppins font-semibold">Removing...</span>
              </>
            ) : (
              <span className="text-button font-poppins font-semibold">Remove</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RemoveTeamMemberModal;

