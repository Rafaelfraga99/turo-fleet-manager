import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { tripApi, reportApi } from '../api/api';
import { Trip } from '../types/Vehicle';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from '../components/common/StatusBadge';
import Header from '../components/layout/Header';

const statusTabs = [
  { label: 'All', value: 'ALL' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Booked', value: 'Booked' },
  { label: 'In Progress', value: 'In-progress' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const promise = filter === 'ALL'
      ? tripApi.getAll()
      : filter === 'CANCELLED'
        ? Promise.all([tripApi.getByStatus('Guest cancellation'), tripApi.getByStatus('Host cancellation')])
            .then(([g, h]) => [...g, ...h])
        : tripApi.getByStatus(filter);
    promise.then(setTrips).catch(console.error).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <Header title="Trips" />

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-1 bg-bg-surface rounded-lg p-1 border border-border-subtle/50 w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab.value ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
        </div>
        <button onClick={() => reportApi.exportTrips()} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-border-subtle rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="mt-6 bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4">Reservation</th>
              <th className="text-left py-3 px-4">Guest</th>
              <th className="text-left py-3 px-4">Vehicle</th>
              <th className="text-left py-3 px-4">Dates</th>
              <th className="text-left py-3 px-4">Days</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Trip Price</th>
              <th className="text-right py-3 px-4">Total Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : trips.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No trips found</td></tr>
            ) : (
              trips.map((t) => (
                <tr key={t.id} className="hover:bg-bg-elevated/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-300">{t.reservationId}</td>
                  <td className="py-3 px-4 text-sm text-gray-200">{t.guest}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{t.vehicle?.vehicleName || '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {formatDate(t.tripStart)} → {formatDate(t.tripEnd)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300 text-center">{t.tripDays}</td>
                  <td className="py-3 px-4"><StatusBadge status={t.tripStatus} /></td>
                  <td className="py-3 px-4 text-right text-sm text-gray-200">{formatCurrency(t.tripPrice || 0)}</td>
                  <td className="py-3 px-4 text-right text-sm text-emerald-400 font-medium">{formatCurrency(t.totalEarnings || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
