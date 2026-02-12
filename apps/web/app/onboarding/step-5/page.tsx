"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/progress-bar";
import BackButton from "@/components/back-button";
import Input from "@/components/input";
import { DollarSign, Loader2 } from "lucide-react";
import { setOnboardingApiSuccess } from "@/Redux/reducers/auth";
import { useAppSelector } from "@/Redux/hooks";
import { RootState } from "@/Redux/store";
import { useDispatch } from "react-redux";
import authActions from "@/Redux/actions/auth";
const OnboardingStep5 = () => {
  const router = useRouter();
  const [pmApprovalLimit, setPmApprovalLimit] = useState("1000");
  const { onboardingApiSuccess, onboardingApiLoading } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const handleContinue = () => {
    // Handle form submission
    const formData = new FormData();
    formData.append("pmApprovalLimit", pmApprovalLimit);
    formData.append("step", "5");
    dispatch(authActions.onboardingApiRequest(formData));
  };

  useEffect(() => {
    if (onboardingApiSuccess) {
      router.push("/onboarding/step-6");
      dispatch(setOnboardingApiSuccess(false));
    }
  }, [onboardingApiSuccess]);

  const handleSkip = () => {
    // Skip to next step
    router.push("/onboarding/step-6");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-[672px] flex flex-col gap-8 sm:gap-[50px] px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-11 pb-6 sm:pb-8 rounded-xl sm:rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Container */}
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-4 sm:gap-8">
            <BackButton href="/onboarding/step-4" />
            <h2 className="text-label text-primary">Company Setup</h2>
          </div>

          {/* Progress and Content Container */}
          <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-11">
            {/* Progress Bar */}
            <ProgressBar currentStep={5} totalSteps={7} />

            {/* Content Container */}
            <div className="w-full flex flex-col gap-8">
              {/* Title Section */}
              <div className="w-full flex flex-col gap-0.5">
                <h1 className="text-h3 text-primary">
                  Configure Invoice Approval Limits
                </h1>
                <p className="text-body-copy text-primary">
                  Who needs to approve invoices based on amount?
                </p>
              </div>

              {/* Approval Limits */}
              <div className="w-full flex flex-col gap-4">
                {/* Auto-Approve Threshold */}
                {/* <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex flex-col gap-2 px-1 pt-0.5">
                    <h3 className="text-h6 text-primary">
                      Auto-Approve Threshold
                    </h3>
                    <p className="text-body-copy text-primary">
                      Invoices under this amount are automatically approved:
                    </p>
                  </div>
                  <Input
                    label=""
                    type="number"
                    placeholder="1000"
                    value={autoApproveThreshold}
                    onChange={(e) => setAutoApproveThreshold(e.target.value)}
                    showLabel={false}
                    inputStyle="body-copy"
                    leftIcon={DollarSign}
                  />
                </div> */}

                {/* PM Approval Limit */}
                <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex flex-col gap-2 px-1 pt-0.5">
                    <h3 className="text-h6 text-primary">
                      Project Manager Approval Limit
                    </h3>
                    <p className="text-body-copy text-primary">
                      PMs can approve up to:
                    </p>
                  </div>
                  <Input
                    label=""
                    type="number"
                    placeholder="1000"
                    value={pmApprovalLimit}
                    onChange={(e) => setPmApprovalLimit(e.target.value)}
                    showLabel={false}
                    inputStyle="body-copy"
                    leftIcon={DollarSign}
                  />
                </div>

                {/* Owner Approval Limit */}
                {/* <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex flex-col gap-2 px-1 pt-0.5">
                    <h3 className="text-h6 text-primary">
                      Owner Approval Limit
                    </h3>
                    <p className="text-body-copy text-primary">
                      Owner approval required above:
                    </p>
                  </div>
                  <Input
                    label=""
                    type="number"
                    placeholder="1000"
                    value={ownerApprovalLimit}
                    onChange={(e) => setOwnerApprovalLimit(e.target.value)}
                    showLabel={false}
                    inputStyle="body-copy"
                    leftIcon={DollarSign}
                  />
                </div> */}

                {/* Example Routing Alert */}
                {/* <ExampleRoutingAlert /> */}
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

export default OnboardingStep5;

