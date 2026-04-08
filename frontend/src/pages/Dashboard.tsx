import React, { useEffect, useState } from 'react';
import { Car, TrendingUp, MapPin, Calendar, Shield } from 'lucide-react';
import { vehicleApi, analyticsApi } from '../api/api';
import { DashboardStats } from '../types/Vehicle';
import { FleetHealthSummary } from '../types/Analytics';
import { formatCurrency, formatNumber } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import Header from '../components/layout/Header';
import MonthlyRevenueChart from '../components/dashboard/MonthlyRevenueChart';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import LeaderboardWidget from '../components/dashboard/LeaderboardWidget';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [fleetHealth, setFleetHealth] = useState<FleetHealthSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vehicleApi.getDashboardStats(),
      analyticsApi.getFleetHealth(),
    ])
      .then(([s, h]) => { setStats(s); setFleetHealth(h); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Earnings" value={formatCurrency(stats.totalEarnings)} icon={TrendingUp} iconColor="text-emerald-400" />
        <StatCard title="Fleet Size" value={stats.totalVehicles} icon={Car} iconColor="text-indigo-400" />
        <StatCard title="Completed Trips" value={stats.completedTrips} icon={MapPin} iconColor="text-cyan-400" />
        <StatCard title="Trip Days" value={formatNumber(stats.totalTripDays)} icon={Calendar} iconColor="text-amber-400" />
        {fleetHealth && (
          <StatCard title="Fleet Health" value={`${fleetHealth.avgHealthScore}/100`} icon={Shield} iconColor="text-indigo-400" />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyRevenueChart />
        </div>
        <AlertsPanel />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LeaderboardWidget />

        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">In Progress</p>
              <p className="text-2xl font-bold tabular-nums mt-1 text-cyan-400">{stats.inProgressTrips}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Booked</p>
              <p className="text-2xl font-bold tabular-nums mt-1 text-indigo-400">{stats.bookedTrips}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Cancelled</p>
              <p className="text-2xl font-bold tabular-nums mt-1 text-amber-400">{stats.cancelledTrips}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Total Distance</p>
              <p className="text-2xl font-bold tabular-nums mt-1 text-gray-100">{formatNumber(stats.totalDistance)} mi</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Avg per Trip</p>
              <p className="text-2xl font-bold tabular-nums mt-1 text-emerald-400">
                {stats.completedTrips > 0 ? formatCurrency(stats.totalEarnings / stats.completedTrips) : '$0'}
              </p>
            </div>
            {fleetHealth && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Critical Vehicles</p>
                <p className="text-2xl font-bold tabular-nums mt-1 text-red-400">{fleetHealth.critical}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
