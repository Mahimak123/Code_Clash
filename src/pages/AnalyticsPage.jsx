import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import SentimentChart from '../components/SentimentChart';
import { LoadingSkeleton, ErrorState } from '../components/StateViews';
import { BarChart3, PieChart, TrendingUp, Share2, Heart, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';

export default function AnalyticsPage({ selectedBrand }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAnalytics(selectedBrand);
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedBrand]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchAnalytics} />;

  // Engagement data formatted
  const engagementData = Object.entries(data?.engagement_by_sentiment || {}).map(([key, val]) => ({
    name: key,
    engagement: val,
  }));

  const sentimentColors = {
    Positive: '#10b981',
    Neutral: '#6366f1',
    Negative: '#f43f5e',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Crisis Analytics & Sentiment Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">Deep-dive quantitative metrics across channels, topics, and sentiment groups</p>
      </div>

      {/* Chart 1: Sentiment & Mentions Over Time */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Sentiment & Mentions Over Time</h3>
            <p className="text-xs text-slate-400">Hourly post sentiment distribution</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Analyzed Posts: <strong className="text-slate-200">{data?.total_posts_analyzed || 769}</strong></span>
        </div>
        <SentimentChart data={data?.sentiment_trend || []} />
      </div>

      {/* Chart 2 & 3: Platform Breakdown & Engagement by Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment by Platform */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              Sentiment Distribution by Platform
            </h3>
            <p className="text-xs text-slate-400">Comparing volume across social media networks</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.sentiment_by_platform || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="platform" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="positive" name="Positive" fill="#10b981" stackId="a" />
                <Bar dataKey="neutral" name="Neutral" fill="#6366f1" stackId="a" />
                <Bar dataKey="negative" name="Negative" fill="#f43f5e" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement by Sentiment */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Total Engagement by Sentiment Class
            </h3>
            <p className="text-xs text-slate-400">Sum of likes, shares, and retweets per category</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="engagement" radius={[6, 6, 0, 0]}>
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={sentimentColors[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
