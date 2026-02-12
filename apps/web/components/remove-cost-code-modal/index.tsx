"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/modal";

interface RemoveCostCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  costCodeName?: string;
  isLoading?: boolean;
  error?: string | null;
}

const RemoveCostCodeModal: React.FC<RemoveCostCodeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  costCodeName,
  isLoading = false,
  error,
}) => {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="515px">
      <div className="flex flex-col gap-8 px-11 pt-11 pb-8">
        {/* Content */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-h3 text-primary font-poppins font-semibold text-center">
            Remove Cost Code
          </h2>
          <p className="text-body-copy text-primary font-sf-pro text-center max-w-[409px]">
            Are you sure you want to Remove this Cost Code?
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-sf-pro">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-stretch gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors font-poppins font-semibold text-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#EF4444] text-[#F3F5F7] rounded-lg hover:bg-[#dc2626] transition-colors font-poppins font-semibold text-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RemoveCostCodeModal;

