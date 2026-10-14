import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  FolderPlus,
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Tags,
  BarChart3,
  ScrollText,
  FileCheck2,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export const Sidebar = () => {
  const { user, isClient, isFreelancer, isAdmin } = useAuth();

  const clientLinks = [
    { to: '/client/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/client/projects/create', label: 'Create AI Project', icon: FolderPlus, highlight: true },
    { to: '/client/projects', label: 'My Projects', icon: Briefcase },
    { to: '/client/contracts', label: 'Contracts & Escrow', icon: FileCheck2 },
    { to: '/client/invoices', label: 'Invoices & Billing', icon: DollarSign },
    { to: '/client/messages', label: 'Messages', icon: MessageSquare },
  ];

  const freelancerLinks = [
    { to: '/freelancer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/freelancer/projects/create', label: 'Add Project Idea', icon: FolderPlus, highlight: true },
    { to: '/freelancer/projects', label: 'My Project Ideas', icon: Briefcase },
    { to: '/freelancer/proposals', label: 'My Proposals', icon: FileText },
    { to: '/freelancer/contracts', label: 'Active Contracts', icon: FileCheck2 },
    { to: '/freelancer/milestones', label: 'Milestones & Work', icon: CheckCircle2 },
    { to: '/freelancer/time-tracking', label: 'Time Tracker', icon: Clock },
    { to: '/freelancer/earnings', label: 'Earnings & Invoices', icon: DollarSign },
    { to: '/freelancer/messages', label: 'Messages', icon: MessageSquare },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Console Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/freelancers', label: 'Freelancer Verification', icon: ShieldCheck },
    { to: '/admin/projects', label: 'Project Moderation', icon: Briefcase },
    { to: '/admin/contracts', label: 'Contracts Oversight', icon: FileCheck2 },
    { to: '/admin/disputes', label: 'Dispute Arbitration', icon: AlertTriangle },
    { to: '/admin/taxonomy', label: 'Taxonomy & Skills', icon: Tags },
    { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: ScrollText },
  ];

  let links = [];
  if (isAdmin) links = adminLinks;
  else if (isClient) links = clientLinks;
  else if (isFreelancer) links = freelancerLinks;

  const displayName =
    user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'WorkPulse User');

  return (
    <aside className="w-64 bg-white dark:bg-[#0D1220] border-r border-slate-200 dark:border-[#3B82F6]/15 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      {/* User profile brief in sidebar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#111726]/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center font-bold text-xs shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">{displayName}</h4>
            <Badge variant={user?.role} className="mt-1 text-[10px]" />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          WorkSpace Menu
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-[#3B82F6]/15 text-[#3B82F6] dark:text-[#60A5FA] font-bold border border-[#3B82F6]/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : link.highlight
                    ? 'text-[#3B82F6] dark:text-[#93C5FD] bg-[#3B82F6]/5 hover:bg-[#3B82F6]/10 font-semibold border border-[#3B82F6]/20'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161F36]/60 font-medium'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
