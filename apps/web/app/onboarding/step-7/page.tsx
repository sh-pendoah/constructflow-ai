"use client";

import ProgressBar from "@/components/progress-bar";
import BackButton from "@/components/back-button";
import { CircleCheck, Link as LinkIcon, Info } from "lucide-react";
import { setOnboardingStepsData } from "@/Redux/reducers/auth";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
const OnboardingStep7 = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleGoToReviewQueue = () => {
    // Navigate to review queue
    dispatch(setOnboardingStepsData(null));
    router.push("/dashboard");
  };

  const completedItems = [
    "Company profile created",
    "Gmail accounts connected",
    "Jobs imported",
    "Cost codes imported",
    "Compliance tracking enabled",
    "Approval rules configure",
    "Team members invited",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-[672px] flex flex-col gap-8 sm:gap-[50px] px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-11 pb-6 sm:pb-8 rounded-xl sm:rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Container */}
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-4 sm:gap-8">
            <BackButton href="/onboarding/step-6" />
            <h2 className="text-label text-primary">Company Setup</h2>
          </div>

          {/* Progress and Content Container */}
          <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-11">
            {/* Progress Bar */}
            <ProgressBar currentStep={7} totalSteps={7} />

            {/* Content Container */}
            <div className="w-full flex flex-col gap-8">
              {/* Title Section */}
              <div className="w-full flex flex-col gap-0.5">
                <h1 className="text-h3 text-primary">You're All Set!</h1>
                <p className="text-body-copy text-primary">
                  docflow-360 is ready to process your construction documents
                </p>
              </div>

              {/* Completion Items */}
              <div className="w-full flex flex-col gap-4">
                {/* Success Alert with Checkmarks */}
                <div className="w-full flex flex-col gap-2 p-3 pl-4 rounded-lg border border-green bg-green-light">
                  {completedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-green flex-shrink-0" />
                      <span className="text-supporting text-primary">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Connected Gmail Account Alert */}
                <div className="w-full flex flex-col gap-2 p-3 pl-4 rounded-lg border border-yellow bg-yellow-light">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-label text-primary">
                      Your Connected Gmail Account(s)
                    </span>
                  </div>
                  <div className="w-full flex items-center gap-2 p-2 rounded border border-yellow bg-white-custom">
                    <span className="text-supporting text-primary">
                      MarshConstruct-docs@company.com (All workflows)
                    </span>
                  </div>
                </div>

                {/* What Happens Next Alert */}
                <div className="w-full flex flex-col gap-2 p-3 pl-4 rounded-lg border border-blue-info bg-blue-info">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-info flex-shrink-0" />
                    <span className="text-supporting text-primary font-bold">
                      What happens next?
                    </span>
                  </div>
                  <p className="text-supporting text-dark whitespace-pre-line">
                    {`Field teams email documents to your connected Gmail addresses

docflow-360 automatically processes all documents

You review exceptions in the Review Queue (only 10-20%)

Add more data anytime via Company Settings or email`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full">
            <button
              type="button"
              onClick={handleGoToReviewQueue}
              className="w-full flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer"
            >
              Go to Review Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep7;

