"use client";

import { useState } from "react";
import ReviewQueueList from "@/components/review-queue-list";
import ReviewQueuePreview from "@/components/review-queue-preview";
import ReviewQueueDetails from "@/components/review-queue-details";
import { ReviewQueueItem } from "@/types/review-queue";

export default function ReviewQueuePage() {
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);

  const handleItemSelect = (item: ReviewQueueItem) => {
    setSelectedItem(item);
  };

  const handleRefresh = () => {
    setSelectedItem(null);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <h1 className="text-2xl font-semibold text-gray-900">Review Queue</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve documents requiring attention
        </p>
      </div>

      {/* 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Queue List */}
        <div className="w-[380px] flex-shrink-0 h-full border-r bg-gray-50">
          <ReviewQueueList 
            onSelectItem={handleItemSelect} 
            selectedItemId={selectedItem?._id}
          />
        </div>

        {/* Center: Document Preview */}
        <div className="flex-1 min-w-0 h-full bg-gray-100">
          <ReviewQueuePreview item={selectedItem} />
        </div>

        {/* Right: Details & Actions */}
        <div className="w-[400px] flex-shrink-0 h-full border-l bg-white">
          <ReviewQueueDetails 
            item={selectedItem} 
            onUpdate={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
}
