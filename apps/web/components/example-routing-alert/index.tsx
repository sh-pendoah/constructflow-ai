import React from "react";
import { Info, Dot } from "lucide-react";

interface ExampleRoutingAlertProps {
  className?: string;
}

const ExampleRoutingAlert: React.FC<ExampleRoutingAlertProps> = ({
  className = "",
}) => {
  const examples = [
    "$800 invoice → Auto-approved",
    "$3,500 invoice → PM approves",
    "$125,000 invoice → Owner approves",
  ];

  return (
    <div
      className={`flex flex-col gap-2 p-3 pl-4 rounded-lg border border-blue-info bg-blue-info ${className}`}
    >
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-info flex-shrink-0" />
        <span className="text-supporting text-primary font-bold">
          Example routing:
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {examples.map((example, index) => (
          <div key={index} className="flex items-center gap-1">
            <Dot className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-supporting text-dark">{example}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleRoutingAlert;
