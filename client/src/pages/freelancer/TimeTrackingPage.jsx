import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient.js';
import { contractApi } from '../../api/contractApi.js';
import { Play, Square, Clock, Plus, Calendar, CheckCircle2 } from 'lucide-react';
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
        description: description || 'Active development sprint',
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
        description: manualDescription || 'Development work',
        durationHours: Number(manualHours),
      });
      setManualDescription('');
      setManualHours('1.5');
      const hRes = await apiClient.get('/time-tracking/my/summary');
      if (hRes.data?.entries) setHistory(hRes.data.entries);
      alert('Manual time entry logged!');
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

  const columns = [
    {
      key: 'contract',
      header: 'Contract',
      render: (row) => <span className="font-semibold text-white">{row.contract?.title}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="text-xs text-gray-300">{row.description || 'Sprint task'}</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row) => (
        <span className="font-bold text-sky-400">
          {Number(row.durationHours || 0).toFixed(2)} hrs
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date Logged',
      render: (row) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Time Tracking & Active Stopwatch</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Record billable project hours with live stopwatch timers or log retrospective work blocks.
        </p>
      </div>

      {/* Stopwatch Widget */}
      <div className="glass-card p-8 rounded-3xl border border-sky-500/30 text-center relative overflow-hidden bg-gradient-to-b from-sky-950/20 to-transparent">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Select Active Contract
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              disabled={timerRunning}
              className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
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

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={timerRunning}
            placeholder="What are you working on right now?"
            className="w-full px-4 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />

          {/* Digital Timer Display */}
          <div className="p-6 rounded-2xl bg-[#080d19] border border-sky-500/40 shadow-inner">
            <div className="text-5xl font-mono font-black tracking-widest text-sky-400 select-none">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
              Hours : Minutes : Seconds
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4">
            {!timerRunning ? (
              <button
                onClick={handleStartTimer}
                disabled={!selectedContractId}
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Timer</span>
              </button>
            ) : (
              <button
                onClick={handleStopTimer}
                className="px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all flex items-center gap-2 animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop & Save Entry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manual Time Entry Section */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          <span>Manual Entry Log</span>
        </h3>
        <form onSubmit={handleManualEntry} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
            placeholder="Task description..."
            className="sm:col-span-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={manualHours}
              onChange={(e) => setManualHours(e.target.value)}
              className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <span className="text-xs text-gray-400">hours</span>
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Log History */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Logged Time Entries</h3>
        <DataTable
          columns={columns}
          data={history}
          loading={loading}
          searchPlaceholder="Search logged entries..."
        />
      </div>
    </div>
  );
};
