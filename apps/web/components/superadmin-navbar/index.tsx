"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Bell, ChevronDown } from "lucide-react";
import UserDropdown from "@/components/user-dropdown";
import NotificationDropdown from "@/components/notification-dropdown";

interface SuperAdminNavbarProps {
  onMenuClick?: () => void;
}

const SuperAdminNavbar: React.FC<SuperAdminNavbarProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState<{ top: number; right: number, width?: number } | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Calculate notification dropdown position
  useEffect(() => {
    if (isNotificationOpen && notificationButtonRef.current) {
      const buttonRect = notificationButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768;
      const dropdownWidth = isMobile ? Math.min(viewportWidth - 32, 672) : 672; // 16px margin on each side for mobile
      
      // Calculate right position to align with button's right edge
      let rightPosition = viewportWidth - buttonRect.right;
      
      // On mobile, center the dropdown or align to button
      if (isMobile) {
        // Align to button's right edge, but ensure it stays within viewport
        rightPosition = Math.max(16, viewportWidth - buttonRect.right);
        
        // If dropdown would overflow, align to left edge
        if (rightPosition + dropdownWidth > viewportWidth - 16) {
          rightPosition = 16;
        }
      } else {
        // Desktop: align with button's right edge
        if (buttonRect.right - dropdownWidth < 0) {
          rightPosition = viewportWidth - dropdownWidth - 16; // 16px margin from edge
        }
      }
      
      setNotificationPosition({
        top: buttonRect.bottom + 8, // 8px gap below button
        right: rightPosition,
        width: dropdownWidth, // Pass width for mobile responsiveness
      });
    }
  }, [isNotificationOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="w-full h-[84px] bg-white border-b border-[#DEE0E3] shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] flex items-center justify-between px-4 lg:px-[60px] py-4">
      {/* Left Section - Empty for now, can add hamburger menu here for mobile */}
      <div className="flex-1" />

      {/* Right Section: Notifications and User Profile */}
      <div className="flex items-center gap-4 flex-shrink-0 relative" ref={dropdownRef} style={{ gap: "16px" }}>
        {/* Notification Bell */}
        <div className="relative">
          <button
            ref={notificationButtonRef}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[#F3F5F7] transition-colors cursor-pointer hover:bg-gray-200"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Notification Badge */}
            <span className="absolute top-1.5 right-2.5 w-2.5 h-2.5 bg-[#10B981] rounded-full border-2 border-white"></span>
          </button>

          {/* Notification Dropdown */}
          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            position={notificationPosition}
          />
        </div>

        {/* User Profile */}
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="User menu"
        >
          {/* User avatar */}
          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-[#F3F5F7] border border-[#BFEDE7]">
            {!imageError ? (
              <Image
                src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?_gl=1*gammq9*_ga*MTUxNTc4NTcwNi4xNzQ0NzQyOTY2*_ga_8JE65Q40S6*czE3NjY1MjgzNTEkbzE1JGcxJHQxNzY2NTI4MzYwJGo1MSRsMCRoMA.."
                alt="User Profile"
                width={44}
                height={44}
                className="object-cover w-full h-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-primary text-sm font-semibold">JD</span>
            )}
          </div>

          {/* User Name and Role */}
          <div className="flex flex-col items-start">
            <span className="text-body-copy font-sf-pro text-[#000000] leading-tight">
              John Doe
            </span>
            <span className="text-supporting font-sf-pro text-[#2E3338] leading-tight">
              Admin
            </span>
          </div>

          {/* Dropdown Chevron */}
          <ChevronDown className="w-5 h-5 text-[#2E3338] flex-shrink-0" />
        </button>

        {/* User Dropdown */}
        <UserDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
        />
      </div>
    </nav>
  );
};

export default SuperAdminNavbar;

