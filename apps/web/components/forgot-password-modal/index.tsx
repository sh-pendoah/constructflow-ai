"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendCode?: (email: string) => void;
  isLoading?: boolean;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSendCode,
  isLoading = false,
}) => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!email.trim()) {
      return;
    }
    onSendCode?.(email);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="515px">
      <div className="flex flex-col gap-8 px-11 pt-11 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Forgot Password?
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
          No worries! Enter Your Email address and we&apos;ll send you a code to reset your password
        </p>

        {/* Email Input */}
        <div className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
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
        </div>

        {/* Send Reset Code Button */}
        <button
          onClick={handleSubmit}
          disabled={!email.trim() || isLoading}
          className="w-full h-[50px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-button"
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
        </button>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;

