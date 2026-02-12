"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Search, Settings, FileText, ChevronDown, X, Info, ArrowLeft } from "lucide-react";
import DataTable, { Column } from "@/components/data-table";
import Pagination from "@/components/pagination";
import AddCOIVendorModal from "@/components/add-coi-vendor-modal";
import EditCOIVendorModal from "@/components/edit-coi-vendor-modal";
import Select from "@/components/select";
import Checkbox from "@/components/checkbox";
import Input from "@/components/input";
import Alert from "@/components/alert";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import companyActions from "@/Redux/actions/company";

const scheduleOptions = [
  { value: "7 Days", label: "7 Days" },
  { value: "15 Days", label: "15 Days" },
  { value: "30 Days", label: "30 Days" },
  { value: "60 Days", label: "60 Days" },
  { value: "90 Days", label: "90 Days" },
];


interface Vendor {
  id: string;
  vendorName: string;
  email: string;
  currentCOI: string;
  expires: string;
  expiresOriginal?: string; // Original ISO date for edit modal
  status: "Active" | "Expiring Soon" | "Expired";
  coiDocumentUrl?: string;
  emailTemplate?: string;
  emailSubject?: string;
  emailBody?: string;
  ccRecipients?: string[];
}

const COIAlertsPage = () => {
  const dispatch = useAppDispatch();
  const { coiVendors: coiVendorsData, isLoadingCOIVendors, getCOIVendorsError } = useAppSelector((state) => state.company);
  const hasFetchedCOIVendors = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [isEditVendorModalOpen, setIsEditVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const itemsPerPage = 15;
  const [showCOIAlerts, setShowCOIAlerts] = useState(false);
  const [externalAlertMode, setExternalAlertMode] = useState("manual");
  const [internalAlertMode, setInternalAlertMode] = useState("manual");
  const [externalScheduleIntervals, setExternalScheduleIntervals] = useState<string[]>(["30 Days", "15 Days"]);
  const [internalScheduleIntervals, setInternalScheduleIntervals] = useState<string[]>(["30 Days", "15 Days"]);
  const [externalSendFinalAlert, setExternalSendFinalAlert] = useState(true);
  const [internalSendFinalAlert, setInternalSendFinalAlert] = useState(true);
  const [internalCcRecipients, setInternalCcRecipients] = useState<string[]>(["pm@company.com", "pm@company.com"]);
  const [newInternalCcRecipient, setNewInternalCcRecipient] = useState("");

  // Fetch COI vendors on component mount (only when not showing COI alerts view)
  useEffect(() => {
    if (!showCOIAlerts && !hasFetchedCOIVendors.current) {
      dispatch(companyActions.getCOIVendorsRequest());
      hasFetchedCOIVendors.current = true;
    }
  }, [dispatch, showCOIAlerts]);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  // Helper function to convert formatted date to YYYY-MM-DD
  const convertToDateInputFormat = (dateString: string): string => {
    try {
      // If already in YYYY-MM-DD format, return as is
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      // Try to parse and convert from formatted date (e.g., "Jan 15, 2026")
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Helper function to determine status based on expiration date
  const getStatusFromExpirationDate = (expirationDate: string): "Active" | "Expiring Soon" | "Expired" => {
    try {
      const expDate = new Date(expirationDate);
      const today = new Date();
      const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiration < 0) {
        return "Expired";
      } else if (daysUntilExpiration <= 30) {
        return "Expiring Soon";
      } else {
        return "Active";
      }
    } catch {
      return "Active";
    }
  };

  // Helper function to extract filename from URL
  const getFilenameFromUrl = (url: string): string => {
    try {
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      return filename || "COI_Document.pdf";
    } catch {
      return "COI_Document.pdf";
    }
  };

  // Store original vendor data for edit modal
  const [originalVendorData, setOriginalVendorData] = useState<Record<string, any>>({});

  // Transform API data to Vendor format
  const allVendors: Vendor[] = useMemo(() => {
    if (!coiVendorsData || !Array.isArray(coiVendorsData)) {
      return [];
    }

    const vendorsMap: Record<string, any> = {};
    const transformed = coiVendorsData.map((vendor: any) => {
      // Determine status: use API status if it's "expired", otherwise calculate from expiration date
      let status: "Active" | "Expiring Soon" | "Expired";
      if (vendor.status && vendor.status.toLowerCase() === "expired") {
        status = "Expired";
      } else {
        status = getStatusFromExpirationDate(vendor.coiExpirationDate);
      }

      const vendorId = vendor._id || "";
      vendorsMap[vendorId] = vendor; // Store original data

      // Extract email-related data from alerts if available
      const emailTemplate = vendor.emailTemplate || "Standard Vendor Reminder";
      const emailSubject = vendor.emailSubject || `COI Expiration Notice - ${vendor.vendorName || ""}`;
      const emailBody = vendor.emailBody || `Dear ${vendor.vendorName || ""},\n\nThis is a reminder that your Certificate of Insurance (COI) is expiring soon. Please renew your COI to maintain compliance.\n\nThank you.`;
      const ccRecipients = vendor.ccRecipients || [];

      return {
        id: vendorId,
        vendorName: vendor.vendorName || "",
        email: vendor.vendorEmail || "",
        currentCOI: vendor.coiDocument ? getFilenameFromUrl(vendor.coiDocument) : "",
        expires: vendor.coiExpirationDate ? formatDate(vendor.coiExpirationDate) : "",
        expiresOriginal: vendor.coiExpirationDate || "", // Store original ISO date for edit modal
        status: status,
        coiDocumentUrl: vendor.coiDocument || "", // Store URL for download
        emailTemplate,
        emailSubject,
        emailBody,
        ccRecipients,
      };
    });
    
    setOriginalVendorData(vendorsMap);
    return transformed;
  }, [coiVendorsData]);

  const handleBack = () => {
    setShowCOIAlerts(false);
    localStorage.removeItem("configure_coi_alerts");
    // Dispatch custom event to notify layout of localStorage change
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("localStorageChange"));
    }
  };

  
  const handleSaveChanges = () => {
    // Add your save logic here
  };

  const handleAddExternalSchedule = () => {
    setExternalScheduleIntervals([...externalScheduleIntervals, "30 Days"]);
  };

  const handleRemoveExternalSchedule = (index: number) => {
    setExternalScheduleIntervals(externalScheduleIntervals.filter((_, i) => i !== index));
  };

  const handleExternalScheduleChange = (index: number, value: string) => {
    const newIntervals = [...externalScheduleIntervals];
    newIntervals[index] = value;
    setExternalScheduleIntervals(newIntervals);
  };

  const handleAddInternalSchedule = () => {
    setInternalScheduleIntervals([...internalScheduleIntervals, "30 Days"]);
  };

  const handleRemoveInternalSchedule = (index: number) => {
    setInternalScheduleIntervals(internalScheduleIntervals.filter((_, i) => i !== index));
  };

  const handleInternalScheduleChange = (index: number, value: string) => {
    const newIntervals = [...internalScheduleIntervals];
    newIntervals[index] = value;
    setInternalScheduleIntervals(newIntervals);
  };

  const handleAddInternalCcRecipient = () => {
    if (newInternalCcRecipient.trim() && !internalCcRecipients.includes(newInternalCcRecipient.trim())) {
      setInternalCcRecipients([...internalCcRecipients, newInternalCcRecipient.trim()]);
      setNewInternalCcRecipient("");
    }
  };

  const handleRemoveInternalCcRecipient = (email: string) => {
    setInternalCcRecipients(internalCcRecipients.filter((e) => e !== email));
  };



  // Filter vendors based on search and status filter
  const filteredVendors = allVendors.filter((vendor) => {
    const matchesSearch =
      vendor.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || vendor.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const totalVendors = allVendors.length;
  const activeCOIs = allVendors.filter((v) => v.status === "Active").length;
  const expiringSoon = allVendors.filter((v) => v.status === "Expiring Soon").length;
  const expired = allVendors.filter((v) => v.status === "Expired").length;

  // Calculate pagination
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleConfigureAlerts = () => {
    setShowCOIAlerts(true);
    localStorage.setItem("configure_coi_alerts", "true");
    // Dispatch custom event to notify layout of localStorage change
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("localStorageChange"));
    }
  };
  const handleAddVendor = () => {
    setIsAddVendorModalOpen(true);
  };

  const handleEdit = (vendorId: string) => {
    const vendor = allVendors.find((v) => v.id === vendorId);
    if (vendor) {
      setEditingVendor({ ...vendor }); // Create new object reference
      setIsEditVendorModalOpen(true);
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active":
        return "border-[#10B981] text-[#10B981] border";
      case "Expiring Soon":
        return "border-[#F59E0B] text-[#F59E0B] border";
      case "Expired":
        return "border-[#EF4444] text-[#EF4444] border";
      default:
        return "border-gray-500 text-gray-500 border";
    }
  };

  // Define table columns
  const columns: Column<Vendor>[] = [
    {
      key: "vendorName",
      label: "Vendor Name",
      // sortable: true,
    },
    {
      key: "email",
      label: "Email",
      // sortable: true,
    },
    {
      key: "currentCOI",
      label: "Current COI",
      // sortable: true,
      render: (value: string, row: Vendor) => (
        <div className="flex items-center gap-2 text-[#3B82F6]">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <a
            href={row.coiDocumentUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sf-pro hover:underline max-w-[100px] truncate"
            onClick={(e) => {
              if (!row.coiDocumentUrl) {
                e.preventDefault();
              }
            }}
          >
            {value}
          </a>
        </div>
      ),
    },
    {
      key: "expires",
      label: "Expires",
      // sortable: true,
    },
    {
      key: "status",
      label: "Status",
      // sortable: true,
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-sf-pro font-medium whitespace-nowrap ${getStatusBadgeClass(value)}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_value: string, row: Vendor) => (
        <button
          onClick={() => handleEdit(row.id)}
          className="text-supporting text-primary font-sf-pro hover:underline cursor-pointer"
        >
          Edit
        </button>
      ),
    },
  ];

  if (!showCOIAlerts) {
    return (
      <div className="w-full px-4 sm:px-0">
        {/* Header Container */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg sm:text-xl md:text-h4 text-primary font-poppins font-semibold">
              COI Vendor Management
            </h2>
            <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
              Manage vendor certificates of insurance and expiration alerts
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleConfigureAlerts}
              className="h-[44px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#0E1114] text-[#0E1114] rounded-lg hover:bg-black/80 hover:text-white transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Configure Alerts</span>
            </button>
            <button
              onClick={handleAddVendor}
              className="h-[44px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-[#0E1114] text-white rounded-lg hover:bg-black/80 transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>
  
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          <div className="flex flex-col items-center gap-0.5 p-4 bg-white border border-[#DEE0E3] rounded-lg shadow-md">
            <h3 className="text-h3 text-primary font-poppins font-semibold h-[39px] flex items-center justify-center">
              {totalVendors}
            </h3>
            <p className="text-sm sm:text-label text-primary font-sf-pro">
              Total Vendors
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-4 bg-white border border-[#DEE0E3] rounded-lg shadow-md">
            <h3 className="text-h3 text-[#10B981] font-poppins font-semibold h-[39px] flex items-center justify-center">
              {activeCOIs}
            </h3>
            <p className="text-sm sm:text-label text-primary font-sf-pro">
              Active COIs
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-4 bg-white border border-[#DEE0E3] rounded-lg shadow-md">
            <h3 className="text-h3 text-[#F59E0B] font-poppins font-semibold h-[39px] flex items-center justify-center">
              {expiringSoon}
            </h3>
            <p className="text-sm sm:text-label text-primary font-sf-pro">
              Expiring Soon
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-4 bg-white border border-[#DEE0E3] rounded-lg shadow-md">
            <h3 className="text-h3 text-[#EF4444] font-poppins font-semibold h-[39px] flex items-center justify-center">
              {expired}
            </h3>
            <p className="text-sm sm:text-label text-primary font-sf-pro">
              Expired
            </p>
          </div>
        </div>
  
        {/* Table Container */}
        <div className="flex flex-col bg-white border border-[#DEE0E3] rounded-lg overflow-hidden">
          {/* Search and Filter Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-5 border-b border-[#DEE0E3]">
            <div className="flex-1 max-w-[373px] relative">
              <div className="flex items-center w-full px-3 py-2 h-[52px] rounded-lg border border-[#DEE0E3] bg-white">
                <input
                  type="text"
                  placeholder="Search Vendors"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="flex-1 text-body-copy text-primary placeholder:text-[#6F7A85] outline-none bg-transparent font-sf-pro"
                />
                <Search className="w-6 h-6 text-primary flex-shrink-0 ml-2 cursor-pointer" />
              </div>
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none h-[52px] px-4 py-2 pr-10 rounded-lg border border-[#DEE0E3] bg-white text-body-copy text-primary font-sf-pro cursor-pointer outline-none hover:border-primary transition-colors"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
            </div>
          </div>
  
          {/* Table */}
          {isLoadingCOIVendors && !coiVendorsData ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-[#6F7A85] font-sf-pro">Loading vendors...</p>
            </div>
          ) : getCOIVendorsError ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-[#EF4444] font-sf-pro">{getCOIVendorsError}</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-[#6F7A85] font-sf-pro">No vendors found</p>
            </div>
          ) : (
            <>
              {isLoadingCOIVendors && coiVendorsData && (
              <div className="flex items-center justify-center p-2 bg-blue-50 border-b border-blue-200">
                <p className="text-xs text-blue-600 font-sf-pro">Refreshing vendors...</p>
              </div>
            )}
              <DataTable columns={columns} data={paginatedVendors} />
            </>
          )}
  
          {/* Pagination */}
          {filteredVendors.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVendors.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              itemName="vendors"
            />
          )}
        </div>
  
        {/* Add COI Vendor Modal */}
        <AddCOIVendorModal
          isOpen={isAddVendorModalOpen}
          onClose={() => setIsAddVendorModalOpen(false)}
          onSubmit={(data: any) => {
            if (data?.success) {
              // COI vendor created successfully, vendors list will be refetched by saga
              setIsAddVendorModalOpen(false);
              dispatch(companyActions.getCOIVendorsRequest());
            }
          }}
        />
  
        {/* Edit COI Vendor Modal */}
        <EditCOIVendorModal
          isOpen={isEditVendorModalOpen}
          onClose={() => {
            setIsEditVendorModalOpen(false);
            setEditingVendor(null);
          }}
          vendorData={
            editingVendor && originalVendorData[editingVendor.id]
              ? {
                  id: editingVendor.id,
                  vendorName: editingVendor.vendorName,
                  email: editingVendor.email,
                  currentCOI: editingVendor.currentCOI,
                  expires: editingVendor.expiresOriginal 
                    ? (editingVendor.expiresOriginal.includes("T") 
                        ? editingVendor.expiresOriginal.split("T")[0] 
                        : editingVendor.expiresOriginal)
                    : (editingVendor.expires ? convertToDateInputFormat(editingVendor.expires) : ""),
                  uploadedDate: originalVendorData[editingVendor.id].createdAt 
                    ? formatDate(originalVendorData[editingVendor.id].createdAt) 
                    : "Nov 15, 2024",
                  coiFileUrl: editingVendor.coiDocumentUrl,
                  emailTemplate: editingVendor.emailTemplate || "Standard Vendor Reminder",
                  emailSubject: editingVendor.emailSubject || `COI Expiration Notice - ${editingVendor.vendorName}`,
                  emailBody: editingVendor.emailBody || `Dear ${editingVendor.vendorName},\n\nThis is a reminder that your Certificate of Insurance (COI) is expiring soon. Please renew your COI to maintain compliance.\n\nThank you.`,
                  ccRecipients: editingVendor.ccRecipients || [],
                }
              : null
          }
          onSubmit={(data: any) => {
            if (data?.success) {
              // COI vendor updated successfully, vendors list will be refetched by saga
              setIsEditVendorModalOpen(false);
              setEditingVendor(null);
              dispatch(companyActions.getCOIVendorsRequest());
            }
          }}
        />
      </div>
    );
  }


  return (
    <div className="w-full px-4 sm:px-0">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="h-[40px] hover:bg-black/80 hover:text-white cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border border-[#8A949E] rounded-lg transition-colors font-poppins font-semibold text-sm mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to COI Alerts
      </button>

      {/* Main Container */}
      <div className="flex flex-col items-end gap-8">
        {/* Header Container */}
        <div className="w-full flex flex-col gap-0.5">
          <h2 className="text-lg sm:text-xl md:text-h4 text-primary font-poppins font-semibold">
            COI Vendor Management
          </h2>
          <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
            Manage vendor certificates of insurance and expiration alerts
          </p>
        </div>

        {/* Content Container */}
        <div className="w-full flex flex-col sm:flex-row gap-6">
          {/* External Alerts Container */}
          <div className="flex-1 bg-white border border-[#DEE0E3] rounded-xl shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] p-8">
            <div className="flex flex-col gap-6">
              {/* External Alerts Header */}
              <div className="flex flex-col gap-1">
                <h3 className="text-h6 text-primary font-poppins font-semibold">
                  External Alerts (To External Vendor)
                </h3>
                <p className="text-body-copy text-primary font-sf-pro">
                  Remind vendors to renew their COI
                </p>
              </div>

              {/* Alert Mode Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-button text-[#2E3338] font-poppins font-semibold">
                  Alert Mode
                </label>
                <div className="flex flex-col gap-3">
                  <div
                    onClick={() => setExternalAlertMode("manual")}
                    className={`flex items-center justify-between gap-12 p-3 rounded-lg border cursor-pointer transition-all ${
                      externalAlertMode === "manual"
                        ? "bg-[#F9FFFE] border-[#1F6F66]"
                        : "bg-white border-[#DEE0E3]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            externalAlertMode === "manual"
                              ? "border-[#1F6F66]"
                              : "border-[#DEE0E3]"
                          }`}
                        >
                          {externalAlertMode === "manual" && (
                            <div className="w-4 h-4 rounded-full bg-[#1F6F66]" />
                          )}
                        </div>
                      </div>
                      <span className="text-supporting text-[#03111F] font-sf-pro">
                        Manual (Flag only, don't auto-send)
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => setExternalAlertMode("auto")}
                    className={`flex items-center justify-between gap-12 p-3 rounded-lg border cursor-pointer transition-all ${
                      externalAlertMode === "auto"
                        ? "bg-[#F9FFFE] border-[#1F6F66]"
                        : "bg-white border-[#DEE0E3]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            externalAlertMode === "auto"
                              ? "border-[#1F6F66]"
                              : "border-[#DEE0E3]"
                          }`}
                        >
                          {externalAlertMode === "auto" && (
                            <div className="w-4 h-4 rounded-full bg-[#1F6F66]" />
                          )}
                        </div>
                      </div>
                      <span className="text-supporting text-[#03111F] font-sf-pro">
                        Auto-send emails at intervals
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Section (shown when auto is selected) */}
              {externalAlertMode === "auto" && (
                <div className="flex flex-col gap-4">
                  {/* Schedule Header */}
                  <div className="flex items-center justify-between">
                    <label className="text-button text-[#2E3338] font-poppins font-semibold">
                      Schedule (if auto-send enabled)
                    </label>
                    <button className="w-9 h-9 flex items-center justify-center text-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Schedule Intervals */}
                  <div className="flex flex-col gap-4">
                    {externalScheduleIntervals.map((interval, index) => (
                      <div key={index} className="flex items-end gap-4">
                        <div className="flex-1">
                          <Select
                            label=""
                            value={interval}
                            onChange={(e) => handleExternalScheduleChange(index, e.target.value)}
                            options={scheduleOptions}
                            showLabel={false}
                            className="h-[51px]"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveExternalSchedule(index)}
                          className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-[#FFEDED] rounded-lg hover:bg-red-100 transition-colors"
                          style={{ padding: "12px 16px" }}
                        >
                          <X className="w-5 h-5 text-[#EF4444]" />
                          <span className="text-button text-[#EF4444] font-poppins font-semibold">
                            Remove
                          </span>
                        </button>
                      </div>
                    ))}

                    {/* Add Button */}
                    <button
                      onClick={handleAddExternalSchedule}
                      className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#8A949E] rounded-lg bg-transparent hover:bg-gray-50 transition-colors"
                      style={{ padding: "12px 16px" }}
                    >
                      <Plus className="w-5 h-5 text-[#2E3338]" />
                      <span className="text-button text-[#2E3338] font-poppins font-semibold">
                        Add
                      </span>
                    </button>

                    {/* Send Final Alert Checkbox */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={externalSendFinalAlert}
                        onChange={setExternalSendFinalAlert}
                        label="Send final alert on expiration day"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Internal Alerts Container */}
          <div className="flex-1 bg-white border border-[#DEE0E3] rounded-xl shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] p-8">
            <div className="flex flex-col gap-6">
              {/* Internal Alerts Header */}
              <div className="flex flex-col gap-1">
                <h3 className="text-h6 text-primary font-poppins font-semibold">
                  Internal Alerts (For Internal Teams)
                </h3>
                <p className="text-body-copy text-primary font-sf-pro">
                  Notify your team about expiring COIs
                </p>
              </div>

              {/* Alert Mode Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-button text-[#2E3338] font-poppins font-semibold">
                  Alert Mode
                </label>
                <div className="flex flex-col gap-3">
                  <div
                    onClick={() => setInternalAlertMode("manual")}
                    className={`flex items-center justify-between gap-12 p-3 rounded-lg border cursor-pointer transition-all ${
                      internalAlertMode === "manual"
                        ? "bg-[#F9FFFE] border-[#1F6F66]"
                        : "bg-white border-[#DEE0E3]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            internalAlertMode === "manual"
                              ? "border-[#1F6F66]"
                              : "border-[#DEE0E3]"
                          }`}
                        >
                          {internalAlertMode === "manual" && (
                            <div className="w-4 h-4 rounded-full bg-[#1F6F66]" />
                          )}
                        </div>
                      </div>
                      <span className="text-supporting text-[#03111F] font-sf-pro">
                        Manual (Notification center only)
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => setInternalAlertMode("auto")}
                    className={`flex items-center justify-between gap-12 p-3 rounded-lg border cursor-pointer transition-all ${
                      internalAlertMode === "auto"
                        ? "bg-[#F9FFFE] border-[#1F6F66]"
                        : "bg-white border-[#DEE0E3]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            internalAlertMode === "auto"
                              ? "border-[#1F6F66]"
                              : "border-[#DEE0E3]"
                          }`}
                        >
                          {internalAlertMode === "auto" && (
                            <div className="w-4 h-4 rounded-full bg-[#1F6F66]" />
                          )}
                        </div>
                      </div>
                      <span className="text-supporting text-[#03111F] font-sf-pro">
                        Auto-send to notification center + email
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Alert (shown when auto is selected) */}
              {internalAlertMode === "auto" && (
                <Alert
                  heading="Note"
                  bodyText="Platform users (PM, Admin) will always see alerts in the notification center. Enabling auto-send will also send email notifications to selected recipients below."
                  variant="info"
                  showIcon={true}
                  className="!bg-[#EBF3FF] !border-[#3B82F6]"
                />
              )}

              {/* Schedule Section (shown when auto is selected) */}
              {internalAlertMode === "auto" && (
                <div className="flex flex-col gap-4">
                  {/* Schedule Header */}
                  <div className="flex items-center justify-between">
                    <label className="text-button text-[#2E3338] font-poppins font-semibold">
                      Schedule (if auto-send enabled)
                    </label>
                    <button className="w-9 h-9 flex items-center justify-center text-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Schedule Intervals */}
                  <div className="flex flex-col gap-4">
                    {internalScheduleIntervals.map((interval, index) => (
                      <div key={index} className="flex items-end gap-4">
                        <div className="flex-1">
                          <Select
                            label=""
                            value={interval}
                            onChange={(e) => handleInternalScheduleChange(index, e.target.value)}
                            options={scheduleOptions}
                            showLabel={false}
                            className="h-[51px]"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveInternalSchedule(index)}
                          className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-[#FFEDED] rounded-lg hover:bg-red-100 transition-colors"
                          style={{ padding: "12px 16px" }}
                        >
                          <X className="w-5 h-5 text-[#EF4444]" />
                          <span className="text-button text-[#EF4444] font-poppins font-semibold">
                            Remove
                          </span>
                        </button>
                      </div>
                    ))}

                    {/* Add Button */}
                    <button
                      onClick={handleAddInternalSchedule}
                      className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#8A949E] rounded-lg bg-transparent hover:bg-gray-50 transition-colors"
                      style={{ padding: "12px 16px" }}
                    >
                      <Plus className="w-5 h-5 text-[#2E3338]" />
                      <span className="text-button text-[#2E3338] font-poppins font-semibold">
                        Add
                      </span>
                    </button>

                    {/* Send Final Alert Checkbox */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={internalSendFinalAlert}
                        onChange={setInternalSendFinalAlert}
                        label="Send final alert on expiration day"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CC Recipients Section (shown when auto is selected) */}
              {internalAlertMode === "auto" && (
                <div className="flex flex-col gap-4">
                  {/* CC Recipients Input */}
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Input
                        label="CC Recipients (Internal Team)"
                        type="email"
                        value={newInternalCcRecipient}
                        onChange={(e) => setNewInternalCcRecipient(e.target.value)}
                        labelStyle="supporting"
                        inputStyle="body-copy"
                        name="ccRecipient"
                        placeholder="Additional@gmail.com"
                      />
                    </div>
                    <button
                      onClick={handleAddInternalCcRecipient}
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
                  {internalCcRecipients.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {internalCcRecipients.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-5 p-3 bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg"
                        >
                          <span className="flex-1 text-button text-[#2E3338] font-poppins font-semibold">
                            {email}
                          </span>
                          <button
                            onClick={() => handleRemoveInternalCcRecipient(email)}
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
              )}
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSaveChanges}
          className="h-[51px] cursor-pointer flex items-center justify-center gap-2 px-3 py-5 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors font-poppins font-semibold text-button w-[315px]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default COIAlertsPage;


