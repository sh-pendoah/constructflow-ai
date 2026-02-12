"use client";

import { BriefcaseBusiness } from "lucide-react";

const NoPreviewTab = () => {
  return (
    <div className="w-full">
      {/* Invoices content will go here */}
      <div className="w-full flex flex-col items-center justify-center gap-8 py-20">
        <div className="w-[420px] flex flex-col items-center gap-8">
          {/* Document Container - placeholder for document preview */}
          <img
            src="/images/Document.png"
            alt="Invoice Preview"
            className="w-[200px] h-[200px] object-cover"
          />
          {/* Preview Container */}
          <div className="w-full flex flex-col items-center gap-0.5">
            <h3 className="text-h3 text-primary font-poppins font-semibold text-center">
              No Preview Available
            </h3>
            <p className="text-body-copy text-primary text-center">
              This content cannot be previewed at the moment.
            </p>
            <button
              className="self-stretch px-3 py-5 bg-black cursor-pointer hover:bg-black/80 transition-colors mt-3 rounded-lg inline-flex justify-center items-center gap-2"
            >
              <BriefcaseBusiness className="w-5 h-5 text-white" />
              <div className="text-center justify-center text-white text-base font-semibold font-['Poppins']">
                Add Jobs
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoPreviewTab;
