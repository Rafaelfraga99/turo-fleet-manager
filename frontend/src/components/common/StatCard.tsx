import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, icon: Icon, iconColor = 'text-primary' }: Props) {
  return (
    <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</p>
          <p className="text-3xl font-bold tabular-nums mt-2 text-gray-100">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-800/50 ${iconColor}`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
