import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Clock, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative w-full py-[120px] bg-[#1B232A] overflow-hidden">
      
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[#1F6F66] opacity-[0.15] blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#5BA89E] opacity-[0.1] blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#1F6F66] opacity-[0.08] blur-[80px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '64px 64px' }}>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 relative z-10">
        
        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          
          {/* Headline */}
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white text-[40px] md:text-[56px] font-bold leading-[1.1] mb-6 tracking-tight"
            style={{ fontFamily: 'Onest, sans-serif' }}
          >
            Ready to Stop the{' '}
            <span className="relative inline-block text-white">
              Paperwork Chaos
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#1F6F66]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="url(#underline-gradient)" strokeWidth="3" fill="none" />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1F6F66" />
                    <stop offset="100%" stopColor="#5BA89E" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            ?
          </motion.h2>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-lg md:text-[20px] leading-[1.6] max-w-[700px] mx-auto mb-10"
            style={{ fontFamily: 'Onest, sans-serif' }}
          >
            Cut your admin time by 70% and get back to building. Join hundreds of construction teams who switched to docflow-360.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row cursor-pointer items-center justify-center gap-4 mb-12"
          >
            <Link href="/auth/signup">
            <button className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 bg-[#1F6F66] text-white text-base font-bold px-10 py-4 rounded-xl shadow-lg shadow-teal-900/50 hover:bg-[#185A52] hover:-translate-y-1 transition-all duration-300">
              Start 14-Day Free Trial
              <ArrowRight size={18} />
            </button>
            </Link>
            <Link href="/auth">
            <button className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white text-base font-bold px-10 py-4 rounded-xl hover:bg-white/10 transition-all duration-300">
              Schedule a Demo
            </button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <ShieldCheck size={18} className="text-[#5BA89E]" />
              <span>No contracts. Cancel anytime.</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <Clock size={18} className="text-[#5BA89E]" />
              <span>Setup in under 30 minutes.</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <CreditCard size={18} className="text-[#5BA89E]" />
              <span>No credit card required.</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};