import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ScrollText, ShieldAlert, Terminal, ShieldCheck } from 'lucide-react';

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
      header: 'Security Event',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#3B82F6] dark:text-[#60A5FA] bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
          {row.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Target Entity',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">{row.entity}</div>
          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
            {row.entityId}
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Operator',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.user?.name || 'System / Daemon'}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Payload Details',
      render: (row) => {
        let text = row.details;
        try {
          const parsed = JSON.parse(row.details);
          text = JSON.stringify(parsed, null, 1);
        } catch {}
        return (
          <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0D1220] p-2 rounded-lg border border-slate-200 dark:border-slate-800 max-w-xs overflow-x-auto">
            {text}
          </pre>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Audit Timestamp',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
          <Terminal className="w-3.5 h-3.5" />
          <span>IMMUTABLE FORENSIC AUDIT LEDGER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          System Security & Audit Trail
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cryptographically referenced audit ledger documenting administrative mutations, permission changes, escrow releases, and dispute resolutions.
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

export default AdminAuditLogsPage;
