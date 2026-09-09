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

  const displayName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'WorkPulse User');

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* User profile brief in sidebar */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{displayName}</h4>
            <Badge variant={user?.role} className="mt-0.5 text-[10px]" />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 shadow-xs'
                    : link.highlight
                    ? 'bg-gradient-to-r from-indigo-50/70 to-violet-50/70 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
