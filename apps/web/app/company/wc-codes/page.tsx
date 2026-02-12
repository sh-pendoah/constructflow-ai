"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Search, Download, Import, Lightbulb, MoreVertical } from "lucide-react";
import DataTable, { Column } from "@/components/data-table";
import Pagination from "@/components/pagination";
import AddWCCodeModal from "@/components/add-wc-code-modal";
import EditWCCodeModal from "@/components/edit-wc-code-modal";
import ImportWCCSVModal from "@/components/import-wc-csv-modal";
import RemoveWCCodeModal from "@/components/remove-wc-code-modal";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import companyActions from "@/Redux/actions/company";
import { deleteWCCodeFailure } from "@/Redux/reducers/company";

interface WCCode {
  id: string;
  code: string;
  category: string;
  description: string;
}

const WCCodesPage = () => {
  const dispatch = useAppDispatch();
  const { wcCodes: wcCodesData, isLoadingWCCodes, getWCCodesError, isDeletingWCCode, deleteWCCodeSuccess, deleteWCCodeError } = useAppSelector((state) => state.company);
  const hasFetchedWCCodes = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<Record<string, { top: number; right: number }>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [editingWCCode, setEditingWCCode] = useState<WCCode | null>(null);
  const [removingWCCodeId, setRemovingWCCodeId] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const itemsPerPage = 15;

  // Fetch WC codes on component mount
  useEffect(() => {
    if (!hasFetchedWCCodes.current) {
      dispatch(companyActions.getWCCodesRequest());
      hasFetchedWCCodes.current = true;
    }
  }, [dispatch]);

  // Transform API data to WCCode format
  const allWCCodes: WCCode[] = useMemo(() => {
    if (!wcCodesData || !Array.isArray(wcCodesData)) {
      return [];
    }

    return wcCodesData.map((wcCode: any) => ({
      id: wcCode._id || "",
      code: wcCode.codeNumber || "",
      category: wcCode.category || "",
      description: wcCode.description || "",
    }));
  }, [wcCodesData]);

  // Filter WC codes based on search
  const filteredWCCodes = allWCCodes.filter((code) => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredWCCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWCCodes = filteredWCCodes.slice(startIndex, startIndex + itemsPerPage);

  // Calculate dropdown position
  useEffect(() => {
    if (openDropdownId) {
      const button = buttonRefs.current[openDropdownId];
      if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownWidth = 255;
        const right = window.innerWidth - rect.right;
        const top = rect.bottom + 4;

        setDropdownPosition({
          [openDropdownId]: { top, right },
        });
      }
    }
  }, [openDropdownId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const dropdown = dropdownRefs.current[openDropdownId];
        const button = buttonRefs.current[openDropdownId];
        if (
          dropdown &&
          !dropdown.contains(event.target as Node) &&
          button &&
          !button.contains(event.target as Node)
        ) {
          setOpenDropdownId(null);
        }
      }
    };

    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const handleEdit = (codeId: string) => {
    const wcCode = allWCCodes.find((c) => c.id === codeId);
    if (wcCode) {
      setEditingWCCode({ ...wcCode }); // Create new object reference
      setIsEditModalOpen(true);
    }
    setOpenDropdownId(null);
  };

  const handleRemove = (codeId: string) => {
    setRemovingWCCodeId(codeId);
    setIsRemoveModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleConfirmRemove = () => {
    if (removingWCCodeId) {
      dispatch(companyActions.deleteWCCodeRequest(removingWCCodeId));
    }
  };

  // Close modal on successful deletion
  useEffect(() => {
    if (deleteWCCodeSuccess) {
      setIsRemoveModalOpen(false);
      setRemovingWCCodeId(null);
      dispatch(deleteWCCodeFailure(false));
      dispatch(companyActions.getWCCodesRequest());
    }
  }, [deleteWCCodeSuccess]);

  // Define table columns
  const columns: Column<WCCode>[] = [
    {
      key: "code",
      label: "Code",
      // sortable: true,
    },
    {
      key: "category",
      label: "Category",
      // sortable: true,
    },
    {
      key: "description",
      label: "Description",
      // sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => {
        const isOpen = openDropdownId === row.id;
        const position = dropdownPosition[row.id];
        
        return (
          <div className="relative" ref={(el) => { dropdownRefs.current[row.id] = el; }}>
            <button
              ref={(el) => { buttonRefs.current[row.id] = el; }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(isOpen ? null : row.id);
              }}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-primary" />
            </button>
            {isOpen && position && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setOpenDropdownId(null)}
                />
                <div
                  className="fixed z-[101] w-[255px] bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] overflow-hidden"
                  style={{
                    top: `${position.top}px`,
                    right: `${position.right}px`,
                  }}
                >
                  <div className="p-0.5 flex flex-col">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="w-full px-3 py-3 text-left text-body-copy text-primary font-sf-pro hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(row.id)}
                      className="w-full px-3 py-3 text-left text-body-copy text-[#EF4444] font-sf-pro hover:bg-gray-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDownloadTemplate = () => {
    // Add your download template logic here
  };

  const handleImportCSV = () => {
    setIsImportModalOpen(true);
  };

  const handleAddCode = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (data: any) => {
    if (data?.success) {
      // WC code created successfully, WC codes list will be refetched by saga
      setIsAddModalOpen(false);
      dispatch(companyActions.getWCCodesRequest());
    }
  };

  const handleEditSubmit = (data: any) => {
    if (data?.success) {
      // WC code updated successfully, WC codes list will be refetched by saga
      setIsEditModalOpen(false);
      dispatch(companyActions.getWCCodesRequest());
    }
  };

  const handleImportSubmit = (file: File) => {
    // Add your import logic here
  };

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg sm:text-xl md:text-h4 text-primary font-poppins font-semibold">
            Workers Comp Codes
          </h2>
          <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
            Using industry standard NCCI classification codes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={handleDownloadTemplate}
            className="h-[44px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#0E1114] text-[#0E1114] rounded-lg hover:bg-black/80 hover:text-white transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Download Template</span>
          </button>
          <button
            onClick={handleImportCSV}
            className="h-[44px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#0E1114] text-[#0E1114] rounded-lg hover:bg-black/80 hover:text-white transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
          >
            <Import className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleAddCode}
            className="h-[44px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-[#0E1114] text-white rounded-lg hover:bg-black/80 transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Code</span>
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="flex flex-col gap-2 p-3 pl-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
          <h3 className="text-supporting text-primary font-sf-pro font-medium">
            Industry Standard Codes Loaded
          </h3>
        </div>
        <p className="text-supporting text-primary font-sf-pro pl-6">
          Your account includes NCCI workers compensation classification codes.
          You can import your own codes or modify existing ones.
        </p>
      </div>

      {/* Table Container */}
      <div className="flex flex-col bg-white border border-[#DEE0E3] rounded-lg overflow-hidden">
        {/* Search Container */}
        <div className="flex items-center gap-2 p-5 border-b border-[#DEE0E3]">
          <div className="flex-1 max-w-[373px] relative">
            <div className="flex items-center w-full px-3 py-2 h-[52px] rounded-lg border border-[#DEE0E3] bg-white">
              <input
                type="text"
                placeholder="Search WCCodes"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="flex-1 text-body-copy text-primary placeholder:text-[#6F7A85] outline-none bg-transparent font-sf-pro"
              />
              <Search className="w-6 h-6 text-primary flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoadingWCCodes && !wcCodesData ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-[#6F7A85] font-sf-pro">Loading WC codes...</p>
          </div>
        ) : getWCCodesError ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-[#EF4444] font-sf-pro">{getWCCodesError}</p>
          </div>
        ) : filteredWCCodes.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-[#6F7A85] font-sf-pro">No WC codes found</p>
          </div>
        ) : (
          <>
            {isLoadingWCCodes && wcCodesData && (
              <div className="flex items-center justify-center p-2 bg-blue-50 border-b border-blue-200">
                <p className="text-xs text-blue-600 font-sf-pro">Refreshing WC codes...</p>
              </div>
            )}
            <DataTable columns={columns} data={paginatedWCCodes} />
          </>
        )}

        {/* Pagination */}
        {filteredWCCodes.length > 0 && !isLoadingWCCodes && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredWCCodes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            itemName="WC codes"
          />
        )}
      </div>

      {/* Add WC Code Modal */}
      <AddWCCodeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      {/* Edit WC Code Modal */}
      <EditWCCodeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingWCCode(null);
        }}
        onSubmit={handleEditSubmit}
        wcCodeData={editingWCCode}
      />

      {/* Import CSV Modal */}
      <ImportWCCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImportSubmit}
      />

      {/* Remove WC Code Modal */}
      <RemoveWCCodeModal
        isOpen={isRemoveModalOpen}
        onClose={() => {
          if (!isDeletingWCCode) {
            setIsRemoveModalOpen(false);
            setRemovingWCCodeId(null);
          }
        }}
        onConfirm={handleConfirmRemove}
        isLoading={isDeletingWCCode}
        error={deleteWCCodeError}
      />
    </div>
  );
};

export default WCCodesPage;


