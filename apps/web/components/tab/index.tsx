"use client";

import React from "react";

interface TabProps {
  label: string;
  isActive?: boolean;
  badgeCount?: number;
  onClick?: () => void;
  showBadge?: boolean;
}

const Tab: React.FC<TabProps> = ({
  label,
  isActive = false,
  badgeCount,
  onClick,
  showBadge = false,
}) => {
  const hasBadge = showBadge && badgeCount !== undefined && badgeCount > 0;

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 sm:px-4 sm:py-3 rounded-lg
        inline-flex justify-center items-center
        transition-all duration-300 ease-in-out cursor-pointer
        text-sm sm:text-base
        ${
          isActive
            ? "bg-Interactive-Primary-Active border text-Text-txt-Inverse"
            : "bg-white border border-[#DEE0E3] text-primary hover:border-primary/30"
        }
      `}
      data-active={isActive}
      data-show-name="true"
      data-show-num-badge={showBadge}
      data-size="md"
    >
      <span className="font-sf-pro whitespace-nowrap">{label}</span>
      {/* Badge container - always rendered to prevent layout shift */}
      {showBadge && (
        <span
          className={`
            inline-flex items-center justify-center min-w-0 
            transition-all duration-300 ease-in-out
            ${
              hasBadge
                ? `opacity-100 max-w-[20px] ml-1.5 sm:ml-2.5 px-1.5 sm:px-2 py-0.5 sm:py-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full ${isActive ? 'bg-white/20' : 'bg-step-badge'}`
                : "opacity-0 max-w-0 ml-0 px-0 py-1"
            }
          `}
        >
          <span className={`text-[10px] sm:text-xs font-normal font-sf-pro whitespace-nowrap ${isActive ? 'text-Text-txt-Inverse' : 'text-primary'}`}>
            {badgeCount}
          </span>
        </span>
      )}
    </button>
  );
};

export default Tab;

