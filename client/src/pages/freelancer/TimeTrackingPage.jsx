import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient.js';
import { contractApi } from '../../api/contractApi.js';
import {
  Play,
  Square,
  Clock,
  Plus,
  Calendar,
  CheckCircle2,
  Timer,
  Zap,
  Activity,
  Briefcase,
} from 'lucide-react';
import { DataTable } from '../../components/common/DataTable.jsx';

export const TimeTrackingPage = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual entry modal
  const [manualDescription, setManualDescription] = useState('');
  const [manualHours, setManualHours] = useState('1.5');
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchContractsAndHistory = async () => {
      try {
        const cRes = await contractApi.getUserContracts({ status: 'ACTIVE' });
        if (cRes.data?.contracts && cRes.data.contracts.length > 0) {
          setContracts(cRes.data.contracts);
          setSelectedContractId(cRes.data.contracts[0].id);
        }

        const hRes = await apiClient.get('/time-tracking/my/summary');
        if (hRes.data?.entries) {
          setHistory(hRes.data.entries);
        }
      } catch (err) {
        console.error('Failed to load time tracking data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContractsAndHistory();
  }, []);

  // Stopwatch ticking interval
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const handleStartTimer = async () => {
    if (!selectedContractId) {
      alert('Please select an active contract to track time on.');
      return;
    }

    try {
      const res = await apiClient.post('/time-tracking/start', {
        contractId: selectedContractId,
        description: description || 'Active engineering sprint',
      });
      if (res.data) {
        setActiveEntryId(res.data.id);
        setTimerRunning(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    if (!activeEntryId) return;
    try {
      await apiClient.post(`/time-tracking/${activeEntryId}/stop`);
      setTimerRunning(false);
      setElapsedSeconds(0);
      setActiveEntryId(null);
      setDescription('');

      // Refresh history
      const hRes = await apiClient.get('/time-tracking/my/summary');
      if (hRes.data?.entries) setHistory(hRes.data.entries);
    } catch (err) {
      alert(err.message || 'Failed to stop timer');
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!selectedContractId) return;
    try {
      await apiClient.post('/time-tracking/manual', {
        contractId: selectedContractId,
        description: manualDescription || 'Development sprint',
        durationHours: Number(manualHours),
      });
      setManualDescription('');
      setManualHours('1.5');
      const hRes = await apiClient.get('/time-tracking/my/summary');
      if (hRes.data?.entries) setHistory(hRes.data.entries);
    } catch (err) {
      alert(err.message || 'Failed to log manual time');
    }
  };

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h} : ${m} : ${s}`;
  };

  const totalTrackedHours = history.reduce((sum, h) => sum + Number(h.durationHours || 0), 0);

  const columns = [
    {
      key: 'contract',
      header: 'Contract & Client',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
            {row.contract?.title || 'Engineering Contract'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Client: {row.contract?.client?.name || 'Verified Client'}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Session Focus',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.description || 'Sprint task'}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row) => (
        <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA] font-mono text-xs">
          {Number(row.durationHours || 0).toFixed(2)} hrs
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Logged At',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#06B6D4] text-xs font-mono font-medium mb-2">
          <Timer className="w-3.5 h-3.5" />
          <span>REAL-TIME TELEMETRY TRACKER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Precision Time Tracking & Timesheets
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Log billable hours against active milestones, track development sprint intervals, and export audited work sessions.
        </p>
      </div>

      {/* Cyber Stopwatch Console */}
      <div className="cyber-card bg-white dark:bg-[#111726]/90 p-8 rounded-3xl border border-slate-200 dark:border-blue-500/25 shadow-xl relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto space-y-6 relative z-10">
          {/* Active Contract Selector */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Target Contract Workstream
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              disabled={timerRunning}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            >
              {contracts.length === 0 ? (
                <option value="">No active contracts available</option>
              ) : (
                contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.client?.name})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Description Input */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={timerRunning}
            placeholder="Describe your current focus (e.g., Auth Middleware optimization)..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />

          {/* Digital Timer Display Panel */}
          <div className="p-7 rounded-2xl bg-[#080B12] border border-blue-500/30 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] text-center relative">
            {timerRunning && (
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  RECORDING
                </span>
              </div>
            )}
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-[#00F0FF] select-none text-glow-cyan">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-widest mt-2 font-mono">
              HH : MM : SS
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            {!timerRunning ? (
              <button
                onClick={handleStartTimer}
                disabled={!selectedContractId}
                className="btn-electric px-8 py-3 rounded-xl text-white font-semibold text-xs shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Session Timer</span>
              </button>
            ) : (
              <button
                onClick={handleStopTimer}
                className="px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop & Commit Session</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Section */}
      <div className="cyber-card bg-white dark:bg-[#111726]/85 p-6 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#3B82F6]" />
          <span>Manual Timesheet Submission</span>
        </h3>
        <form onSubmit={handleManualEntry} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
            placeholder="Retroactive sprint description..."
            className="sm:col-span-2 px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={manualHours}
              onChange={(e) => setManualHours(e.target.value)}
              className="w-24 px-3 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">hrs</span>
            <button
              type="submit"
              className="ml-auto btn-electric px-4 py-2.5 rounded-xl text-xs font-semibold"
            >
              Log Time
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3B82F6]" />
            <span>Logged Time Sessions</span>
          </h3>
          <span className="text-xs font-mono text-[#3B82F6] dark:text-[#60A5FA] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 font-semibold">
            Total: {totalTrackedHours.toFixed(2)} Hours Logged
          </span>
        </div>
        <DataTable
          columns={columns}
          data={history}
          loading={loading}
          searchPlaceholder="Search logged entries by task or contract..."
        />
      </div>
    </div>
  );
};

export default TimeTrackingPage;
