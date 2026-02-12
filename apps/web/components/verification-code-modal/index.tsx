"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import Modal from "@/components/modal";

interface VerificationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
  isVerifying?: boolean;
  isResending?: boolean;
}

const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  isOpen,
  onClose,
  email = "john@company.com",
  onVerify,
  onResend,
  isVerifying = false,
  isResending = false,
}) => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset code when modal opens
      setCode(["", "", "", "", "", ""]);
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("").concat(Array(6 - pastedData.length).fill(""));
      setCode(newCode.slice(0, 6));
      // Focus the next empty input or last input
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      onVerify?.(fullCode);
    }
  };

  const handleResend = () => {
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    onResend?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div className="flex flex-col gap-6 sm:gap-8 pt-4 sm:pt-6 px-4 sm:px-8 pb-4 sm:pb-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-0.5 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-h3 text-primary font-poppins font-semibold">
              Verify Email Address
            </h2>
            <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
              Enter the verification code sent to your email
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] cursor-pointer flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Info Alert */}
        <div className="p-2.5 sm:p-3 pl-3 sm:pl-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)]">
          <p className="text-xs sm:text-supporting text-primary font-sf-pro">
            We've sent a 6-digit verification code to {email}
          </p>
        </div>

        {/* Verification Code Section */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <h3 className="text-base sm:text-h6 text-[#2E3338] font-poppins font-semibold text-center">
            Enter Verification Code
          </h3>

          {/* Code Input Container */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 w-full px-2 sm:px-0">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] text-center text-xl sm:text-2xl font-semibold text-primary border border-[#8A949E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6F66] focus:border-[#1F6F66] bg-white"
              />
            ))}
          </div>

          {/* Resend Code Section */}
          <div className="flex flex-col gap-1 w-full">
            <p className="text-sm sm:text-body-copy text-[#2E3338] font-sf-pro text-center">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={isResending || isVerifying}
              className="h-[32px] sm:h-[36px] cursor-pointer flex items-center justify-center gap-2 px-3 py-2 text-[#1F6F66] rounded-lg hover:bg-[#1F6F66]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm sm:text-button font-poppins font-semibold">
                    Resending...
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-button font-poppins font-semibold">
                  Resend Code
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
          <button
            onClick={onClose}
            disabled={isVerifying || isResending}
            className="h-[44px] sm:h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 sm:py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm sm:text-button font-poppins font-semibold">Back</span>
          </button>
          <button
            onClick={handleVerify}
            disabled={code.join("").length !== 6 || isVerifying || isResending}
            className="h-[44px] sm:h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 sm:py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm sm:text-button font-poppins font-semibold">
                  Verifying...
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-button font-poppins font-semibold">
                Verify Code
              </span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VerificationCodeModal;

