import React from "react";
import Navbar from "@/components/navbar";
import NextTopLoader from "nextjs-toploader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <NextTopLoader />
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[39px] pt-4 sm:pt-5 pb-0">
        <Navbar />
      </div>
      <main className="w-full max-w-[1362px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[39px]">{children}</main>
    </div>
  );
}

