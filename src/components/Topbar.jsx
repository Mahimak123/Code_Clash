import React, { useState } from 'react';
import { Search, Bell, Shield, ChevronDown, CheckCircle2, User } from 'lucide-react';

export default function Topbar({ selectedBrand, setSelectedBrand, searchQuery, setSearchQuery, theme, toggleTheme }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const brands = ['All', 'PayWave', 'StreamBox', 'FoodRush'];

  const notifications = [
    { id: 1, title: 'CRITICAL ALERT: Payment Failure', time: '12m ago', read: false },
    { id: 2, title: 'StreamBox Outage spike detected', time: '28m ago', read: false },
    { id: 3, title: 'FoodRush delivery delay monitoring', time: '45m ago', read: true },
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Brand selector & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
          <span className="text-slate-400">Brand:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer"
          >
            {brands.map((b) => (
              <option key={b} value={b} className="bg-slate-900 text-slate-200">
                {b === 'All' ? '⚡ All Brands' : b}
              </option>
            ))}
          </select>
        </div>

        {/* System Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Operational</span>
        </div>
      </div>

      {/* Center/Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, topics, alerts..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-slate-700 relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl p-3 z-50 backdrop-blur-lg">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-200 font-mono">Alert Notifications</span>
                <span className="text-rose-400 font-mono">2 Unread</span>
              </div>
              <div className="divide-y divide-slate-800/60 mt-1 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 text-xs">
                    <p className={`font-medium ${n.read ? 'text-slate-400' : 'text-rose-300 font-semibold'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-xs font-bold font-mono">
            VW
          </div>
        </div>
      </div>
    </header>
  );
}
