import React from 'react';
import { Mail, Settings, Check, ArrowRight } from 'lucide-react';

const StepCard = ({ 
  icon: Icon, 
  step, 
  title, 
  description, 
  hasArrow = false 
}: { 
  icon: any, 
  step: string, 
  title: string, 
  description: string, 
  hasArrow?: boolean 
}) => (
  <div className="relative flex-1">
    <div className="h-full bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      {/* Icon Circle */}
      <div className="w-14 h-14 rounded-full bg-[#1F6F66] flex items-center justify-center mb-6 shrink-0 text-white shadow-md shadow-teal-200">
        <Icon size={24} strokeWidth={2} />
      </div>

      {/* Content */}
      <span className="text-[#1F6F66] font-semibold text-sm mb-2 uppercase tracking-wide">{step}</span>
      <h3 className="text-[#1B232A] text-xl font-bold mb-3" style={{ fontFamily: 'Onest, sans-serif' }}>
        {title}
      </h3>
      <p className="text-[#6C757D] leading-relaxed text-[15px]" style={{ fontFamily: 'Onest, sans-serif' }}>
        {description}
      </p>
    </div>

    {/* Connector Arrow (Desktop only) */}
    {hasArrow && (
      <div className="hidden md:flex absolute top-1/2 -right-[28px] transform -translate-y-1/2 z-10 text-gray-300">
        <ArrowRight size={24} />
      </div>
    )}
  </div>
);

export const HowItWorks: React.FC = () => {
  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="bg-[#1F6F66] text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 shadow-sm">
            Simple Process
          </span>
          <h2 
            className="text-[#1B232A] text-[40px] font-semibold leading-tight mb-4"
            style={{ fontFamily: 'Onest, sans-serif' }}
          >
            How It Works
          </h2>
          <p 
            className="text-[#6C757D] text-lg max-w-[600px]"
            style={{ fontFamily: 'Onest, sans-serif' }}
          >
            Email → Process → Review. No behavior change required.
          </p>
        </div>

        {/* Steps Container */}
        <div className="w-full flex flex-col md:flex-row gap-8 relative">
          
          <StepCard 
            icon={Mail}
            step="Step 1"
            title="Email Documents"
            description="Your team sends invoices, logs, and compliance docs exactly as they do today. No new tools."
            hasArrow={true}
          />

          <StepCard 
            icon={Settings}
            step="Step 2"
            title="We Process Everything"
            description="OCR extraction, vendor matching, and exception detection happen automatically."
            hasArrow={true}
          />

          <StepCard 
            icon={Check}
            step="Step 3"
            title="Review Exceptions"
            description="Office team reviews only the 10-20% that need attention. Everything else flows through."
            hasArrow={false}
          />

        </div>

      </div>
    </section>
  );
};