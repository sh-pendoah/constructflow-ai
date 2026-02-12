"use client";

import React, { useState } from "react";
import { Pencil } from "lucide-react";
import UpdatePaymentMethodModal from "@/components/update-payment-method-modal";

interface BillingHistoryItem {
  date: string;
  description: string;
  amount: string;
}

const BillingPage = () => {
  const [isUpdatePaymentModalOpen, setIsUpdatePaymentModalOpen] = useState(false);

  // Billing history data
  const billingHistory: BillingHistoryItem[] = [
    {
      date: "Dec 15, 2025",
      description: "Professional Plan - December 2025",
      amount: "$149.00",
    },
    {
      date: "Nov 15, 2025",
      description: "Professional Plan - November 2025",
      amount: "$149.00",
    },
    {
      date: "Oct 15, 2025",
      description: "Professional Plan - October 2025",
      amount: "$149.00",
    },
    {
      date: "Sep 15, 2025",
      description: "Professional Plan - September 2025",
      amount: "$149.00",
    },
    {
      date: "Aug 15, 2025",
      description: "Professional Plan - August 2025",
      amount: "$149.00",
    },
    {
      date: "Jul 15, 2025",
      description: "Professional Plan - July 2025",
      amount: "$149.00",
    },
    {
      date: "Jun 15, 2025",
      description: "Professional Plan - June 2025",
      amount: "$149.00",
    },
    {
      date: "May 15, 2025",
      description: "Professional Plan - May 2025",
      amount: "$149.00",
    },
    {
      date: "Apr 15, 2025",
      description: "Professional Plan - April 2025",
      amount: "$149.00",
    },
    {
      date: "Mar 15, 2025",
      description: "Professional Plan - March 2025",
      amount: "$149.00",
    },
    {
      date: "Feb 15, 2025",
      description: "Professional Plan - February 2025",
      amount: "$149.00",
    },
    {
      date: "Jan 15, 2025",
      description: "Professional Plan - January 2025",
      amount: "$149.00",
    },
  ];

  // Visa icon SVG - matches Figma design
  const VisaIcon = () => (
    <svg
      width="67"
      height="53"
      viewBox="0 0 67 53"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <rect width="67" height="53" rx="4" fill="#1A1F71" />
      <path d="M28 32L26 20H30L32 32H28Z" fill="#FFA500" />
      <path
        d="M39 21C38 20.6 36.5 20.3 35 20.3C31 20.3 28.3 22.3 28.3 25C28.3 26.8 30 27.8 31.5 28.4C33 29 33.5 29.5 33.5 30.3C33.5 31.4 32.3 32 31.1 32C29.5 32 28.6 31.7 27.4 31.2L26.9 31L26.4 34.7C27.5 35.1 29.2 35.5 31 35.6C35.3 35.6 37.9 33.6 37.9 30.8C37.9 29.2 36.8 28.1 34.6 27.3C33.2 26.8 32.4 26.4 32.4 25.6C32.4 24.9 33.1 24.2 34.8 24.2C36.1 24.1 37.1 24.4 37.8 24.7L38.1 24.8L38.6 21.2L39 21Z"
        fill="white"
      />
      <path
        d="M47 20L42 32H38L36 22.6C35.7 21.5 35.2 21.1 34.2 20.7L34.4 20H39.4C40.3 20 40.9 20.4 41.1 21.2L42.7 28.3L45.2 20H47Z"
        fill="white"
      />
    </svg>
  );

  return (
    <div className="w-full px-4 xl:px-0">
      {/* Billing & Subscription Section */}
      <div className="flex flex-col gap-6 mb-6 sm:mb-8">
        <h2
          className="text-lg sm:text-xl md:text-2xl font-poppins font-semibold text-[#03111F]"
          style={{ fontSize: "22px", lineHeight: "1.5em" }}
        >
          Billing & Subscription
        </h2>

        {/* Main Container */}
        <div className="w-full bg-white rounded-xl" style={{ padding: "16px" }}>
          {/* Inner Container with Row Layout */}
          <div
            className="w-full bg-[#F3F5F7] border border-[#DEE0E3] rounded-lg flex flex-col lg:flex-row items-center gap-11"
            style={{ padding: "16px 20px 24px", borderWidth: "0.4px" }}
          >
            {/* Left Section: Frame 5580 */}
            <div className="flex justify-between gap-2 flex-1 w-full lg:w-auto">
              {/* Current Plan with Tag */}
              <div className="flex flex-col gap-2">
                <h3
                  className="text-base sm:text-lg font-poppins font-semibold text-[#2E3338]"
                  style={{ fontSize: "18px", lineHeight: "1.5em" }}
                >
                  Current Plan
                </h3>
                <span
                  className="text-base sm:text-lg font-poppins font-semibold text-primary"
                  style={{ fontSize: "26px", lineHeight: "1.5em" }}
                >
                  Monthly Cost
                </span>
                <span
                  className="text-sm sm:text-base font-sf-pro text-primary"
                  style={{ fontSize: "16px", lineHeight: "1.193359375em" }}
                >
                  Next Billing Cycle
                </span>
              </div>

              {/* Monthly Cost and Next Billing Cycle Container */}
              <div className="flex flex-col gap-1">
                {/* Monthly Cost Container */}
                {/* Professional Tag */}
                <span
                  className="flex items-center justify-center bg-[#EBF3FF] border border-[#3B82F6] rounded-full"
                  style={{ padding: "4px 12px" }}
                >
                  <span
                    className="text-xs font-sf-pro text-[#3B82F6]"
                    style={{ fontSize: "12px", lineHeight: "1.193359375em" }}
                  >
                    Professional
                  </span>
                </span>
                <div className="flex flex-col gap-1">
                  <span
                    className="text-2xl sm:text-3xl font-poppins font-semibold text-[#03111F]"
                    style={{ fontSize: "32px", lineHeight: "1.5em" }}
                  >
                    $149
                  </span>
                </div>

                {/* Next Billing Cycle Container */}
                <div className="flex flex-col gap-1">
                  <span
                    className="text-base font-poppins font-semibold text-primary"
                    style={{ fontSize: "16px", lineHeight: "1.5em" }}
                  >
                    Jan 15, 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div
              className="hidden lg:flex items-center justify-center flex-shrink-0"
              style={{ width: "0px", height: "106px" }}
            >
              <div
                className="w-0 h-full border-l border-[#8A949E]"
                style={{ borderWidth: "0.4px" }}
              />
            </div>

            {/* Right Section: Frame 5579 */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-11 flex-1 w-full lg:w-auto">
              {/* Payment Method */}
              <div className="flex items-center gap-4 flex-1">
                {/* Visa Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="67"
                  height="53"
                  viewBox="0 0 67 53"
                  fill="none"
                >
                  <path
                    d="M54.6701 23.6607C54.6701 23.6607 55.4844 28.0379 55.717 28.9844H51.8785C52.2274 27.9196 53.7396 23.779 53.7396 23.779C53.6233 23.8973 54.0885 22.7143 54.3212 22.0045L54.6701 23.6607ZM67 5.67857V47.3214C67 50.5156 64.441 53 61.4167 53H5.58333C2.44271 53 0 50.5156 0 47.3214V5.67857C0 2.60268 2.44271 0 5.58333 0H61.4167C64.441 0 67 2.60268 67 5.67857ZM17.6806 35.4911L25.0087 17.0357H20.1233L15.4705 29.5759L15.0052 27.0915L13.3767 18.692C13.1441 17.5089 12.3299 17.154 11.283 17.0357H3.72222V17.5089C5.46701 17.9821 7.09549 18.5737 8.60764 19.5201L12.7951 35.4911H17.6806ZM28.6146 35.4911L31.6389 17.0357H26.8698L23.9618 35.4911H28.6146ZM44.8993 29.4576C45.0156 27.3281 43.7361 25.7902 41.0608 24.4888C39.4323 23.6607 38.3854 23.0692 38.3854 22.2411C38.3854 21.4129 39.1996 20.5848 41.0608 20.5848C42.5729 20.5848 43.7361 20.9397 44.5503 21.2946L45.0156 21.5312L45.5972 17.5089C44.6667 17.154 43.2708 16.7991 41.4097 16.7991C36.7569 16.7991 33.5 19.2835 33.5 22.8326C33.5 25.4353 35.8264 26.9732 37.5712 27.8013C39.4323 28.7478 40.0139 29.3393 40.0139 30.0491C40.0139 31.3504 38.6181 31.942 37.2222 31.942C35.3611 31.942 34.4306 31.5871 32.8021 30.8772L32.2205 30.6406L31.6389 34.7812C32.6858 35.2545 34.6632 35.7277 36.7569 35.7277C41.7587 35.7277 44.8993 33.2433 44.8993 29.4576ZM61.4167 35.4911L57.5781 17.0357H53.9722C52.809 17.0357 51.9948 17.3906 51.5295 18.5737L44.5503 35.4911H49.5521C49.5521 35.4911 50.25 33.2433 50.4826 32.7701H56.5312C56.6476 33.3616 56.9965 35.4911 56.9965 35.4911H61.4167Z"
                    fill="#0E1114"
                  />
                </svg>
                {/* Card Info */}
                <div className="flex flex-col gap-1">
                  <span
                    className="text-base sm:text-lg font-poppins font-semibold text-primary"
                    style={{ fontSize: "22px", lineHeight: "1.5em" }}
                  >
                    Visa ending in 4242
                  </span>
                  <span
                    className="text-sm font-sf-pro text-primary"
                    style={{
                      fontSize: "16px",
                      lineHeight: "1.193359375em",
                      height: "15px",
                    }}
                  >
                    Expires 12/2027
                  </span>
                </div>
              </div>

              {/* Update Card Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setIsUpdatePaymentModalOpen(true)}
                  className="flex h-[50px] cursor-pointer hover:bg-black/80 hover:text-white items-center justify-center gap-2 border border-[#8A949E] rounded-lg bg-transparent transition-colors"
                  style={{ padding: "0px 24px" }}
                >
                  <Pencil className="w-4" />
                  <span
                    className="text-base font-poppins font-semibold"
                    style={{ fontSize: "16px", lineHeight: "1.5em" }}
                  >
                    Update Card
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History Section */}
      <div className="flex flex-col gap-5">
        <h2
          className="text-lg sm:text-xl md:text-2xl font-poppins font-semibold text-[#03111F]"
          style={{ fontSize: "22px", lineHeight: "1.5em" }}
        >
          Billing History
        </h2>

        {/* Billing History Table */}
        <div className="w-full bg-white border border-[#DEE0E3] rounded-lg overflow-hidden">
          <div className="min-w-full">
            {/* Table Header */}
            <div className="flex bg-white">
              {/* Date Column Header */}
              <div
                className="flex-1 flex items-center gap-2 px-4 py-4 bg-[#F3F5F7] border-b border-[#DEE0E3] min-w-[120px]"
                style={{
                  borderLeft: "1px solid #DEE0E3",
                  borderTop: "1px solid #DEE0E3",
                  borderBottom: "1px solid #DEE0E3",
                  height: "52px",
                }}
              >
                <span
                  className="text-sm sm:text-base text-primary font-sf-pro whitespace-nowrap"
                  style={{ fontSize: "16px", lineHeight: "1.193359375em" }}
                >
                  Date
                </span>
              </div>

              {/* Description Column Header */}
              <div
                className="flex-1 flex items-center gap-2 px-4 py-4 bg-[#F4F5F6] border-b border-[#DEE0E3] min-w-[120px]"
                style={{
                  borderTop: "1px solid #DEE0E3",
                  borderBottom: "1px solid #DEE0E3",
                  height: "52px",
                }}
              >
                <span
                  className="text-sm sm:text-base text-primary font-sf-pro whitespace-nowrap"
                  style={{ fontSize: "16px", lineHeight: "1.193359375em" }}
                >
                  Description
                </span>
              </div>

              {/* Amount Column Header */}
              <div
                className="flex-1 flex items-center gap-2 px-4 py-4 bg-[#F4F5F6] border-b border-[#DEE0E3] min-w-[120px]"
                style={{
                  borderRight: "1px solid #DEE0E3",
                  borderTop: "1px solid #DEE0E3",
                  borderBottom: "1px solid #DEE0E3",
                  height: "52px",
                }}
              >
                <span
                  className="text-sm sm:text-base text-primary font-sf-pro whitespace-nowrap"
                  style={{ fontSize: "16px", lineHeight: "1.193359375em" }}
                >
                  Amount
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col">
              {billingHistory.map((item, index) => (
                <div key={index} className="flex">
                  {/* Date Cell */}
                  <div
                    className="flex-1 flex items-center px-4 py-4 min-w-[120px] bg-white"
                    style={{
                      borderLeft: "1px solid #DEE0E3",
                      borderBottom:
                        index === billingHistory.length - 1
                          ? "none"
                          : "1px solid #DEE0E3",
                      height: "52px",
                    }}
                  >
                    <span
                      className="text-sm text-primary font-sf-pro whitespace-nowrap"
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.2102272851126534em",
                      }}
                    >
                      {item.date}
                    </span>
                  </div>

                  {/* Description Cell */}
                  <div
                    className="flex-1 flex items-center px-4 py-4 min-w-[120px] bg-white"
                    style={{
                      borderBottom:
                        index === billingHistory.length - 1
                          ? "none"
                          : "1px solid #DEE0E3",
                      height: "52px",
                    }}
                  >
                    <span
                      className="text-sm text-primary font-sf-pro whitespace-nowrap"
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.2102272851126534em",
                      }}
                    >
                      {item.description}
                    </span>
                  </div>

                  {/* Amount Cell */}
                  <div
                    className="flex-1 flex items-center px-4 py-4 min-w-[120px] bg-white"
                    style={{
                      borderRight: "1px solid #DEE0E3",
                      borderBottom:
                        index === billingHistory.length - 1
                          ? "none"
                          : "1px solid #DEE0E3",
                      height: "52px",
                    }}
                  >
                    <span
                      className="text-sm text-primary font-sf-pro whitespace-nowrap"
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.2102272851126534em",
                      }}
                    >
                      {item.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Update Payment Method Modal */}
      <UpdatePaymentMethodModal
        isOpen={isUpdatePaymentModalOpen}
        onClose={() => setIsUpdatePaymentModalOpen(false)}
        onSubmit={(data) => {
          // Add your API call here
        }}
      />
    </div>
  );
};

export default BillingPage;
