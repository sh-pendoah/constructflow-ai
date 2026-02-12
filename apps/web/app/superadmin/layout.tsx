"use client";

import React, { useState, useEffect } from "react";
import SuperAdminSidebar from "@/components/superadmin-sidebar";
import SuperAdminNavbar from "@/components/superadmin-navbar";
import { Menu, X } from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on desktop by default, open state only for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] flex">
      {/* Sidebar */}
      <SuperAdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-[283px] min-w-0">
        {/* Navbar */}
        <div className="sticky top-0 z-30">
          {/* Mobile Menu Button */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-[#DEE0E3] shadow-md text-primary hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          <SuperAdminNavbar onMenuClick={toggleSidebar} />
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 lg:px-8 py-8 overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

