import React from 'react';
import { Link } from 'react-router-dom';

export const BrandLogo = ({ className = '', size = 'md', to = '/' }) => {
  const sizeClasses = {
    sm: 'text-base font-extrabold',
    md: 'text-xl font-black',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  };

  const bracketClasses = {
    sm: 'text-sm font-bold',
    md: 'text-lg font-black',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  };

  const content = (
    <div className={`inline-flex items-center gap-1 tracking-tight select-none group ${className}`}>
      {/* Code Opening Bracket */}
      <span className={`text-[#3B82F6] group-hover:text-[#60A5FA] transition-colors ${bracketClasses[size]}`}>
        &lt;
      </span>
      
      {/* Brand Text */}
      <span className={`text-slate-900 dark:text-[#F8FAFC] tracking-tight font-display transition-colors ${sizeClasses[size]}`}>
        WorkPulse
      </span>

      {/* Code Closing Bracket */}
      <span className={`text-[#3B82F6] group-hover:text-[#60A5FA] transition-colors ${bracketClasses[size]}`}>
        /&gt;
      </span>

      {/* AI Super-tag */}
      <span className="ml-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 shadow-[0_0_8px_rgba(59,130,246,0.25)]">
        AI
      </span>
    </div>
  );

  if (!to) return content;

  return (
    <Link to={to} className="inline-flex items-center">
      {content}
    </Link>
  );
};

export default BrandLogo;
