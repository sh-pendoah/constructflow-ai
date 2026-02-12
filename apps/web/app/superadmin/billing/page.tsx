"use client";

import React, { useState } from "react";
import DataTable, { Column } from "@/components/data-table";
import Pagination from "@/components/pagination";

interface Transaction {
  id: string;
  company: string;
  planSubscription: string;
  amount: number;
  date: string;
  status: "Completed" | "Failed" | "Pending";
}

const SuperAdminBillingPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Mock data for transactions - Using more realistic data to match the design
  const allTransactions: Transaction[] = [
    // Pro Plan companies (10 companies)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `pro-${i + 1}`,
      company: `Pro Company ${i + 1}`,
      planSubscription: "Pro Plan",
      amount: 1499.0,
      date: `2024-12-${28 - i}`,
      status: "Completed" as const,
    })),
    // Growth Plan companies (14 companies)
    ...Array.from({ length: 14 }, (_, i) => ({
      id: `growth-${i + 1}`,
      company: `Growth Company ${i + 1}`,
      planSubscription: "Growth Plan",
      amount: 799.0,
      date: `2024-12-${28 - i}`,
      status: "Failed" as const,
    })),
    // Starter Plan companies (12 companies)
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `starter-${i + 1}`,
      company: `Starter Company ${i + 1}`,
      planSubscription: "Starter Plan",
      amount: 299.0,
      date: `2024-12-${28 - i}`,
      status: "Completed" as const,
    })),
    // Sample companies with actual names
    {
      id: "1",
      company: "Silverstone Construction",
      planSubscription: "Pro Plan",
      amount: 1499.0,
      date: "2024-12-28",
      status: "Completed",
    },
    {
      id: "2",
      company: "Titan Commercial Builders",
      planSubscription: "Pro Plan",
      amount: 1499.0,
      date: "2024-12-27",
      status: "Completed",
    },
    {
      id: "3",
      company: "Redwood Builders LLC",
      planSubscription: "Growth Plan",
      amount: 799.0,
      date: "2024-12-26",
      status: "Completed",
    },
    {
      id: "4",
      company: "Harbor Concrete & Masonry",
      planSubscription: "Growth Plan",
      amount: 799.0,
      date: "2024-12-25",
      status: "Completed",
    },
    {
      id: "5",
      company: "Apex Development Group",
      planSubscription: "Starter Plan",
      amount: 299.0,
      date: "2024-12-20",
      status: "Completed",
    },
    // Add more transactions for pagination
    ...Array.from({ length: 100 }, (_, i) => ({
      id: `extra-${i + 1}`,
      company: `Company ${i + 100}`,
      planSubscription: ["Pro Plan", "Growth Plan", "Starter Plan"][i % 3],
      amount: [1499.0, 799.0, 299.0][i % 3],
      date: `2024-12-${20 - Math.floor(i / 5)}`,
      status: (i % 5 === 0 ? "Failed" : i % 5 === 1 ? "Pending" : "Completed") as "Completed" | "Failed" | "Pending",
    })),
  ];

  // Calculate pagination
  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = allTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate statistics
  const totalRevenue = allTransactions
    .filter((t) => t.status === "Completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const avgRevenuePerCompany = Math.round(totalRevenue / 28); // Assuming 28 companies
  const failedPayments = allTransactions.filter((t) => t.status === "Failed").length;

  // Revenue by plan type with company counts
  const revenueByPlan = {
    Pro: {
      revenue: allTransactions
        .filter((t) => t.planSubscription === "Pro Plan" && t.status === "Completed")
        .reduce((sum, t) => sum + t.amount, 0),
      companies: new Set(
        allTransactions
          .filter((t) => t.planSubscription === "Pro Plan")
          .map((t) => t.company)
      ).size,
    },
    Growth: {
      revenue: allTransactions
        .filter((t) => t.planSubscription === "Growth Plan" && t.status === "Completed")
        .reduce((sum, t) => sum + t.amount, 0),
      companies: new Set(
        allTransactions
          .filter((t) => t.planSubscription === "Growth Plan")
          .map((t) => t.company)
      ).size,
    },
    Starter: {
      revenue: allTransactions
        .filter((t) => t.planSubscription === "Starter Plan" && t.status === "Completed")
        .reduce((sum, t) => sum + t.amount, 0),
      companies: new Set(
        allTransactions
          .filter((t) => t.planSubscription === "Starter Plan")
          .map((t) => t.company)
      ).size,
    },
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-white border-[#10B981] text-[#10B981]";
      case "Failed":
        return "bg-white border-[#EF4444] text-[#EF4444]";
      case "Pending":
        return "bg-white border-[#F59E0B] text-[#F59E0B]";
      default:
        return "bg-white border-gray-500 text-gray-500";
    }
  };

  // Define table columns
  const columns: Column<Transaction>[] = [
    {
      key: "company",
      label: "Company",
      render: (_value: string, row: Transaction) => (
        <span className="text-supporting text-primary font-sf-pro">{row.company}</span>
      ),
    },
    {
      key: "planSubscription",
      label: "Plan Subscription",
      render: (_value: string, row: Transaction) => (
        <span className="text-supporting text-primary font-sf-pro">{row.planSubscription}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (_value: string, row: Transaction) => (
        <span className="text-supporting text-primary font-semibold!">
          ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (_value: string, row: Transaction) => (
        <span className="text-supporting text-primary font-sf-pro">{row.date}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_value: string, row: Transaction) => (
        <span
          className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-sf-pro border ${getStatusBadgeClass(
            row.status
          )}`}
          style={{ padding: "4px 8px" }}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header Container */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-h3 text-primary font-poppins font-semibold">Billing & Revenue</h1>
        <p className="text-body-copy text-primary font-sf-pro">
          All onboarded construction firms
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
          <span className="text-h3 text-primary font-poppins font-semibold" style={{ height: "39px", display: "flex", alignItems: "center" }}>
            ${totalRevenue.toLocaleString()}
          </span>
          <span className="text-label text-primary font-sf-pro">Total Revenue</span>
        </div>

        {/* Avg Revenue/Company */}
        <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
          <span className="text-h3 text-primary font-poppins font-semibold" style={{ height: "39px", display: "flex", alignItems: "center" }}>
            ${avgRevenuePerCompany.toLocaleString()}
          </span>
          <span className="text-label text-primary font-sf-pro">Avg Revenue/Company</span>
        </div>

        {/* Failed Payments */}
        <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
          <span className="text-h3 font-poppins font-semibold" style={{ height: "39px", display: "flex", alignItems: "center", color: "#EF4444" }}>
            {failedPayments}
          </span>
          <span className="text-label text-primary font-sf-pro">Failed Payments</span>
        </div>
      </div>

      {/* Revenue by Plan Type Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h6 text-primary font-poppins font-semibold">
          Revenue by Plan Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Starter Plan Revenue */}
          <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
            <span className="text-label text-primary font-sf-pro">Starter</span>
            <span className="text-h3 text-primary font-poppins font-semibold" style={{ height: "39px", display: "flex", alignItems: "center" }}>
              ${revenueByPlan.Starter.revenue.toLocaleString()}
            </span>
            <span className="text-label text-primary font-sf-pro">
              {revenueByPlan.Starter.companies} companies
            </span>
          </div>

          {/* Growth Plan Revenue */}
          <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
            <span className="text-label text-primary font-sf-pro">Growth</span>
            <span className="text-h3 text-primary font-poppins font-semibold" style={{ height: "39px", display: "flex", alignItems: "center" }}>
              ${revenueByPlan.Growth.revenue.toLocaleString()}
            </span>
            <span className="text-label text-primary font-sf-pro">
              {revenueByPlan.Growth.companies} companies
            </span>
          </div>

          {/* Pro Plan Revenue */}
          <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
            <span className="text-label text-primary font-sf-pro">Pro</span>
            <span className="text-h3 text-primary font-poppins font-semibold" style={{ height: "39px", display: "flex", alignItems: "center" }}>
              ${revenueByPlan.Pro.revenue.toLocaleString()}
            </span>
            <span className="text-label text-primary font-sf-pro">
              {revenueByPlan.Pro.companies} companies
            </span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex flex-col bg-white border border-[#DEE0E3] rounded-lg overflow-hidden">
        {/* Search Container / Header */}
        <div
          className="flex items-center border-b border-[#DEE0E3]"
          style={{ padding: "20px 16px" }}
        >
          <h3 className="text-h6 text-primary font-poppins font-semibold">
            Recent Transactions
          </h3>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={paginatedTransactions} />

        {/* Pagination */}
        {allTransactions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allTransactions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            itemName="transactions"
          />
        )}
      </div>
    </div>
  );
};

export default SuperAdminBillingPage;

