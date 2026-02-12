import React from 'react';

export const Button: React.FC<any> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: "bg-[#1F6F66] text-white hover:bg-[#185A52] focus:ring-[#1F6F66]",
    secondary: "bg-white border border-[#1B232A] text-[#1B232A] hover:bg-gray-50 focus:ring-[#1B232A]"
  };

  return (
    <button
      className={`${variants[variant as keyof typeof variants]} ${className || ''}`}
      style={{ fontFamily: 'Onest, sans-serif' }}
      {...props}
    >
      {children}
    </button>
  );
};