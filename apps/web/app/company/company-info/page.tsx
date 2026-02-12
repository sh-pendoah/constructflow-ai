"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, PenLine, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import EditCompanyInfoModal from "@/components/edit-company-info-modal";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { authActions } from "@/Redux/actions/auth";
import { updateCompanyInfoFailure } from "@/Redux/reducers/auth";

const CompanyInfoPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { companyInfo, isLoading, updateCompanyInfoSuccess } = useAppSelector((state) => state.auth);
  const hasFetchedCompanyInfo = useRef(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  // const [phone, setPhone] = useState("");
  // const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [timezone, setTimezone] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Fetch company info on component mount
  useEffect(() => {
    if (!hasFetchedCompanyInfo.current) {
      dispatch(authActions.getCompanyInfoRequest());
      hasFetchedCompanyInfo.current = true;
    }
  }, [dispatch]);

  // Update states when companyInfo is available
  useEffect(() => {
    if (companyInfo) {
      setCompanyName(companyInfo.companyName || "");
      setIndustry(companyInfo.industry || "");
      setAddress(companyInfo.companyAddress || "");
      setCity(companyInfo.city || "");
      setState(companyInfo.state || "");
      setZipCode(companyInfo.zipCode || "");
      setTimezone(companyInfo.timezone || "");
      setCompanyLogo(companyInfo.companyLogo || null);
      // Note: email and phone are not in the API response, keeping them empty
    }
  }, [companyInfo]);

  const handleBack = () => {
    router.back();
  };

  const handleEditInformation = () => {
    setIsEditModalOpen(true);
  };

  // Helper function to convert data URL to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSaveChanges = async (data: any) => {
    try {
      const formData = new FormData();
      
      // Add all text fields (including address which maps to companyAddress)
      if (data.companyName) formData.append('companyName', data.companyName);
      if (data.industry) formData.append('industry', data.industry);
      if (data.address) formData.append('companyAddress', data.address); // API expects companyAddress
      if (data.city) formData.append('city', data.city);
      if (data.state) formData.append('state', data.state);
      if (data.zipCode) formData.append('zipCode', data.zipCode);
      if (data.timezone) formData.append('timezone', data.timezone);
      
      // Handle company logo file upload
      // The modal converts File to data URL, so we need to convert it back
      if (data.logo) {
        // Check if it's a data URL (base64) - this is what the modal sends
        if (typeof data.logo === 'string' && data.logo.startsWith('data:')) {
          // Convert data URL to File
          const file = dataURLtoFile(data.logo, 'company-logo.jpg');
          formData.append('companyLogo', file);
        } else if (data.logo instanceof File) {
          // It's already a File object (shouldn't happen with current modal, but handle it)
          formData.append('companyLogo', data.logo);
        }
        // If it's a URL string (existing logo from API), skip it - only send new uploads
      }
      
      // Dispatch the update action
      dispatch(authActions.updateCompanyInfoRequest(formData));
    } catch (error) {
      console.error('Error preparing form data:', error);
    }
  };

  // Refresh company info after successful update
  useEffect(() => {
    if (updateCompanyInfoSuccess) {
      // Refetch company info to get updated data
      dispatch(authActions.getCompanyInfoRequest());
      setIsEditModalOpen(false);
      dispatch(updateCompanyInfoFailure(false));
    }
  }, [updateCompanyInfoSuccess, dispatch]);

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-0">
      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-h4 text-primary font-poppins font-semibold">
            Company Information Details
          </h2>
          <button
            onClick={handleEditInformation}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-black cursor-pointer text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-button font-poppins font-semibold">Updating...</span>
              </>
            ) : (
              <>
                <PenLine className="w-5 h-5" />
                <span className="text-button font-poppins font-semibold">Edit Information</span>
              </>
            )}
          </button>
        </div>

        {/* Form Card - View Mode Only */}
        <div className="bg-white rounded-xl border border-[#DEE0E3] shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)]">
          <div className="flex flex-col gap-4 p-6">
            {/* Company Name and Industry Row */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-1 p-4 bg-[#F4F5F6] rounded-lg">
                <label className="text-button text-primary font-poppins font-semibold">
                  Company Name
                </label>
                <p className="text-body-copy text-primary font-sf-pro">{companyName || "—"}</p>
              </div>
              <div className="flex-1 flex flex-col gap-1 p-4 bg-[#F4F5F6] rounded-lg">
                <label className="text-button text-primary font-poppins font-semibold">
                  Industry / Trade
                </label>
                <p className="text-body-copy text-primary font-sf-pro">{industry || "—"}</p>
              </div>
            </div>

            {/* Company Address */}
            <div className="flex flex-col gap-1 p-4 bg-[#F4F5F6] rounded-lg">
              <label className="text-button text-primary font-poppins font-semibold">
                Company Address
              </label>
              <p className="text-body-copy text-primary font-sf-pro">{address || "—"}</p>
            </div>

            {/* Phone and Email Row */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-1 p-4 bg-[#F4F5F6] rounded-lg">
                <label className="text-button text-primary font-poppins font-semibold">
                  City
                </label>
                <p className="text-body-copy text-primary font-sf-pro">{city || "—"}</p>
              </div>
              <div className="flex-1 flex flex-col gap-1 p-4 bg-[#F4F5F6] rounded-lg">
                <label className="text-button text-primary font-poppins font-semibold">
                  State
                </label>
                <p className="text-body-copy text-primary font-sf-pro">{state || "—"}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-1 p-4 bg-[#F4F5F6] rounded-lg">
                <label className="text-button text-primary font-poppins font-semibold">
                  Zip Code
                </label>
                <p className="text-body-copy text-primary font-sf-pro">{zipCode || "—"}</p>
              </div>
              <div className="flex-1 flex flex-col gap-1 p-4 bg-[#F4F5F6] rounded-lg">
                <label className="text-button text-primary font-poppins font-semibold">
                  Timezone
                </label>
                <p className="text-body-copy text-primary font-sf-pro">{timezone || "—"}</p>
              </div>
            </div>

            {/* Company Logo */}
            <div className="flex flex-col gap-1">
              <label className="text-button text-primary font-poppins font-semibold">
                Company Logo (Optional)
              </label>
              <div className="flex items-center gap-3 p-4 bg-[#F4F5F6] rounded-lg">
                {companyLogo ? (
                  <div className="relative min-w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={companyLogo}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-[#DEE0E3] flex items-center justify-center bg-white">
                    <span className="text-xs text-[#6F7A85]">No Logo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCompanyInfoModal
        isOpen={isEditModalOpen}
        onClose={() => {
          if (!isLoading) {
            setIsEditModalOpen(false);
          }
        }}
        onSave={handleSaveChanges}
        isLoading={isLoading}
        initialData={{
          companyName,
          industry,
          address,
          city,
          state,
          zipCode,
          timezone,
          // phone,
          // email,
          logo: companyLogo,
        }}
      />
    </div>
  );
};

export default CompanyInfoPage;

