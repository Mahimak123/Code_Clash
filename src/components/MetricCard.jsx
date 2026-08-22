import React from 'react';

export default function MetricCard({ title, value, trend, subtext, icon: Icon, color = 'blue', highlight = false }) {
  const colorMap = {
    red: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    green: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  const isUp = trend?.startsWith('+') || trend?.includes('↑');
  const isDown = trend?.startsWith('-') || trend?.includes('↓');

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:border-slate-700 glass-panel ${
      highlight ? 'border-rose-500/40 bg-slate-900/90 shadow-lg shadow-rose-950/20' : 'border-slate-800/80 bg-slate-900/50'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-100 font-mono">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        {trend && (
          <span className={`inline-flex items-center font-semibold font-mono px-1.5 py-0.5 rounded ${
            color === 'red' || (isUp && color !== 'green')
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-emerald-400 bg-emerald-500/10'
          }`}>
            {trend}
          </span>
        )}
        <span className="text-slate-400 truncate">{subtext}</span>
      </div>
    </div>
  );
}
