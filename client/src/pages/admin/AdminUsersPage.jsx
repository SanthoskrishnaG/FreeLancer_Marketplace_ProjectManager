import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Shield, UserX, UserCheck, AlertTriangle, Users, Lock, ShieldCheck } from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('SUSPENDED');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      if (res.data?.users) setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);

    try {
      await adminApi.updateUserStatus(selectedUser.id, {
        status: newStatus,
        reason: reason || 'Administrative moderation action',
      });
      setModalOpen(false);
      setReason('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Identity & Credentials',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.name}`}
            alt={row.name}
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-blue-500/30"
          />
          <div>
            <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{row.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role Clearance',
      sortable: true,
      render: (row) => <Badge variant={row.role} />,
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: (row) => <Badge variant={row.status} />,
    },
    {
      key: 'projectsOrContracts',
      header: 'Active Pipeline',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {row.role === 'CLIENT'
            ? `${row._count?.clientProjects || 0} projects • ${row._count?.clientContracts || 0} contracts`
            : `${row._count?.proposals || 0} proposals • ${row._count?.freelancerContracts || 0} contracts`}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Moderation',
      render: (row) => (
        <div>
          {row.role !== 'ADMIN' && (
            <button
              onClick={() => {
                setSelectedUser(row);
                setNewStatus(row.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                setModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] border border-slate-200 dark:border-slate-700/80 transition-all"
            >
              Modify Status
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>IDENTITY ACCESS MANAGEMENT (IAM)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          User Directory & Moderation Controls
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review verified platform profiles, audit role assignments, monitor user velocity, and enforce access revocation.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users by name or email address..."
        filterKey="role"
        filterOptions={[
          { label: 'Client', value: 'CLIENT' },
          { label: 'Freelancer', value: 'FREELANCER' },
          { label: 'Admin', value: 'ADMIN' },
        ]}
      />

      {/* Modify Status Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Account Status & Access Clearance"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            Updating status for <span className="text-slate-900 dark:text-[#F8FAFC] font-bold">{selectedUser?.name}</span> ({selectedUser?.email}). This action will be recorded in the security audit ledger.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            >
              <option value="ACTIVE">ACTIVE (Full Platform Privileges)</option>
              <option value="SUSPENDED">SUSPENDED (Temporary Hold)</option>
              <option value="BANNED">BANNED (Permanent Revocation)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Administrative Moderation
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Identity re-verification, suspicious bid activity, or compliance policy violation..."
              className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Apply Status Modification
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
