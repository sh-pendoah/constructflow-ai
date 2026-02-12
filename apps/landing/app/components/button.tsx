import React from 'react';
import { ButtonProps } from '../utils/interfaces/button';

export const Button: React.FC<ButtonProps> = ({ 
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
      className={`${variants[variant]} ${className || ''}`}
      style={{ fontFamily: 'Onest, sans-serif' }}
      {...props}
    >
      {children}
    </button>
  );
};