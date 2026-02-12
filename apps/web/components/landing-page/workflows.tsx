import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ShieldCheck, DollarSign, Mail, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Check } from 'lucide-react';

// --- Shared Components ---

const Badge = ({ text, className = "", variant = "blue" }: { text: string, className?: string, variant?: "blue" | "white" }) => {
  const baseStyle = "px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase inline-flex items-center justify-center";
  const variants = {
    blue: "bg-[#E6F2F1] text-[#1F6F66] border border-[#1F6F66]/20",
    white: "bg-white/10 text-white border border-white/20 backdrop-blur-sm"
  };
  return <span className={`${baseStyle} ${variants[variant]} ${className}`}>{text}</span>;
};

const CardWrapper = ({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={`relative group overflow-hidden transition-all duration-500 hover:-translate-y-1.5 ${className}`}
  >
    {children}
  </motion.div>
);

// --- Mockup Components ---

// Card 1 Animation: Email -> PDF -> Table
const DailyLogMockup = () => {
  return (
    <div className="relative w-full h-[240px] mt-10 flex items-center justify-between px-4 md:px-12 gap-4">
      {/* Step 1: Email */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-3 z-10"
      >
        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center shadow-sm border border-teal-100 relative">
          <Mail className="text-teal-500" size={32} />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
          >
            1
          </motion.div>
        </div>
        <div className="text-xs text-gray-400 font-medium">Daily Log.pdf</div>
      </motion.div>

      {/* Arrow 1 */}
      <div className="flex-1 h-[2px] bg-gray-100 relative overflow-hidden mx-4">
        <motion.div 
          className="absolute inset-0 bg-[#1F6F66]"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
        />
      </div>

      {/* Step 2: Extraction Table */}
      <div className="w-[200px] bg-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-4 z-10">
        <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-semibold">Extracted Data</div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.5, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded bg-teal-50 flex items-center justify-center text-[#1F6F66]">
                <FileText size={12} />
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full w-full" />
              <div className="w-8 h-2 bg-gray-100 rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Arrow 2 */}
      <div className="flex-1 h-[2px] bg-gray-100 relative overflow-hidden mx-4">
        <motion.div 
          className="absolute inset-0 bg-[#1F6F66]"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1.5, repeatDelay: 0.5 }}
        />
      </div>

      {/* Step 3: Comp Code */}
      <div className="flex flex-col items-center gap-3 z-10">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center shadow-sm border border-green-100">
          <CheckCircle2 className="text-green-500" size={32} />
        </div>
        <div className="text-xs text-gray-400 font-medium">Audit Ready</div>
      </div>
    </div>
  );
};

