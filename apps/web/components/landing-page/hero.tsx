import React from 'react';
import { Button } from './button';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import dashboardImage from '@/assets/banner.png';
import Image from "next/image"
import Link from 'next/link';

// Floating Badge Component for the "creative elements"
const FloatingBadge = ({ icon: Icon, text, className, delay }: { icon: any, text: string, className?: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay: delay, type: "spring" }}
    className={`absolute bg-white/90 backdrop-blur-sm rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.08)] px-3 py-2 flex items-center gap-2.5 z-20 border border-gray-100 ${className}`}
  >
    <div className="bg-[#E6F2F1] p-1.5 rounded-full text-[#1F6F66]">
      <Icon size={16} />
    </div>
    <div className="flex flex-col">
      <span className="text-[#1B232A] font-semibold text-xs leading-tight whitespace-nowrap">{text}</span>
    </div>
  </motion.div>
);

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-white pt-12 pb-20 mt-[72px]">
      {/* --- Creative Lively Background --- */}
      
      {/* 1. Base Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.3]"
        style={{
          backgroundImage: 'linear-gradient(#E9ECEF 1px, transparent 1px), linear-gradient(90deg, #E9ECEF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* 2. Large Vibrant Gradient Meshes - Creating a "Flow" */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#1F6F66]/10 via-[#5BA89E]/20 to-transparent blur-[80px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-bl from-[#1F6F66]/15 via-[#5BA89E]/10 to-transparent blur-[100px] rounded-full pointer-events-none mix-blend-multiply" />
      
      {/* 3. Decorative Abstract Shapes/Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100 600 C 200 400, 600 800, 1540 200" stroke="url(#gradient-line)" strokeWidth="2" strokeDasharray="8 8" />
        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1F6F66" stopOpacity="0" />
            <stop offset="50%" stopColor="#1F6F66" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1F6F66" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>


      <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Content Wrapper - Tighter spacing to fit fold */}
        <div className="max-w-[800px] flex flex-col items-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-[#E6F2F1] mb-6 border border-[#D0E8E5]"
          >
            <span className="text-[#1F6F66] text-[13px] font-semibold tracking-wide uppercase">
              Lightweight Automation
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#1B232A] font-bold text-[40px] md:text-[56px] leading-[1.1] mb-4 tracking-tight"
            style={{ fontFamily: 'Onest, sans-serif' }}
          >
            Construction Ops <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1F6F66] to-[#5BA89E]">Without the Chaos</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#6C757D] text-[16px] md:text-[18px] leading-[1.6] max-w-[540px] mb-8"
            style={{ fontFamily: 'Onest, sans-serif' }}
          >
            Your team emails. We automate. You review exceptions. Done. 
            Stop chasing paperwork and start building.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <Button variant="primary" className="w-full sm:w-auto px-6 py-2.5 h-10 text-[15px] shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all rounded-[8px]">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Link href="/auth/signup">
              <Button variant="secondary" className="w-full sm:w-auto px-6 py-2.5 h-10 text-[15px] flex items-center gap-2 group rounded-[8px]">
                Get Started
                <ArrowRight size={16} className="text-gray-400 group-hover:text-[#1F6F66] transition-colors" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Container - Reduced Size & Tighter Constraints */}
        <div className="relative w-full max-w-[840px] perspective-1000">
          
          {/* Main Dashboard Image */}
          <motion.div 
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative bg-white rounded-xl border border-gray-200 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] z-10"
          >
             {/* Simple Browser Header */}
             <div className="bg-gray-50 border-b border-gray-100 rounded-t-xl px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-block px-3 py-0.5 bg-white rounded text-[10px] text-gray-400 border border-gray-100 font-mono">
                    app.docflow-360.com
                  </div>
                </div>
             </div>

             {/* The Dashboard Component - constrained height/width */}
             <div className="overflow-hidden rounded-b-xl bg-gray-50">
                <div className="w-full h-[450px] overflow-hidden">
                  <div style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '166.67%', height: '166.67%' }}>
                      <Image src={dashboardImage} alt="Dashboard Invoices Approved"  />
                  </div>
                </div>
             </div>
          </motion.div>
          
          {/* Glow Effect under the dashboard */}
          <div className="absolute top-[20%] left-[10%] right-[10%] bottom-[-20px] bg-[#1F6F66] opacity-20 blur-[60px] -z-10 rounded-full" />


          {/* Floating Elements - Positioned closer to main image */}
          <FloatingBadge 
            icon={CheckCircle2} 
            text="Invoice #209 Approved" 
            className="-right-6 top-16 md:-right-8 md:top-24 shadow-teal-100"
            delay={1.0}
          />

          <FloatingBadge 
            icon={Zap} 
            text="Workflow Triggered" 
            className="-left-6 bottom-24 md:-left-8 md:bottom-32 shadow-teal-100"
            delay={1.2}
          />
          
        </div>

      </div>
    </section>
  );
};
