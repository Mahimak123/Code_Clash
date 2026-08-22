import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export default function SentimentBadge({ sentiment }) {
  const sent = (sentiment || 'Neutral').toLowerCase();

  if (sent === 'positive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <ThumbsUp className="w-3 h-3 text-emerald-400" />
        Positive
      </span>
    );
  }

  if (sent === 'negative') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <ThumbsDown className="w-3 h-3 text-rose-400" />
        Negative
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
      <Minus className="w-3 h-3 text-indigo-400" />
      Neutral
    </span>
  );
}
