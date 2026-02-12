"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";
import { ArrowLeft } from "lucide-react";

const tabs = [
  { id: "company-info", label: "Company Info", path: "/company/company-info" },
  {
    id: "users-permissions",
    label: "Users & Permissions",
    path: "/company/user-permissions",
  },
  { id: "workflows", label: "Workflows", path: "/company/workflows" },
  { id: "jobs", label: "Jobs", path: "/company/jobs" },
  { id: "cost-codes", label: "Cost Codes", path: "/company/cost-codes" },
  { id: "wc-codes", label: "WC Codes", path: "/company/wc-codes" },
  {
    id: "approval-rules",
    label: "Approval Rules",
    path: "/company/approval-rules",
  },
  { id: "coi-alerts", label: "COI Alerts", path: "/company/coi-alerts" },
  { id: "billing", label: "Billing", path: "/company/billing" },
];

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("company-info");
  const [configureCOIAlerts, setConfigureCOIAlerts] = useState<string | null>(null);

  // Update active tab based on current pathname
  useEffect(() => {
    const currentTab = tabs.find(
      (tab) => pathname === tab.path || pathname.startsWith(tab.path + "/")
    );
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [pathname]);

  // Check localStorage on client side only
  useEffect(() => {
    const coiAlertsPath = location.pathname === '/company/coi-alerts'
    if (typeof window !== "undefined") {
      const value = localStorage.getItem("configure_coi_alerts");
      setConfigureCOIAlerts((coiAlertsPath && value) ? value : null);
    }
  }, [location.pathname]);


  // Listen for storage changes to update in real-time
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "configure_coi_alerts") {
          setConfigureCOIAlerts(e.newValue);
        }
      };

      window.addEventListener("storage", handleStorageChange);

      // Also listen for custom events in case storage changes happen in the same tab
      const handleCustomStorageChange = () => {
        const value = localStorage.getItem("configure_coi_alerts");
        setConfigureCOIAlerts(value);
      };
      window.addEventListener("localStorageChange", handleCustomStorageChange as EventListener);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("localStorageChange", handleCustomStorageChange as EventListener);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[39px] pt-4 sm:pt-5 pb-0">
        <Navbar />
      </div>
      <main className="w-full max-w-[1362px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[39px]">
        <div className="w-full min-h-[calc(100vh-100px)] bg-[#F3F5F7]">
          <div className="w-full mx-auto lg:pr-0 pt-6 sm:pt-8 md:pt-[34px] pb-8">
            {/* Back Button */}
            {configureCOIAlerts === "true" ? null : <Link
              href="/dashboard"
              className="flex items-center gap-2 mb-3 px-4 py-3 border border-[#8A949E] rounded-lg bg-white hover:text-white text-[#2E3338] hover:bg-black/80 transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className=" font-poppins font-semibold">
                Back to Review Queue
              </span>
            </Link>}
            {/* Header Container */}
           {configureCOIAlerts === "true" ? null : <div className="flex flex-col px-4 sm:px-0 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex flex-col gap-0.5 w-full sm:w-[315px]">
                <h1 className="text-xl sm:text-2xl md:text-h3 text-primary font-poppins font-semibold">
                  Company Settings
                </h1>
                <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
                  Manage your organization's configuration
                </p>
              </div>

              {/* Tabs Container */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    className={`px-3 cursor-pointer sm:px-4 py-2 sm:py-3 rounded-lg font-sf-pro font-medium text-sm sm:text-label transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? "bg-[#1F6F66] text-white"
                        : "bg-white border border-[#DEE0E3] text-primary hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>}
            <NextTopLoader />

            {/* Page Content */}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
