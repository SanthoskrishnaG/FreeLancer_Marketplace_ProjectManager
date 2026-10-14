import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';
import { NetworkBackground } from '../common/NetworkBackground.jsx';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#080B12] text-slate-900 dark:text-[#F8FAFC] relative overflow-x-hidden transition-colors duration-200">
      {/* Subtle Constellation Particle Network */}
      <NetworkBackground className="opacity-20 dark:opacity-40" />

      {/* Global Navigation */}
      <Navbar />

      {/* Dashboard Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row relative z-10">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
