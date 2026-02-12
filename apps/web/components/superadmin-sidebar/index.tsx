"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CircleDollarSign, PanelRight, PanelRightOpen } from "lucide-react";

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();

  const menuItems = [
    { id: "companies", label: "Companies", path: "/superadmin/companies", icon: Building2 },
    { id: "billing", label: "Billing", path: "/superadmin/billing", icon: CircleDollarSign },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-[#DEE0E3] shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)]
          z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          w-[283px]
        `}
      >
        <div className="flex flex-col h-full" style={{ padding: "24px 16px", gap: "36px" }}>
          {/* Logo Section */}
          <div className="flex items-center justify-between" style={{ gap: "41px" }}>
            <Link href="/superadmin/companies" className="block">
              <div className="w-[151px] h-[54px] relative">
                <Image
                  src="/images/worklighter-logo.png"
                  alt="Worklighter Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          <PanelRightOpen onClick={onClose} className="w-5 h-5 md:hidden block text-primary cursor-pointer" />
          </div>

          {/* Menu Items */}
          <nav className="flex-1 flex flex-col" style={{ gap: "4px" }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-2 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? "bg-[#1F6F66] text-white"
                        : "text-[#0E1114] hover:bg-gray-50"
                    }
                  `}
                  style={{ padding: "12px 20px" }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-label font-sf-pro font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;

