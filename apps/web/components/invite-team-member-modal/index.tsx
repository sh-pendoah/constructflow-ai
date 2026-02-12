"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Loader2 } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";

interface TeamMemberData {
  email: string;
  name: string;
  role: string;
}

interface InviteTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite?: (data: TeamMemberData) => void;
  onUpdate?: (data: TeamMemberData) => void;
  initialData?: TeamMemberData | null;
  mode?: "add" | "edit";
  isLoading?: boolean;
}

const InviteTeamMemberModal: React.FC<InviteTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  onUpdate,
  initialData = null,
  mode = "add",
  isLoading = false,
}) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Admin");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const hasInitialized = useRef(false);
  const previousIsOpen = useRef(false);

  const roles = ["Admin", "Project Manager"];

  // Only initialize/reset form when modal first opens, not when initialData changes
  useEffect(() => {
    if (isOpen && !previousIsOpen.current) {
      // Modal just opened - initialize with initialData
      if (initialData) {
        setEmail(initialData.email || "");
        setName(initialData.name || "");
        setRole(initialData.role || "Admin");
      } else {
        // Reset form for add mode
        setEmail("");
        setName("");
        setRole("Admin");
      }
      hasInitialized.current = true;
    }
    previousIsOpen.current = isOpen;
    
    // Reset initialization flag when modal closes
    if (!isOpen && hasInitialized.current) {
      hasInitialized.current = false;
    }
  }, [isOpen]); // Only depend on isOpen, not initialData

  const handleSubmit = () => {
    if (!email.trim() || isLoading) {
      return; // Email is required or API is in progress
    }
    const data = { email, name, role };
    if (mode === "edit") {
      onUpdate?.(data);
    } else {
      onInvite?.(data);
    }
    // Don't close modal or clear form here - let parent component handle it after API success
    // Form fields will remain filled until API succeeds and modal closes
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            {mode === "edit" ? "Edit Team Member" : "Invite Team Member"}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-11 h-11 flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <Input
              label={mode === "edit" ? "Email Address *" : "Invite Team Member *"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              labelStyle="supporting"
              inputStyle="body-copy"
              name="email"
              placeholder="user@company.com"
              readOnly={mode === "edit"}
            />
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <Input
              label="Name (Optional)"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              labelStyle="supporting"
              inputStyle="body-copy"
              name="name"
              placeholder="Name"
            />
          </div>

          {/* Role Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-supporting text-primary font-sf-pro">
              Role
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-4 border border-[#DEE0E3] rounded-lg bg-white text-body-copy text-primary font-sf-pro hover:border-[#1F6F66] transition-colors cursor-pointer"
              >
                <span>{role}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary transition-transform ${
                    isRoleDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isRoleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute z-20 w-full mt-1 bg-white border border-[#DEE0E3] rounded-lg shadow-lg overflow-hidden">
                    {roles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRole(r);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-3 text-left text-body-copy font-sf-pro hover:bg-gray-50 transition-colors ${
                          role === r ? "bg-[#F3F5F7]" : ""
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-stretch gap-8">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-button font-poppins font-semibold">Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!email.trim() || isLoading}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-button font-poppins font-semibold">Sending...</span>
              </>
            ) : (
              <span className="text-button font-poppins font-semibold">
                {mode === "edit" ? "Update" : "Send Invitation"}
              </span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InviteTeamMemberModal;

