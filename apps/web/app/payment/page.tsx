"use client";
import { PricingCard } from "@/components/landing-page/pricing";

export default function PaymentPage() {
  return (
    <div className="max-w-[1200px] my-10 mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
    {/* Tier 1 */}
    <PricingCard
      title="Core Ingestion"
      description="Customer Correction & Approval"
      price="$1,500"
      heading="Included"
      features={[
        {
          text: "docflow-360-owned ingestion inboxes (Invoices, Logs, Compliance)",
          type: "included",
        },
        {
          text: "Email-based ingestion only",
          type: "included",
        },
        {
          text: "OCR + structured data extraction",
          type: "included",
        },
        {
          text: "Generic ERP-agnostic schema normalization",
          type: "included",
        },
        {
          text: "Exception Review Queue (view & approve errors)",
          type: "included",
        },
        {
          text: "ERP-ready CSV exports for standard import",
          type: "included",
        },
        {
          text: "Immutable source retention for audit",
          type: "included",
        },
        {
          text: "ERP-specific export mapping, confidence scoring & advanced validations (Advanced Ops)",
          type: "locked",
        },
        {
          text: "Customer-specific schema evolution, historical backfill, optional docflow-360 correction (Embedded Ops Partner)",
          type: "excluded",
        },
      ]}
      ctaText="Get Started"
      badgeColor="green"
      delay={0}
      buttonBorderGreen={true}
    />

    {/* Tier 2 */}
    <PricingCard
      title="Advanced Ops"
      description="Customer Approval with System Guidance"
      price="$3,500"
      heading="Everything in Core Ingestion, plus"
      features={[
        {
          text: "Custom ERP-specific export mapping",
          type: "included",
        },
        {
          text: "Cost code validation suggestions (CSI MasterFormat baseline + customer mappings)",
          type: "included",
        },
        {
          text: "Confidence scoring on extracted field",
          type: "included",
        },
        {
          text: "Workers’ compensation code validation suggestions (NCCI / state-aware)",
          type: "included",
        },
        {
          text: "Priority processing and exception surfacing",
          type: "included",
        },
        {
          text: "Schema evolution, complex exports, historical backfill, optional docflow-360 correction (Embedded Ops Partner)",
          type: "locked",
        },
      ]}
      ctaText="Get Started"
      isHighlighted
      badge="Most Popular"
      badgeColor="green"
      delay={0.1}
    />

    {/* Tier 3 */}
    <PricingCard
      title="Embedded Ops Partner"
      description=" Shared or Delegated (Contract-Specific)"
      price="$7,500"
      heading="Everything in Advanced Ops, plus"
      features={[
        {
          text: "Customer-specific schema evolution",
          type: "included",
        },
        {
          text: "Complex or multi-ERP export requirements",
          type: "included",
        },
        {
          text: "Historical document backfill ingestion",
          type: "included",
        },
        {
          text: "Defined escalation paths",
          type: "included",
        },
        {
          text: "Optional docflow-360-performed correction and approval (by agreement)",
          type: "included",
        },
        {
          text: "Explicit liability carve-outs and audit logging",
          type: "included",
        },
      ]}
      ctaText="Contact Sales"
      badgeColor="green"
      delay={0.2}
      buttonBorderGreen={true}
    />
  </div>
  );
}