import React from 'react';
import { RefreshCw, AlertCircle, Inbox } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-800/60 rounded-lg w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-900/60 border border-slate-800/80 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-900/60 border border-slate-800/80 rounded-xl" />
      <div className="h-48 bg-slate-900/60 border border-slate-800/80 rounded-xl" />
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-rose-500/20 rounded-2xl bg-rose-950/10">
      <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
      <h3 className="text-lg font-bold text-slate-100">Unable to connect to monitoring service</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-md">
        {message || "Could not fetch real-time crisis data from the backend APIs. Make sure the FastAPI service is running."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "Everything looks quiet.", subtext = "No active anomalies or negative spikes detected at this moment." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-800/80 rounded-2xl bg-slate-900/40">
      <Inbox className="w-10 h-10 text-slate-500 mb-3" />
      <h3 className="text-base font-bold text-slate-200">{message}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
  );
}
