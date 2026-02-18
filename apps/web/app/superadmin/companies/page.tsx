"use client";

import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import DataTable, { Column } from "@/components/data-table";
import Pagination from "@/components/pagination";
import CompanyDetailsModal from "@/components/company-details-modal";

interface Company {
  id: string;
  companyName: string;
  companyUrl: string;
  status: "Active" | "Inactive";
  plan: string;
  workflows: string[];
  users: number;
}

const SuperAdminCompaniesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPlanType, setFilterPlanType] = useState("All");
  const [isCompanyDetailsModalOpen, setIsCompanyDetailsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const itemsPerPage = 15;

  // Mock data for companies
  const allCompanies: Company[] = [
    {
      id: "1",
      companyName: "Silverstone Construction",
      companyUrl: "silverstone.docflow-360.com",
      status: "Active",
      plan: "Pro",
      workflows: ["Invoices", "Daily Logs", "Compliance"],
      users: 12,
    },
    {
      id: "2",
      companyName: "Redwood Builders LLC",
      companyUrl: "redwood.docflow-360.com",
      status: "Inactive",
      plan: "Growth",
      workflows: ["Invoices", "Daily Logs"],
      users: 8,
    },
    {
      id: "3",
      companyName: "Apex Development Group",
      companyUrl: "apex.docflow-360.com",
      status: "Active",
      plan: "Starter",
      workflows: ["Invoices", "Compliance"],
      users: 3,
    },
    {
      id: "4",
      companyName: "Harbor Concrete & Masonry",
      companyUrl: "harbor.docflow-360.com",
      status: "Active",
      plan: "Growth",
      workflows: ["Invoices", "Compliance"],
      users: 6,
    },
    {
      id: "5",
      companyName: "Ironclad Construction Co",
      companyUrl: "ironclad.docflow-360.com",
      status: "Inactive",
      plan: "Pro",
      workflows: ["Invoices", "Daily Logs", "Compliance"],
      users: 15,
    },
    {
      id: "6",
      companyName: "Titan Commercial Builders",
      companyUrl: "titan.docflow-360.com",
      status: "Active",
      plan: "Pro",
      workflows: ["Invoices", "Daily Logs", "Compliance"],
      users: 28,
    },
    {
      id: "7",
      companyName: "Summit Roofing Solutions",
      companyUrl: "summit.docflow-360.com",
      status: "Active",
      plan: "Starter",
      workflows: ["Invoices", "Compliance"],
      users: 4,
    },
    {
      id: "8",
      companyName: "Cornerstone Renovations",
      companyUrl: "cornerstone.docflow-360.com",
      status: "Active",
      plan: "Growth",
      workflows: ["Invoices", "Daily Logs"],
      users: 9,
    },
    // Add more to match the 127 total
    ...Array.from({ length: 119 }, (_, i) => ({
      id: `${i + 9}`,
      companyName: `Company ${i + 9}`,
      companyUrl: `company${i + 9}.docflow-360.com`,
      status: (i % 3 === 0 ? "Inactive" : "Active") as "Active" | "Inactive",
      plan: ["Pro", "Growth", "Starter"][i % 3],
      workflows: ["Invoices", "Daily Logs", "Compliance"].slice(0, (i % 3) + 1),
      users: Math.floor(Math.random() * 30) + 1,
    })),
  ];

  // Filter companies
  const filteredCompanies = allCompanies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.companyUrl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || company.status === filterStatus;
    const matchesPlan = filterPlanType === "All" || company.plan === filterPlanType;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  // Calculate statistics
  const totalRevenue = 47200;
  const activeCompanies = allCompanies.filter((c) => c.status === "Active").length;
  const totalDocumentsProcessed = 47832;
  const documentsToday = 1247;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "Active") {
      return "bg-white border border-[#10B981] text-[#10B981]";
    }
    return "bg-white border border-[#EF4444] text-[#EF4444]";
  };

  // Define table columns
  const columns: Column<Company>[] = [
    {
      key: "company",
      width: "25%",
      label: "Company",
      render: (_value: string, row: Company) => (
        <div className="flex flex-col gap-1 w-full">
          <span className="text-body-copy text-primary font-poppins font-semibold! whitespace-nowrap">
            {row.companyName}
          </span>
          <span className="text-supporting text-[#2E3338] font-sf-pro">
            {row.companyUrl}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      width: "10%",
      label: "Status",
      render: (_value: string, row: Company) => (
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
    {
      width: "10%",
      key: "plan",
      label: "Plan",
      render: (_value: string, row: Company) => (
        <span className="text-supporting text-primary font-sf-pro whitespace-nowrap">{row.plan}</span>
      ),
    },
    {
      key: "workflows",
      label: "Workflows",
      width: "25%",
      render: (_value: string, row: Company) => (
        <div className="flex items-center gap-1 ">
          {row.workflows.map((workflow, index) => (
            <span
              key={index}
              className="inline-flex items-center whitespace-nowrap justify-center px-2 py-1 rounded-lg text-supporting text-primary font-sf-pro border border-[#DEE0E3] bg-white"
              style={{ padding: "4px 8px" }}
            >
              {workflow}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "users",
      label: "Users",
      width: "10%",
      render: (_value: string, row: Company) => (
        <span className="text-supporting text-primary font-sf-pro whitespace-nowrap">{row.users}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "left",
      width: "20%",
      render: (_value: string, row: Company) => (
        <button
          onClick={() => {
            setSelectedCompany(row);
            setIsCompanyDetailsModalOpen(true);
          }}
          className="text-button whitespace-nowrap text-[#2E3338] font-poppins font-semibold hover:underline cursor-pointer"
          style={{ padding: "12px 8px" }}
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header Container */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-h3 text-primary font-poppins font-semibold">Companies</h1>
        <p className="text-body-copy text-primary font-sf-pro">
          All onboarded construction firms
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
          <span className="text-h3 text-primary font-poppins font-semibold">
            ${totalRevenue.toLocaleString()}
          </span>
          <span className="text-label text-primary font-sf-pro">Total Revenue</span>
        </div>

        {/* Active Companies */}
        <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
          <span className="text-h3 text-primary font-poppins font-semibold">
            {activeCompanies}
          </span>
          <span className="text-label text-primary font-sf-pro">Active Companies</span>
        </div>

        {/* Total Documents Processed */}
        <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-3">
            <span className="text-h3 text-primary font-poppins font-semibold">
              {totalDocumentsProcessed.toLocaleString()}
            </span>
            <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-sf-pro bg-[#ECFFF8] border border-[#10B981] text-[#10B981]">
              All time
            </span>
          </div>
          <span className="text-label text-primary font-sf-pro">
            Total Documents Processed
          </span>
        </div>

        {/* Documents Today */}
        <div className="bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(202,218,239,0.3)] p-4 flex flex-col items-center gap-0.5">
          <span className="text-h3 text-primary font-poppins font-semibold">
            {documentsToday.toLocaleString()}
          </span>
          <span className="text-label text-primary font-sf-pro">Documents Today</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex flex-col bg-white border border-[#DEE0E3] rounded-lg overflow-hidden">
        {/* Search and Filter Container */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-b border-[#DEE0E3]"
          style={{ padding: "20px 16px" }}
        >
          {/* Search Input */}
          <div className="flex-1 max-w-[373px]">
            <div className="relative flex items-center w-full px-3 py-2 h-[52px] rounded-lg border border-[#DEE0E3] bg-white">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Company by Name"
                className="flex-1 text-body-copy text-primary placeholder:text-[#6F7A85] outline-none bg-transparent font-sf-pro pr-3"
              />
              <Search className="w-6 h-6 text-primary flex-shrink-0" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none h-[52px] px-4 py-2 pr-10 rounded-lg border border-[#8A949E] bg-white text-button text-[#2E3338] font-poppins font-semibold cursor-pointer outline-none hover:border-primary transition-colors"
            >
              <option value="All">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
          </div>

          {/* Plan Type Filter */}
          <div className="relative">
            <select
              value={filterPlanType}
              onChange={(e) => {
                setFilterPlanType(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none h-[52px] px-4 py-2 pr-10 rounded-lg border border-[#8A949E] bg-white text-button text-[#2E3338] font-poppins font-semibold cursor-pointer outline-none hover:border-primary transition-colors"
            >
              <option value="All">Plan Type</option>
              <option value="Pro">Pro</option>
              <option value="Growth">Growth</option>
              <option value="Starter">Starter</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={paginatedCompanies} />

        {/* Pagination */}
        {filteredCompanies.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCompanies.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            itemName="companies"
          />
        )}
      </div>

      {/* Company Details Modal */}
      <CompanyDetailsModal
        isOpen={isCompanyDetailsModalOpen}
        onClose={() => {
          setIsCompanyDetailsModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onDisable={(companyId) => {
          // Add your disable logic here
        }}
        onActivate={(companyId) => {
          // Add your activate logic here
        }}
      />
    </div>
  );
};

export default SuperAdminCompaniesPage;


