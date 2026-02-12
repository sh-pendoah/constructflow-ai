"use client";

import React, { useState } from "react";
import { FileText, Eye, EyeOff } from "lucide-react";
import { ReviewQueueItem } from "../../../types/review-queue";

interface ReviewQueuePreviewProps {
  item?: ReviewQueueItem | null;
}

const ReviewQueuePreview: React.FC<ReviewQueuePreviewProps> = ({ item }) => {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);

  if (!item) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F3F5F7] border border-[#DEE0E3] border-l-0 border-r-0">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <FileText className="w-8 h-8 text-[#DEE0E3]" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-supporting text-primary font-sf-pro font-semibold">
              No Document Selected
            </p>
            <p className="text-small text-[#6F7A85] font-sf-pro">
              Select an item from the queue to preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPDF = item.mimeType?.includes("pdf") || item.fileUrl?.endsWith(".pdf");
  const isImage =
    item.mimeType?.includes("image") ||
    item.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="w-full h-full flex flex-col bg-[#F3F5F7] border border-[#DEE0E3] border-l-0 border-r-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 bg-white border-b border-[#DEE0E3]">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="text-supporting text-primary font-sf-pro font-semibold truncate">
            {item.fileName || "Document Preview"}
          </h3>
          <p className="text-small text-[#6F7A85] font-sf-pro capitalize">
            {item.documentType.replace("-", " ")}
          </p>
        </div>
        
        {/* Bounding Box Toggle - For future implementation */}
        <button
          onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
            ${
              showBoundingBoxes
                ? "bg-[#EBF3FF] border-[#3B82F6] text-[#3B82F6]"
                : "bg-white border-[#DEE0E3] text-[#6F7A85] hover:border-[#8A949E]"
            }
          `}
          title="Toggle bounding boxes (Coming soon)"
        >
          {showBoundingBoxes ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
          <span className="text-small font-sf-pro">Boxes</span>
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4 hide-scrollbar">
        {!item.fileUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-12 h-12 text-[#DEE0E3]" />
              <p className="text-supporting text-[#6F7A85] font-sf-pro">
                No file available for preview
              </p>
            </div>
          </div>
        ) : isPDF ? (
          <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-sm">
            <iframe
              src={item.fileUrl}
              className="w-full h-full"
              title="PDF Preview"
              style={{ border: "none", minHeight: "600px" }}
            />
          </div>
        ) : isImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative max-w-full max-h-full">
              <img
                src={item.fileUrl}
                alt={item.fileName || "Document"}
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              />
              {showBoundingBoxes && item.boundingBoxes && item.boundingBoxes.length > 0 && (
                <svg
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 10 }}
                >
                  {item.boundingBoxes.map((box, index) => (
                    <g key={index}>
                      <rect
                        x={`${box.x}%`}
                        y={`${box.y}%`}
                        width={`${box.width}%`}
                        height={`${box.height}%`}
                        fill="none"
                        stroke={
                          (box.confidence || 1) < 0.7 ? "#F59E0B" : "#3B82F6"
                        }
                        strokeWidth="2"
                        opacity="0.7"
                      />
                      <title>
                        {box.field}: {box.text} (
                        {Math.round((box.confidence || 1) * 100)}%)
                      </title>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-12 h-12 text-[#DEE0E3]" />
              <p className="text-supporting text-[#6F7A85] font-sf-pro">
                Preview not available for this file type
              </p>
              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-small font-sf-pro"
                >
                  Open File
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewQueuePreview;
