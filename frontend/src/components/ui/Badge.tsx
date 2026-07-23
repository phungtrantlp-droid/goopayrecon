import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'yellow' | 'gray' | 'orange';
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', showDot = false, className = '' }) => {
  const variants = {
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const dotColors = {
    green: 'bg-green-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    yellow: 'bg-yellow-400',
    orange: 'bg-orange-400',
    gray: 'bg-gray-400',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
