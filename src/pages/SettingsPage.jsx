import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Server, Sliders, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [sensitivity, setSensitivity] = useState('High');
  const [autoAlert, setAutoAlert] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          System Settings & API Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure backend endpoints, AI sensitivity thresholds, and alerting rules</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Backend API Configuration */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
          <h3 className="text-sm font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            BACKEND API SERVICE
          </h3>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">FASTAPI BASE URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-rose-500/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: http://localhost:8000</p>
          </div>
        </div>

        {/* AI Model Sensitivity */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
          <h3 className="text-sm font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-400" />
            CRISIS DETECTION THRESHOLDS
          </h3>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">SPIKE SENSITIVITY LEVEL</label>
            <select
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
            >
              <option value="Low">Low (+200% velocity trigger)</option>
              <option value="Medium">Medium (+100% velocity trigger)</option>
              <option value="High">High (+50% velocity trigger - Recommended)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="autoAlert"
              checked={autoAlert}
              onChange={(e) => setAutoAlert(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="autoAlert" className="text-xs text-slate-300 font-medium cursor-pointer">
              Automatically trigger critical alert banner when Crisis Risk Score exceeds 80/100
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/30 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>

          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
