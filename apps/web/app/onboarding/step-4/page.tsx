"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/progress-bar";
import BackButton from "@/components/back-button";
import FileUpload from "@/components/file-upload";
// import Input from "@/components/input";
import Checkbox from "@/components/checkbox";
import HowItWorksAlert from "@/components/how-it-works-alert";
import VendorInfoAlert from "@/components/vendor-info-alert";
import { setOnboardingApiSuccess, setOnboardingStepsData } from "@/Redux/reducers/auth";
import { useAppSelector } from "@/Redux/hooks";
import { RootState } from "@/Redux/store";
import { useDispatch } from "react-redux";
import authActions from "@/Redux/actions/auth";
import { Loader2 } from "lucide-react";
const OnboardingStep4 = () => {
  const router = useRouter();
  // const [complianceFiles, setComplianceFiles] = useState<File[]>([]);
  const [alertDays30, setAlertDays30] = useState(true);
  const [alertDays15, setAlertDays15] = useState(false);
  const [alertDays7, setAlertDays7] = useState(false);
  const [alertExpired, setAlertExpired] = useState(false);
  const { onboardingStepsData, onboardingApiSuccess } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { onboardingApiLoading } = useAppSelector((state: RootState) => state.auth);
  const handleComplianceFiles = (files: File[]) => {
    // setComplianceFiles(files);
    dispatch(setOnboardingStepsData({
      ...onboardingStepsData,
      complianceDocuments:files,
      // expirationAlerts:expirationAlerts,
    }));
  };

  const handleContinue = () => {
    const expirationAlertsTemp = [];
    if (alertDays30) {
      expirationAlertsTemp.push("30 days from expiration");
    }
    if (alertDays15) {
      expirationAlertsTemp.push("15 days from expiration");
    }
    if (alertDays7) {
      expirationAlertsTemp.push("7 days from expiration");
    }
    if (alertExpired) {
      expirationAlertsTemp.push("expired");
    }

    const formData = new FormData();
       // 8. complianceDocuments (File)
       if (onboardingStepsData?.complianceDocuments && Array.isArray(onboardingStepsData.complianceDocuments)) {
        onboardingStepsData.complianceDocuments.forEach((file: File) => {
          formData.append("complianceDocuments", file);
        });
      }
         // 9. expirationAlerts (Text: JSON array)
    const expirationAlerts = expirationAlertsTemp;
    formData.append("expirationAlerts", JSON.stringify(expirationAlerts));
    formData.append("step", "4");
    dispatch(authActions.onboardingApiRequest(formData));

  };

  useEffect(() => {
    if (onboardingApiSuccess) {
      router.push("/onboarding/step-5");
      dispatch(setOnboardingApiSuccess(false));
    }
  }, [onboardingApiSuccess]);

  const handleSkip = () => {
    // Skip to next step
    router.push("/onboarding/step-5");
  };

  const howItWorksSteps = [
    "Upload all COIs, Workers Comp, Insurance docs.",
    "We Extract vendor names automatically.",
    "We Track expiration dates.",
    "We Create vendor records from the documents.",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-[672px] flex flex-col gap-8 sm:gap-[50px] px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-11 pb-6 sm:pb-8 rounded-xl sm:rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Container */}
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-4 sm:gap-8">
            <BackButton href="/onboarding/step-3" />
            <h2 className="text-label text-primary">Company Setup</h2>
          </div>

          {/* Progress and Content Container */}
          <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-11">
            {/* Progress Bar */}
            <ProgressBar currentStep={4} totalSteps={7} />

            {/* Content Container */}
            <div className="w-full flex flex-col gap-8">
              {/* Title Section */}
              <div className="w-full flex flex-col gap-0.5">
                <h1 className="text-h3 text-primary">
                  Upload Compliance Documents
                </h1>
                <p className="text-body-copy text-primary">
                  We'll automatically extract vendor and expiration dates
                </p>
              </div>

              {/* How It Works Alert */}
              <HowItWorksAlert heading="How it works" steps={howItWorksSteps} />

              {/* File Upload */}
              <FileUpload
                heading="Click to upload multiple files (or Drag & Drop)"
                bodyText="COI, Workers Comp, Business License, Bonding (PDF, PNG, JPG)"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple={true}
                onFilesSelect={handleComplianceFiles}
              />

              {/* Expiration Alert Settings */}
              <div className="w-full flex flex-col gap-3 pt-3 px-1">
                <div className="w-full flex flex-col gap-2">
                  <h3 className="text-h6 text-primary">
                    Expiration Alert Settings
                  </h3>
                  <p className="text-body-copy text-primary">
                    Send me alerts when documents are:
                  </p>
                </div>
                <div className="w-full flex flex-col gap-3">
                  <Checkbox
                    checked={alertDays30}
                    onChange={setAlertDays30}
                    label="30 days from expiration"
                  />
                  <Checkbox
                    checked={alertDays15}
                    onChange={setAlertDays15}
                    label="15 days from expiration"
                  />
                  <Checkbox
                    checked={alertDays7}
                    onChange={setAlertDays7}
                    label="7 days from expiration"
                  />
                  <Checkbox
                    checked={alertExpired}
                    onChange={setAlertExpired}
                    label="Expired"
                  />
                </div>
              </div>

              {/* Alert Recipients Input */}
              {/* <Input
                label="Alert Recipients"
                type="email"
                placeholder="you@company.com"
                value={alertRecipients}
                onChange={(e) => setAlertRecipients(e.target.value)}
                labelStyle="supporting"
                inputStyle="body-copy"
              /> */}

              {/* Vendor Info Alert */}
              <VendorInfoAlert />
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
              Skip for Now
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

export default OnboardingStep4;

