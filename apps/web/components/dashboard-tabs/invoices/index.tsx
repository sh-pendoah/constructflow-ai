"use client";

import { useState } from "react";
import InvoiceSidebar, { Invoice } from "@/components/invoice-sidebar";
import InvoicePreview from "@/components/invoice-preview";
import InvoiceDetails from "@/components/invoice-details";
// import NoPreviewTab from "../no-preview";

const InvoicesTab = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  return (
    <div className="w-full px-0">
      <div className="w-full h-[calc(100vh-300px)] min-h-[768px] max-h-[768px] flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[316px] flex-shrink-0 h-full">
          <InvoiceSidebar onInvoiceSelect={handleInvoiceSelect} />
        </div>

        {/* Center Preview Section */}
        <div className="flex-1 min-w-0 h-full relative">
          <InvoicePreview />
        </div>

        {/* Right Invoice Details Section */}
        <div className="w-[336px] flex-shrink-0 h-full">
          <InvoiceDetails invoice={selectedInvoice} />
        </div>
      </div>
      {/* <NoPreviewTab /> */}
    </div>
  );
};

export default InvoicesTab;

