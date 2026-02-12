"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Receipt, FileCheck2, ShieldCheck, CircleCheck } from "lucide-react";
import ConnectGmailModal from "@/components/connect-gmail-modal";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { authActions } from "@/Redux/actions/auth";

interface Workflow {
  id: string;
  title: string;
  icon: React.ReactNode;
  lastActivity: string;
  status: "Active" | "Inactive";
  email: string;
}

const WorkflowsPage = () => {
  const dispatch = useAppDispatch();
  const { workflows: workflowsData, isLoading, getWorkflowsError } = useAppSelector((state) => state.auth);
  const hasFetchedWorkflows = useRef(false);

  const [isConnectGmailModalOpen, setIsConnectGmailModalOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  // Fetch workflows on component mount
  useEffect(() => {
    if (!hasFetchedWorkflows.current) {
      dispatch(authActions.getWorkflowsRequest());
      hasFetchedWorkflows.current = true;
    }
  }, [dispatch]);

  // Helper function to get icon based on workflow key
  const getWorkflowIcon = (key: string) => {
    switch (key) {
      case "invoices":
        return <Receipt className="w-5 h-5 text-primary" />;
      case "daily_logs":
        return <FileCheck2 className="w-5 h-5 text-primary" />;
      case "compliance_alerts":
        return <ShieldCheck className="w-5 h-5 text-primary" />;
      default:
        return <Receipt className="w-5 h-5 text-primary" />;
    }
  };

  // Transform API data to Workflow format
  const workflows: Workflow[] = useMemo(() => {
    if (!workflowsData || !Array.isArray(workflowsData)) {
      return [];
    }

    return workflowsData.map((workflow: any) => ({
      id: workflow.key || "",
      title: workflow.name || "",
      icon: getWorkflowIcon(workflow.key),
      lastActivity: workflow.lastActivity
        ? `Last activity: ${workflow.lastActivity}`
        : "No activity yet",
      status: workflow.isActive ? "Active" : "Inactive",
      email: "Not connected", // API response doesn't include email, using placeholder
    }));
  }, [workflowsData]);

  const getStatusStyles = (status: "Active" | "Inactive") => {
    if (status === "Active") {
      return {
        bg: "bg-[#fff]",
        border: "border-[#10B981]",
        text: "text-[#10B981]",
      };
    } else {
      return {
        bg: "bg-[#fff]",
        border: "border-[#EF4444]",
        text: "text-[#EF4444]",
      };
    }
  };

  const handleConnect = (workflowId: string) => {
    // Add your connect logic here
  };

  const handleDisconnect = (workflowId: string) => {
    // Add your disconnect logic here
  };

  const handleConnectDifferentGmail = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setIsConnectGmailModalOpen(true);
  };

  const handleContinueWithGoogle = () => {
    if (selectedWorkflowId) {
      // Add your Google OAuth logic here
    }
  };

  return (
    <>
      {/* Section Header Container */}
      <div className="flex flex-col px-4 sm:px-0 gap-0.5 mb-6">
        <h2 className="text-lg sm:text-xl md:text-h4 text-primary font-poppins font-semibold">
          Active Workflows
        </h2>
        <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
          Enable or disable workflows for your organization
        </p>
      </div>

      {/* Workflow List Container */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-[#6F7A85] font-sf-pro">Loading workflows...</p>
          </div>
        ) : getWorkflowsError ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-[#EF4444] font-sf-pro">{getWorkflowsError}</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-[#6F7A85] font-sf-pro">No workflows found</p>
          </div>
        ) : (
          workflows.map((workflow) => {
          const statusStyles = getStatusStyles(workflow.status);
          return (
            <div
              key={workflow.id}
              className="flex flex-col gap-4 p-4 bg-white border border-[#DEE0E3] rounded-xl"
            >
              {/* Workflow Item Header */}
              <div className="flex items-center gap-4 p-4 bg-[#F3F5F7] rounded-lg">
                <div className="flex flex-col gap-2 flex-1">
                  {/* Workflow Item Title Container */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full p-1.5">
                      {workflow.icon}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-h6 text-primary font-poppins font-semibold">
                      {workflow.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
                    {workflow.lastActivity}
                  </p>
                </div>
                {/* Status Tag */}
                <span
                  className={`px-2 h-6 flex items-center justify-center rounded-full border ${statusStyles.bg} ${statusStyles.border} ${statusStyles.text}`}
                >
                  <span className="text-xs font-sf-pro">{workflow.status}</span>
                </span>
              </div>

              {/* Workflow Item Footer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Workflow Item Email Container */}
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-sm text-[#6F7A85] font-sf-pro">
                    Connected Gmail Account
                  </p>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
                      {workflow.email}
                    </p>
                  </div>
                </div>

                {/* Workflow Item Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {workflow.status === "Active" ? (
                    <button
                      onClick={() => handleDisconnect(workflow.id)}
                      className="h-[35px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EF4444] text-[#EF4444] rounded-lg hover:bg-[#FFEDED] transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(workflow.id)}
                      className="h-[35px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#10B981] text-[#10B981] rounded-lg hover:bg-[#ECFFF8] transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
                    >
                      Connect
                    </button>
                  )}
                  <button
                    onClick={() => handleConnectDifferentGmail(workflow.id)}
                    className="h-[35px] cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-gray-50 transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
                  >
                    Connected Different Gmail
                  </button>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Connect Gmail Modal */}
      <ConnectGmailModal
        isOpen={isConnectGmailModalOpen}
        onClose={() => {
          setIsConnectGmailModalOpen(false);
          setSelectedWorkflowId(null);
        }}
        onContinue={handleContinueWithGoogle}
      />
    </>
  );
};

export default WorkflowsPage;


