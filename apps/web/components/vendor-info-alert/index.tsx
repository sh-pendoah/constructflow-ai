import React from "react";
import { CircleCheck, Dot } from "lucide-react";

interface VendorInfoAlertProps {
  className?: string;
}

const VendorInfoAlert: React.FC<VendorInfoAlertProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col gap-2 p-3 pl-4 rounded-lg border border-green bg-green-light ${className}`}
    >
      <div className="flex items-center gap-2">
        <CircleCheck className="w-4 h-4 text-green flex-shrink-0" />
        <span className="text-supporting text-primary font-bold">
          Vendors can be added later via
        </span>
      </div>
      <p className="text-supporting text-primary">
        Helps us route invoices correctly and track costs per project.
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Dot className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-supporting text-dark">
            Email: Updates@yourcompany.worklighter.com
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Dot className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-supporting text-dark">Admin Portal</span>
        </div>
        <div className="flex items-center gap-1">
          <Dot className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-supporting text-dark">
            Auto-detected from new invoices or compliance docs
          </span>
        </div>
      </div>
    </div>
  );
};

export default VendorInfoAlert;
