import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  className = "",
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`flex flex-col items-center gap-2 h-[47px] ${className}`}>
      <div className="w-full h-[7px] bg-[#F4F5F6] rounded-full shadow-2xl overflow-hidden relative">
        <div
          className="h-full rounded-full shadow-2xl transition-all duration-300"
          style={{
            width: `${progressPercentage}%`,
            background:
              "linear-gradient(90deg, rgba(31, 111, 102, 0.2) 0%, rgba(31, 111, 102, 1) 100%)",
            boxShadow: "0px 1px 4px 0px rgba(93, 158, 150, 1)",
          }}
        />
      </div>
      <span className="text-label text-primary">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
};

export default ProgressBar;
