import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/StateViews';
import { AlertTriangle, ArrowRight, ShieldAlert, Filter, CheckCircle2 } from 'lucide-react';

export default function IncidentsPage({ selectedBrand, onSelectIncident }) {
  const [incidents, setIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getIncidents(selectedBrand, statusFilter);
      setIncidents(res);
    } catch (err) {
      console.error("Failed to load incidents:", err);
      setError(err.message || "Failed to load incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedBrand, statusFilter]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchIncidents} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Incident Tracker
          </h1>
          <p className="text-xs text-slate-400">Aggregated risk clusters requiring mitigation and response</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">STATUS:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {incidents.length === 0 ? (
        <EmptyState message="No incidents found" subtext="No active incidents match the current brand or status filter." />
      ) : (
        /* Incidents Table / Grid */
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden glass-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800/80">
                <tr>
                  <th className="px-4 py-3.5">Incident</th>
                  <th className="px-4 py-3.5">Brand</th>
                  <th className="px-4 py-3.5">Topic</th>
                  <th className="px-4 py-3.5">Severity</th>
                  <th className="px-4 py-3.5 text-right">Negative Posts</th>
                  <th className="px-4 py-3.5">Velocity</th>
                  <th className="px-4 py-3.5">Platforms</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-4 font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        {inc.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono font-semibold text-slate-200">
                      {inc.brand}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-300">
                      {inc.topic}
                    </td>
                    <td className="px-4 py-4">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-rose-400">
                      {inc.negative_posts}
                    </td>
                    <td className="px-4 py-4 font-mono text-rose-400 font-bold">
                      {inc.growth}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        {(inc.platforms || []).map((p) => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${
                        inc.status === 'Active'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(inc.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        Investigate <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
