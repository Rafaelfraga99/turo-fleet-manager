import React from 'react';
import { Bell, Search } from 'lucide-react';

interface Props {
  title: string;
}

export default function Header({ title }: Props) {
  return (
    <header className="h-16 border-b border-border-subtle/50 flex items-center justify-between px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-100">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-bg-elevated border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none w-64"
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-200 transition-colors">
          <Bell size={20} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
