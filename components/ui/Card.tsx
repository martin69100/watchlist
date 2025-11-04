import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  const baseClasses = 'bg-card rounded-lg shadow-lg overflow-hidden';
  
  return <div className={`${baseClasses} ${className}`}>{children}</div>;
};
