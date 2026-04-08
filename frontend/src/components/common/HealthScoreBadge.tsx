import React from 'react';

interface Props {
  score: number;
  category: string;
  showLabel?: boolean;
}

export default function HealthScoreBadge({ score, category, showLabel = true }: Props) {
  const config = score >= 70
    ? { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/30', label: 'Top Performer' }
    : score >= 40
    ? { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/30', label: 'Needs Attention' }
    : { bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/30', label: 'Critical' };

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full border ${config.bg} ${config.border}`}>
        <span className={`text-sm font-bold tabular-nums ${config.text}`}>{score}</span>
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      )}
    </div>
  );
}
