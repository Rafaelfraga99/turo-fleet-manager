import React from 'react';

const statusConfig: Record<string, { dot: string; bg: string; text: string }> = {
  'Completed': { dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  'Booked': { dot: 'bg-indigo-400', bg: 'bg-indigo-400/10', text: 'text-indigo-400' },
  'In-progress': { dot: 'bg-cyan-400', bg: 'bg-cyan-400/10', text: 'text-cyan-400' },
  'Guest cancellation': { dot: 'bg-amber-400', bg: 'bg-amber-400/10', text: 'text-amber-400' },
  'Host cancellation': { dot: 'bg-red-400', bg: 'bg-red-400/10', text: 'text-red-400' },
};

const defaultConfig = { dot: 'bg-gray-400', bg: 'bg-gray-400/10', text: 'text-gray-400' };

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status] || defaultConfig;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
