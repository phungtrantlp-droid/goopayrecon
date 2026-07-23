import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

interface TopBarProps {
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const [time, setTime] = useState(new Date());
  const { user } = useAuthStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-border-color flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-sm font-mono text-gray-400 bg-surface-card px-3 py-1.5 rounded-md border border-border-color">
          {format(time, 'dd/MM/yyyy HH:mm:ss')}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">{user?.username}</span>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-white border border-primary-light">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
