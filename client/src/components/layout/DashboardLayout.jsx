import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
