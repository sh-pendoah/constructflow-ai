import React, { useState, useEffect } from "react";
import { Link, CircleCheck } from "lucide-react";
import Alert from "@/components/alert";

interface GmailConnectMultipleProps {
  selectedWorkflows: string[];
  setConnectedWorkflows: any;
  connectedWorkflows: any;
}

interface WorkflowConnectionStatus {
  workflow: string;
  email: string;
  connected: boolean;
}

const GmailConnectMultiple: React.FC<GmailConnectMultipleProps> = ({
  selectedWorkflows,
  setConnectedWorkflows,
  connectedWorkflows,
}) => {
  // Map workflow IDs to display names and OAuth workflow types
  const workflowNames: { [key: string]: string } = {
    invoices: "Invoices & Bills",
    logs: "Daily Logs & Field Reports",
    compliance: "Compliance Documents",
  };

  // Map workflow IDs to OAuth workflow types
  const workflowOAuthMap: { [key: string]: "invoices" | "dailyLogs" | "compliance" } = {
    invoices: "invoices",
    dailyLogs: "dailyLogs",
    compliance: "compliance",
  };

  // State to track which workflows are connected

  // Load connection status from localStorage on mount and handle OAuth callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for OAuth callback first
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const email = urlParams.get("email");
      const error = urlParams.get("error");

      if (error) {
        console.error("[GmailConnectMultiple] OAuth error:", error);
        const errorDetails = urlParams.get("details");
        let errorMessage = `OAuth Error: ${error}`;
        if (errorDetails) {
          errorMessage += `\nDetails: ${decodeURIComponent(errorDetails)}`;
        }
        if (error === "missing_credentials") {
          errorMessage += "\n\n⚠️ Missing GOOGLE_CLIENT_SECRET environment variable!\n\n";
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // If we have code and state but no email, redirect to API route to exchange code for email
      if (code && state && !email) {
        
        const apiUrl = new URL("/api/auth/google/callback", window.location.origin);
        apiUrl.searchParams.set("code", code);
        apiUrl.searchParams.set("state", state);
        
        window.location.href = apiUrl.toString();
        return;
      }
      // If we have code, state, and email, save the connection
      if (code && state && email) {
        try {
          const stateData = JSON.parse(state);
          const { workflow } = stateData;

          // Load existing connections
          const savedConnections = localStorage.getItem("gmail_workflow_connections");
          let existingConnections: WorkflowConnectionStatus[] = [];
          
          if (savedConnections) {
            try {
              existingConnections = JSON.parse(savedConnections);
            } catch (error) {
              console.error("Error parsing saved connections:", error);
            }
          }

          // Check if workflow is already connected
          const existingConnection = existingConnections.find((c) => c.workflow === workflow);
          
          if (!existingConnection) {
            // Use the actual email from Google OAuth
            const newConnections = [
              ...existingConnections,
              { workflow, email, connected: true },
            ];
            setConnectedWorkflows(newConnections);
            localStorage.setItem("gmail_workflow_connections", JSON.stringify(newConnections));
          } else {
            // Update existing connection with new email if different
            const updatedConnections = existingConnections.map((c) =>
              c.workflow === workflow ? { ...c, email, connected: true } : c
            );
            setConnectedWorkflows(updatedConnections);
            localStorage.setItem("gmail_workflow_connections", JSON.stringify(updatedConnections));
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return; // Exit early after handling callback
        } catch (error) {
          console.error("Error processing OAuth callback:", error);
        }
      }

      // Load saved connections if no callback
      const savedConnections = localStorage.getItem("gmail_workflow_connections");
      if (savedConnections) {
        try {
          const connections: WorkflowConnectionStatus[] = JSON.parse(savedConnections);
          setConnectedWorkflows(connections);
        } catch (error) {
          console.error("Error parsing saved connections:", error);
        }
      }
    }
  }, []);

  const connectGmail = (workflow: "invoices" | "dailyLogs" | "compliance") => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error("[GmailConnectMultiple] Google Client ID is not configured");
      alert("Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.");
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const stateData = JSON.stringify({ workflow });

    // Define scopes - space-separated for Google OAuth
    const scopes = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile", // Additional scope for better email access
    ].join(" ");

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state: stateData,
      include_granted_scopes: "true", // Include previously granted scopes
    });

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    window.location.href = oauthUrl;
  };

  const handleConnect = (workflow: string) => {
    const oauthWorkflow = workflowOAuthMap[workflow] as "invoices" | "dailyLogs" | "compliance";
    if (oauthWorkflow) {
      connectGmail(oauthWorkflow);
    }
  };

  const getConnectionStatus = (workflow: string): WorkflowConnectionStatus | null => {
    // Check both the workflow ID and the mapped OAuth workflow type
    const oauthWorkflow = workflowOAuthMap[workflow];
    return connectedWorkflows.find(
      (c: any) => c.workflow === workflow || c.workflow === oauthWorkflow
    ) || null;
  };

  const getEmailForWorkflow = (workflow: string): string => {
    const oauthWorkflow = workflowOAuthMap[workflow] || workflow;
    const connection = getConnectionStatus(workflow);
    if (connection && connection.connected) {
      return connection.email;
    }
    // Default emails based on workflow
    if (workflow === "logs") {
      return "Dailylogs@company.com";
    }
    return `${workflow}@company.com`;
  };

  // Listen for storage changes (in case connection is updated from another tab/window)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "gmail_workflow_connections" && e.newValue) {
          try {
            const connections: WorkflowConnectionStatus[] = JSON.parse(e.newValue);
            setConnectedWorkflows(connections);
          } catch (error) {
            console.error("Error parsing storage change:", error);
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Title Section */}
      <div className="w-full flex flex-col gap-0.5">
        <h1 className="text-h3 text-primary">Connect Your Gmail Accounts</h1>
        <p className="text-body-copy text-primary">
          Connect a Gmail for each workflow.
        </p>
      </div>

      {/* Workflow Items */}
      <div className="w-full flex flex-col gap-3">
        {selectedWorkflows.map((workflow) => {
          const connection = getConnectionStatus(workflow);
          const isConnected = connection?.connected || false;
          const email = getEmailForWorkflow(workflow);
          
          return (
            <div
              key={workflow}
              className="w-full flex items-center gap-3 py-2 px-4 pl-4 border border-custom rounded-lg"
            >
              <h3 className="text-h6 text-dark flex-1">
                {workflowNames[workflow] || workflow}
              </h3>
              {isConnected ? (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-[44px] py-3 px-3 rounded-lg bg-transparent text-button text-primary cursor-default"
                  disabled
                >
                  <CircleCheck className="w-5 h-5 text-success" />
                  <span className="text-start text-success">
                    Connected:
                    <br />
                    {email}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConnect(workflow)}
                  className="flex items-center justify-center gap-2 h-[44px] py-3 px-3 rounded-lg border border-radio-inactive bg-transparent hover:bg-gray-50 transition-colors text-button text-dark cursor-pointer"
                >
                  <Link className="w-5 h-5 text-primary" />
                  <span>Continue With Google</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip Alert */}
      {/* <Alert
        heading="Tip"
        bodyText="You can use the same Gmail for multiple workflows by connecting it multiple times"
        variant="tip"
        showIcon={true}
      /> */}
    </div>
  );
};

export default GmailConnectMultiple;
