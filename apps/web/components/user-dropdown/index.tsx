"use client";

import React from "react";
import { destroyCookie } from "nookies";
import Link from "next/link";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;


  const handleLogOut = () => {
    // Handle log out action
    destroyCookie(null, 'auth_token');
    location.href = "/auth";
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 z-50 w-[240px] sm:w-[269px] bg-white rounded-[8px] sm:rounded-[12px] border-b border-[#BFEDE7] shadow-medium">
        <div className="flex flex-col gap-2 py-2 sm:py-3 px-3 sm:px-4">
          {/* First Section */}
          <div className="flex flex-col gap-0 pb-2 border-b border-[#DEE0E3]">
            {/* Edit Profile */}
              <Link
                href="/dashboard"
                onClick={onClose}
              className="flex items-center cursor-pointer gap-2 px-2 sm:px-3 py-1 bg-white rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
            >
              <span className="flex-1 font-semibold text-left text-sm sm:text-supporting text-primary font-sf-pro">
                Review Queue
              </span>
            </Link>
            <Link
                href="/dashboard/edit-profile"
                onClick={onClose}
              className="flex items-center cursor-pointer gap-2 px-2 sm:px-3 py-1 bg-white rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
            >
              <span className="flex-1 font-semibold text-left text-sm sm:text-supporting text-primary font-sf-pro">
                Edit Profile
              </span>
            </Link>

            {/* Configuration */}
            <Link
              href="/company/company-info"
              onClick={onClose}
              className="flex items-center cursor-pointer gap-2 px-2 sm:px-3 py-1 bg-white rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
            >
              {/* <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" /> */}
              <span className="flex-1 font-semibold text-left text-sm sm:text-supporting text-primary font-sf-pro">
                Configuration
              </span>
            </Link>
          </div>

          {/* Log Out */}
          <button
            onClick={handleLogOut}
            className="flex items-center cursor-pointer gap-2 px-2 sm:px-3 py-2 sm:py-3 bg-[#FFEDED] rounded-lg hover:bg-[#FFE0E0] transition-colors w-full text-left"
          >
            {/* <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-[#EF4444] flex-shrink-0" /> */}
            <span className="flex-1 font-semibold text-left text-sm sm:text-supporting text-[#EF4444] font-sf-pro">
              Log Out
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserDropdown;

