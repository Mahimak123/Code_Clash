import React from 'react';
import SentimentBadge from './SentimentBadge';
import { MessageSquare, Heart, Share2, CornerDownRight } from 'lucide-react';

export default function SocialPostCard({ post }) {
  if (!post) return null;

  const platformIcons = {
    Reddit: '🔴',
    X: '𝕏',
    Instagram: '📷',
    YouTube: '▶️',
  };

  const platformColors = {
    Reddit: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    X: 'text-slate-200 bg-slate-800/80 border-slate-700/50',
    Instagram: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    YouTube: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const sentimentBorder = {
    Positive: 'border-l-4 border-l-emerald-500',
    Negative: 'border-l-4 border-l-rose-500',
    Neutral: 'border-l-4 border-l-indigo-500',
  };

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 hover:border-slate-700 transition-all glass-panel ${sentimentBorder[post.sentiment] || ''}`}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded font-mono font-semibold border ${platformColors[post.platform] || 'text-slate-300'}`}>
            {platformIcons[post.platform] || '💬'} {post.platform}
          </span>
          <span className="font-bold text-slate-200">{post.brand}</span>
        </div>

        <div className="flex items-center gap-2">
          <SentimentBadge sentiment={post.sentiment} />
          <span className="text-slate-400 font-mono text-[11px]">{post.timestamp}</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-200 leading-relaxed font-sans">
        "{post.text}"
      </p>

      {post.reasoning && (
        <div className="mt-2.5 p-2 rounded bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 flex items-start gap-1.5 font-mono">
          <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span><strong className="text-indigo-300">AI Reasoning:</strong> {post.reasoning}</span>
        </div>
      )}

      <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-300 border border-slate-700/40">
          Topic: {post.topic}
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 hover:text-slate-200">
            <Heart className="w-3.5 h-3.5 text-rose-400" /> {post.engagement || 142} engagements
          </span>
          {post.confidence && (
            <span className="text-slate-400">
              Conf: {(post.confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
