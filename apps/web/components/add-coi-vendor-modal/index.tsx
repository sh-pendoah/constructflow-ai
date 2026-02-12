"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Plus, FileText, Upload, Info, Loader2 } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Select from "@/components/select";
import FileUpload from "@/components/file-upload";
import Alert from "@/components/alert";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import companyActions from "@/Redux/actions/company";
import { createCOIVendorFailure } from "@/Redux/reducers/company";

interface AddCOIVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: any;
}

const AddCOIVendorModal: React.FC<AddCOIVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const { isCreatingCOIVendor, createCOIVendorSuccess, createCOIVendorError } = useAppSelector((state) => state.company);

  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [coiFile, setCoiFile] = useState<File | null>(null);
  const [coiExpirationDate, setCoiExpirationDate] = useState("");
  const [emailTemplate, setEmailTemplate] = useState(
    "Standard Vendor Reminder"
  );
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [newCcRecipient, setNewCcRecipient] = useState("");

  // Close modal and reset form on successful creation
  useEffect(() => {
    if (createCOIVendorSuccess) {
      resetForm();
      onSubmit?.({ success: true });
      dispatch(createCOIVendorFailure(""));
      // Small delay to allow success message to be seen
      setTimeout(() => {
        onClose();
      }, 100);
    }
  }, [createCOIVendorSuccess, onClose, onSubmit, dispatch]);

  // Reset error when modal closes
  useEffect(() => {
    if (!isOpen && createCOIVendorError) {
      dispatch(createCOIVendorFailure(""));
    }
  }, [isOpen, createCOIVendorError, dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setVendorName("");
    setVendorEmail("");
    setCoiFile(null);
    setCoiExpirationDate("");
    setEmailTemplate("Standard Vendor Reminder");
    setCcRecipients([]);
    setNewCcRecipient("");
  };

  const handleAddCcRecipient = () => {
    if (
      newCcRecipient.trim() &&
      !ccRecipients.includes(newCcRecipient.trim())
    ) {
      setCcRecipients([...ccRecipients, newCcRecipient.trim()]);
      setNewCcRecipient("");
    }
  };

  const handleRemoveCcRecipient = (email: string) => {
    setCcRecipients(ccRecipients.filter((e) => e !== email));
  };

  const handleRemoveFile = () => {
    setCoiFile(null);
  };

  const handleSubmit = () => {
    if (!vendorName.trim() || !vendorEmail.trim() || !coiFile) {
      return;
    }

    // Create FormData for API
    const formData = new FormData();
    formData.append("vendorName", vendorName.trim());
    formData.append("vendorEmail", vendorEmail.trim());
    formData.append("coiDocument", coiFile);
    
    // Format date to YYYY-MM-DD if provided
    if (coiExpirationDate) {
      // Convert from mm/dd/yyyy to yyyy-mm-dd if needed
      let formattedDate = coiExpirationDate;
      if (coiExpirationDate.includes("/")) {
        const parts = coiExpirationDate.split("/");
        if (parts.length === 3) {
          const [month, day, year] = parts;
          formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      } else if (coiExpirationDate.includes("-") && coiExpirationDate.length === 10) {
        // Already in YYYY-MM-DD format
        formattedDate = coiExpirationDate;
      }
      formData.append("coiExpirationDate", formattedDate);
    }
    
    formData.append("emailTemplate", emailTemplate);
    
    // Default email subject and body (can be customized based on template)
    formData.append("emailSubject", `COI Expiration Notice - ${vendorName.trim()}`);
    formData.append("emailBody", `Dear ${vendorName.trim()},\n\nThis is a reminder that your Certificate of Insurance (COI) is expiring soon. Please renew your COI to maintain compliance.\n\nThank you.`);
    
    // Append CC recipients as JSON string array
    if (ccRecipients.length > 0) {
      formData.append("ccRecipients", JSON.stringify(ccRecipients));
    }

    dispatch(companyActions.createCOIVendorRequest(formData));
  };

  const handleClose = () => {
    if (!isCreatingCOIVendor) {
      resetForm();
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const emailTemplates = [
    { value: "Standard Vendor Reminder", label: "Standard Vendor Reminder" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div
        className="flex flex-col"
        style={{ padding: "24px 32px 32px", gap: "32px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Add COI Vendor
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreatingCOIVendor}
            className="w-11 h-11 flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert */}
        <div
          className="self-stretch pl-4 pr-3 py-3 bg-[#EBF3FF] rounded-lg border border-[#3B82F6] inline-flex flex-col justify-start items-start gap-2"
        >
          <div className="self-stretch inline-flex justify-start items-start gap-2">
            <Info className="w-4 h-4 text-[#3B82F6] mt-1" />
            <div className="flex-1 justify-start">
              <span className="text-Text-txt-dark text-sm font-normal font-Inter">
                Alert emails will be sent to the{" "}
              </span>
              <span className="text-Text-txt-dark text-sm font-bold font-Inter">
                Vendor Email
              </span>
              <span className="text-Text-txt-dark text-sm font-normal font-Inter">
                . <br />
                Add CC recipients to notify others when alerts are sent.
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex flex-col"
          style={{ gap: "20px", maxHeight: "519px", overflowY: "auto" }}
        >
          {/* Vendor Info Section */}
          <div
            className="flex flex-col border border-[#DEE0E3] rounded-xl"
            style={{ padding: "20px 16px", gap: "16px" }}
          >
            {/* Vendor Name and Email Row */}
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                <Input
                  label="Vendor Name"
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  labelStyle="supporting"
                  inputStyle="body-copy"
                  name="vendorName"
                  placeholder="e.g., ABC Plumbing CO."
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Vendor Email"
                  type="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  labelStyle="supporting"
                  inputStyle="body-copy"
                  name="vendorEmail"
                  placeholder="Additional@Vendor.com"
                  required
                />
              </div>
            </div>

            {/* Upload COI Document */}
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <FileUpload
                label="Upload COI Document"
                heading="Click to upload or drag and drop"
                bodyText="PDF, JPG, PNG or any image format"
                accept=".pdf,.jpg,.jpeg,.png,image/*"
                onFileSelect={(file) => setCoiFile(file)}
                className="required"
              />
            </div>

            {/* File Info Card (shown when file is uploaded) */}
            {coiFile && (
              <div className="flex items-center gap-5 p-4 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg">
                <FileText className="w-9 h-9 text-primary flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-button text-[#03111F] font-poppins font-semibold">
                    {coiFile.name}
                  </span>
                  <span className="text-supporting text-[#6F7A85] font-sf-pro">
                    {formatFileSize(coiFile.size)}
                  </span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-3 bg-[#FFEDED] rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors"
                >
                  <X className="w-5 h-5 text-[#EF4444]" />
                </button>
              </div>
            )}

            {/* COI Expiration Date */}
            <div className="flex flex-col" style={{ gap: "4px" }}>
              <label className="text-supporting text-primary font-sf-pro">
                COI Expiration Date
              </label>
              <div className="relative">
                <Input
                  label=""
                  type="date"
                  value={coiExpirationDate}
                  onChange={(e) => setCoiExpirationDate(e.target.value)}
                  labelStyle="supporting"
                  inputStyle="body-copy"
                  name="coiExpirationDate"
                  placeholder="mm/dd/yyyy"
                  showLabel={false}
                  inputClassV2="pr-10"
                />
                {/* <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-primary pointer-events-none" /> */}
              </div>
              <span className="text-supporting text-[#6F7A85] font-sf-pro">
                If document is uploaded, we'll try to auto-extract the date. You
                can edit it if needed.
              </span>
            </div>
          </div>

          {/* Alert Settings Section */}
          <div
            className="flex flex-col border border-[#DEE0E3] rounded-xl"
            style={{ padding: "20px 16px", gap: "16px" }}
          >
            <h3 className="text-button text-primary font-poppins font-semibold">
              Email Alert Settings
            </h3>

            {/* Email Template */}
            <Select
              label="Email Template"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              options={emailTemplates}
              labelStyle="supporting"
            />

            {/* CC Recipients Row */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  label="CC Recipients"
                  type="email"
                  value={newCcRecipient}
                  onChange={(e) => setNewCcRecipient(e.target.value)}
                  labelStyle="supporting"
                  inputStyle="body-copy"
                  name="ccRecipient"
                  placeholder="Additional@gmail.com"
                />
              </div>
              <button
                onClick={handleAddCcRecipient}
                className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#8A949E] rounded-lg bg-transparent hover:bg-gray-50 transition-colors"
                style={{ padding: "12px 16px" }}
              >
                <Plus className="w-5 h-5 text-[#2E3338]" />
                <span className="text-button text-[#2E3338] font-poppins font-semibold">
                  Add
                </span>
              </button>
            </div>

            {/* CC Recipients List */}
            {ccRecipients.length > 0 && (
              <div className="flex flex-col gap-3">
                {ccRecipients.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-5 p-3 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg"
                  >
                    <span className="flex-1 text-button text-[#2E3338] font-poppins font-semibold">
                      {email}
                    </span>
                    <button
                      onClick={() => handleRemoveCcRecipient(email)}
                      className="p-2 bg-[#FFEDED] rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors"
                      style={{ padding: "8px 12px" }}
                    >
                      <X className="w-5 h-5 text-[#EF4444]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {createCOIVendorError && (
          <div className="p-3 bg-[#FFEDED] border border-[#EF4444] rounded-lg">
            <p className="text-sm text-[#EF4444] font-sf-pro">{createCOIVendorError}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-stretch gap-8">
          <button
            onClick={handleClose}
            disabled={isCreatingCOIVendor}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: "20px 12px" }}
          >
            <span className="text-button font-poppins font-semibold">
              Cancel
            </span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreatingCOIVendor || !vendorName.trim() || !vendorEmail.trim() || !coiFile}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: "20px 12px" }}
          >
            {isCreatingCOIVendor ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-button font-poppins font-semibold">Adding...</span>
              </>
            ) : (
              <span className="text-button font-poppins font-semibold">
                Add Vendor
              </span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCOIVendorModal;

