"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/progress-bar";
import BackButton from "@/components/back-button";
import FileUpload from "@/components/file-upload";
import Alert from "@/components/alert";
import DownloadTemplateButton from "@/components/download-template-button";
import { setOnboardingApiSuccess, setOnboardingStepsData } from "@/Redux/reducers/auth";
import { useAppSelector } from "@/Redux/hooks";
import { RootState } from "@/Redux/store";
import { useDispatch } from "react-redux";
import authActions from "@/Redux/actions/auth";
import { Loader2 } from "lucide-react";
const OnboardingStep3 = () => {
  const router = useRouter();
  // const [projectsFiles, setProjectsFiles] = useState<File[]>([]);
  // const [costCodesFiles, setCostCodesFiles] = useState<File[]>([]);
  // const [workersCompFiles, setWorkersCompFiles] = useState<File[]>([]);
  const { onboardingStepsData, onboardingApiSuccess, onboardingApiLoading } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  // const handleProjectsFiles = (files: File[]) => {
  //   setProjectsFiles(files);
  // };

  const handleCostCodesFiles = (files: File[]) => {
    // setCostCodesFiles(files);
    dispatch(setOnboardingStepsData({
      ...onboardingStepsData,
      costCodesFiles: files,
    }));
  };

  const handleWorkersCompFiles = (files: File[]) => {
    // setWorkersCompFiles(files);
    dispatch(setOnboardingStepsData({
      ...onboardingStepsData,
      workersCompFiles: files,
    }));
  };

  const handleDownloadTemplate = (type: string) => {
    // Handle template download
  };

  const handleContinue = () => {
    // Handle form submission
    const formData = new FormData();
    // 6. costCodesFiles (File)
    if (onboardingStepsData?.costCodesFiles && Array.isArray(onboardingStepsData.costCodesFiles)) {
      onboardingStepsData.costCodesFiles.forEach((file: File) => {
        formData.append("costCodesFiles", file);
      });
    }

    // 7. workersCompFiles (File)
    if (onboardingStepsData?.workersCompFiles && Array.isArray(onboardingStepsData.workersCompFiles)) {
      onboardingStepsData.workersCompFiles.forEach((file: File) => {
        formData.append("workersCompFiles", file);
      });
    }
    formData.append("step", "3");
    dispatch(authActions.onboardingApiRequest(formData));
  };

  useEffect(() => {
    if (onboardingApiSuccess) {
      router.push("/onboarding/step-4");
      dispatch(setOnboardingStepsData(null));
      dispatch(setOnboardingApiSuccess(false));
    }
  }, [onboardingApiSuccess]);

  const handleSkip = () => {
    // Skip to next step
    router.push("/onboarding/step-4");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-[672px] flex flex-col gap-8 sm:gap-[50px] px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-11 pb-6 sm:pb-8 rounded-xl sm:rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Container */}
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-4 sm:gap-8">
            <BackButton href="/onboarding/step-2" />
            <h2 className="text-label text-primary">Company Setup</h2>
          </div>

          {/* Progress and Content Container */}
          <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-11">
            {/* Progress Bar */}
            <ProgressBar currentStep={3} totalSteps={7} />

            {/* Content Container */}
            <div className="w-full flex flex-col gap-8">
              {/* Title Section */}
              <div className="w-full flex flex-col gap-0.5">
                <h1 className="text-h3 text-primary">
                  Import Your Company Data
                </h1>
                <p className="text-body-copy text-primary">
                  Optional - You can add or update this anytime later
                </p>
              </div>

              {/* Add Your Active Projects */}
              {/* <div className="w-full flex flex-col gap-4 p-4 pb-3 border border-custom rounded-xl">
                <h3 className="text-button text-primary">
                  Add Your Active Projects
                </h3>

                <Alert
                  heading="Why we need jobs"
                  bodyText="Helps us route invoices correctly and track costs per project."
                  variant="tip"
                  showIcon={true}
                />

                <FileUpload
                  heading="Click to upload multiple files (or Drag & Drop)"
                  bodyText="Supported formats: CSV, PDF, DOC, XLS"
                  accept=".csv,.pdf,.doc,.docx,.xls,.xlsx"
                  multiple={true}
                  onFilesSelect={handleProjectsFiles}
                />
              </div> */}

              {/* Cost Codes */}
              <div className="w-full flex flex-col gap-4 p-4 pb-3 border border-custom rounded-xl">
                <h3 className="text-button text-primary">Cost Codes</h3>

                {/* <Alert
                  heading="We'll use CSI Masterformat by default"
                  bodyText="Industry standard cost code structure (16 divisions, ~200 codes)"
                  variant="success"
                  showIcon={true}
                /> */}

                <div className="w-full flex items-center gap-4">
                  <span className="text-button text-primary flex-1">
                    Have additional custom codes?
                  </span>
                  <DownloadTemplateButton
                    onClick={() => handleDownloadTemplate("cost-codes")}
                  />
                </div>

                <FileUpload
                  heading="Click to upload multiple files (or Drag & Drop)"
                  bodyText="Supported formats: CSV, PDF, DOC, XLS"
                  accept=".csv,.pdf,.doc,.docx,.xls,.xlsx"
                  multiple={true}
                  onFilesSelect={handleCostCodesFiles}
                />
              </div>

              {/* Workers Comp Codes */}
              <div className="w-full flex flex-col gap-4 p-4 pb-3 border border-custom rounded-xl">
                <h3 className="text-button text-primary">Workers Comp Codes</h3>

                <Alert
                  heading="We'll use official state workers comp codes"
                  bodyText="Standardized codes required for insurance reporting"
                  variant="success"
                  showIcon={true}
                />

                <div className="w-full flex items-center gap-4">
                  <span className="text-button text-primary flex-1">
                    Have custom mappings?
                  </span>
                  <DownloadTemplateButton
                    onClick={() => handleDownloadTemplate("workers-comp")}
                  />
                </div>

                <FileUpload
                  heading="Click to upload multiple files (or Drag & Drop)"
                  bodyText="Supported formats: CSV, PDF, DOC, XLS"
                  accept=".csv,.pdf,.doc,.docx,.xls,.xlsx"
                  multiple={true}
                  onFilesSelect={handleWorkersCompFiles}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              disabled={onboardingApiLoading}
              onClick={handleSkip}
              className="flex-1 flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg border border-radio-inactive bg-transparent hover:bg-black/80 group hover:text-white transition-colors text-button text-dark cursor-pointer"
            >
              Skip All for Now
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={onboardingApiLoading}
              className="flex-1 flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {onboardingApiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3;

