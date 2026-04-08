import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Route, Trophy, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rankings', icon: Trophy, label: 'Rankings' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/trips', icon: Route, label: 'Trips' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-bg-surface border-r border-border-subtle/50 flex flex-col z-40">
      <div className="h-16 flex items-center px-6 border-b border-border-subtle/50">
        <Car className="text-primary mr-3" size={24} />
        <span className="text-lg font-bold tracking-tight text-gray-100">Turo Fleet</span>
      </div>

      <nav className="flex-1 py-4 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-primary/15 text-indigo-400 border-l-2 border-primary'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`
            }
          >
            <item.icon size={18} strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
