import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Shield, AlertTriangle } from 'lucide-react';
import { analyticsApi } from '../api/api';
import { VehiclePerformance, FleetHealthSummary } from '../types/Analytics';
import { formatCurrency } from '../utils/formatters';
import HealthScoreBadge from '../components/common/HealthScoreBadge';
import StatCard from '../components/common/StatCard';
import Header from '../components/layout/Header';

const sortTabs = [
  { label: 'Health Score', value: 'healthScore' },
  { label: 'Revenue/Day', value: 'revenuePerDay' },
  { label: 'Completion Rate', value: 'completionRate' },
  { label: 'Total Earnings', value: 'totalEarnings' },
];

export default function VehicleRankings() {
  const [rankings, setRankings] = useState<VehiclePerformance[]>([]);
  const [fleetHealth, setFleetHealth] = useState<FleetHealthSummary | null>(null);
  const [sortBy, setSortBy] = useState('healthScore');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsApi.getVehicleRankings(sortBy),
      analyticsApi.getFleetHealth(),
    ])
      .then(([r, h]) => { setRankings(r); setFleetHealth(h); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sortBy]);

  return (
    <div>
      <Header title="Vehicle Rankings" />

      {fleetHealth && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Fleet Health" value={`${fleetHealth.avgHealthScore}/100`} icon={Shield} iconColor="text-indigo-400" />
          <StatCard title="Top Performers" value={fleetHealth.topPerformers} icon={Trophy} iconColor="text-emerald-400" />
          <StatCard title="Needs Attention" value={fleetHealth.needsAttention} icon={AlertTriangle} iconColor="text-amber-400" />
          <StatCard title="Avg Revenue/Day" value={formatCurrency(fleetHealth.avgRevenuePerDay)} icon={Trophy} iconColor="text-cyan-400" />
        </div>
      )}

      <div className="mt-6 flex gap-1 bg-bg-surface rounded-lg p-1 border border-border-subtle/50 w-fit">
        {sortTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSortBy(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sortBy === tab.value ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-center py-3 px-4 w-12">#</th>
              <th className="text-left py-3 px-4">Vehicle</th>
              <th className="text-center py-3 px-4">Health</th>
              <th className="text-right py-3 px-4">Rev/Day</th>
              <th className="text-center py-3 px-4">Completion</th>
              <th className="text-right py-3 px-4">Trips</th>
              <th className="text-right py-3 px-4">Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : (
              rankings.map((v, i) => (
                <tr key={v.id} className="hover:bg-bg-elevated/70 transition-colors cursor-pointer" onClick={() => navigate(`/vehicles/${v.id}`)}>
                  <td className="py-3 px-4 text-center text-sm text-gray-500 font-medium">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="text-sm font-medium text-gray-100">{v.vehicleName}</span>
                      <span className="text-xs text-gray-500 ml-2 font-mono">{v.licensePlate}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <HealthScoreBadge score={v.healthScore} category={v.healthCategory} showLabel={false} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-medium tabular-nums ${
                      v.revenuePerDay >= 50 ? 'text-emerald-400' : v.revenuePerDay >= 30 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(v.revenuePerDay)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            v.completionRate >= 70 ? 'bg-emerald-400' : v.completionRate >= 50 ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${v.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums w-8">{Math.round(v.completionRate)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-300">
                    <span className="text-emerald-400">{v.completedTrips}</span>
                    <span className="text-gray-600"> / {v.totalTrips}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-emerald-400 font-medium tabular-nums">
                    {formatCurrency(v.totalEarnings)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
