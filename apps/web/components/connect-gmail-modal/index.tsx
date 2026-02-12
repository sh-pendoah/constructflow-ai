"use client";

import React from "react";
import { X, Info } from "lucide-react";
import Modal from "@/components/modal";

interface ConnectGmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

const ConnectGmailModal: React.FC<ConnectGmailModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const handleContinue = () => {
    onContinue?.();
    // Add your Google OAuth logic here
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-0.5 flex-1">
            <h2 className="text-h3 text-primary font-poppins font-semibold">
              Connect Gmail Account
            </h2>
            <p className="text-body-copy text-primary font-sf-pro">
              Connect a Gmail account to receive workflow documents
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex cursor-pointer items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert/Info Section */}
        <div className="flex flex-col gap-2 p-3 pl-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
            <h3 className="text-supporting text-primary font-sf-pro font-medium">
              How it works
            </h3>
          </div>
          <p className="text-supporting text-primary font-sf-pro pl-6">
            You'll be redirected to Google to sign in and grant permissions.
            We'll only access emails sent to this workflow inbox.
          </p>
        </div>

        {/* Google Icon and Preview Container */}
        <div className="flex flex-col items-center gap-5">
          {/* Google Icon */}
          <div className="flex items-center justify-center w-[94px] h-[94px] bg-[#F3F5F7] rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="54"
              height="54"
              viewBox="0 0 54 54"
              fill="none"
            >
              <g clip-path="url(#clip0_16083_22211)">
                <path
                  d="M26.9996 22.0898V32.5462H41.5304C40.8924 35.9089 38.9776 38.7563 36.1058 40.6708L44.8685 47.47C49.974 42.7574 52.9194 35.8355 52.9194 27.6128C52.9194 25.6983 52.7477 23.8572 52.4285 22.0901L26.9996 22.0898Z"
                  fill="#4285F4"
                />
                <path
                  d="M11.868 32.1406L9.89169 33.6535L2.89612 39.1025C7.33883 47.9142 16.4445 54.0016 26.999 54.0016C34.2888 54.0016 40.4005 51.5961 44.8679 47.4726L36.1052 40.6734C33.6998 42.2934 30.6316 43.2753 26.999 43.2753C19.979 43.2753 14.0147 38.5381 11.879 32.1562L11.868 32.1406Z"
                  fill="#34A853"
                />
                <path
                  d="M2.89615 14.8984C1.05534 18.531 0 22.6302 0 26.9992C0 31.3682 1.05534 35.4674 2.89615 39.0999C2.89615 39.1243 11.8799 32.129 11.8799 32.129C11.3399 30.509 11.0208 28.791 11.0208 26.9989C11.0208 25.2068 11.3399 23.4888 11.8799 21.8688L2.89615 14.8984Z"
                  fill="#FBBC05"
                />
                <path
                  d="M26.9995 10.7509C30.976 10.7509 34.5104 12.1254 37.3332 14.7764L45.0649 7.04464C40.3767 2.67562 34.2896 0 26.9995 0C16.4451 0 7.33883 6.06272 2.89612 14.8991L11.8796 21.87C14.015 15.4881 19.9796 10.7509 26.9995 10.7509Z"
                  fill="#EA4335"
                />
              </g>
              <defs>
                <clipPath id="clip0_16083_22211">
                  <rect width="54" height="54" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          {/* Preview Title and Description */}
          <div className="flex flex-col items-center gap-0.5">
            <h3 className="text-h3 text-primary font-poppins font-semibold">
              Connect with Google
            </h3>
            <p className="text-body-copy text-primary font-sf-pro">
              Sign in to your Gmail account to continue
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full h-[51px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors font-poppins font-semibold text-button"
        >
          Continue with Google
        </button>
      </div>
    </Modal>
  );
};

export default ConnectGmailModal;
