"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/progress-bar";
import RadioCard from "@/components/radio-card";
import Alert from "@/components/alert";
import BackButton from "@/components/back-button";
import GmailInstructions from "@/components/gmail-instructions";
import GmailAccountSelection from "@/components/gmail-account-selection";
import WorkflowSelection from "@/components/workflow-selection";
import GmailConnectOne from "@/components/gmail-connect-one";
import GmailConnectMultiple from "@/components/gmail-connect-multiple";
import { useAppSelector } from "@/Redux/hooks";
import { RootState } from "@/Redux/store";
import { setOnboardingApiSuccess, setOnboardingStepsData } from "@/Redux/reducers/auth";
import { useDispatch } from "react-redux";
import authActions from "@/Redux/actions/auth";
import { Loader2 } from "lucide-react";

const OnboardingStep2 = () => {
  const router = useRouter();
  const [gmailUsage, setGmailUsage] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGmailSelection, setShowGmailSelection] = useState(false);
  const [showWorkflowSelection, setShowWorkflowSelection] = useState(false);
  const [showGmailConnect, setShowGmailConnect] = useState(false);
  const [gmailAccountType, setGmailAccountType] = useState<string>("");
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([
    "invoices",
  ]);
  const [connectedWorkflows, setConnectedWorkflows] = useState<string[]>([]);
  const { onboardingStepsData,onboardingApiSuccess, onboardingApiLoading  } = useAppSelector((state: RootState) => state.auth);  
  const dispatch = useDispatch();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailUsage) {
      return;
    }

    // If "no" is selected, show instructions
    if (gmailUsage === "no") {
      setShowInstructions(true);
      dispatch(setOnboardingStepsData({
        ...onboardingStepsData,
        usesGmail: "no",
      }));
    } else if (gmailUsage === "yes") {
      // If "yes" is selected, show Gmail account selection
      setShowGmailSelection(true);
      dispatch(setOnboardingStepsData({
        ...onboardingStepsData,
        usesGmail: "yes",
      }));
    }
  };

  const handleContinueFromInstructions = () => {
    // Handle continuation after instructions
    setGmailUsage("yes");
    setShowInstructions(false);
    setShowGmailSelection(true);

    // router.push("/onboarding/step-3");
  };

  const handleContinueFromGmailSelection = () => {
    if (!gmailAccountType) {
      return;
    }
    dispatch(setOnboardingStepsData({
      ...onboardingStepsData,
      gmailAccountType: gmailAccountType === "one" ? "single" : "separate",
    }));
    // Show workflow selection after Gmail account selection
    setShowGmailSelection(false);
    setShowWorkflowSelection(true);
  };

  useEffect(() => {
    const isWorkflowSelected = localStorage.getItem("isWorkflowSelected");
    const selectedWorkflows:any = localStorage.getItem("selectedWorkflows");
    const gmailAccountType = localStorage.getItem("oneGmailForAll");
    if (isWorkflowSelected && selectedWorkflows && !gmailAccountType) {
      setSelectedWorkflows(JSON.parse(selectedWorkflows));
      setShowWorkflowSelection(false);
      setShowGmailConnect(true);
    } else if (gmailAccountType) {
      setGmailAccountType('one')
      setSelectedWorkflows(JSON.parse(selectedWorkflows));
      setShowWorkflowSelection(false);
      setShowGmailConnect(true);
    }
  }, []);

  const handleContinueFromWorkflowSelection = () => {
    dispatch(setOnboardingStepsData({
      ...onboardingStepsData,
      selectedWorkflows: selectedWorkflows,
    }));
    // Show Gmail connection screen after workflow selection
    setShowWorkflowSelection(false);
    setShowGmailConnect(true);
    localStorage.setItem("selectedWorkflows", JSON.stringify(selectedWorkflows));
    if(gmailAccountType === "one") {
      localStorage.setItem("oneGmailForAll", "true");
    } else {
      localStorage.setItem("isWorkflowSelected", "true");
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("isWorkflowSelected");
    localStorage.removeItem("selectedWorkflows");
    localStorage.removeItem("gmail_workflow_connections");
    localStorage.removeItem("gmail_one_connection");
    localStorage.removeItem("oneGmailForAll");
    setConnectedWorkflows([]);
  };

  const handleContinueFromGmailConnect = () => {
    clearLocalStorage();
    const formData = new FormData();
    // formData.append("gmailAccountType", onboardingStepsData?.gmailAccountType || "");
    // formData.append("selectedWorkflows", JSON.stringify(onboardingStepsData?.selectedWorkflows || []));
    // formData.append("usesGmail", onboardingStepsData?.usesGmail || "");
    formData.append("step", "2");
    dispatch(authActions.onboardingApiRequest(formData));
  };

  
  useEffect(() => {
    if (onboardingApiSuccess) {
      router.push("/onboarding/step-3");
      dispatch(setOnboardingApiSuccess(false));
    }
  }, [onboardingApiSuccess]);

  const handleWorkflowChange = (workflow: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkflows([...selectedWorkflows, workflow]);
    } else {
      setSelectedWorkflows(selectedWorkflows.filter((w) => w !== workflow));
    }
  };

  const handleBackFromInstructions = () => {
    setShowInstructions(false);
  };

  const handleBackFromGmailSelection = () => {
    setShowGmailSelection(false);
  };

  const handleBackFromWorkflowSelection = () => {
    setShowWorkflowSelection(false);
    setShowGmailSelection(true);
  };

  const handleBackFromGmailConnect = () => {
    clearLocalStorage();

    setShowGmailConnect(false);
    setShowWorkflowSelection(true); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-[672px] flex flex-col gap-8 sm:gap-[50px] px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-11 pb-6 sm:pb-8 rounded-xl sm:rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Container */}
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-4 sm:gap-8">
            <BackButton
              href={
                !showInstructions &&
                !showGmailSelection &&
                !showWorkflowSelection &&
                !showGmailConnect
                  ? "/onboarding/step-1"
                  : undefined
              }
              onClick={
                showInstructions
                  ? handleBackFromInstructions
                  : showGmailSelection
                    ? handleBackFromGmailSelection
                    : showWorkflowSelection
                      ? handleBackFromWorkflowSelection
                      : showGmailConnect
                        ? handleBackFromGmailConnect
                        : undefined
              }
            />
            <h2 className="text-label text-primary">Company Setup</h2>
          </div>

          {/* Progress and Content Container */}
          <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-11">
            {/* Progress Bar */}
            <ProgressBar currentStep={2} totalSteps={7} />

            {/* Content Container */}
            {!showInstructions &&
            !showGmailSelection &&
            !showWorkflowSelection &&
            !showGmailConnect ? (
              <>
                <div className="w-full flex flex-col gap-8">
                  {/* Question Section */}
                  <div className="w-full flex flex-col gap-0.5">
                    <h1 className="text-[22px] sm:text-[24px] md:text-h3 leading-[1.5em] font-semibold text-primary font-poppins">
                      Does Your Company Use Gmail?
                    </h1>
                    <p className="text-body-copy text-primary">
                      Worklighter connects to Gmail accounts to monitor and
                      process documents.
                    </p>
                  </div>

                  {/* Options */}
                  <div className="w-full flex flex-col gap-3">
                    <RadioCard
                      label="Yes, we use Gmail"
                      supportingText="We'll connect your Gmail account(s) in the next step"
                      value="yes"
                      selected={gmailUsage === "yes"}
                      onChange={setGmailUsage}
                    />
                    <RadioCard
                      label="No, we use Outlook/Yahoo/Other"
                      supportingText="We'll show you how to set up Gmail forwarding"
                      value="no"
                      selected={gmailUsage === "no"}
                      onChange={setGmailUsage}
                    />
                  </div>

                  {/* Alert */}
                  <Alert
                    heading="Important"
                    bodyText="Worklighter only supports Gmail accounts\n\nIf you don't use Gmail, we'll guide you through a simple setup process"
                    variant="warning"
                    showIcon={true}
                  />
                </div>

                {/* Continue Button */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!gmailUsage}
                  className="w-full flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {onboardingApiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                </button>
              </>
            ) : showInstructions ? (
              <>
                <GmailInstructions />

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={handleContinueFromInstructions}
                  className="w-full flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer"
                >
                  I've Set Up Forwarding - Continue
                </button>
              </>
            ) : showGmailSelection ? (
              <>
                <GmailAccountSelection
                  gmailAccountType={gmailAccountType}
                  onGmailAccountTypeChange={setGmailAccountType} 
                />

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={handleContinueFromGmailSelection}
                  disabled={!gmailAccountType}
                  className="w-full flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </>
            ) : showWorkflowSelection ? (
              <>
                <WorkflowSelection
                  selectedWorkflows={selectedWorkflows}
                  onWorkflowChange={handleWorkflowChange}
                />

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={handleContinueFromWorkflowSelection}
                  className="w-full flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                {gmailAccountType === "one" ? (
                  <GmailConnectOne selectedWorkflows={selectedWorkflows} setConnectedWorkflows={setConnectedWorkflows} connectedWorkflows={connectedWorkflows} />
                ) : (
                  <GmailConnectMultiple connectedWorkflows={connectedWorkflows} selectedWorkflows={selectedWorkflows} setConnectedWorkflows={setConnectedWorkflows}/>
                )}

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={handleContinueFromGmailConnect}
                  disabled={onboardingApiLoading}
                  className="w-full flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2;

