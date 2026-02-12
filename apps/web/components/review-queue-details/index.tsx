"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  Bot,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ReviewQueueItem } from "../../../types/review-queue";
import Input from "@/components/input";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

interface ReviewQueueDetailsProps {
  item?: ReviewQueueItem | null;
  onUpdate?: () => void;
}

const ReviewQueueDetails: React.FC<ReviewQueueDetailsProps> = ({
  item,
  onUpdate,
}) => {
  const [corrections, setCorrections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (item) {
      setCorrections({});
    }
  }, [item]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!item || item.status !== "pending") {
        return;
      }

      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        handleApprove();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handleReject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async () => {
    if (!item) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE}/api/review-queue/${item._id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("success", "Document approved successfully");
      if (onUpdate) onUpdate();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to approve document");
      console.error("Error approving:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!item) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE}/api/review-queue/${item._id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("success", "Document rejected successfully");
      if (onUpdate) onUpdate();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to reject document");
      console.error("Error rejecting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setCorrections((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveCorrections = async () => {
    if (!item || Object.keys(corrections).length === 0) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE}/api/review-queue/${item._id}/corrections`,
        { corrections },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("success", "Corrections saved successfully");
      setCorrections({});
      if (onUpdate) onUpdate();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to save corrections");
      console.error("Error saving corrections:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return { bg: "#FFEDED", text: "#EF4444", border: "#EF4444" };
      case "medium":
        return { bg: "#FFF6E6", text: "#F59E0B", border: "#F59E0B" };
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

  if (!item) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white border border-[#DEE0E3] border-l-0 rounded-tr-xl">
        <p className="text-supporting text-[#6F7A85] font-sf-pro">
          Select an item to view details
        </p>
      </div>
    );
  }

  const statusColor = getStatusColor(item.status);
  const showActions = item.status === "pending" || item.status === "needs-correction";
  const confidencePercent = Math.round((item.ocrConfidence || 0) * 100);

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#DEE0E3] border-l-0 rounded-tr-xl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`
            fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2
            ${toast.type === "success" ? "bg-[#10B981] text-white" : "bg-[#EF4444] text-white"}
          `}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="text-supporting font-sf-pro">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-h6 text-primary font-poppins font-semibold">
            Document Details
          </h2>
          <div
            className="px-2 h-6 flex items-center justify-center rounded-full border capitalize"
            style={{
              borderColor: statusColor.border,
            }}
          >
            <span
              className="text-xs font-normal font-sf-pro"
              style={{ color: statusColor.text }}
            >
              {item.status.replace("-", " ")}
            </span>
          </div>
        </div>
        <button className="flex items-center justify-center w-9 h-9 p-2 border border-[#8A949E] rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 hide-scrollbar">
        <div className="flex flex-col gap-5">
          {/* Confidence Score */}
          {item.ocrConfidence !== undefined && (
            <div
              className={`
                flex items-center gap-2 p-3 pl-4 rounded-lg border
                ${
                  confidencePercent >= 70
                    ? "bg-[#EBF3FF] border-[#3B82F6]"
                    : "bg-[#FFF6E6] border-[#F59E0B]"
                }
              `}
            >
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Bot
                    className={`w-6 h-6 ${
                      confidencePercent >= 70 ? "text-[#3B82F6]" : "text-[#F59E0B]"
                    }`}
                  />
                  <span className="text-label text-primary font-sf-pro">
                    AI Confidence
                  </span>
                </div>
                <p className="text-small text-primary font-sf-pro">
                  {confidencePercent >= 70
                    ? "High confidence - AI extraction verified"
                    : "Low confidence - Please review carefully"}
                </p>
              </div>
              <div className="relative w-[52px] h-[52px]">
                <svg className="w-[52px] h-[52px] transform -rotate-90">
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke="#DEE0E3"
                    strokeWidth="4"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke={confidencePercent >= 70 ? "#3B82F6" : "#F59E0B"}
                    strokeWidth="4"
                    strokeDasharray={`${
                      (confidencePercent / 100) * 2 * Math.PI * 22
                    } ${2 * Math.PI * 22}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-h5 font-poppins font-semibold ${
                      confidencePercent >= 70 ? "text-[#3B82F6]" : "text-[#F59E0B]"
                    }`}
                  >
                    {confidencePercent}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Exceptions */}
          {item.exceptions && item.exceptions.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-supporting text-primary font-sf-pro font-semibold">
                Exceptions ({item.exceptions.length})
              </h3>
              <div className="flex flex-col gap-2">
                {item.exceptions.map((exception, index) => {
                  const severityColor = getSeverityColor(exception.severity);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 border border-[#DEE0E3] rounded-lg"
                    >
                      <AlertTriangle
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: severityColor.text }}
                      />
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-supporting text-primary font-sf-pro font-semibold">
                            {exception.type}
                          </span>
                          <div
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: severityColor.bg }}
                          >
                            <span
                              className="text-xs font-sf-pro capitalize"
                              style={{ color: severityColor.text }}
                            >
                              {exception.severity}
                            </span>
                          </div>
                        </div>
                        <p className="text-small text-[#6F7A85] font-sf-pro">
                          {exception.message}
                        </p>
                        {exception.field && (
                          <span className="text-xs text-[#6F7A85] font-sf-pro">
                            Field: {exception.field}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Actions */}
          {item.suggestedActions && item.suggestedActions.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-supporting text-primary font-sf-pro font-semibold">
                Suggested Actions
              </h3>
              <div className="flex flex-col gap-2">
                {item.suggestedActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg"
                  >
                    <Bot className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-supporting text-primary font-sf-pro font-semibold">
                        {action.action}
                      </span>
                      <p className="text-small text-[#6F7A85] font-sf-pro">
                        {action.reason}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#6F7A85] font-sf-pro">
                        <span>Field: {action.field}</span>
                        <span>•</span>
                        <span>Confidence: {Math.round(action.confidence * 100)}%</span>
                      </div>
                      {action.suggestedValue && (
                        <div className="mt-1 px-2 py-1 bg-white rounded border border-[#DEE0E3]">
                          <span className="text-small text-primary font-sf-pro">
                            Suggested: {JSON.stringify(action.suggestedValue)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Data Fields */}
          {item.extractedData && (
            <div className="flex flex-col gap-3">
              <h3 className="text-supporting text-primary font-sf-pro font-semibold">
                Extracted Data
              </h3>
              <div className="flex flex-col gap-3">
                {Object.entries(item.extractedData).map(([field, value]) => {
                  const fieldBox = item.boundingBoxes?.find((box) => box.field === field);
                  const fieldConfidence = fieldBox?.confidence || 1;
                  const isLowConfidence = fieldConfidence < 0.7;
                  const currentValue = corrections[field] !== undefined ? corrections[field] : value;

                  return (
                    <div
                      key={field}
                      className={`
                        ${isLowConfidence ? "bg-[#FFF6E6] border-[#F59E0B]" : ""}
                      `}
                    >
                      <Input
                        label={field
                          .split(/(?=[A-Z])/)
                          .join(" ")
                          .replace(/^\w/, (c) => c.toUpperCase())}
                        value={currentValue?.toString() || ""}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        name={field}
                        labelStyle="supporting"
                        inputStyle="body-copy"
                        readOnly={!showActions}
                        className={isLowConfidence ? "border-[#F59E0B]" : ""}
                      />
                      {isLowConfidence && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
                          <span className="text-xs text-[#F59E0B] font-sf-pro">
                            Low confidence ({Math.round(fieldConfidence * 100)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save Corrections Button */}
          {showActions && Object.keys(corrections).length > 0 && (
            <button
              onClick={handleSaveCorrections}
              disabled={loading}
              className="w-full px-4 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-button font-poppins font-semibold">
                {loading ? "Saving..." : "Save Corrections"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-col items-center w-full gap-2 p-4 pt-4 pb-4 px-2 border-t border-[#C3CCD5] flex-shrink-0">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 w-full max-h-12 flex items-center justify-center gap-2 py-5 px-6 bg-[#10B981] text-white rounded-lg hover:bg-[#0ea572] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            <span className="text-button font-poppins font-semibold">
              Approve (Y)
            </span>
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 w-full max-h-12 flex items-center justify-center gap-2 py-5 px-6 bg-[#FFEDED] text-[#EF4444] rounded-lg hover:bg-[#FFE0E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
            <span className="text-button font-poppins font-semibold">
              Reject (N)
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewQueueDetails;
