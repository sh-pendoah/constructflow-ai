import React, { useRef, useState, useEffect } from "react";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  label?: string;
  heading?: string;
  bodyText?: string;
  accept?: string;
  onFileSelect?: (file: File | null) => void;
  onFilesSelect?: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  heading = "Upload OR Drag & Drop",
  bodyText = "Recommended: 200x200px PNG",
  accept = "image/*",
  onFileSelect,
  onFilesSelect,
  multiple = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Clean up preview URL when component unmounts or file changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Create preview URL for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file input
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (multiple && onFilesSelect) {
      const files = Array.from(e.dataTransfer.files);
      const updatedFiles = [...selectedFiles, ...files];
      setSelectedFiles(updatedFiles);
      onFilesSelect(updatedFiles);
      // Clear input for multiple files
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (multiple && onFilesSelect) {
      const files = Array.from(e.target.files || []);
      const updatedFiles = [...selectedFiles, ...files];
      setSelectedFiles(updatedFiles);
      onFilesSelect(updatedFiles);
      // Clear input for multiple files (so same files can be selected again)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  const handleRemoveFileFromList = (
    indexToRemove: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove,
    );
    setSelectedFiles(updatedFiles);
    if (onFilesSelect) {
      onFilesSelect(updatedFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      {label && (
        <label className="text-button text-primary text-sm sm:text-base">
          {label}
        </label>
      )}

      {!multiple && selectedFile ? (
        // Preview Mode
        <div className="relative rounded-lg sm:rounded-xl border border-custom bg-white-custom overflow-hidden">
          {previewUrl ? (
            // Image Preview
            <div className="relative w-full aspect-square max-h-[200px] bg-[#F4F5F6] flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 rounded-full bg-white-custom border border-custom shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ) : (
            // Non-image file preview
            <div className="relative w-full min-h-[120px] bg-[#F4F5F6] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-placeholder" />
                <span className="text-body-copy text-primary font-medium">
                  {selectedFile.name}
                </span>
              </div>
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 rounded-full bg-white-custom border border-custom shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          )}
          {/* File Info */}
          <div className="p-3 border-t border-custom">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-body-copy text-primary truncate font-medium">
                  {selectedFile.name}
                </p>
                <p className="text-small text-placeholder">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          className={`flex flex-col items-center justify-center gap-3 py-5 px-3 rounded-xl border border-dashed border-radio-inactive cursor-pointer hover:opacity-80 transition-opacity bg-white-custom ${className}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex items-center justify-center p-2">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-label text-primary">{heading}</span>
            <span className="text-supporting text-placeholder">{bodyText}</span>
          </div>
        </div>
      )}

      {/* Multiple Files Preview */}
      {multiple && selectedFiles.length > 0 && (
        <div className="flex flex-col gap-3">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="w-full p-4 bg-background rounded-lg border border-custom flex items-center gap-5"
            >
              <div className="flex-1 flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-8 text-primary" />
                </div>
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="text-base font-semibold font-poppins text-dark line-clamp-2">
                    {file.name}
                  </div>
                  <div className="text-small text-placeholder line-clamp-1">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemoveFileFromList(index, e)}
                className="p-3 bg-red-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors flex-shrink-0"
                title="Remove"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
