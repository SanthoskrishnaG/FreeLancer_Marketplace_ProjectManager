import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ScrollText, ShieldAlert } from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getAuditLogs();
        if (res.data?.logs) setLogs(res.data.logs);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    {
      key: 'action',
      header: 'Security Action',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
          {row.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entity / Target ID',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-white">{row.entity}</div>
          <div className="text-[11px] font-mono text-gray-500 truncate max-w-[140px]">
            {row.entityId}
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Admin User',
      render: (row) => (
        <span className="text-xs text-gray-300 font-medium">{row.user?.name || 'System'}</span>
      ),
    },
    {
      key: 'details',
      header: 'Audit Payload Details',
      render: (row) => {
        let text = row.details;
        try {
          const parsed = JSON.parse(row.details);
          text = JSON.stringify(parsed, null, 1);
        } catch {}
        return (
          <pre className="text-[10px] font-mono text-gray-400 bg-gray-900/60 p-1.5 rounded border border-gray-800 max-w-xs overflow-x-auto">
            {text}
          </pre>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-400 font-mono">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">System Security & Audit Logs</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Immutable forensic ledger recording every administrative mutation, status change, and arbitration.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search audit trail by action or entity..."
      />
    </div>
  );
};
