import React from "react";
import { motion } from "framer-motion";
import { Check, X, Lock } from "lucide-react";

type Feature = {
  text: string;
  type: "included" | "locked" | "excluded";
};

const PricingCard = ({
  title,
  description,
  price,
  heading,
  features,
  ctaText,
  isHighlighted = false,
  badge,
  delay = 0,
  buttonBorderGreen = false,
}: {
  title: string;
  description: string;
  price: string;
  heading: string;
  features: Feature[];
  ctaText: string;
  isHighlighted?: boolean;
  badge?: string;
  delay?: number;
  buttonBorderGreen?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 0 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`relative flex flex-col p-10 rounded-2xl bg-white border transition-all duration-300 ${
      isHighlighted
        ? "border-teal-100 shadow-[0_20px_40px_rgba(31,111,102,0.15)] z-10"
        : "border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
    }`}
  >
    {badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-500">
        {badge}
      </div>
    )}

    {/* Header */}
    <div className="mb-6 text-center">
      <h3
        className="text-[#1B232A] text-xl font-bold mb-2"
        style={{ fontFamily: "Onest, sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="text-[#6C757D] text-[15px] min-h-[44px]"
        style={{ fontFamily: "Onest, sans-serif" }}
      >
        {description}
      </p>
    </div>

    {/* Price */}
    <div className="mb-8 text-center">
      <div
        className="text-[#1B232A] text-4xl font-bold"
        style={{ fontFamily: "Onest, sans-serif" }}
      >
        {price}
      </div>

      <span className="text-gray-400 text-sm">per month</span>
    </div>

    {/* CTA Button */}
    <button
      className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 mb-8 ${
        isHighlighted
          ? "bg-[#1F6F66] text-white hover:bg-[#185A52] shadow-lg shadow-teal-200"
          : buttonBorderGreen
            ? "bg-white border border-[#1F6F66] text-[#1B232A] hover:bg-gray-50"
            : "bg-white border border-gray-200 text-[#1B232A] hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      {ctaText}
    </button>

    <p
      className="text-[#1B232A] font-bold text-[15px] mb-4"
      style={{ fontFamily: "Onest, sans-serif" }}
    >
      {heading}
    </p>

    {/* Features */}
    <div className="space-y-4 flex-1 mb-4">
      {features.map((feature, i) => {
        const isLocked = feature.type === "locked";
        const isExcluded = feature.type === "excluded";
        const bgColor = isExcluded
          ? "bg-red-100"
          : isLocked
            ? "bg-gray-200"
            : "bg-green-100";
        const textColor = isExcluded
          ? "#000"
          : isLocked
            ? "#A0A0A0"
            : "#495057";

        return (
          <div
            key={i}
            className={`flex items-start gap-3 text-sm`}
            style={{ color: textColor }}
          >
            <div
              className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${bgColor}`}
            >
              {isLocked ? (
                <Lock
                  size={12}
                  strokeWidth={2}
                  color="#6B7280"
                />
              ) : isExcluded ? (
                <X size={12} strokeWidth={3} color="#DC3545" />
              ) : (
                <Check
                  size={12}
                  strokeWidth={3}
                  color="#1F6F66"
                />
              )}
            </div>
            <span className={`leading-5 ${isLocked}`}>
              {feature.text}
            </span>
          </div>
        );
      })}
    </div>
  </motion.div>
);

export const Pricing: React.FC = () => {
  return (
    <section className="w-full bg-white py-24 border-t border-gray-50">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <h2
            className="text-[#1B232A] text-[40px] font-semibold leading-tight mb-4"
            style={{ fontFamily: "Onest, sans-serif" }}
          >
            Simple, Workflow-Based Pricing
          </h2>
          <p
            className="text-[#6C757D] text-lg max-w-[600px]"
            style={{ fontFamily: "Onest, sans-serif" }}
          >
            Start with one workflow. Expand as you see value.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Tier 1 */}
          <PricingCard
            title="Core Ingestion"
            description="Customer Correction & Approval"
            price="$1,500"
            heading="Included"
            features={[
              {
                text: "Worklighter-owned ingestion inboxes (Invoices, Logs, Compliance)",
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
                text: "Customer-specific schema evolution, historical backfill, optional Worklighter correction (Embedded Ops Partner)",
                type: "excluded",
              },
            ]}
            ctaText="Get Started"
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
                text: "Schema evolution, complex exports, historical backfill, optional Worklighter correction (Embedded Ops Partner)",
                type: "locked",
              },
            ]}
            ctaText="Get Started"
            isHighlighted
            badge="Most Popular"
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
                text: "Optional Worklighter-performed correction and approval (by agreement)",
                type: "included",
              },
              {
                text: "Explicit liability carve-outs and audit logging",
                type: "included",
              },
            ]}
            ctaText="Contact Sales"
            delay={0.2}
            buttonBorderGreen={true}
          />
        </div>
      </div>
    </section>
  );
};
