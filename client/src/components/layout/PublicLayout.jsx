import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { NetworkBackground } from '../common/NetworkBackground.jsx';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#080B12] text-slate-900 dark:text-[#F8FAFC] relative overflow-x-hidden transition-colors duration-200">
      {/* Dynamic Cyber Network Constellation Background */}
      <NetworkBackground />

      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
