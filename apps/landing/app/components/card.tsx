import React from 'react';
import { CardProps } from '../utils/interfaces/card';

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-white rounded-[16px] ${className || ''}`}
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontFamily: 'Onest, sans-serif'
      }}
      {...props}
    >
      {children}
    </div>
  );
};
