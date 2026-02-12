"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";

interface CreateNewPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetPassword?: (newPassword: string, confirmPassword: string) => void;
  isLoading?: boolean;
}

const CreateNewPasswordModal: React.FC<CreateNewPasswordModalProps> = ({
  isOpen,
  onClose,
  onResetPassword,
  isLoading = false,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      return;
    }
    if (newPassword !== confirmPassword) {
      return;
    }
    onResetPassword?.(newPassword, confirmPassword);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="515px">
      <div className="flex flex-col gap-8 px-11 pt-11 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Create new password
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
          Enter your new password
        </p>

        {/* Password Inputs */}
        <div className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            labelStyle="supporting"
            inputStyle="body-copy"
            name="newPassword"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            labelStyle="supporting"
            inputStyle="body-copy"
            name="confirmPassword"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>

        {/* Reset Password Button */}
        <button
          onClick={handleSubmit}
          disabled={!newPassword.trim() || !confirmPassword.trim() || newPassword !== confirmPassword || isLoading}
          className="w-full h-[50px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-button"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </Modal>
  );
};

export default CreateNewPasswordModal;

