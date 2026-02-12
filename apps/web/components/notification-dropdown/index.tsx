"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, X, FileX2, FileWarning, Receipt } from "lucide-react";

interface Notification {
  id: string;
  icon: React.ReactNode;
  heading: string;
  body: string;
  caption: string;
  time: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { top: number; right: number; width?: number };
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  position,
}) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: "1",
      icon: <FileX2 className="w-7 h-7" />,
      heading: "Insurance Expired",
      body: "Steel & Sons Inc - Workers Compensation",
      caption: "Certificate expired 28 days ago",
      time: "5m ago",
    },
    {
      id: "2",
      icon: <FileWarning className="w-7 h-7" />,
      heading: "Insurance Expiring Soon",
      body: "MHX, LLC - Property Insurance",
      caption: "Expires in 7 days (June 1, 2026)",
      time: "2h ago",
    },
    {
      id: "3",
      icon: <Receipt className="w-7 h-7" />,
      heading: "Requires Owner Approval",
      body: "Invoice #2016645 - Hampton Lumber",
      caption: "Amount: $14,974.56 (Over PM limit)",
      time: "3h ago",
    },
  ];

  const handleMarkAllRead = () => {
    // Add your logic here
  };

  const handleViewAll = () => {
    onClose();
    router.push("/dashboard/notifications");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div
        className="fixed z-50 bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] flex flex-col"
        style={{
          top: position?.top ? `${position.top}px` : "auto",
          right: position?.right ? `${position.right}px` : "auto",
          width: position?.width ? `${position.width}px` : "672px",
          maxWidth: "calc(100vw - 32px)",
          padding: isMobile ? "16px 20px 20px" : "24px 32px 32px",
          gap: isMobile ? "24px" : "32px",
        }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8">
          {/* Title Section */}
          <div className="flex flex-col flex-1" style={{ gap: "2px" }}>
            <h3 className="text-xl sm:text-h3 text-primary font-poppins font-semibold">
              Notifications
            </h3>
            <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
              You have 12 New Notifications
            </p>
          </div>

          {/* Action Buttons */}
          <div
            className="flex items-center w-full sm:w-auto justify-between sm:justify-end"
            style={{ gap: "12px" }}
          >
            {/* Mark All Read Button */}
            <button
              onClick={handleMarkAllRead}
              className="h-[40px] sm:h-[44px] flex items-center justify-center gap-2 px-3 rounded-full text-sm sm:text-button text-[#2E3338] font-poppins font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ padding: "10px 12px" }}
            >
              <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Mark All Read</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] flex items-center justify-center rounded-full text-[#2E3338] hover:bg-gray-50 transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: isMobile ? "32px" : "36px",
                  height: isMobile ? "32px" : "36px",
                  padding: "4px",
                }}
              >
                <div
                  className={`${
                    isMobile ? "w-6 h-6" : "w-7 h-7"
                  } flex items-center justify-center`}
                >
                  {notification.icon}
                </div>
              </div>

              {/* Content */}
              <div
                className="flex-1 flex flex-col min-w-0"
                style={{ gap: "4px" }}
              >
                {/* Top Section: Heading/Body and Time */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex flex-col flex-1 min-w-0"
                    style={{ gap: "2px" }}
                  >
                    <h4 className="text-sm sm:text-body-copy text-primary font-sf-pro font-semibold truncate">
                      {notification.heading}
                    </h4>
                    <p className="text-sm sm:text-body-copy text-primary font-sf-pro line-clamp-2">
                      {notification.body}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs sm:text-small text-[#2E3338] font-sf-pro flex-shrink-0 whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-xs sm:text-small text-[#2E3338] font-sf-pro line-clamp-1">
                  {notification.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <button
          onClick={handleViewAll}
          className="w-full h-[44px] sm:h-[50px] flex items-center justify-center gap-2 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors cursor-pointer font-poppins font-semibold text-sm sm:text-button"
          style={{ padding: "16px 12px" }}
        >
          View All Notifications
        </button>
      </div>
    </>
  );
};

export default NotificationDropdown;
