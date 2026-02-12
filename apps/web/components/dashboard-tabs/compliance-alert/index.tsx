"use client";

import React, { useState } from "react";
import ComplianceSidebar, { Compliance } from "@/components/compliance-sidebar";
import CompliancePreview from "@/components/compliance-preview";
import ComplianceDetails from "@/components/compliance-details";

const ComplianceAlertTab = () => {
  const [selectedCompliance, setSelectedCompliance] = useState<Compliance | null>(null);

  const handleComplianceSelect = (compliance: Compliance) => {
    setSelectedCompliance(compliance);
  };

  return (
    <div className="w-full px-0">
      <div className="w-full h-[calc(100vh-300px)] min-h-[768px] max-h-[768px] flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[316px] flex-shrink-0 h-full">
          <ComplianceSidebar onComplianceSelect={handleComplianceSelect} />
        </div>

        {/* Center Preview Section */}
        <div className="flex-1 min-w-0 h-full relative">
          <CompliancePreview />
        </div>

        {/* Right Compliance Details Section */}
        <div className="w-[336px] flex-shrink-0 h-full">
          <ComplianceDetails compliance={selectedCompliance} />
        </div>
      </div>
    </div>
  );
};

export default ComplianceAlertTab;

