import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import MetricCard from '../components/MetricCard';
import MainCrisisAlert from '../components/MainCrisisAlert';
import SentimentChart from '../components/SentimentChart';
import NegativeSpikeSection from '../components/NegativeSpikeSection';
import SocialPostCard from '../components/SocialPostCard';
import { LoadingSkeleton, ErrorState } from '../components/StateViews';
import { MessageSquare, AlertOctagon, Flame, ShieldAlert, ArrowRight, Rss } from 'lucide-react';

export default function OverviewPage({ selectedBrand, onNavigateToIncident, onNavigateTab }) {
  const [data, setData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, anomaliesRes, analyticsRes, postsRes] = await Promise.all([
        apiService.getOverview(selectedBrand),
        apiService.getAnomalies(selectedBrand),
        apiService.getAnalytics(selectedBrand),
        apiService.getPosts({ brand: selectedBrand, limit: 4 }),
      ]);
      setData(overviewRes);
      setAnomalies(anomaliesRes);
      setAnalytics(analyticsRes);
      setRecentPosts(postsRes.posts || []);
    } catch (err) {
      console.error("Failed to load overview data:", err);
      setError(err.message || "API connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedBrand]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchOverview} />;

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>REAL-TIME THREAT MONITORING</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Social Pulse</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time view of emerging customer issues and brand risk spikes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="TOTAL MENTIONS"
          value={data.total_mentions?.toLocaleString() || '769'}
          trend={data.total_mentions_trend || '+14.2%'}
          subtext="vs previous 24h"
          icon={MessageSquare}
          color="blue"
        />

        <MetricCard
          title="NEGATIVE SENTIMENT"
          value={`${data.negative_sentiment_pct}%`}
          trend={data.negative_sentiment_trend || '+18.4%'}
          subtext="velocity surge"
          icon={Flame}
          color="red"
          highlight={true}
        />

        <MetricCard
          title="ACTIVE INCIDENTS"
          value={data.active_incidents_count || '3'}
          trend={`${data.high_priority_incidents_count || 2} high priority`}
          subtext="requiring response"
          icon={AlertOctagon}
          color="orange"
        />

        <MetricCard
          title="CRISIS RISK"
          value={`${data.crisis_risk_score}/100`}
          trend={data.crisis_risk_level || 'Critical'}
          subtext="threshold exceeded"
          icon={ShieldAlert}
          color="red"
          highlight={true}
        />
      </div>

      {/* Main Crisis Alert Prominent Component */}
      {data.main_incident && (
        <MainCrisisAlert
          incident={data.main_incident}
          onViewIncident={onNavigateToIncident}
        />
      )}

      {/* Sentiment Trend Chart */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Sentiment Velocity Over Time</h3>
            <p className="text-xs text-slate-400">Tracking positive, neutral, and negative post volume trends</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Positive
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Neutral
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Negative Spike
            </span>
          </div>
        </div>

        <SentimentChart data={analytics?.sentiment_trend || []} />
      </div>

      {/* Negative Spike Detection (Anomalies & Emerging Issues) */}
      <NegativeSpikeSection
        anomalies={anomalies}
        onSelectIncident={onNavigateToIncident}
      />

      {/* Live Social Feed Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Rss className="w-5 h-5 text-indigo-400" />
              Live Social Stream
            </h3>
            <p className="text-xs text-slate-400">Latest social posts classified by AI model</p>
          </div>
          <button
            onClick={() => onNavigateTab('live-feed')}
            className="text-xs font-mono font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            View Full Stream <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentPosts.map((post) => (
            <SocialPostCard key={post.post_id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
