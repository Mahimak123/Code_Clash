import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import SocialPostCard from '../components/SocialPostCard';
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/StateViews';
import { Rss, Filter, Search, RefreshCw } from 'lucide-react';

export default function LiveFeedPage({ selectedBrand, searchQuery }) {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [platform, setPlatform] = useState('All');
  const [sentiment, setSentiment] = useState('All');
  const [topic, setTopic] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getPosts({
        brand: selectedBrand,
        platform,
        sentiment,
        topic,
        search: searchQuery || localSearch,
        limit: 100,
      });
      setPosts(res.posts || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Failed to load feed:", err);
      setError(err.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedBrand, platform, sentiment, topic, searchQuery, localSearch]);

  const platforms = ['All', 'Reddit', 'X', 'Instagram', 'YouTube'];
  const sentiments = ['All', 'Negative', 'Positive', 'Neutral'];
  const topics = ['All', 'Payment Failure', 'Outage', 'Buffering', 'Late Delivery', 'Missing Order', 'UX', 'Food Quality', 'Tracking', 'Customer Support'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Rss className="w-6 h-6 text-rose-500" />
            Live Social Stream
          </h1>
          <p className="text-xs text-slate-400">Real-time incoming social media mentions classified by Gemini AI</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
          <span>Total Matches:</span>
          <strong className="text-slate-200">{total}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 glass-panel grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Platform filter */}
        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">PLATFORM</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Sentiment filter */}
        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">SENTIMENT</label>
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
          >
            {sentiments.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Topic filter */}
        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">TOPIC</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
          >
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Local search filter */}
        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">FILTER KEYWORD</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter post text..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPosts} />
      ) : posts.length === 0 ? (
        <EmptyState message="No matching social media posts found" subtext="Try clearing your filters or changing search keywords." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <SocialPostCard key={post.post_id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
