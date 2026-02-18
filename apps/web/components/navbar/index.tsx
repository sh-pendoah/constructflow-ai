"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Bell, ChevronDown } from "lucide-react";
import UserDropdown from "@/components/user-dropdown";
import NotificationDropdown from "@/components/notification-dropdown";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { authActions } from "@/Redux/actions/auth";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState<{
    top: number;
    right: number;
    width?: number;
  } | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const { userData } = useAppSelector((state) => state.auth);
  const hasFetchedProfile = useRef(false);
  const dispatch = useAppDispatch();
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
      const dropdownWidth = isMobile
        ? Math.min(viewportWidth - 32, 672)
        : 672; // 16px margin on each side for mobile

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

    // Fetch profile data on mount (only once)
    useEffect(() => {
      if (!hasFetchedProfile.current) {
        hasFetchedProfile.current = true;
        dispatch(authActions.getProfileRequest());
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

  return (
    <nav className="w-full max-w-[1362px] mx-auto flex justify-between items-center px-3 sm:px-4 md:px-5 py-2 sm:py-3 bg-white rounded-[8px] sm:rounded-[12px] border border-[#E7EBEE] shadow-medium">
      {/* Logo */}
      <Link href="/dashboard" className="w-[100px] h-[36px] sm:w-[120px] sm:h-[43px] md:w-[151px] md:h-[54px] relative flex-shrink-0">
        <Image
          src="/images/docflow-360-logo.png"
          alt="docflow-360 Logo"
          fill
          className="object-contain"
          priority
        />
      </Link>

      {/* Right Section: Notifications and User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 relative" ref={dropdownRef}>
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

        {/* User Profile Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="User menu"
          >
            {/* User avatar image */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
              {userData?.user?.profilePicImage ? (
                <img
                  src={userData?.user?.profilePicImage}
                  alt="User Profile"
                  width={44}
                  height={44}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-2 border-[#DEE0E3]">
                    <span className="text-sm text-gray-500 font-semibold">
                      {userData?.user?.firstName?.[0]?.toUpperCase() || ""}
                      {userData?.user?.lastName?.[0]?.toUpperCase() || ""}
                    </span>
                  </div>
              )}
            </div>
            
            {/* User Name and Role */}
            <div className="flex flex-col items-start">
              <span className="text-base sm:text-lg font-semibold text-primary font-sf-pro leading-tight">
                {userData?.user?.firstName} {userData?.user?.lastName}
              </span>
              <span className="text-xs sm:text-sm text-[#6F7A85] font-sf-pro leading-tight">
                {userData?.user?.role}
              </span>
            </div>

            {/* Dropdown Chevron */}
            <ChevronDown className="w-5 h-5 text-[#6F7A85] flex-shrink-0" />
          </button>

          {/* User Dropdown */}
          <UserDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



