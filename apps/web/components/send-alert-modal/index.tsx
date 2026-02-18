"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Settings, Plus, PencilLine, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/modal";
import Input from "@/components/input";
import AlertSentModal from "@/components/alert-sent-modal";

interface SendAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: () => void;
}

const SendAlertModal: React.FC<SendAlertModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [to, setTo] = useState("contact@mhx.com");
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState("");
  const [subject, setSubject] = useState("Insurance Renewal Required - MHX, LLC");
  const [template, setTemplate] = useState("Standard Renewal Notice");
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isAlertSentModalOpen, setIsAlertSentModalOpen] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  const templateOptions = [
    { value: "Standard Renewal Notice", label: "Standard Renewal Notice" },
    { value: "Urgent Expiration Warning", label: "Urgent Expiration Warning" },
    { value: "Final Notice Before Hold", label: "Final Notice Before Hold" },
    { value: "Custom Template", label: "Custom Template" },
  ];

  const defaultEmailPreview = `Dear MHX, LLC,


Your Certificate of Property Insurance is approaching expiration:


Certificate #: 570115108424

Policy #: NAP200349006

Current Expiration: 06/01/2026

Days Remaining: 167


To maintain compliance with Rogue Forest Products, LLC, please provide an updated certificate at least 30 days before expiration.


Required Coverage:

• ALL RISK Property Insurance

• Minimum Coverage: $25,000,000

• Certificate Holder: Rogue Forest Products, LLC


Submit To: compliance@docflow-360.com


⚠️ Important: Outstanding invoices may be held if insurance expires without renewal.


Questions? Contact: admin@docflow-360.com


Best regards,

docflow-360 Compliance Team`;

  const [emailPreview, setEmailPreview] = useState(defaultEmailPreview);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddCc = () => {
    const trimmedEmail = ccInput.trim();
    if (trimmedEmail) {
      if (validateEmail(trimmedEmail)) {
        setCcRecipients([...ccRecipients, trimmedEmail]);
        setCcInput("");
        toast.success("Email added successfully");
      } else {
        toast.error("Please enter a valid email address");
      }
    } else {
      toast.error("Please enter an email address");
    }
  };

  const handleRemoveCc = (index: number) => {
    setCcRecipients(ccRecipients.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    // Store the form data before closing
    const formData = {
      to,
      cc: ccRecipients,
      subject,
    };
    
    onSend?.();
    onClose();
    
    // Open success modal after a short delay to ensure the current modal closes first
    setTimeout(() => {
      setIsAlertSentModalOpen(true);
    }, 100);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplateDropdownOpen(false);
      }
    };

    if (isTemplateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTemplateDropdownOpen]);

  // Reset AlertSentModal state when SendAlertModal closes
  useEffect(() => {
    if (!isOpen && isAlertSentModalOpen) {
      // If the modal closes and success modal is still open, keep it open
      // This handles the case where we're transitioning from one modal to another
    } else if (!isOpen) {
      // Reset the success modal state when the main modal closes normally
      setIsAlertSentModalOpen(false);
    }
  }, [isOpen]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
        <div className="flex flex-col pt-6 px-8 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Send Alert to Vendor
          </h2>
          <div className="flex items-center gap-2">
            <button className="max-h-[44px] cursor-pointer flex items-center gap-2 px-4 py-3 hover:bg-black/80 border border-[#8A949E] text-[#2E3338] rounded-lg hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-button font-poppins font-semibold">Configure</span>
            </button>
            <button
              onClick={onClose}
              className="w-[50px] h-[50px] cursor-pointer flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-col gap-6 overflow-y-auto hide-scrollbar" style={{ maxHeight: "542px" }}>
          {/* To Field */}
          <Input
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            name="to"
            labelStyle="supporting"
            inputStyle="body-copy"
          />

          {/* CC Recipients */}
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  label="CC Recipients (Optional)"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCc();
                    }
                  }}
                  name="cc"
                  labelStyle="supporting"
                  inputStyle="body-copy"
                  placeholder="Additional@gmail.com"
                />
              </div>
              <button
                onClick={handleAddCc}
                className="h-[50px] cursor-pointer flex items-center gap-2 px-4 py-3 hover:bg-black/80 border border-[#8A949E] text-[#2E3338] rounded-lg hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-button font-poppins font-semibold">Add</span>
              </button>
            </div>

            {/* CC Recipients Chips */}
            {ccRecipients.map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-5 p-2 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg"
              >
                <span className="text-body-copy text-[#2E3338] font-sf-pro">
                  {email}
                </span>
                <button
                  onClick={() => handleRemoveCc(index)}
                  className="h-11 w-11 cursor-pointer flex items-center justify-center bg-[#FFEDED] text-[#EF4444] rounded-lg hover:bg-[#FFE0E0] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Subject Field */}
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            name="subject"
            labelStyle="supporting"
            inputStyle="body-copy"
          />

          {/* Template Dropdown */}
          <div className="relative" ref={templateDropdownRef}>
            <label className="text-supporting text-primary font-sf-pro mb-2 block">
              Template
            </label>
            <div className="relative">
              <button
                onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                className="h-[50px] cursor-pointer w-full flex items-center justify-between gap-2 px-3 py-4 border border-[#DEE0E3] rounded-lg bg-white hover:border-primary/50 transition-colors"
              >
                <span className="text-body-copy text-primary font-sf-pro">
                  {template}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-primary transition-transform ${
                    isTemplateDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isTemplateDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#DEE0E3] rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-y-auto hide-scrollbar max-h-60">
                    {templateOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTemplate(option.value);
                          setIsTemplateDropdownOpen(false);
                        }}
                        className="h-[50px] cursor-pointer w-full text-left px-4 py-3 text-body-copy text-primary font-sf-pro hover:bg-gray-50 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email Preview */}
          <div className="flex flex-col gap-2">
            <label className="text-supporting text-primary font-sf-pro">
              Email Preview
            </label>
            <div className="border border-[#DEE0E3] rounded-lg p-3 bg-white">
              <textarea
                value={emailPreview}
                onChange={(e) => setEmailPreview(e.target.value)}
                readOnly={!isEmailEditable}
                className={`w-full min-h-[200px] text-body-copy text-primary font-sf-pro resize-none border-none outline-none hide-scrollbar ${
                  isEmailEditable ? "bg-white" : "bg-transparent"
                }`}
              />
            </div>
            <button
              onClick={() => setIsEmailEditable(!isEmailEditable)}
              className="h-8 cursor-pointer self-start flex items-center gap-2 hover:bg-black/80 hover:border hover:border-primary border-[#8A949E] text-[#2E3338] rounded-lg hover:text-white  px-3 py-2 text-supporting font-poppins font-semibold hover:text-primary transition-colors"
            >
              <PencilLine className="w-4 h-4" />
              <span>{isEmailEditable ? "Save Template" : "Edit Template"}</span>
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-stretch gap-8 mt-8 ">
          <button
            onClick={onClose}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 hover:bg-black/80 border border-[#8A949E] text-[#2E3338] rounded-lg hover:text-white transition-colors"
          >
            <span className="text-button font-poppins font-semibold">Cancel</span>
          </button>
          <button
            onClick={handleSend}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-white rounded-lg hover:bg-[#1a5d55] transition-colors"
          >
            <span className="text-button font-poppins font-semibold">Send Alert Now</span>
          </button>
        </div>
        </div>
      </Modal>

      {/* Alert Sent Success Modal - Rendered outside the main modal */}
      <AlertSentModal
        isOpen={isAlertSentModalOpen}
        onClose={() => setIsAlertSentModalOpen(false)}
        to={to}
        cc={ccRecipients}
        subject={subject}
      />
    </>
  );
};

export default SendAlertModal;


