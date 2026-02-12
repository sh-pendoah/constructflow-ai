"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import companyActions from "@/Redux/actions/company";
import { updateApprovalRulesFailure } from "@/Redux/reducers/company";

const ApprovalRulesPage = () => {
  const dispatch = useAppDispatch();
  const { isUpdatingApprovalRules, updateApprovalRulesSuccess, updateApprovalRulesError } = useAppSelector((state) => state.company);
  
  const [projectManagerLimit, setProjectManagerLimit] = useState("5000");
  const errorMessage = "Invoices above this amount require owner approval";

  // Reset success state after showing success message
  useEffect(() => {
    if (updateApprovalRulesSuccess) {
      dispatch(updateApprovalRulesFailure(""));
    }
  }, [updateApprovalRulesSuccess, dispatch]);

  const handleSave = () => {
    const limit = parseFloat(projectManagerLimit);
    if (!isNaN(limit) && limit > 0) {
      dispatch(companyActions.updateApprovalRulesRequest({ pmApprovalLimit: limit }));
    }
  };


  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProjectManagerLimit(value);
  };

  // Approval Limits View
    return (
      <div className="w-full px-4 sm:px-0">
        {/* Header Container */}
        <div className="flex flex-col gap-0.5 mb-6">
          <h2 className="text-lg sm:text-xl md:text-h4 text-primary font-poppins font-semibold">
            Approval Thresholds & Rules
          </h2>
          <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
            Configure approval limits and automation rules
          </p>
        </div>

        {/* Approval Limits Container */}
        <div className="flex flex-col items-end gap-6">
          <div className="w-full bg-white border border-[#DEE0E3] rounded-xl p-4 sm:p-6">
            <h3 className="text-h6 text-primary font-poppins font-semibold mb-5">
              Approval Limits
            </h3>

            {/* Project Manager Limit Input */}
            <div className="flex flex-col gap-1">
              <label className="text-supporting text-primary font-sf-pro">
                Project Manager Limit
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center w-full px-3 py-4 h-[52px] rounded-lg border border-[#DEE0E3] bg-white backdrop-blur-[30px]">
                  <DollarSign className="w-6 h-6 text-primary flex-shrink-0" />
                  <input
                    type="number"
                    value={projectManagerLimit}
                    onChange={handleLimitChange}
                    className="flex-1 text-body-copy text-primary outline-none bg-transparent ml-3"
                    placeholder="Enter amount"
                  />
                  <ChevronsUpDown className="w-6 h-6 text-primary flex-shrink-0 ml-2" />
                </div>
                <p className="text-supporting text-[#6F7A85] font-sf-pro">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {updateApprovalRulesError && (
            <div className="w-full p-3 bg-[#FFEDED] border border-[#EF4444] rounded-lg">
              <p className="text-sm text-[#EF4444] font-sf-pro">{updateApprovalRulesError}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isUpdatingApprovalRules || !projectManagerLimit || isNaN(parseFloat(projectManagerLimit)) || parseFloat(projectManagerLimit) <= 0}
            className="h-[50px] cursor-pointer flex items-center justify-center gap-2 px-6 py-5 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors font-poppins font-semibold text-button whitespace-nowrap w-[263px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingApprovalRules ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Approval Rules"
            )}
          </button>
        </div>
      </div>
    );
  

  // COI Alerts View
 
};

export default ApprovalRulesPage;


