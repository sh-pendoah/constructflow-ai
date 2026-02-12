"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Plus, FileText, Info, Loader2 } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Select from "@/components/select";
import FileUpload from "@/components/file-upload";
import Alert from "@/components/alert";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import companyActions from "@/Redux/actions/company";
import { updateCOIVendorFailure } from "@/Redux/reducers/company";

interface VendorData {
  id: string;
  vendorName: string;
  email: string;
  currentCOI: string;
  expires: string;
  coiFileUrl?: string;
  emailTemplate?: string;
  emailSubject?: string;
  emailBody?: string;
  ccRecipients?: string[];
  uploadedDate?: string;
}

interface EditCOIVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: any;
  vendorData?: VendorData | null;
}

const EditCOIVendorModal: React.FC<EditCOIVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vendorData,
}) => {
  const dispatch = useAppDispatch();
  const { isUpdatingCOIVendor, updateCOIVendorSuccess, updateCOIVendorError } = useAppSelector((state) => state.company);

  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [coiFile, setCoiFile] = useState<File | null>(null);
  const [coiExpirationDate, setCoiExpirationDate] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("Standard Vendor Reminder");
  const [emailSubject, setEmailSubject] = useState("COI Expiration Notice - {vendor_name}");
  const [emailBody, setEmailBody] = useState(`Dear {vendor_name},

This is a reminder that your Certificate of Insurance will expire on {expiration_date}.

Please renew your COI and send us the updated documentation at your earliest convenience to avoid any disruption in our business relationship.

If you have already renewed, please disregard this message.

Best regards,
ABC Construction Inc.
(555) 123-4567`);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [newCcRecipient, setNewCcRecipient] = useState("");

  // Populate form when vendorData changes or modal opens
  useEffect(() => {
    if (isOpen && vendorData) {
      setVendorName(vendorData.vendorName || "");
      setVendorEmail(vendorData.email || "");
      setCoiExpirationDate(vendorData.expires || "");
      setEmailTemplate(vendorData.emailTemplate || "Standard Vendor Reminder");
      setEmailSubject(vendorData.emailSubject || "COI Expiration Notice - {vendor_name}");
      setEmailBody(vendorData.emailBody || `Dear {vendor_name},

This is a reminder that your Certificate of Insurance will expire on {expiration_date}.

Please renew your COI and send us the updated documentation at your earliest convenience to avoid any disruption in our business relationship.

If you have already renewed, please disregard this message.

Best regards,
ABC Construction Inc.
(555) 123-4567`);
      setCcRecipients(vendorData.ccRecipients || []);
      setCoiFile(null); // Reset new file upload
    }
  }, [isOpen, vendorData]);

  // Close modal and reset form on successful update
  useEffect(() => {
    if (updateCOIVendorSuccess) {
      onSubmit?.({ success: true });
      dispatch(updateCOIVendorFailure(""));
      // Small delay to allow success message to be seen
      setTimeout(() => {
        onClose();
      }, 100);
    }
  }, [updateCOIVendorSuccess, onClose, onSubmit, dispatch]);

  // Reset error when modal closes
  useEffect(() => {
    if (!isOpen && updateCOIVendorError) {
      dispatch(updateCOIVendorFailure(""));
    }
  }, [isOpen, updateCOIVendorError, dispatch]);

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
    if (!vendorName.trim() || !vendorEmail.trim() || !vendorData) {
      return;
    }

    // Create FormData for API
    const formData = new FormData();
    formData.append("vendorName", vendorName.trim());
    formData.append("vendorEmail", vendorEmail.trim());
    
    // Only append file if a new one is uploaded
    if (coiFile) {
      formData.append("coiDocument", coiFile);
    }
    
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
    formData.append("emailSubject", emailSubject.trim());
    formData.append("emailBody", emailBody.trim());
    
    // Append CC recipients as JSON string array
    if (ccRecipients.length > 0) {
      formData.append("ccRecipients", JSON.stringify(ccRecipients));
    }

    dispatch(companyActions.updateCOIVendorRequest(vendorData.id, formData));
  };

  const handleClose = () => {
    if (!isUpdatingCOIVendor) {
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

  const hasExistingFile = vendorData?.currentCOI && !coiFile;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div
        className="flex flex-col"
        style={{ padding: "24px 32px 32px", gap: "32px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Edit Vendor: {vendorData?.vendorName || ""}
          </h2>
          <button
            onClick={handleClose}
            disabled={isUpdatingCOIVendor}
            className="w-11 h-11 flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
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

            {/* Current COI Document */}
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <label className="text-supporting text-primary font-sf-pro">
                Current COI Document
              </label>

              {/* Existing File Card */}
              {hasExistingFile && (
                <div className="flex items-center gap-5 p-4 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg">
                  <FileText className="w-9 h-9 text-primary flex-shrink-0" />
                  <div className="flex-1 flex flex-col">
                    <span className="text-button text-[#03111F] font-poppins font-semibold">
                      {vendorData.currentCOI}
                    </span>
                    <span className="text-supporting text-[#6F7A85] font-sf-pro">
                      {vendorData.uploadedDate 
                        ? `Uploaded: ${vendorData.uploadedDate}`
                        : "Uploaded: Nov 15, 2024"}
                    </span>
                  </div>
                  <button
                    className="px-4 h-[35px] flex items-center justify-center bg-[#8A949E] text-[#F3F5F7] rounded-lg hover:bg-[#7a858f] transition-colors font-poppins font-semibold text-button"
                    onClick={() => {
                      // Handle view document
                    }}
                  >
                    View Document
                  </button>
                </div>
              )}

              {/* Replace Document Upload */}
              {!coiFile && (
                <FileUpload
                  label=""
                  heading="Replace With New COI Document"
                  bodyText="Upload a renewed COI to update expiration date"
                  accept=".pdf,.jpg,.jpeg,.png,image/*"
                  onFileSelect={(file) => setCoiFile(file)}
                />
              )}

              {/* New File Info Card (shown when new file is uploaded) */}
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
            </div>

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
                />
              </div>
            </div>
          </div>

          {/* Email Template & Body Section */}
          <div
            className="flex flex-col border border-[#DEE0E3] rounded-xl"
            style={{ padding: "20px 16px", gap: "16px" }}
          >
            <h3 className="text-button text-primary font-poppins font-semibold">
              Email Template & Body
            </h3>

            {/* Select Template */}
            <Select
              label="Select Template"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              options={emailTemplates}
              labelStyle="supporting"
            />

            {/* Email Subject */}
            <Input
              label="Email Subject"
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              labelStyle="supporting"
              inputStyle="body-copy"
              name="emailSubject"
              placeholder="COI Expiration Notice - {vendor_name}"
            />

            {/* Email Body */}
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <label className="text-supporting text-primary font-sf-pro">
                Email Body (Customize for this vendor)
              </label>
              <Input
                label=""
                multiline={true}
                rows={10}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                labelStyle="supporting"
                inputStyle="body-copy"
                name="emailBody"
                placeholder="Email body text..."
                showLabel={false}
              />
            </div>

            {/* Available Variables Alert */}
            <div
              className="self-stretch pl-4 pr-3 py-3 bg-[#EBF3FF] rounded-lg border border-[#3B82F6] inline-flex flex-col justify-start items-start"
              style={{ gap: "8px" }}
            >
              <div className="self-stretch inline-flex justify-start items-start" style={{ gap: "8px" }}>
                <Info className="w-4 h-4 text-[#3B82F6] mt-1 flex-shrink-0" />
                <span className="text-supporting text-primary font-sf-pro font-semibold">
                  Available Variables
                </span>
              </div>
              <span className="text-supporting text-primary font-sf-pro pl-6">
                {"{vendor_name}, {expiration_date}, {days_until_expiration}, {company_name}, {company_contact}"}
              </span>
            </div>
          </div>

          {/* Email Recipients Section */}
          <div
            className="flex flex-col border border-[#DEE0E3] rounded-xl"
            style={{ padding: "16px", gap: "16px" }}
          >
            <h3 className="text-button text-primary font-poppins font-semibold">
              Email Recipients
            </h3>

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

        {/* Buttons */}
        <div className="flex items-stretch gap-8">
          <button
            onClick={onClose}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors"
            style={{ padding: "20px 12px" }}
          >
            <span className="text-button font-poppins font-semibold">
              Cancel
            </span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!vendorName.trim() || !vendorEmail.trim() || !vendorData}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: "20px 12px" }}
          >
            <span className="text-button font-poppins font-semibold">
              Save Changes
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCOIVendorModal;


