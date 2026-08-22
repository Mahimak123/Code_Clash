import React, { useState } from 'react';
import {
  LayoutDashboard,
  Rss,
  AlertTriangle,
  BarChart3,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Radio
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ activeTab, setActiveTab, theme, toggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-feed', label: 'Live Feed', icon: Rss },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle, badge: '3' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'topics', label: 'Topics', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/90 text-slate-200 transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:text-white shadow-md z-40 cursor-pointer"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Top Header / Branding */}
      <div>
        <div className="flex items-center gap-3 p-5 border-b border-slate-800/80">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-indigo-600 shadow-lg shadow-rose-950/30">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-mono flex items-center gap-1.5">
                VibeWatch
              </h1>
              <p className="text-[11px] font-medium text-slate-400">AI Crisis Monitor</p>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                } ${collapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Theme toggle + Profile */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1`}>
          {!collapsed && <span className="text-xs text-slate-400 font-mono">APPEARANCE</span>}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-8 w-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
            <User className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">SecOps Analyst</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">analyst@vibewatch.ai</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
