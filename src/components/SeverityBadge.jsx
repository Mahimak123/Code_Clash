import React from 'react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || 'LOW').toUpperCase();
  
  const styles = {
    LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    CRITICAL: 'bg-rose-500/15 text-rose-500 border-rose-500/40 font-semibold animate-pulse',
  };

  const badgeStyle = styles[sev] || styles.LOW;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs border uppercase tracking-wider font-mono ${badgeStyle}`}>
      {sev}
    </span>
  );
}
