"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify?: (code: string) => void;
  onResend?: () => void;
  email?: string;
  isVerifying?: boolean;
  isResending?: boolean;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  email,
  isVerifying = false,
  isResending = false,
}) => {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setCode("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!code.trim() || code.length !== 6) {
      return;
    }
    onVerify?.(code);
  };

  const handleCodeChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="515px">
      <div className="flex flex-col gap-8 px-11 pt-11 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Verify your Email
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-body-copy text-primary font-sf-pro">
          Enter the 6-digit code sent to your email.
        </p>

        {/* Code Input */}
        <div className="flex flex-col gap-4">
          <Input
            label=""
            type="text"
            value={code}
            onChange={(e: any) => handleCodeChange(e)}
            placeholder="000000"
            showLabel={false}
            labelStyle="supporting"
            inputStyle="body-copy"
            name="code"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>

        {/* Verify Email Button */}
        <button
          onClick={handleSubmit}
          disabled={!code.trim() || code.length !== 6 || isVerifying}
          className="w-full h-[50px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-button"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </button>

        {/* Resend Link */}
        <div className="flex items-center justify-center">
          <p className="text-body-copy text-primary font-sf-pro">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={onResend}
              disabled={isResending}
              className="text-[#3B82F6] hover:underline cursor-pointer font-sf-pro disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Resending..." : "Resend."}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default VerifyEmailModal;
