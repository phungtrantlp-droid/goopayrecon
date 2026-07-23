import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Link2, TrendingUp, TrendingDown, 
  FileCheck, BarChart3, RefreshCw, ChevronLeft, ChevronRight, LogOut 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/partners', label: 'Đối Tác', icon: Users },
  { path: '/connectors', label: 'Connector', icon: Link2 },
  { path: '/thu', label: 'Phát Sinh Thu', icon: TrendingUp, color: 'text-green-400' },
  { path: '/chi', label: 'Phát Sinh Chi', icon: TrendingDown, color: 'text-red-400' },
  { path: '/quyet-toan', label: 'Quyết Toán', icon: FileCheck, color: 'text-purple-400' },
  { path: '/balance', label: 'Số Dư Lũy Kế', icon: BarChart3 },
  { path: '/reconciliation', label: 'Đối Soát', icon: RefreshCw },
];

export const Sidebar: React.FC<{ collapsed: boolean; setCollapsed: (val: boolean) => void }> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className={`fixed inset-y-0 left-0 z-40 bg-surface-card border-r border-border-color flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
      <div className="h-16 flex items-center px-4 border-b border-border-color justify-between">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'w-8' : 'w-full'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
            <span className="font-bold text-white text-lg">G</span>
          </div>
          {!collapsed && <span className="font-bold text-lg whitespace-nowrap gradient-text">GooPayRecon</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap overflow-hidden
                ${isActive ? 'bg-primary/20 text-accent font-medium border-l-2 border-accent' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${item.color || ''} ${isActive ? 'text-accent' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 border-t border-border-color">
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="w-full flex items-center justify-center p-2 mb-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <div className="flex items-center gap-2"><ChevronLeft className="w-5 h-5" /><span>Thu gọn</span></div>}
        </button>
        
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-surface transition-all overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-medium">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.username}</div>
              <div className="text-xs text-gray-400 truncate">{user?.role}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
