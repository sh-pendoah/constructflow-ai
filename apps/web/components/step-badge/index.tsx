import React from "react";

interface StepBadgeProps {
  stepNumber: string;
  className?: string;
}

const StepBadge: React.FC<StepBadgeProps> = ({
  stepNumber,
  className = "",
}) => {
  return (
    <div
      className={`flex w-fit items-center justify-center gap-2.5 px-3 py-1 rounded-3xl border border-radio-inactive bg-step-badge ${className}`}
    >
      <span className="text-supporting text-primary">Step {stepNumber}</span>
    </div>
  );
};

export default StepBadge;
