import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '../api/api';
import { RevenueBreakdown, LocationStat, VehiclePerformance } from '../types/Analytics';
import { formatCurrency } from '../utils/formatters';
import Header from '../components/layout/Header';

const tabs = [
  { label: 'Revenue', value: 'revenue' },
  { label: 'Cancellations', value: 'cancellations' },
  { label: 'Locations', value: 'locations' },
];

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#818cf8', '#9ca3af', '#fb923c', '#a78bfa', '#f472b6', '#4ade80'];

export default function Analytics() {
  const [tab, setTab] = useState('revenue');
  const [breakdown, setBreakdown] = useState<RevenueBreakdown | null>(null);
  const [locations, setLocations] = useState<LocationStat[]>([]);
  const [rankings, setRankings] = useState<VehiclePerformance[]>([]);

  useEffect(() => {
    analyticsApi.getRevenueBreakdown().then(setBreakdown).catch(console.error);
    analyticsApi.getLocationStats().then(setLocations).catch(console.error);
    analyticsApi.getVehicleRankings('completionRate').then(setRankings).catch(console.error);
  }, []);

  const revenueData = breakdown ? [
    { name: 'Trip Price', value: breakdown.tripPrice },
    { name: 'Tolls', value: breakdown.tollsAndTickets },
    { name: 'Gas', value: breakdown.gasReimbursement },
    { name: 'Extras', value: breakdown.extras },
    { name: 'Delivery', value: breakdown.delivery },
    { name: 'Cancellation', value: breakdown.cancellationFees },
    { name: 'Late Fees', value: breakdown.lateFees },
    { name: 'Cleaning', value: breakdown.cleaning },
    { name: 'Excess Distance', value: breakdown.excessDistance },
    { name: 'Additional Usage', value: breakdown.additionalUsage },
  ].filter(d => d.value > 0) : [];

  const secondaryRevenue = revenueData.filter(d => d.name !== 'Trip Price');

  return (
    <div>
      <Header title="Analytics" />

      <div className="mt-6 flex gap-1 bg-bg-surface rounded-lg p-1 border border-border-subtle/50 w-fit">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'revenue' && breakdown && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Revenue Composition</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value">
                      {revenueData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e1e2a', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }}
                      formatter={(value: any) => [formatCurrency(Number(value))]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {revenueData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-400">{d.name}</span>
                    <span className="text-xs text-gray-200 ml-auto tabular-nums">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Secondary Revenue Streams</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={secondaryRevenue} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e1e2a', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }}
                      formatter={(value: any) => [formatCurrency(Number(value))]}
                    />
                    <Bar dataKey="value" fill="#22d3ee" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 border-t border-border-subtle pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Secondary Revenue</span>
                  <span className="text-sm font-medium text-cyan-400 tabular-nums">
                    {formatCurrency(secondaryRevenue.reduce((s, d) => s + d.value, 0))}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-400">Discounts Given</span>
                  <span className="text-sm font-medium text-red-400 tabular-nums">{formatCurrency(breakdown.discounts)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'cancellations' && (
          <div className="bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50">
              <h3 className="text-lg font-medium text-gray-100">Cancellation Analysis by Vehicle</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-bg-elevated/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Vehicle</th>
                  <th className="text-center py-3 px-4">Total Trips</th>
                  <th className="text-center py-3 px-4">Completed</th>
                  <th className="text-center py-3 px-4">Cancelled</th>
                  <th className="text-center py-3 px-4">Completion Rate</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rankings.map((v) => (
                  <tr key={v.id} className="hover:bg-bg-elevated/70 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-200">{v.vehicleName}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-300">{v.totalTrips}</td>
                    <td className="py-3 px-4 text-center text-sm text-emerald-400">{v.completedTrips}</td>
                    <td className="py-3 px-4 text-center text-sm text-red-400">{v.cancelledTrips}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              v.completionRate >= 70 ? 'bg-emerald-400' : v.completionRate >= 50 ? 'bg-amber-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${v.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums">{Math.round(v.completionRate)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        v.completionRate >= 70 ? 'bg-emerald-400/10 text-emerald-400' :
                        v.completionRate >= 50 ? 'bg-amber-400/10 text-amber-400' :
                        'bg-red-400/10 text-red-400'
                      }`}>
                        {v.completionRate >= 70 ? 'Healthy' : v.completionRate >= 50 ? 'Warning' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'locations' && (
          <div className="bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50">
              <h3 className="text-lg font-medium text-gray-100">Revenue by Pickup Location</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-bg-elevated/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-right py-3 px-4">Trips</th>
                  <th className="text-right py-3 px-4">Total Revenue</th>
                  <th className="text-right py-3 px-4">Avg per Trip</th>
                  <th className="text-right py-3 px-4">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {locations.map((loc, i) => {
                  const totalRev = locations.reduce((s, l) => s + l.totalEarnings, 0);
                  const share = totalRev > 0 ? (loc.totalEarnings / totalRev * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-bg-elevated/70 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-200 max-w-md">{loc.location}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-300">{loc.tripCount}</td>
                      <td className="py-3 px-4 text-right text-sm text-emerald-400 font-medium tabular-nums">{formatCurrency(loc.totalEarnings)}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-300 tabular-nums">{formatCurrency(loc.avgEarnings)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 tabular-nums w-10">{share.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
