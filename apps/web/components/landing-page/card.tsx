import React from 'react';

export const Card: React.FC<any> = ({ children, className, ...props }) => {
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
