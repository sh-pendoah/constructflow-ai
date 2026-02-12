"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileX2, FileWarning, Receipt } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  icon: React.ReactNode;
  heading: string;
  body: string;
  caption: string;
  time: string;
  isUnread: boolean;
  date: string; // "today" or "yesterday"
}

const NotificationsPage = () => {
  const router = useRouter();

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: "1",
      icon: <FileX2 className="w-7 h-7" />,
      heading: "Insurance Expired",
      body: "Steel & Sons Inc - Workers Compensation",
      caption: "Certificate expired 28 days ago",
      time: "5m ago",
      isUnread: true,
      date: "today",
    },
    {
      id: "2",
      icon: <FileWarning className="w-7 h-7" />,
      heading: "Insurance Expiring Soon",
      body: "MHX, LLC - Property Insurance",
      caption: "Expires in 7 days (June 1, 2026)",
      time: "2h ago",
      isUnread: true,
      date: "today",
    },
    {
      id: "3",
      icon: <Receipt className="w-7 h-7" />,
      heading: "Requires Owner Approval",
      body: "Invoice #2016645 - Hampton Lumber",
      caption: "Amount: $14,974.56 (Over PM limit)",
      time: "3h ago",
      isUnread: true,
      date: "today",
    },
    {
      id: "4",
      icon: <FileX2 className="w-7 h-7" />,
      heading: "Insurance Expired",
      body: "Steel & Sons Inc - Workers Compensation",
      caption: "Certificate expired 28 days ago",
      time: "5m ago",
      isUnread: false,
      date: "today",
    },
    {
      id: "5",
      icon: <FileX2 className="w-7 h-7" />,
      heading: "Insurance Expired",
      body: "Steel & Sons Inc - Workers Compensation",
      caption: "Certificate expired 28 days ago",
      time: "3d ago",
      isUnread: true,
      date: "yesterday",
    },
    {
      id: "6",
      icon: <FileWarning className="w-7 h-7" />,
      heading: "Insurance Expiring Soon",
      body: "MHX, LLC - Property Insurance",
      caption: "Expires in 7 days (June 1, 2026)",
      time: "4d ago",
      isUnread: true,
      date: "yesterday",
    },
    {
      id: "7",
      icon: <Receipt className="w-7 h-7" />,
      heading: "Requires Owner Approval",
      body: "Invoice #2016645 - Hampton Lumber",
      caption: "Amount: $14,974.56 (Over PM limit)",
      time: "4d ago",
      isUnread: true,
      date: "yesterday",
    },
    {
      id: "8",
      icon: <FileX2 className="w-7 h-7" />,
      heading: "Insurance Expired",
      body: "Steel & Sons Inc - Workers Compensation",
      caption: "Certificate expired 28 days ago",
      time: "5d ago",
      isUnread: false,
      date: "yesterday",
    },
    {
      id: "9",
      icon: <FileX2 className="w-7 h-7" />,
      heading: "Insurance Expired",
      body: "Steel & Sons Inc - Workers Compensation",
      caption: "Certificate expired 28 days ago",
      time: "5d ago",
      isUnread: true,
      date: "yesterday",
    },
  ];

  const todayNotifications = notifications.filter((n) => n.date === "today");
  const yesterdayNotifications = notifications.filter(
    (n) => n.date === "yesterday"
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[39px] relative min-h-[calc(100vh-100px)] bg-[#F3F5F7] pb-4 sm:pb-8 pt-4 sm:pt-6 md:pt-8">
      <div className="w-full max-w-[672px] mx-auto px-4 sm:px-6 md:px-8 lg:px-0">
        {/* Page Header */}
        <Link
        href="/dashboard"
        className="flex items-center gap-2 mb-3 px-4 py-3 border border-[#8A949E] rounded-lg bg-white hover:text-white text-[#2E3338] hover:bg-black/80 transition-colors w-fit"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className=" font-poppins font-semibold">
          Back to Review Queue
        </span>
      </Link>
        <div className="flex flex-col gap-0.5 mb-8 sm:mb-8">
          <h1 className="text-2xl sm:text-h3 text-primary font-poppins font-semibold">
            Notifications
          </h1>
          <p className="text-base sm:text-body-copy text-primary font-sf-pro">
            You have 12 New Notifications
          </p>
        </div>

        {/* Notifications Container */}
        <div className="flex flex-col gap-8">
          {/* Today Section */}
          {todayNotifications.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg sm:text-h6 text-[#2E3338] font-poppins font-semibold">
                Today
              </h2>
              <div className="bg-white rounded-xl sm:rounded-2xl border border-[#DEE0E3] p-4 sm:p-6">
                <div className="flex flex-col gap-0">
                  {todayNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-2 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer`}
                    >
                      {/* Icon */}
                      <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 p-1">
                        <div className="w-7 h-7 flex items-center justify-center text-[#2E3338]">
                          {notification.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col min-w-0 gap-1">
                        {/* Top Section: Heading/Body and Time */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                            <h4 className="text-base sm:text-body-copy text-primary font-sf-pro font-semibold">
                              {notification.heading}
                            </h4>
                            <p className="text-base sm:text-body-copy text-primary font-sf-pro">
                              {notification.body}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {notification.isUnread && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <span className="text-sm sm:text-small text-[#2E3338] font-sf-pro whitespace-nowrap">
                              {notification.time}
                            </span>
                          </div>
                        </div>

                        {/* Caption */}
                        <p className="text-sm sm:text-small text-[#2E3338] font-sf-pro">
                          {notification.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Yesterday Section */}
          {yesterdayNotifications.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg sm:text-h6 text-[#2E3338] font-poppins font-semibold">
                Yesterday
              </h2>
              <div className="bg-white rounded-xl sm:rounded-2xl border border-[#DEE0E3] p-4 sm:p-6">
                <div className="flex flex-col gap-0">
                  {yesterdayNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-2 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer `}
                    >
                      {/* Icon */}
                      <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 p-1">
                        <div className="w-7 h-7 flex items-center justify-center text-[#2E3338]">
                          {notification.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col min-w-0 gap-1">
                        {/* Top Section: Heading/Body and Time */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                            <h4 className="text-base sm:text-body-copy text-primary font-sf-pro font-semibold">
                              {notification.heading}
                            </h4>
                            <p className="text-base sm:text-body-copy text-primary font-sf-pro">
                              {notification.body}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {notification.isUnread && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <span className="text-sm sm:text-small text-[#2E3338] font-sf-pro whitespace-nowrap">
                              {notification.time}
                            </span>
                          </div>
                        </div>

                        {/* Caption */}
                        <p className="text-sm sm:text-small text-[#2E3338] font-sf-pro">
                          {notification.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
