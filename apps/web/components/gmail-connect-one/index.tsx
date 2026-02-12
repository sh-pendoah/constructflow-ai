import React, { useState, useEffect } from "react";
import { Check, Lightbulb, Lock, X, Link, CircleCheck } from "lucide-react";

interface GmailConnectOneProps {
  selectedWorkflows: string[];
  setConnectedWorkflows?: any;
  connectedWorkflows?: any;
}

const GmailConnectOne: React.FC<GmailConnectOneProps> = ({
  selectedWorkflows,
  setConnectedWorkflows,
  connectedWorkflows = [],
}) => {
  // Local state for connection status
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string>("");
  // Map workflow IDs to display names
  const workflowNames: { [key: string]: string } = {
    invoices: "Invoices & Bills",
    logs: "Daily Logs & Field Reports",
    compliance: "Compliance Documents (COI, WC)",
    materials: "Material Tickets & Receipts",
  };

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
        console.error("[GmailConnectOne] OAuth error:", error);
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
          const { workflowType, workflows } = stateData;

          // Check if this callback is for "connect one" (workflowType: "all")
          // or for "connect multiple" (has workflow property)
          if (workflowType === "all" || workflows) {
            // For "connect one", we save a single connection that covers all workflows
            const connectionData = {
              workflowType: "all", // Indicates single Gmail for all workflows
              email,
              connected: true,
              workflows: workflows || selectedWorkflows, // Use workflows from state or selectedWorkflows
            };

            localStorage.setItem("gmail_one_connection", JSON.stringify(connectionData));
            setIsConnected(true);
            setConnectedEmail(email);

            if (setConnectedWorkflows) {
              setConnectedWorkflows([connectionData]);
            }


            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
          // If it's not for "connect one", let "connect multiple" handle it
        } catch (error) {
          console.error("Error processing OAuth callback:", error);
        }
      }

      // Load saved connection if no callback
      const savedConnection = localStorage.getItem("gmail_one_connection");
      if (savedConnection) {
        try {
          const connection = JSON.parse(savedConnection);
          if (connection.connected && connection.email) {
            setIsConnected(true);
            setConnectedEmail(connection.email);
          }
        } catch (error) {
          console.error("Error parsing saved connection:", error);
        }
      }
    }
  }, [selectedWorkflows, setConnectedWorkflows]);

  // Listen for storage changes (in case connection is updated from another tab/window)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "gmail_one_connection" && e.newValue) {
          try {
            const connection = JSON.parse(e.newValue);
            if (connection.connected && connection.email) {
              setIsConnected(true);
              setConnectedEmail(connection.email);
              if (setConnectedWorkflows) {
                setConnectedWorkflows([connection]);
              }
            }
          } catch (error) {
            console.error("Error parsing storage change:", error);
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [setConnectedWorkflows]);

  const connectGmail = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error("[GmailConnectOne] Google Client ID is not configured");
      alert("Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.");
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const stateData = JSON.stringify({ 
      workflowType: "all", // Single Gmail for all workflows
      workflows: selectedWorkflows 
    });

    // Define scopes - space-separated for Google OAuth
    const scopes = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state: stateData,
      include_granted_scopes: "true",
    });

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Title Section */}
      <div className="w-full flex flex-col gap-0.5">
        <h1 className="text-h3 text-primary">Connect Your Gmail Accounts</h1>
        <p className="text-body-copy text-primary">
          Click below to authenticate with Google
        </p>
      </div>

      {/* Gmail Monitoring Section */}
      <div className="w-full flex flex-col gap-3 py-2 border border-custom rounded-lg">
        <div className="w-full flex flex-col gap-3 px-4">
          <h2 className="text-h6 text-dark">This Gmail will monitor</h2>
          <div className="w-full flex flex-col gap-2">
            {selectedWorkflows?.length > 0 && selectedWorkflows?.map((workflow) => (
              <div key={workflow} className="flex items-center gap-1">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-supporting text-dark">
                  {workflowNames[workflow] || workflow}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-classify Section */}
        <div className="w-full flex gap-6 pt-3 px-2 border-t border-[#C3CCD5]">
          <div className="flex items-start gap-1">
            <Lightbulb className="w-5 h-5 text-blue-info flex-shrink-0" />
            <span className="text-supporting text-blue-info">
              We'll automatically detect and classify document types
            </span>
          </div>

          {/* Continue With Google Button */}
          {isConnected ? (
            <button
              type="button"
              className="w-fit flex whitespace-nowrap items-center justify-center gap-2 h-[44px] py-3 px-3 rounded-lg bg-transparent text-button text-primary cursor-default"
              disabled
            >
              <CircleCheck className="w-5 h-5 text-success" />
              <span className="text-start text-success">
                Connected:
                <br />
                {connectedEmail}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={connectGmail}
              className="w-fit flex whitespace-nowrap items-center justify-center gap-2 h-[44px] py-3 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer"
            >
              <Link className="w-5 h-5 text-primary-button" />
              <span>Connect With Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Permissions Alert */}
      <div className="w-full flex flex-col gap-2 py-3 px-3 pl-4 rounded-lg border border-blue-info bg-blue-info">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-info flex-shrink-0" />
          <span className="text-supporting !font-bold text-primary">
            What we access:
          </span>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Check className="w-5 h-5 text-blue-info  flex-shrink-0" />
            <span className="text-supporting text-dark">
              Read emails with attachments only
            </span>
          </div>
          <div className="flex items-center gap-1">
            <X className="w-5 h-5 text-blue-info flex-shrink-0" />
            <span className="text-supporting text-dark">
              Never send emails from your account
            </span>
          </div>
          <div className="flex items-center gap-1">
            <X className="w-5 h-5 text-blue-info flex-shrink-0" />
            <span className="text-supporting text-dark">
              Never delete or modify emails
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmailConnectOne;
