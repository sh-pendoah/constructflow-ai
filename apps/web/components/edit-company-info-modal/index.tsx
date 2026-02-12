"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Select from "@/components/select";
import FileUpload from "@/components/file-upload";
import { Cities, States } from "@/utils/enums/locations";

interface EditCompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
  initialData?: {
    companyName?: string;
    industry?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    timezone?: string;
    // phone?: string;
    // email?: string;
    logo?: string | null;
  };
}

const EditCompanyInfoModal: React.FC<EditCompanyInfoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  initialData = {},
}) => {
  const [companyName, setCompanyName] = useState(initialData.companyName || "");
  const [industry, setIndustry] = useState(initialData.industry || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [city, setCity] = useState(initialData.city || "");
  const [state, setState] = useState(initialData.state || "");
  const [zipCode, setZipCode] = useState(initialData.zipCode || "");
  const [timezone, setTimezone] = useState(initialData.timezone || "");
  const [companyLogo, setCompanyLogo] = useState<string | null>(initialData.logo || null);
  const hasInitialized = useRef(false);
  const previousIsOpen = useRef(false);

  // Sample options - replace with actual data
  const industryOptions = [
    { value: "tech", label: "Technology" },
    { value: "retail", label: "Retail" },
    { value: "healthcare", label: "Healthcare" },
  ];

  // Convert Cities enum to options array
  const cityOptions = Object.values(Cities).map((city) => ({
    value: city,
    label: city,
  }));

  // Convert States enum to options array
  const stateOptions = Object.values(States).map((state) => ({
    value: state.toLowerCase(),
    label: state,
  }));

  const timezoneOptions = [
    { value: "pst", label: "Pacific Standard Time (PST)" },
    { value: "est", label: "Eastern Standard Time (EST)" },
    { value: "cst", label: "Central Standard Time (CST)" },
  ];

  // Only initialize/reset fields when modal first opens, not when initialData changes
  useEffect(() => {
    if (isOpen && !previousIsOpen.current) {
      // Modal just opened - initialize with initialData
      setCompanyName(initialData.companyName || "");
      setIndustry(initialData.industry || "");
      setAddress(initialData.address || "");
      setCity(initialData.city || "");
      setState(initialData.state || "");
      setZipCode(initialData.zipCode || "");
      setTimezone(initialData.timezone || "");
      setCompanyLogo(initialData.logo || null);
      hasInitialized.current = true;
    }
    previousIsOpen.current = isOpen;
    
    // Reset initialization flag when modal closes
    if (!isOpen && hasInitialized.current) {
      hasInitialized.current = false;
    }
  }, [isOpen]); // Only depend on isOpen, not initialData

  const handleSave = () => {
    if (isLoading) return; // Prevent saving while API is in progress
    onSave({
      companyName,
      industry,
      address,
      city,
      state,
      zipCode,
      timezone,
      logo: companyLogo,
    });
    // Don't close modal here - let parent component handle it after API success
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Edit : Company Information
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-11 h-11 flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex flex-col gap-8">
          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            {/* Company Name and Industry Row */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1">
                <Input
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  labelStyle="supporting"
                  inputStyle="body-copy"
                  name="companyName"
                  required
                />
              </div>
              <div className="flex-1">
                <Select
                  label="Industry / Trade"
                  placeholder="Industry / Trade"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  name="industry"
                  labelStyle="supporting"
                  options={industryOptions}
                  required
                />
              </div>
            </div>

            {/* Company Address */}
            <div>
              <Input
                label="Company Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Company Address"
                labelStyle="supporting"
                inputStyle="body-copy"
                name="address"
                multiline
                rows={3}
              />
            </div>

            {/* City and State Row */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1">
                <Select
                  label="City"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  name="city"
                  labelStyle="supporting"
                  options={cityOptions}
                  required
                />
              </div>
              <div className="flex-1">
                <Select
                  label="State"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  name="state"
                  labelStyle="supporting"
                  options={stateOptions}
                  required
                />
              </div>
            </div>

            {/* ZIP Code and Timezone Row */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1">
                <Input
                  label="ZIP Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP Code"
                  labelStyle="supporting"
                  inputStyle="body-copy"
                  name="zipCode"
                  required
                />
              </div>
              <div className="flex-1">
                <Select
                  label="Timezone"
                  placeholder="Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  name="timezone"
                  labelStyle="supporting"
                  options={timezoneOptions}
                  required
                />
              </div>
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="flex flex-col gap-4">
            <label className="text-button text-primary font-poppins font-semibold">
              Company Logo (Optional)
            </label>
            <FileUpload
              onFileSelect={(file) => {
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setCompanyLogo(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              heading="Upload OR Drag & Drop"
              bodyText="Recommended: 200x200px PNG"
              accept="image/*"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-8">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-[51px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] rounded-lg bg-white text-[#2E3338] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!companyName.trim() || !industry.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !timezone.trim() || isLoading}
            className="flex-1 h-[51px] cursor-pointer flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Information"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCompanyInfoModal;

