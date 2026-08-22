import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import SocialPostCard from '../components/SocialPostCard';
import { LoadingSkeleton, ErrorState } from '../components/StateViews';
import { Tag, AlertTriangle, ArrowRight, Share2, Flame } from 'lucide-react';

export default function TopicsPage({ selectedBrand, onSelectIncident }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getTopics(selectedBrand);
      setTopics(res);
      if (res && res.length > 0 && !selectedTopic) {
        setSelectedTopic(res[0]);
      }
    } catch (err) {
      console.error("Failed to load topics:", err);
      setError(err.message || "Failed to load topics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [selectedBrand]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchTopics} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Tag className="w-6 h-6 text-rose-500" />
          Topic Intelligence & Cluster Breakdown
        </h1>
        <p className="text-xs text-slate-400 mt-1">AI-clustered topic frequency, sentiment ratio, and cross-platform spread</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Topic Progress Bars & Selection */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            MOST DISCUSSED TOPICS
          </h3>

          <div className="space-y-2">
            {topics.map((t) => {
              const isSelected = selectedTopic?.name === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => setSelectedTopic(t)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-500/50 bg-slate-900 shadow-md shadow-rose-950/20'
                      : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      {t.name}
                      {t.negative_pct > 50 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          High Risk
                        </span>
                      )}
                    </span>
                    <span className="text-slate-300 font-bold">{t.percentage}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        t.negative_pct > 50 ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(5, t.percentage)}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span>Total Mentions: <strong className="text-slate-200">{t.count}</strong></span>
                    <span className="text-rose-400 font-semibold">{t.negative_count} Negative</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Detailed Topic Inspection */}
        <div className="lg:col-span-7 space-y-6">
          {selectedTopic ? (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 glass-panel space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 uppercase font-bold">TOPIC INSPECTION</span>
                  <h2 className="text-2xl font-bold text-slate-100">{selectedTopic.name}</h2>
                </div>

                {selectedTopic.related_incident && (
                  <button
                    onClick={() => onSelectIncident(selectedTopic.related_incident)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow cursor-pointer"
                  >
                    View Related Incident ({selectedTopic.related_incident})
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">VOLUME</span>
                  <span className="text-lg font-bold text-slate-100">{selectedTopic.count}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SHARE</span>
                  <span className="text-lg font-bold text-indigo-400">{selectedTopic.percentage}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">NEGATIVITY</span>
                  <span className="text-lg font-bold text-rose-400">{selectedTopic.negative_pct}%</span>
                </div>
              </div>

              {/* Affected Platforms */}
              <div>
                <span className="text-xs font-mono text-slate-400 block mb-2">AFFECTED PLATFORMS</span>
                <div className="flex items-center gap-2">
                  {(selectedTopic.platforms || []).map((p) => (
                    <span key={p} className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Posts for Topic */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-slate-400 block">REPRESENTATIVE POSTS</span>
                <div className="space-y-3">
                  {(selectedTopic.sample_posts || []).map((post) => (
                    <SocialPostCard key={post.post_id} post={post} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm border border-slate-800 rounded-xl">
              Select a topic from the left to view detailed insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
