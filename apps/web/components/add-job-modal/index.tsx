"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Select from "@/components/select";
import Checkbox from "@/components/checkbox";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import companyActions from "@/Redux/actions/company";
import { createJobFailure } from "@/Redux/reducers/company";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const { isCreatingJob, createJobSuccess, createJobError } = useAppSelector((state) => state.company);

  const [activeTab, setActiveTab] = useState<"job-details" | "email-config">(
    "job-details"
  );

  // Job Details Form State
  const [jobName, setJobName] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  // const [jobStatus, setJobStatus] = useState("Active");
  const [jobAddress, setJobAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Email Configuration Form State
  const [includeInvoiceSubmitter, setIncludeInvoiceSubmitter] = useState(true);
  const [invoiceRecipients, setInvoiceRecipients] = useState<string[]>([]);
  const [invoiceCC, setInvoiceCC] = useState<string[]>([]);
  const [newInvoiceRecipient, setNewInvoiceRecipient] = useState("");
  const [newInvoiceCC, setNewInvoiceCC] = useState("");

  const [includeDailyLogSubmitter, setIncludeDailyLogSubmitter] = useState(true);
  const [dailyLogRecipients, setDailyLogRecipients] = useState<string[]>([]);
  const [dailyLogCC, setDailyLogCC] = useState<string[]>([]);
  const [newDailyLogRecipient, setNewDailyLogRecipient] = useState("");
  const [newDailyLogCC, setNewDailyLogCC] = useState("");

  // Close modal and reset form on successful creation
  useEffect(() => {
    if (createJobSuccess) {
      resetForm();
      onSubmit?.({ success: true });
      dispatch(createJobFailure(false))
      // Small delay to allow success message to be seen
      setTimeout(() => {
        onClose();
      }, 100);
    }
  }, [createJobSuccess, onClose, onSubmit]);

  // Reset error when modal closes
  useEffect(() => {
    if (!isOpen && createJobError) {
      dispatch(companyActions.createJobFailure(""));
    }
  }, [isOpen, createJobError, dispatch]);

  const handleSubmit = () => {
    // Validate required fields
    if (!jobName.trim()) {
      return;
    }

    // If on Job Details tab, validate and switch to Email Configuration
    if (activeTab === "job-details") {
      // Job details are complete, switch to Email Configuration tab
      setActiveTab("email-config");
      return;
    }

    // If on Email Configuration tab, submit both Job Details and Email Configuration
    if (activeTab === "email-config") {
      // Map form data to API payload format (both Job Details and Email Configuration)
      const payload = {
        jobName: jobName.trim(),
        jobNumber: jobNumber.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        jobAddress: jobAddress.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        invoiceRecipients: invoiceRecipients.length > 0 ? invoiceRecipients : undefined,
        invoiceCcRecipients: invoiceCC.length > 0 ? invoiceCC : undefined,
        includeInvoiceSubmitter: includeInvoiceSubmitter,
        dailyLogRecipients: dailyLogRecipients.length > 0 ? dailyLogRecipients : undefined,
        dailyLogCcRecipients: dailyLogCC.length > 0 ? dailyLogCC : undefined,
        includeDailyLogSubmitter: includeDailyLogSubmitter,
      };

      // Remove undefined fields
      Object.keys(payload).forEach((key) => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      dispatch(companyActions.createJobRequest(payload));
    }
  };

  const resetForm = () => {
    setJobName("");
    setJobNumber("");
    // setJobStatus("Active");
    setJobAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setIncludeInvoiceSubmitter(true);
    setInvoiceRecipients([]);
    setInvoiceCC([]);
    setNewInvoiceRecipient("");
    setNewInvoiceCC("");
    setIncludeDailyLogSubmitter(true);
    setDailyLogRecipients([]);
    setDailyLogCC([]);
    setNewDailyLogRecipient("");
    setNewDailyLogCC("");
    setActiveTab("job-details");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddInvoiceRecipient = () => {
    if (newInvoiceRecipient.trim()) {
      setInvoiceRecipients([...invoiceRecipients, newInvoiceRecipient.trim()]);
      setNewInvoiceRecipient("");
    }
  };

  const handleAddInvoiceCC = () => {
    if (newInvoiceCC.trim()) {
      setInvoiceCC([...invoiceCC, newInvoiceCC.trim()]);
      setNewInvoiceCC("");
    }
  };

  const handleAddDailyLogRecipient = () => {
    if (newDailyLogRecipient.trim()) {
      setDailyLogRecipients([
        ...dailyLogRecipients,
        newDailyLogRecipient.trim(),
      ]);
      setNewDailyLogRecipient("");
    }
  };

  const handleAddDailyLogCC = () => {
    if (newDailyLogCC.trim()) {
      setDailyLogCC([...dailyLogCC, newDailyLogCC.trim()]);
      setNewDailyLogCC("");
    }
  };

  const handleRemoveInvoiceRecipient = (index: number) => {
    setInvoiceRecipients(invoiceRecipients.filter((_, i) => i !== index));
  };

  const handleRemoveInvoiceCC = (index: number) => {
    setInvoiceCC(invoiceCC.filter((_, i) => i !== index));
  };

  const handleRemoveDailyLogRecipient = (index: number) => {
    setDailyLogRecipients(dailyLogRecipients.filter((_, i) => i !== index));
  };

  const handleRemoveDailyLogCC = (index: number) => {
    setDailyLogCC(dailyLogCC.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="672px">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-8">
          <h2 className="text-h3 text-primary font-poppins font-semibold flex-1">
            Add New Job
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreatingJob}
            className="w-11 h-11 flex cursor-pointer items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-3 bg-[#F9FFFE] border border-[#BFEDE7] rounded-xl">
          <button
            onClick={() => setActiveTab("job-details")}
            className={`px-2 py-2 font-sf-pro text-supporting transition-colors ${
              activeTab === "job-details"
                ? " border-b-2 border-[#1F6F66] text-primary font-medium"
                : "text-[#2E3338]"
            }`}
          >
            Job Details
          </button>
          <button
            onClick={() => setActiveTab("email-config")}
            className={`px-2 py-2  font-sf-pro text-supporting transition-colors ${
              activeTab === "email-config"
                ? " border-b-2 border-[#1F6F66] text-primary font-medium"
                : "text-[#2E3338]"
            }`}
          >
            Email Configuration
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "job-details" ? (
          <div className="flex flex-col gap-4">
            {/* Job Name and Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Job Name"
                placeholder="e.g., ABC Plumbing CO."
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                labelStyle="supporting"
                inputStyle="body-copy"
                required
              />
              <Input
                label="Job Number (Optional)"
                placeholder="Auto-generated if bank"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
                labelStyle="supporting"
                inputStyle="body-copy"
              />
            </div>

            {/* Job Status */}
            {/* <Select
              label="Job Status"
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value)}
              options={[
                { value: "Active", label: "Active" },
                // { value: "Inactive", label: "Inactive" },
              ]}
              labelStyle="supporting"
            /> */}

            {/* Job Address */}
            <Input
              label="Job Address (Optional)"
              placeholder="Auto-generated if bank"
              value={jobAddress}
              onChange={(e) => setJobAddress(e.target.value)}
              labelStyle="supporting"
              inputStyle="body-copy"
            />

            {/* City, State, Zip Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                labelStyle="supporting"
                inputStyle="body-copy"
              />
              <Input
                label="State"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                labelStyle="supporting"
                inputStyle="body-copy"
              />
              <Input
                label="Zip Code"
                placeholder="Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                labelStyle="supporting"
                inputStyle="body-copy"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-h-[520px] overflow-y-auto">
            {/* Info Alert */}
            <div className="flex flex-col gap-2 p-3 pl-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 12C7.45 12 7 11.55 7 11C7 10.45 7.45 10 8 10C8.55 10 9 10.45 9 11C9 11.55 8.55 12 8 12ZM9 9H7V4H9V9Z"
                    fill="#3B82F6"
                  />
                </svg>
                <h3 className="text-supporting text-primary font-sf-pro font-medium">
                  Automatic Email Notifications
                </h3>
              </div>
              <p className="text-supporting text-primary font-sf-pro pl-6">
                Approved invoices & Daily Logs will be automatically sent to
                the recipients configured below. For documents requiring
                multiple approvals (e.g., PM approval followed by Owner
                approval), the email will only be sent after the final approval
                is completed.
              </p>
            </div>

            {/* Invoices Section */}
            <div className="flex flex-col gap-5 p-5 border border-[#DEE0E3] rounded-xl">
              <h3 className="text-h6 text-[#2E3338] font-poppins font-semibold">
                Invoices (After Approval)
              </h3>

              {/* Send To Recipients */}
              <div className="flex flex-col gap-4">
                <p className="text-button text-[#2E3338] font-poppins font-semibold">
                  Send To Recipients
                </p>
                <Checkbox
                  checked={includeInvoiceSubmitter}
                  onChange={setIncludeInvoiceSubmitter}
                  label="Include document submitter (who emailed Invoice)"
                />
              </div>

              {/* Additional Recipients */}
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Input
                      label="Additional Recipients"
                      placeholder="Recipients@company.com"
                      value={newInvoiceRecipient}
                      type="email"
                      onChange={(e) => setNewInvoiceRecipient(e.target.value)}
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInvoiceRecipient();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAddInvoiceRecipient}
                    className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-gray-50 transition-colors font-poppins font-semibold text-button whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Recipient</span>
                  </button>
                </div>
                {/* Additional Recipients Chips */}
                {invoiceRecipients.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {invoiceRecipients.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-5 p-2 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg"
                      >
                        <span className="text-body-copy text-[#2E3338] font-sf-pro">
                          {email}
                        </span>
                        <button
                          onClick={() => handleRemoveInvoiceRecipient(index)}
                          className="h-11 w-11 cursor-pointer flex items-center justify-center bg-[#FFEDED] text-[#EF4444] rounded-lg hover:bg-[#FFE0E0] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CC Recipients */}
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Input
                      label="CC Recipients"
                      placeholder="CC@company.com"
                      value={newInvoiceCC}
                      type="email"
                      onChange={(e) => setNewInvoiceCC(e.target.value)}
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInvoiceCC();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAddInvoiceCC}
                    className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-gray-50 transition-colors font-poppins font-semibold text-button whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add CC</span>
                  </button>
                </div>
                {/* CC Recipients Chips */}
                {invoiceCC.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {invoiceCC.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-5 p-2 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg"
                      >
                        <span className="text-body-copy text-[#2E3338] font-sf-pro">
                          {email}
                        </span>
                        <button
                          onClick={() => handleRemoveInvoiceCC(index)}
                          className="h-11 w-11 cursor-pointer flex items-center justify-center bg-[#FFEDED] text-[#EF4444] rounded-lg hover:bg-[#FFE0E0] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Daily Logs Section */}
            <div className="flex flex-col gap-5 p-5 border border-[#DEE0E3] rounded-xl">
              <h3 className="text-h6 text-[#2E3338] font-poppins font-semibold">
                Daily Logs (After Approval)
              </h3>

              {/* Send To Recipients */}
              <div className="flex flex-col gap-4">
                <p className="text-button text-[#2E3338] font-poppins font-semibold">
                  Send To Recipients
                </p>
                <Checkbox
                  checked={includeDailyLogSubmitter}
                  onChange={setIncludeDailyLogSubmitter}
                  label="Include document submitter (who emailed daily log)"
                />
              </div>

              {/* Additional Recipients */}
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Input
                      label="Additional Recipients"
                      placeholder="Recipients@company.com"
                      value={newDailyLogRecipient}
                      type="email"
                      onChange={(e) =>
                        setNewDailyLogRecipient(e.target.value)
                      }
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDailyLogRecipient();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAddDailyLogRecipient}
                    className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-gray-50 transition-colors font-poppins font-semibold text-button whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Recipient</span>
                  </button>
                </div>
                {/* Additional Recipients Chips */}
                {dailyLogRecipients.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {dailyLogRecipients.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-5 p-2 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg"
                      >
                        <span className="text-body-copy text-[#2E3338] font-sf-pro">
                          {email}
                        </span>
                        <button
                          onClick={() => handleRemoveDailyLogRecipient(index)}
                          className="h-11 w-11 cursor-pointer flex items-center justify-center bg-[#FFEDED] text-[#EF4444] rounded-lg hover:bg-[#FFE0E0] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CC Recipients */}
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Input
                      label="CC Recipients"
                      placeholder="CC@company.com"
                      value={newDailyLogCC}
                      type="email"
                      onChange={(e) => setNewDailyLogCC(e.target.value)}
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDailyLogCC();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAddDailyLogCC}
                    className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-gray-50 transition-colors font-poppins font-semibold text-button whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add CC</span>
                  </button>
                </div>
                {/* CC Recipients Chips */}
                {dailyLogCC.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {dailyLogCC.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-5 p-2 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg"
                      >
                        <span className="text-body-copy text-[#2E3338] font-sf-pro">
                          {email}
                        </span>
                        <button
                          onClick={() => handleRemoveDailyLogCC(index)}
                          className="h-11 w-11 cursor-pointer flex items-center justify-center bg-[#FFEDED] text-[#EF4444] rounded-lg hover:bg-[#FFE0E0] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {createJobError && (
          <div className="p-3 bg-[#FFEDED] border border-[#EF4444] rounded-lg">
            <p className="text-sm text-[#EF4444] font-sf-pro">{createJobError}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-stretch gap-8">
          <button
            onClick={activeTab === "email-config" ? () => setActiveTab("job-details") : handleClose}
            disabled={isCreatingJob}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors font-poppins font-semibold text-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activeTab === "email-config" ? "Back" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreatingJob || !jobName.trim() || !city.trim() || !state.trim() || !zipCode.trim()}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors font-poppins font-semibold text-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingJob ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : activeTab === "job-details" ? (
              "Continue to Email Configuration"
            ) : (
              "Create Job"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddJobModal;


