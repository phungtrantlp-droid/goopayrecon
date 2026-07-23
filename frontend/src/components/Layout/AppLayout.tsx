import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard & Báo Cáo',
  '/partners': 'Quản lý Đối Tác',
  '/connectors': 'Quản lý Connector',
  '/thu': 'Phát Sinh Thu',
  '/chi': 'Phát Sinh Chi',
  '/quyet-toan': 'Quyết Toán',
  '/balance': 'Số Dư Lũy Kế',
  '/reconciliation': 'Đối Soát & Khóa Sổ',
};

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'GooPayRecon';

  return (
    <div className="min-h-screen bg-surface-dark flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-60'}`}>
        <TopBar title={title} />
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden relative">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
