"use client";

import React, { useState, useRef } from "react";
import { X, FileText, Upload } from "lucide-react";
import Modal from "@/components/modal";

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (file: File) => void;
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit?.(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="672px">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-8">
          <h2 className="text-h3 text-primary font-poppins font-semibold flex-1">
            Import Cost Codes from CSV
          </h2>
          <button
            onClick={handleClose}
            className="w-11 h-11 flex cursor-pointer items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {/* CSV Format Alert */}
          <div className="flex flex-col gap-2 p-3 pl-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
              <h3 className="text-supporting text-primary font-sf-pro font-medium">
                CSV Format
              </h3>
            </div>
            <p className="text-supporting text-primary font-sf-pro pl-6">
              code_number, category, description
            </p>
          </div>

          {/* Upload Container */}
          <div className="flex flex-col gap-2">
            <label className="text-supporting text-primary font-sf-pro">
              Upload CSV File
            </label>
            <div
              onClick={handleFileClick}
              className="flex flex-col items-center justify-center gap-3 p-5 border border-dashed border-[#8A949E] rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-label text-primary font-sf-pro font-medium">
                  Choose File
                </p>
                <p className="text-supporting text-[#6F7A85] font-sf-pro">
                  {selectedFile ? selectedFile.name : "No File Chosen"}
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-stretch gap-8">
          <button
            onClick={handleClose}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors font-poppins font-semibold text-button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className="h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors font-poppins font-semibold text-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Codes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportCSVModal;

