import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Shield, UserX, UserCheck, AlertTriangle } from 'lucide-react';

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
        reason: reason || 'Administrative action',
      });
      alert('User status updated and logged to Security Audit Trail.');
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
      header: 'User Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={row.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.name}`}
            alt={row.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-700"
          />
          <div>
            <div className="font-semibold text-white">{row.name}</div>
            <div className="text-xs text-gray-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
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
      header: 'Activity Counts',
      render: (row) => (
        <span className="text-xs text-gray-400">
          {row.role === 'CLIENT'
            ? `${row._count?.clientProjects || 0} projects, ${row._count?.clientContracts || 0} contracts`
            : `${row._count?.proposals || 0} proposals, ${row._count?.freelancerContracts || 0} contracts`}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-400">
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
              className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 hover:text-white border border-gray-700 transition-colors"
            >
              Modify Status
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">User Directory & Access Control</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          View all registered accounts, roles, verified credentials, and apply disciplinary sanctions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users by name or email..."
        filterKey="role"
        filterOptions={[
          { label: 'Client', value: 'CLIENT' },
          { label: 'Freelancer', value: 'FREELANCER' },
          { label: 'Admin', value: 'ADMIN' },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modify User Status & Security Action"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <p className="text-xs text-gray-400">
            Updating status for <span className="text-white font-semibold">{selectedUser?.name}</span> (
            {selectedUser?.email}). This action will be immutably recorded in the Audit Log.
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Target Account Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ACTIVE">ACTIVE (Normal Access)</option>
              <option value="SUSPENDED">SUSPENDED (Temporary Hold)</option>
              <option value="BANNED">BANNED (Permanent Ban)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Reason for Administrative Action</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Terms of Service violation, suspicious login activity, or identity confirmation."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
            >
              Apply Status Change
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
