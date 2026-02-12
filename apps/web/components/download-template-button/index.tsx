import React from "react";
import { Download } from "lucide-react";

interface DownloadTemplateButtonProps {
  onClick?: () => void;
  className?: string;
}

const DownloadTemplateButton: React.FC<DownloadTemplateButtonProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 h-9 py-2 px-3 rounded-lg border group hover:text-white border-primary bg-transparent hover:bg-black/80 transition-colors text-button text-primary cursor-pointer ${className}`}
    >
      <span>Download Template</span>
      <Download className="w-5 h-5 text-primary group-hover:text-white" />
    </button>
  );
};

export default DownloadTemplateButton;
