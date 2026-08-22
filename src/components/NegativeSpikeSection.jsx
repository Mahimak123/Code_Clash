import React from 'react';
import { AlertCircle, TrendingUp, ArrowRight, ShieldAlert } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function NegativeSpikeSection({ anomalies, onSelectIncident }) {
  if (!anomalies || anomalies.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Anomalies & Emerging Issues
          </h3>
          <p className="text-xs text-slate-400">Automated signal detection based on post volume & sentiment velocity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {anomalies.map((anom) => (
          <div
            key={anom.id}
            onClick={() => onSelectIncident(anom.incident_id)}
            className="group relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 cursor-pointer glass-panel flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1">
                  {anom.type}
                </span>
                <SeverityBadge severity={anom.severity} />
              </div>

              <h4 className="text-sm font-semibold text-slate-100 group-hover:text-rose-300 transition-colors">
                {anom.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {anom.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {anom.growth}
                </span>
                <span className="text-slate-400 text-[11px]">{anom.detected}</span>
              </div>
              <span className="text-slate-400 group-hover:text-slate-200 transition-colors inline-flex items-center gap-1 font-medium">
                Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
