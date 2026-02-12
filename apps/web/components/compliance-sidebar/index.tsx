"use client";

import React, { useState, useEffect, useRef } from "react";
import ComplianceCard from "@/components/compliance-card";
import { useDragToScroll } from "@/utils/hook/use-drag-to-scroll";

export interface Compliance {
  id: string;
  documentType: string;
  companyName: string;
  expiration: string;
  date: string;
  status: "compliant" | "expiring-soon" | "expired" | "pending";
}

interface ComplianceSidebarProps {
  onComplianceSelect?: (compliance: Compliance) => void;
}

type FilterTab = "all" | "expiring-soon" | "compliant" | "expired" | "pending";

const ComplianceSidebar: React.FC<ComplianceSidebarProps> = ({
  onComplianceSelect,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedCompliance, setSelectedCompliance] = useState<string>("1");
  const { ref: scrollContainerRef, handlers } = useDragToScroll();
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});


  // Sample compliance data
  const compliances: Compliance[] = [
    {
      id: "1",
      documentType: "Property Insurance",
      companyName: "MHX, LLC",
      expiration: "2026-06-01",
      date: "2024-12-16",
      status: "compliant",
    },
    {
      id: "2",
      documentType: "Workers Compensation",
      companyName: "Bob's Roofing LLC",
      expiration: "2026-06-01",
      date: "2024-12-16",
      status: "expiring-soon",
    },
    {
      id: "3",
      documentType: "Workers Compensation",
      companyName: "Bob's Roofing LLC",
      expiration: "2026-06-01",
      date: "2024-12-16",
      status: "expired",
    },
    {
      id: "4",
      documentType: "Workers Compensation",
      companyName: "Bob's Roofing LLC",
      expiration: "2026-06-01",
      date: "2024-12-16",
      status: "pending",
    },
  ];

  const filterTabs = [
    {
      id: "all" as FilterTab,
      label: "All",
      count: compliances.length,
    },
    {
      id: "pending" as FilterTab,
      label: "Pending",
      count: compliances.filter((c) => c.status === "pending").length,
    },
    {
      id: "expiring-soon" as FilterTab,
      label: "Expiring Soon",
      count: compliances.filter((c) => c.status === "expiring-soon").length,
    },
    {
      id: "compliant" as FilterTab,
      label: "Compliant",
      count: compliances.filter((c) => c.status === "compliant").length,
    },
    {
      id: "expired" as FilterTab,
      label: "Expired",
      count: compliances.filter((c) => c.status === "expired").length,
    },
  ];

  const filteredCompliances =
    activeFilter === "all"
      ? compliances
      : compliances.filter((c) => c.status === activeFilter);

  const handleComplianceSelect = (compliance: Compliance) => {
    setSelectedCompliance(compliance.id);
    onComplianceSelect?.(compliance);
  };

  useEffect(() => {
    if (filteredCompliances.length > 0 && !selectedCompliance) {
      handleComplianceSelect(filteredCompliances[0]);
    }
  }, [activeFilter]);

  // Scroll active tab into view
  useEffect(() => {
    const activeTab = tabRefs.current[activeFilter];
    const container = scrollContainerRef.current;

    if (activeTab && container) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();

        // Check if tab is outside visible area
        const isTabVisible =
          tabRect.left >= containerRect.left &&
          tabRect.right <= containerRect.right;

        if (!isTabVisible) {
          // Get the index of the active tab
          const activeIndex = filterTabs.findIndex((tab) => tab.id === activeFilter);
          const isLastTab = activeIndex === filterTabs.length - 1;

          if (isLastTab) {
            // If it's the last tab, scroll to the end
            container.scrollTo({
              left: container.scrollWidth - container.clientWidth,
              behavior: "smooth",
            });
          } else {
            // Otherwise, scroll the tab into view
            activeTab.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          }
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#DEE0E3] border-r-0 rounded-tl-xl">
      {/* Filter Tabs */}
      <div className="p-3 pb-0">
        <div className="flex items-center gap-2 p-3 bg-[#F9FFFE] border border-[#BFEDE7] rounded-xl">
          <div
          ref={scrollContainerRef}
          {...handlers}
           className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                onClick={() => setActiveFilter(tab.id)}
                className={`
                  px-2 py-2  cursor-pointer whitespace-nowrap flex-shrink-0
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

      {/* Compliance Cards */}
      <div className="flex-1 overflow-y-auto p-4 gap-3 flex flex-col hide-scrollbar">
        {filteredCompliances.map((compliance) => (
          <ComplianceCard
            key={compliance.id}
            documentType={compliance.documentType}
            companyName={compliance.companyName}
            expiration={compliance.expiration}
            date={compliance.date}
            status={compliance.status}
            isSelected={selectedCompliance === compliance.id}
            onClick={() => handleComplianceSelect(compliance)}
          />
        ))}
      </div>
    </div>
  );
};

export default ComplianceSidebar;

