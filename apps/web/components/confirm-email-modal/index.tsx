"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Alert from "@/components/alert";

interface ConfirmEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVerification?: (email: string) => void;
  currentEmail?: string;
  isLoading?: boolean;
}

const ConfirmEmailModal: React.FC<ConfirmEmailModalProps> = ({
  isOpen,
  onClose,
  onSendVerification,
  currentEmail = "",
  isLoading = false,
}) => {
  const [email, setEmail] = useState(currentEmail);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentEmail);
    }
  }, [isOpen, currentEmail]);

  const handleSubmit = () => {
    if (!email.trim()) {
      return;
    }
    onSendVerification?.(email);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-8 sm:gap-8 sm:px-8 sm:pt-6 sm:pb-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          {/* Title Section */}
          <div className="flex flex-col gap-0.5 flex-1">
            <h2 className="text-h3 text-primary font-poppins font-semibold">
              Before We Send the Verification Code
            </h2>
            <p className="text-body-copy text-primary font-sf-pro">
              Please confirm the email address where you want to receive the code.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6">
          {/* Email Input */}
          <div className="flex flex-col gap-1">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={true}
              labelStyle="supporting"
              inputStyle="body-copy"
              name="email"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <p className="text-supporting text-[#6F7A85] font-sf-pro px-3">
              You can update this email if needed.
            </p>
          </div>

          {/* Info Alert */}
          <Alert
            variant="warning"
            heading="Note"
            bodyText="We'll send a 6-digit verification code to this email. Make sure you have access to this inbox."
            className="border border-[#F57C00] bg-[#FEF2E6]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-[51px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] rounded-lg bg-white text-[#2E3338] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!email.trim() || isLoading}
            className="flex-1 h-[51px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              "Send Verification"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmEmailModal;

