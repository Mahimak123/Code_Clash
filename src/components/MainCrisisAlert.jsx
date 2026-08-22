import React from 'react';
import { AlertTriangle, ArrowRight, Activity, Share2 } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function MainCrisisAlert({ incident, onViewIncident }) {
  if (!incident) return null;

  const riskScore = incident.severity_score || 84;
  const isCritical = incident.severity === 'CRITICAL';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
      isCritical
        ? 'pulse-critical bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/50'
        : 'bg-slate-900/80 border-slate-800'
    }`}>
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            CRITICAL INCIDENT DETECTED
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
            Brand: <strong className="text-slate-200">{incident.brand}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
        {/* Left column: Incident info */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            {incident.name || incident.topic}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {incident.whats_happening || `Negative conversations increased ${incident.growth} in the last hour.`}
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-rose-300 font-medium">
            <Activity className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Negative post velocity surge: <strong className="font-mono text-rose-400">{incident.growth}</strong></span>
          </div>
        </div>

        {/* Right column: Risk bar + Platform Spread */}
        <div className="lg:col-span-5 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-400">CRISIS RISK SCORE</span>
              <span className="text-rose-400 font-bold text-sm">{riskScore} / 100</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-rose-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(10, riskScore))}%` }}
              />
            </div>
          </div>

          {/* Platform Spread */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-2">
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>PROPAGATION VECTOR</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
              {(incident.platforms || ['Reddit', 'X', 'Instagram']).map((plat, idx, arr) => (
                <React.Fragment key={plat}>
                  <span className="px-2 py-1 rounded bg-slate-800/90 text-slate-200 border border-slate-700/60 font-mono">
                    {plat}
                  </span>
                  {idx < arr.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
        <span className="text-xs text-slate-400">
          Detected: <span className="text-slate-300 font-mono">{incident.detected || '12 min ago'}</span>
        </span>
        <button
          onClick={() => onViewIncident(incident.id)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-rose-950/40 cursor-pointer"
        >
          View Incident Deep-Dive
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
