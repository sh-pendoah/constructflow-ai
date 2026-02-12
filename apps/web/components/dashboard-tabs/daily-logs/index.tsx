"use client";

import React, { useState } from "react";
import DailyLogSidebar, { DailyLog } from "@/components/daily-log-sidebar";
import DailyLogPreview from "@/components/daily-log-preview";
import DailyLogDetails from "@/components/daily-log-details";

const DailyLogsTab = () => {
  const [selectedDailyLog, setSelectedDailyLog] = useState<DailyLog | null>(null);

  const handleDailyLogSelect = (dailyLog: DailyLog) => {
    setSelectedDailyLog(dailyLog);
  };

  return (
    <div className="w-full px-0">
      <div className="w-full h-[calc(100vh-300px)] min-h-[768px] max-h-[768px] flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[316px] flex-shrink-0 h-full">
          <DailyLogSidebar onDailyLogSelect={handleDailyLogSelect} />
        </div>

        {/* Center Preview Section */}
        <div className="flex-1 min-w-0 h-full relative">
          <DailyLogPreview />
        </div>

        {/* Right Daily Log Details Section */}
        <div className="w-[336px] flex-shrink-0 h-full">
          <DailyLogDetails dailyLog={selectedDailyLog} />
        </div>
      </div>
    </div>
  );
};

export default DailyLogsTab;

