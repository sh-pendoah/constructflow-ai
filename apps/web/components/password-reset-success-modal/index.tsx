"use client";

import React from "react";
import Modal from "@/components/modal";

interface PasswordResetSuccessModalProps {
  isOpen: boolean;
  onGoToSignIn?: () => void;
}

const PasswordResetSuccessModal: React.FC<PasswordResetSuccessModalProps> = ({
  isOpen,
  onGoToSignIn,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} maxWidth="515px">
      <div className="flex flex-col gap-8 px-11 pt-11 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Password Reset Successful
          </h2>
        </div>

        {/* Description */}
        <p className="text-body-copy text-primary font-sf-pro">
          Your password has been updated successfully. You can now sign in using your new password.
        </p>

        {/* Go to Sign In Button */}
        <button
          onClick={onGoToSignIn}
          className="w-full h-[50px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors font-poppins font-semibold text-button"
        >
          Go to Sign In
        </button>
      </div>
    </Modal>
  );
};

export default PasswordResetSuccessModal;