// Card 2 Animation: Vendor Compliance List
const ComplianceListMockup = () => {
  const vendors = [
    { name: "Acme Concrete", status: "compliant", label: "Valid until Jan 2026", progress: 100 },
    { name: "Steel Corp", status: "warning", label: "30 days left", progress: 70 },
    { name: "Builder LLC", status: "compliant", label: "Valid until Mar 2026", progress: 100 },
    { name: "Demo Inc", status: "expired", label: "Expired 5 days ago", progress: 0 },
  ];

  return (
    <div className="w-full mt-8 space-y-3">
      {vendors.map((vendor, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + (index * 0.15) }}
          className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden"
        >
          {/* Status Icon */}
          <div className="shrink-0">
             {vendor.status === 'compliant' && <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Check size={14} strokeWidth={3} /></div>}
             {vendor.status === 'warning' && (
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600"
                >
                  <AlertTriangle size={14} strokeWidth={2.5} />
                </motion.div>
             )}
             {vendor.status === 'expired' && (
                <motion.div 
                  animate={{ opacity: [1, 0.5, 1] }} 
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600"
                >
                  <XCircle size={14} strokeWidth={2.5} />
                </motion.div>
             )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-gray-800">{vendor.name}</span>
                <span className={`text-[10px] font-medium ${
                  vendor.status === 'compliant' ? 'text-green-600' : 
                  vendor.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>{vendor.label}</span>
             </div>
             {/* Progress Bar */}
             <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${vendor.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 + (index * 0.2) }}
                  className={`h-full rounded-full ${
                    vendor.status === 'compliant' ? 'bg-green-500' : 
                    vendor.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Card 3 Animation: Invoice Approval Interface
const InvoiceApprovalMockup = () => {
  return (
    <div className="w-full h-[320px] bg-[#2D3436] rounded-xl border border-gray-700 overflow-hidden flex shadow-2xl">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-gray-700 bg-[#252B2D] p-3 space-y-2 hidden sm:block">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-semibold">Review Queue (3)</div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`p-3 rounded-lg flex items-center gap-3 ${i === 1 ? 'bg-[#1F6F66]/10 border border-[#1F6F66]/20' : 'hover:bg-white/5 border border-transparent'}`}>
            <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-400 text-xs">#{1023 + i}</div>
            <div className="flex-1 min-w-0">
               <div className={`text-sm font-medium ${i === 1 ? 'text-[#1F6F66]' : 'text-gray-300'}`}>Lumber Co.</div>
               <div className="text-[10px] text-gray-500">$1,240.50</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 p-6 flex flex-col relative">
         <div className="flex justify-between items-start mb-6">
            <div>
               <h4 className="text-white text-lg font-bold">INV-1024</h4>
               <p className="text-gray-400 text-sm">Lumber Supply Co.</p>
            </div>
            <div className="bg-[#1F6F66] text-white text-xs px-2 py-1 rounded font-bold">
               $1,240.50
            </div>
         </div>

         {/* Extracted Fields Simulation */}
         <div className="space-y-3 opacity-80">
            <div className="flex justify-between text-sm py-2 border-b border-gray-700">
               <span className="text-gray-500">Date</span>
               <span className="text-gray-300">Oct 12, 2024</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-700">
               <span className="text-gray-500">GL Code</span>
               <span className="text-gray-300">500-20 Materials</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-700">
               <span className="text-gray-500">Project</span>
               <span className="text-gray-300">Westside Apts</span>
            </div>
         </div>

         {/* Action Bar */}
         <div className="mt-auto flex gap-3">
             <button className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 text-sm hover:bg-gray-700">Reject</button>
             <motion.button 
                animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(31,111,102,0)", "0 0 20px rgba(31,111,102,0.4)", "0 0 0px rgba(31,111,102,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-1 py-2 rounded-lg bg-[#1F6F66] text-white text-sm font-bold shadow-lg shadow-teal-900/50"
             >
                Approve
             </motion.button>
         </div>
         
         {/* Animated Cursor */}
         <motion.div 
            initial={{ opacity: 0, x: 200, y: 200 }}
            animate={{ opacity: [0, 1, 1, 0], x: [200, 180, 180, 200], y: [200, 180, 180, 200] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
            className="absolute bottom-4 right-12 pointer-events-none"
         >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
               <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" stroke="black" strokeWidth="2" />
            </svg>
         </motion.div>
      </div>
    </div>
  );
};


export const Workflows: React.FC = () => {
  return (
    <section className="relative w-full py-24 bg-white overflow-hidden">
       {/* Background Radial Gradient */}
       <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03)_0%,transparent_70%)]" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <Badge text="Core Workflows" className="mb-4" />
          <h2 className="text-[#1B232A] text-[40px] md:text-[48px] font-semibold leading-tight mb-4" style={{ fontFamily: 'Onest, sans-serif' }}>
            Three Workflows. Zero Behavior Change.
          </h2>
          <p className="text-[#6C757D] text-lg max-w-[700px]" style={{ fontFamily: 'Onest, sans-serif' }}>
            Automate the paperwork chaos without forcing your team to change how they work
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Daily Logs (Large, Top Left) */}
          <CardWrapper className="md:col-span-2 bg-white rounded-3xl border border-[#1F6F66]/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-12 flex flex-col h-[520px]">
             <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-full bg-[#1F6F66] flex items-center justify-center text-white mb-6 shrink-0 shadow-lg shadow-teal-100">
                  <ClipboardList size={28} />
                </div>
                <Badge text="Audit-Ready" />
             </div>
             
             <h3 className="text-[#1B232A] text-3xl font-semibold mb-4" style={{ fontFamily: 'Onest, sans-serif' }}>Daily Logs → Workers Comp Audit</h3>
             <p className="text-[#6C757D] text-base leading-relaxed max-w-[480px]">
                Field teams email daily logs as PDFs or photos. We extract tasks, hours, worker names, and suggest comp codes. Generate audit-ready reports instantly.
             </p>

             <div className="flex flex-wrap gap-2 mt-6">
                {['OCR Extraction', 'Code Matching', 'One-Click Export'].map(tag => (
                   <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{tag}</span>
                ))}
             </div>

             <DailyLogMockup />
          </CardWrapper>


          {/* Card 2: Compliance (Medium, Top Right) */}
          <CardWrapper delay={0.2} className="md:col-span-1 bg-gradient-to-b from-[#E6F2F1] to-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-10 flex flex-col h-[520px]">
             <div className="flex items-start justify-between mb-2">
                <div className="w-12 h-12 rounded-full bg-[#1F6F66] flex items-center justify-center text-white mb-4 shadow-lg shadow-teal-100">
                  <ShieldCheck size={24} />
                </div>
                <Badge text="Never Expire" />
             </div>

             <h3 className="text-[#1B232A] text-2xl font-semibold mb-3" style={{ fontFamily: 'Onest, sans-serif' }}>Compliance Tracking</h3>
             <p className="text-[#6C757D] text-[15px] leading-relaxed">
                Track insurance certificates and compliance docs automatically. Get alerts before expiration.
             </p>

             <ComplianceListMockup />
          </CardWrapper>


          {/* Card 3: Invoice Processing (Full Width, Bottom) */}
          <CardWrapper delay={0.3} className="md:col-span-3 bg-[#1B232A] rounded-3xl border border-gray-800 shadow-[0_8px_32px_rgba(31,111,102,0.15)] p-0 flex flex-col md:flex-row overflow-hidden min-h-[400px]">
             {/* Content Left */}
             <div className="flex-1 p-10 md:p-14 flex flex-col justify-center relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1F6F66]/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                   <div className="w-14 h-14 rounded-full bg-[#1F6F66] flex items-center justify-center text-white shadow-lg shadow-teal-900/50">
                     <DollarSign size={28} />
                   </div>
                   <Badge text="80% Auto-Approved" variant="white" />
                </div>

                <h3 className="text-white text-3xl md:text-4xl font-semibold mb-4 relative z-10" style={{ fontFamily: 'Onest, sans-serif' }}>Invoice Processing → <br/>Smart Approvals</h3>
                <p className="text-gray-400 text-base leading-relaxed max-w-[440px] mb-8 relative z-10">
                   Email invoices get OCR'd, matched to vendors, checked for duplicates, and routed based on thresholds. Office team reviews only the exceptions.
                </p>

                <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                   <div>
                      <div className="text-2xl font-bold text-white mb-1">90%</div>
                      <div className="text-sm text-gray-500">Auto-Processed</div>
                   </div>
                   <div>
                      <div className="text-2xl font-bold text-white mb-1">10%</div>
                      <div className="text-sm text-gray-500">Need Review</div>
                   </div>
                   <div>
                      <div className="text-2xl font-bold text-white mb-1">0</div>
                      <div className="text-sm text-gray-500">Duplicate Payments</div>
                   </div>
                </div>
             </div>

             {/* Mockup Right */}
             <div className="flex-1 bg-[#23292C] relative p-8 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_60%)] pointer-events-none" />
                <motion.div 
                   className="w-full max-w-[500px] perspective-1000"
                   initial={{ rotateY: -5, rotateX: 5 }}
                   whileHover={{ rotateY: 0, rotateX: 0 }}
                   transition={{ duration: 0.5 }}
                >
                   <InvoiceApprovalMockup />
                </motion.div>
             </div>
          </CardWrapper>

        </div>
      </div>
    </section>
  );
};