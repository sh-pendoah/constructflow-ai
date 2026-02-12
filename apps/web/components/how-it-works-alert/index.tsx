import React from "react";
import { Info } from "lucide-react";
import Alert from "../alert";

interface HowItWorksAlertProps {
  heading: string;
  steps: string[];
  className?: string;
}

const HowItWorksAlert: React.FC<HowItWorksAlertProps> = ({
  heading,
  steps,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col gap-4 p-3 pl-4 rounded-lg border border-custom bg-background ${className}`}
    >
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-supporting text-primary font-bold">
          {heading}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-supporting text-primary flex-shrink-0">
              {index + 1}.
            </span>
            <span className="text-supporting text-dark">{step}</span>
          </div>
        ))}
      </div>
      {/* Tip Alert */}
      <Alert
        heading="No Need to add vendors manually!"
        bodyText="They'll be created automatically from your compliance documents."
        variant="tip"
        showIcon={true}
      />
    </div>
  );
};

export default HowItWorksAlert;
