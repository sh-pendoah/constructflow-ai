"use client";

import React, { useState } from "react";
import DailyLogCard from "@/components/daily-log-card";

export interface DailyLog {
  id: string;
  companyName: string;
  projectName: string;
  workers: string;
  totalHours: string;
  dateRange: string;
  status: "pending" | "approved" | "rejected";
  secondaryStatus?: "missing" | "duplicate" | null;
}

interface DailyLogSidebarProps {
  onDailyLogSelect?: (dailyLog: DailyLog) => void;
}

type FilterTab = "all" | "approved" | "pending" | "rejected";

const DailyLogSidebar: React.FC<DailyLogSidebarProps> = ({
  onDailyLogSelect,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedDailyLog, setSelectedDailyLog] = useState<string>("1");

  // Sample daily log data
  const dailyLogs: DailyLog[] = [
    {
      id: "1",
      companyName: "Trailhead Design+Build",
      projectName: "Beverly Project",
      workers: "12 workers",
      totalHours: "70 hours total",
      dateRange: "2025-03-17 to 2025-03-28",
      status: "approved",
    },
    {
      id: "2",
      companyName: "Harbor designs",
      projectName: "Mirror Valley Apartments project",
      workers: "12 workers",
      totalHours: "81 hours total",
      dateRange: "2025-03-17 to 2025-03-28",
      status: "rejected",
      secondaryStatus: "missing",
    },
    {
      id: "3",
      companyName: "Trailhead Design+Build",
      projectName: "Beverly Project",
      workers: "12 workers",
      totalHours: "70 hours total",
      dateRange: "2025-03-17 to 2025-03-28",
      status: "pending",
      secondaryStatus: "duplicate",
    },
  ];

  const filterTabs = [
    {
      id: "all" as FilterTab,
      label: "All",
      count: dailyLogs.length,
    },
    {
      id: "approved" as FilterTab,
      label: "Approved",
      count: dailyLogs.filter((log) => log.status === "approved").length,
    },
    {
      id: "pending" as FilterTab,
      label: "Pending",
      count: dailyLogs.filter((log) => log.status === "pending").length,
    },
    {
      id: "rejected" as FilterTab,
      label: "Rejected",
      count: dailyLogs.filter((log) => log.status === "rejected").length,
    },
  ];

  const filteredLogs =
    activeFilter === "all"
      ? dailyLogs
      : dailyLogs.filter((log) => log.status === activeFilter);

  const handleLogSelect = (log: DailyLog) => {
    setSelectedDailyLog(log.id);
    onDailyLogSelect?.(log);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#DEE0E3] border-r-0 rounded-tl-xl">
      {/* Filter Tabs */}
      <div className="p-3 pb-0">
        <div className="flex items-center gap-2 p-3 bg-[#F9FFFE] border border-[#BFEDE7] rounded-xl">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`
                  px-2 py-2  cursor-pointer whitespace-nowrap
                  ${
                    activeFilter === tab.id
                      ? " border-b-2 border-[#1F6F66]"
                      : ""
                  }
                `}
              >
                <span
                  className={`text-supporting font-sf-pro ${
                    activeFilter === tab.id ? "!font-semibold text-primary" : "text-[#2E3338]"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Log Cards */}
      <div className="flex-1 overflow-y-auto p-4 gap-3 flex flex-col hide-scrollbar">
        {filteredLogs.map((log) => (
          <DailyLogCard
            key={log.id}
            companyName={log.companyName}
            projectName={log.projectName}
            workers={log.workers}
            totalHours={log.totalHours}
            dateRange={log.dateRange}
            status={log.status}
            secondaryStatus={log.secondaryStatus}
            isSelected={selectedDailyLog === log.id}
            onClick={() => handleLogSelect(log)}
          />
        ))}
      </div>
    </div>
  );
};

export default DailyLogSidebar;

