"use client";

import React, { useState, useEffect } from "react";
import InvoiceCard from "@/components/invoice-card";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
  vendorName: string;
  amount: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

interface InvoiceSidebarProps {
  onInvoiceSelect?: (invoice: Invoice) => void;
}

type FilterTab = "all" | "approved" | "pending" | "rejected";

const InvoiceSidebar: React.FC<InvoiceSidebarProps> = ({
  onInvoiceSelect,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("pending");
  const [selectedInvoice, setSelectedInvoice] = useState<string>("1");

  // Sample invoice data
  const invoices: Invoice[] = [
    {
      id: "1",
      invoiceNumber: "Invoice #2016645",
      companyName: "Rogue Forest Products - Phoenix Project",
      vendorName: "Hampton Lumber Sales",
      amount: "$14974.56",
      date: "2025-12-08",
      status: "pending" as const,
    },
    {
      id: "2",
      invoiceNumber: "Invoice #SM-45678",
      companyName: "Mirror Valley Apartments",
      vendorName: "Smith Materials",
      amount: "$4,230.50",
      date: "2024-12-16",
      status: "pending" as const,
    },
    {
      id: "3",
      invoiceNumber: "Invoice #ABC-12345",
      companyName: "Downtown Office Complex",
      vendorName: "ABC Supply Co.",
      amount: "$8,950.00",
      date: "2025-01-15",
      status: "approved" as const,
    },
    {
      id: "4",
      invoiceNumber: "Invoice #XYZ-98765",
      companyName: "Riverside Construction Site",
      vendorName: "Premium Builders Inc.",
      amount: "$12,450.75",
      date: "2025-01-20",
      status: "approved" as const,
    },
    {
      id: "5",
      invoiceNumber: "Invoice #SM-45678",
      companyName: "Mirror Valley Apartments",
      vendorName: "Smith Materials",
      amount: "$3,240.50",
      date: "2024-12-16",
      status: "rejected" as const,
    },
    {
      id: "6",
      invoiceNumber: "Invoice #DEF-54321",
      companyName: "Highway Bridge Project",
      vendorName: "Steel Works Ltd.",
      amount: "$25,680.00",
      date: "2025-02-01",
      status: "pending" as const,
    },
    {
      id: "7",
      invoiceNumber: "Invoice #GHI-11111",
      companyName: "Shopping Mall Renovation",
      vendorName: "Interior Design Co.",
      amount: "$6,789.25",
      date: "2025-01-25",
      status: "rejected" as const,
    },
  ];

  // Filter invoices based on active filter
  const filteredInvoices = invoices.filter((invoice) => {
    if (activeFilter === "all") return true;
    return invoice.status === activeFilter;
  });

  const filterTabs = [
    { id: "all" as FilterTab, label: "All", count: invoices.length },
    { id: "approved" as FilterTab, label: "Approved", count: invoices.filter(i => i.status === "approved").length },
    { id: "pending" as FilterTab, label: "Pending", count: invoices.filter(i => i.status === "pending").length },
    { id: "rejected" as FilterTab, label: "Rejected", count: invoices.filter(i => i.status === "rejected").length },
  ];

  const handleInvoiceClick = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      onInvoiceSelect?.(invoice);
    }
  };

  // Call onInvoiceSelect with default selected invoice on mount
  useEffect(() => {
    const defaultInvoice = invoices.find((inv) => inv.id === selectedInvoice);
    if (defaultInvoice && onInvoiceSelect) {
      onInvoiceSelect(defaultInvoice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-white border border-[#DEE0E3] border-r-0 rounded-tl-xl">
      {/* Filter Tabs */}
      <div className="w-full bg-[#F9FFFE] border-[1.5px] border-[#BFEDE7] rounded-xl p-3 shadow-md-custom">
        <div className="flex items-center gap-0 overflow-x-auto hide-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`
                px-2 py-2  cursor-pointer whitespace-nowrap
                ${
                  activeFilter === tab.id
                    ? "border-b-2 border-[#1F6F66] text-primary"
                    : "text-[#2E3338]"
                }
              `}
            >
              <span 
                className={`text-supporting transition-all duration-300 ease-in-out ${activeFilter === tab.id ? "!font-semibold" : ""}`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="flex flex-col gap-2">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoiceNumber={invoice.invoiceNumber}
              companyName={invoice.companyName}
              vendorName={invoice.vendorName}
              amount={invoice.amount}
              date={invoice.date}
              status={invoice.status}
              isSelected={selectedInvoice === invoice.id}
              onClick={() => handleInvoiceClick(invoice.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceSidebar;

