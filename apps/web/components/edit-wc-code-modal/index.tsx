"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import companyActions from "@/Redux/actions/company";
import { updateWCCodeFailure } from "@/Redux/reducers/company";

interface WCCodeData {
  id: string;
  code: string;
  category: string;
  description: string;
}

interface EditWCCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: any;
  wcCodeData?: WCCodeData | null;
}

const EditWCCodeModal: React.FC<EditWCCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  wcCodeData,
}) => {
  const dispatch = useAppDispatch();
  const { isUpdatingWCCode, updateWCCodeSuccess, updateWCCodeError } = useAppSelector((state) => state.company);

  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // Populate form when modal opens or wcCodeData changes
  useEffect(() => {
    if (isOpen && wcCodeData) {
      setCode(wcCodeData.code || "");
      setCategory(wcCodeData.category || "");
      setDescription(wcCodeData.description || "");
    }
  }, [isOpen, wcCodeData]);

  // Close modal and reset form on successful update
  useEffect(() => {
    if (updateWCCodeSuccess) {
      onSubmit?.({ id: wcCodeData?.id || "", code: "", category: "", description: "", success: true });
      dispatch(updateWCCodeFailure(""));
      // Small delay to allow success message to be seen
      setTimeout(() => {
        onClose();
      }, 100);
    }
  }, [updateWCCodeSuccess, onClose, onSubmit, wcCodeData, dispatch]);

  // Reset error when modal closes
  useEffect(() => {
    if (!isOpen && updateWCCodeError) {
      dispatch(updateWCCodeFailure(""));
    }
  }, [isOpen, updateWCCodeError, dispatch]);

  const handleSubmit = () => {
    if (code.trim() && category.trim() && description.trim() && wcCodeData?.id) {
      // Map form data to API payload format
      const payload = {
        codeNumber: code.trim(),
        category: category.trim(),
        description: description.trim(),
      };
      dispatch(companyActions.updateWCCodeRequest(wcCodeData.id, payload));
    }
  };

  const handleClose = () => {
    if (!isUpdatingWCCode) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="672px">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-8">
          <h2 className="text-h3 text-primary font-poppins font-semibold flex-1">
            Edit : Workers Comp Code
          </h2>
          <button
            onClick={handleClose}
            disabled={isUpdatingWCCode}
            className="w-11 h-11 flex cursor-pointer items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          <Input
            label="Code Number"
            placeholder="e.g., 5403"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            labelStyle="supporting"
            inputStyle="body-copy"
            required
          />
          <Input
            label="Category"
            placeholder="e.g., Concrete"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            labelStyle="supporting"
            inputStyle="body-copy"
            required
          />
          <Input
            label="Description"
            placeholder="e.g., Carpentry - NOC"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            labelStyle="supporting"
            inputStyle="body-copy"
            required
          />
        </div>

        {/* Error Message */}
        {updateWCCodeError && (
          <div className="p-3 bg-[#FFEDED] border border-[#EF4444] rounded-lg">
            <p className="text-sm text-[#EF4444] font-sf-pro">{updateWCCodeError}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-stretch gap-8">
          <button
            onClick={handleClose}
            disabled={isUpdatingWCCode}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors font-poppins font-semibold text-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdatingWCCode || !code.trim() || !category.trim() || !description.trim() || !wcCodeData?.id}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors font-poppins font-semibold text-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingWCCode ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              "Update Code"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditWCCodeModal;


