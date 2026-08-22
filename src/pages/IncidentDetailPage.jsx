import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import SocialPostCard from '../components/SocialPostCard';
import { LoadingSkeleton, ErrorState } from '../components/StateViews';
import {
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Share2,
  CheckCircle2,
  Wrench,
  Headphones,
  Megaphone,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

export default function IncidentDetailPage({ incidentId, onBack }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getIncidentDetail(incidentId || 'INC-PAY-01');
      setIncident(res);
    } catch (err) {
      console.error("Failed to load incident detail:", err);
      setError(err.message || "Failed to load incident detail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [incidentId]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />;
  if (!incident) return null;

  const riskScore = incident.severity_score || 84;
  const breakdown = incident.sentiment_breakdown || { positive: 8, neutral: 14, negative: 79 };
  const totalPostsInInc = (breakdown.positive || 0) + (breakdown.neutral || 0) + (breakdown.negative || 0) || 1;

  const categoryIcons = {
    Engineering: Wrench,
    Support: Headphones,
    PR: Megaphone,
    Operations: Layers,
  };

  return (
    <div className="space-y-8">
      {/* Top Back Navigation & Header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-100 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incidents
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-950">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                INCIDENT DISSECTION
              </span>
              <SeverityBadge severity={incident.severity} />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {incident.status}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {incident.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Target Brand: <strong className="text-slate-200">{incident.brand}</strong> | Detected: <span className="text-slate-300">{incident.detected}</span>
            </p>
          </div>

          {/* Risk Gauge Header Widget */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-right min-w-[200px]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">CRISIS SEVERITY</span>
            <div className="text-3xl font-extrabold text-rose-500 font-mono mt-1">
              {riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${riskScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: What's Happening & Why It's Happening */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WHAT'S HAPPENING */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            WHAT'S HAPPENING
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {incident.whats_happening || "Negative conversations around payment failures are increasing rapidly across social channels."}
          </p>
        </div>

        {/* WHY IT'S HAPPENING */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            WHY IT'S HAPPENING
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {incident.why_its_happening || `Dominant topic '${incident.topic}' is triggering elevated negative sentiment velocity (+${incident.growth}).`}
          </p>
        </div>
      </div>

      {/* Grid: Sentiment Distribution & Growth & Cross-Platform Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SENTIMENT DISTRIBUTION */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">SENTIMENT DISTRIBUTION</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-rose-400 font-semibold">Negative ({breakdown.negative || 79})</span>
                <span className="text-rose-400 font-bold">{((breakdown.negative / totalPostsInInc) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${(breakdown.negative / totalPostsInInc) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-indigo-400">Neutral ({breakdown.neutral || 14})</span>
                <span className="text-indigo-400">{((breakdown.neutral / totalPostsInInc) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${(breakdown.neutral / totalPostsInInc) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-emerald-400">Positive ({breakdown.positive || 8})</span>
                <span className="text-emerald-400">{((breakdown.positive / totalPostsInInc) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(breakdown.positive / totalPostsInInc) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* GROWTH VELOCITY */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">GROWTH RATE</h3>
          <div className="flex flex-col justify-center items-center h-32 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-4xl font-extrabold text-rose-500 font-mono tracking-tight">{incident.growth}</span>
            <span className="text-xs text-slate-400 mt-1 font-mono">Negative velocity increase (1h window)</span>
          </div>
        </div>

        {/* SPREAD VECTOR */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-indigo-400" />
            CROSS-PLATFORM SPREAD
          </h3>
          <div className="space-y-2">
            {(incident.spread || []).map((s, idx, arr) => (
              <div key={s.platform} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-mono text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-100">{s.platform}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-400 text-[10px] block">First seen: {s.first_seen}</span>
                  <span className="text-rose-400 font-bold">{s.count} posts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI INSIGHT */}
      <div className="p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          AI ROOT CAUSE INSIGHT
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {incident.ai_insight}
        </p>
      </div>

      {/* RECOMMENDED ACTIONS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Recommended Crisis Mitigation Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(incident.recommended_actions || []).map((rec, idx) => {
            const Icon = categoryIcons[rec.category] || Wrench;
            return (
              <div key={idx} className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 glass-panel space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    {rec.category}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  "{rec.action}"
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SAMPLE POSTS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Representative Social Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(incident.sample_posts || []).map((p) => (
            <SocialPostCard key={p.post_id} post={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
