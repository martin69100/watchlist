import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  const baseClasses = 'w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';
  
  return <input className={`${baseClasses} ${className}`} {...props} />;
};
