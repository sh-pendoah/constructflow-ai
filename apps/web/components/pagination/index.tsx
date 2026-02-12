"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string; // e.g., "jobs", "vendors", "items"
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = "items",
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show 1, 2, 3, 4, ..., last
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show 1, ..., last-3, last-2, last-1, last
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-3 py-3 bg-white border-t border-[#DEE0E3]">
      {/* Showing text */}
      <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
        Showing {startItem}-{endItem} of {totalItems} {itemName}
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`h-10 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed text-primary"
              : "text-primary hover:bg-gray-50 cursor-pointer"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <button
                key={`ellipsis-${index}`}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                disabled
              >
                <MoreHorizontal className="w-4 h-4 text-primary" />
              </button>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium text-xs transition-colors ${
                isActive
                  ? "border border-[#8A949E] text-primary cursor-pointer"
                  : "text-primary hover:bg-gray-50 cursor-pointer"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`h-10 px-4 py-2 flex items-center gap-2 rounded-lg font-medium text-sm transition-colors ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed text-primary"
              : "text-primary hover:bg-gray-50 cursor-pointer"
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

