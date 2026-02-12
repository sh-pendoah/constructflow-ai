import React from "react";
import { ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E9ECEF]">
      <div className="max-w-[1200px] mx-auto px-10 h-[80px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Worklighter"
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Links */}
        <div
          className="hidden md:flex items-center gap-12"
          style={{ marginLeft: "48px" }}
        >
          <a
            href="#"
            className="text-[#1B232A] text-[14px] font-medium hover:text-[#1F6F66] transition-colors"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Features
          </a>
          <a
            href="#"
            className="text-[#1B232A] text-[14px] font-medium hover:text-[#1F6F66] transition-colors"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            How it Works
          </a>
          <a
            href="#"
            className="text-[#1B232A] text-[14px] font-medium hover:text-[#1F6F66] transition-colors"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Pricing
          </a>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex items-center gap-4"
          style={{ marginLeft: "48px" }}
        >
          {/* Log in Button */}
          <a
            href="#"
            className="text-[#1F6F66] text-[15px] font-medium hover:text-[#185A52] border-[1px] border-[#1f6f66] rounded-[8px] transition-colors h-[44px] flex items-center px-6"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
            }}
          >
            Log in
          </a>

          {/* Book a Demo Button */}
          <button
            className="h-[44px] px-8 bg-[#1F6F66] text-white text-[15px] font-medium rounded-[6px] hover:bg-[#185A52] transition-all duration-200 flex items-center gap-2"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
            }}
          >
            Book a Demo
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};