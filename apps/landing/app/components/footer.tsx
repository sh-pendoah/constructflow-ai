import React from 'react';
import { Twitter, Linkedin, Github } from 'lucide-react';
import logo from '@/app/assets/logo.png';

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <li>
    <a 
      href={href} 
      className="text-[#6C757D] text-sm hover:text-[#1F6F66] transition-colors duration-200"
    >
      {children}
    </a>
  </li>
);

const FooterColumn = ({ title, links }: { title: string, links: { label: string, href: string }[] }) => (
  <div className="flex flex-col gap-4">
    <h4 className="text-[#1B232A] font-bold text-sm uppercase tracking-wide">{title}</h4>
    <ul className="space-y-3">
      {links.map((link, index) => (
        <FooterLink key={index} href={link.href}>
          {link.label}
        </FooterLink>
      ))}
    </ul>
  </div>
);

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#F8F9FA] border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Worklighter" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-[#6C757D] text-sm leading-relaxed max-w-[240px]">
              Construction ops automation, simplified. Stop chasing paperwork and start building.
            </p>
          </div>

          {/* Column 2: Product */}
          <FooterColumn 
            title="Product"
            links={[
              { label: "Workflows", href: "#" },
              { label: "Pricing", href: "#" },
              { label: "How It Works", href: "#" },
              { label: "Book a Demo", href: "#" },
            ]}
          />

          {/* Column 3: Legal */}
          <FooterColumn 
            title="Legal"
            links={[
              { label: "Terms of Service", href: "#" },
              { label: "Privacy Policy", href: "#" },
            ]}
          />
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6C757D] text-sm">
            © 2025 Worklighter. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#6C757D] hover:text-[#1F6F66] transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-[#6C757D] hover:text-[#1F6F66] transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-[#6C757D] hover:text-[#1F6F66] transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};