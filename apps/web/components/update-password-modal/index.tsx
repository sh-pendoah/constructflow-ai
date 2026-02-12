"use client";

import React from "react";
import Modal from "@/components/modal";
import { Loader2 } from "lucide-react";

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  isLoading: boolean;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="515px">
      <div className="flex flex-col items-center gap-8 px-11 pt-11 pb-8">
        {/* Title Container */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-h3 text-primary font-poppins font-semibold text-center h-[39px] flex items-center justify-center">
            Update Password
          </h2>
          <p className="text-body-copy text-primary font-sf-pro text-center max-w-[409px]">
            Choose a strong password to keep your account secure.
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
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm sm:text-button font-poppins font-semibold">
                          Updating...
                        </span>
                      </>
                    ) : (
                      <span className="text-button font-poppins font-semibold">Confirm</span>
                    )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UpdatePasswordModal;

