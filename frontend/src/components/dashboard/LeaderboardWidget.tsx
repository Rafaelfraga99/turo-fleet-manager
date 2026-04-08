import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../api/api';
import { VehiclePerformance } from '../../types/Analytics';
import { formatCurrency } from '../../utils/formatters';

export default function LeaderboardWidget() {
  const [top, setTop] = useState<VehiclePerformance[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    analyticsApi.getVehicleRankings('revenuePerDay').then(d => setTop(d.slice(0, 5))).catch(console.error);
  }, []);

  return (
    <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
      <h3 className="text-lg font-medium text-gray-100 mb-4">Top Revenue/Day</h3>
      <div className="space-y-3">
        {top.map((v, i) => (
          <div
            key={v.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-bg-elevated/50 rounded-lg p-2 -mx-2 transition-colors"
            onClick={() => navigate(`/vehicles/${v.id}`)}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 0 ? 'bg-amber-400/20 text-amber-400' :
              i === 1 ? 'bg-gray-300/20 text-gray-300' :
              i === 2 ? 'bg-orange-400/20 text-orange-400' :
              'bg-gray-600/20 text-gray-500'
            }`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 truncate">{v.vehicleName}</p>
              <p className="text-xs text-gray-400">{v.completedTrips} completed</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium tabular-nums text-emerald-400">{formatCurrency(v.revenuePerDay)}/day</p>
              <p className="text-xs text-gray-500 tabular-nums">{formatCurrency(v.totalEarnings)} total</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
