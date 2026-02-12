"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  FileText,
  Receipt,
  FilePenLine,
  Shield,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { ReviewQueueItem, ReviewQueueFilters } from "../../../types/review-queue";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

interface ReviewQueueListProps {
  selectedItemId?: string;
  onSelectItem: (item: ReviewQueueItem) => void;
}

const ReviewQueueList: React.FC<ReviewQueueListProps> = ({
  selectedItemId,
  onSelectItem,
}) => {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ReviewQueueFilters>({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      if (filters.documentType) params.append("documentType", filters.documentType);
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(`${API_BASE}/api/review-queue?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(response.data);
      setFilteredItems(response.data);
      
      if (response.data.length > 0 && !selectedItemId) {
        onSelectItem(response.data[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch review queue items");
      console.error("Error fetching review queue:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, selectedItemId, onSelectItem]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = Math.min(prev + 1, filteredItems.length - 1);
          if (filteredItems[newIndex]) {
            onSelectItem(filteredItems[newIndex]);
          }
          return newIndex;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          if (filteredItems[newIndex]) {
            onSelectItem(filteredItems[newIndex]);
          }
          return newIndex;
        });
      } else if (e.key === "Tab") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = (prev + 1) % filteredItems.length;
          if (filteredItems[newIndex]) {
            onSelectItem(filteredItems[newIndex]);
          }
          return newIndex;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, onSelectItem]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: keyof ReviewQueueFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { bg: "#FFEDED", text: "#EF4444", border: "#EF4444" };
      case "high":
        return { bg: "#FFF6E6", text: "#F59E0B", border: "#F59E0B" };
      case "normal":
        return { bg: "#EBF3FF", text: "#3B82F6", border: "#3B82F6" };
      case "low":
        return { bg: "#F3F5F7", text: "#6F7A85", border: "#8A949E" };
      default:
        return { bg: "#F3F5F7", text: "#6F7A85", border: "#8A949E" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "#F59E0B", border: "#F59E0B" };
      case "in-review":
        return { text: "#3B82F6", border: "#3B82F6" };
      case "approved":
        return { text: "#10B981", border: "#10B981" };
      case "rejected":
        return { text: "#EF4444", border: "#EF4444" };
      case "needs-correction":
        return { text: "#F59E0B", border: "#F59E0B" };
      default:
        return { text: "#6F7A85", border: "#8A949E" };
    }
  };

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case "invoice":
        return <Receipt className="w-4 h-4 text-primary" />;
      case "daily-log":
        return <FilePenLine className="w-4 h-4 text-primary" />;
      case "compliance":
        return <Shield className="w-4 h-4 text-primary" />;
      default:
        return <FileText className="w-4 h-4 text-primary" />;
    }
  };

  const formatDocumentType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white border border-[#DEE0E3] rounded-tl-xl">
        <p className="text-supporting text-[#6F7A85] font-sf-pro">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white border border-[#DEE0E3] rounded-tl-xl">
        <div className="flex flex-col items-center gap-2">
          <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
          <p className="text-supporting text-[#EF4444] font-sf-pro">{error}</p>
          <button
            onClick={fetchItems}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-small font-sf-pro"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#DEE0E3] rounded-tl-xl">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b border-[#DEE0E3]">
        <h2 className="text-h6 text-primary font-poppins font-semibold">
          Review Queue
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6F7A85]" />
          <input
            type="text"
            placeholder="Search by file, invoice, vendor..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-[#DEE0E3] rounded-lg text-supporting text-primary font-sf-pro focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filters.documentType || "all"}
            onChange={(e) => handleFilterChange("documentType", e.target.value)}
            className="flex-1 px-3 py-2 border border-[#DEE0E3] rounded-lg text-small text-primary font-sf-pro focus:outline-none focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="invoice">Invoice</option>
            <option value="daily-log">Daily Log</option>
            <option value="compliance">Compliance</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.status || "all"}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="flex-1 px-3 py-2 border border-[#DEE0E3] rounded-lg text-small text-primary font-sf-pro focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="needs-correction">Needs Correction</option>
          </select>

          <select
            value={filters.priority || "all"}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="flex-1 px-3 py-2 border border-[#DEE0E3] rounded-lg text-small text-primary font-sf-pro focus:outline-none focus:border-primary"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <FileText className="w-12 h-12 text-[#DEE0E3]" />
            <p className="text-supporting text-[#6F7A85] font-sf-pro">
              No items in review queue
            </p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isSelected = item._id === selectedItemId;
            const priorityColor = getPriorityColor(item.priority);
            const statusColor = getStatusColor(item.status);
            const hasLowConfidence = (item.ocrConfidence || 1) < 0.7;
            const exceptionCount = item.exceptions?.length || 0;

            return (
              <div
                key={item._id}
                onClick={() => {
                  onSelectItem(item);
                  setSelectedIndex(index);
                }}
                className={`
                  flex flex-col gap-2 p-4 rounded-xl cursor-pointer transition-all
                  ${
                    isSelected
                      ? "border-[1.5px] border-[#1F6F66] bg-white shadow-medium"
                      : "border border-[#DEE0E3] bg-white hover:border-primary/30"
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F3F5F7] flex items-center justify-center">
                      {getDocumentIcon(item.documentType)}
                    </div>
                    <span className="text-supporting text-primary font-sf-pro">
                      {formatDocumentType(item.documentType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Priority Badge */}
                    <div
                      className="px-2 h-6 flex items-center justify-center rounded-full"
                      style={{
                        backgroundColor: priorityColor.bg,
                      }}
                    >
                      <span
                        className="text-xs font-normal font-sf-pro capitalize"
                        style={{ color: priorityColor.text }}
                      >
                        {item.priority}
                      </span>
                    </div>
                    {/* Status Badge */}
                    <div
                      className="px-2 h-6 flex items-center justify-center rounded-full border"
                      style={{
                        borderColor: statusColor.border,
                      }}
                    >
                      <span
                        className="text-xs font-normal font-sf-pro capitalize"
                        style={{ color: statusColor.text }}
                      >
                        {item.status.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-label text-primary font-sf-pro">
                    {item.fileName || item.invoiceNumber || "Unnamed Document"}
                  </span>
                  <div className="flex flex-col gap-1">
                    {item.vendor && (
                      <span className="text-supporting text-primary font-sf-pro">
                        {item.vendor}
                      </span>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.invoiceNumber && (
                        <>
                          <span className="text-small text-[#2E3338] font-sf-pro">
                            #{item.invoiceNumber}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-primary"></div>
                        </>
                      )}
                      {item.invoiceTotal && (
                        <>
                          <span className="text-label text-[#2E3338] font-sf-pro">
                            ${item.invoiceTotal.toFixed(2)}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-primary"></div>
                        </>
                      )}
                      {item.workersCount && (
                        <>
                          <span className="text-small text-[#2E3338] font-sf-pro">
                            {item.workersCount} workers
                          </span>
                          <div className="w-1 h-1 rounded-full bg-primary"></div>
                        </>
                      )}
                      {item.totalHours && (
                        <span className="text-small text-[#2E3338] font-sf-pro">
                          {item.totalHours} hours
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-2 flex-wrap">
                  {hasLowConfidence && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#FFF6E6] rounded-md">
                      <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
                      <span className="text-xs text-[#F59E0B] font-sf-pro">
                        Low Confidence ({Math.round((item.ocrConfidence || 0) * 100)}%)
                      </span>
                    </div>
                  )}
                  {exceptionCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#FFEDED] rounded-md">
                      <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
                      <span className="text-xs text-[#EF4444] font-sf-pro">
                        {exceptionCount} {exceptionCount === 1 ? "Exception" : "Exceptions"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Date */}
                {item.date && (
                  <span className="text-small text-[#6F7A85] font-sf-pro">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewQueueList;
