import React from 'react';
import { motion } from 'framer-motion';

export const TrustBadges: React.FC = () => {
  const companies = [
    "Vertex",
    "Nexus",
    "Pillar",
    "Horizon",
    "Summit",
    "Terra"
  ];

  return (
    <section className="w-full bg-[#F8F9FA] py-16 border-b border-[#E9ECEF]">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center">
        
        {/* Section Heading */}
        <h3 
          className="text-[#6C757D] text-[14px] font-bold tracking-[1px] mb-10 text-center uppercase"
          style={{ fontFamily: 'Onest, sans-serif' }}
        >
          Trusted by Industry Leaders
        </h3>

        {/* Logo Grid - Interactive Cards */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {companies.map((company, index) => (
            <motion.div 
              key={index} 
              className="group relative flex items-center justify-center h-24 bg-white rounded-xl border border-gray-200 hover:border-[#1F6F66]/30 hover:shadow-[0_4px_20px_-4px_rgba(31,111,102,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Company Name */}
              <div className="relative z-10 flex items-center gap-3">
                {/* Simulated Logo Icon */}
                <div className="w-5 h-5 bg-[#1B232A] group-hover:bg-[#1F6F66] rounded-[4px] transition-colors duration-300"></div>
                {company}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};