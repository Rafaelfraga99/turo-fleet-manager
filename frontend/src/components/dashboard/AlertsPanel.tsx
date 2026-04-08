import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { analyticsApi } from '../../api/api';
import { FleetAlert } from '../../types/Analytics';

const alertConfig = {
  CRITICAL: { icon: AlertCircle, dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-400/5' },
  WARNING: { icon: AlertTriangle, dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/5' },
  INFO: { icon: Info, dot: 'bg-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-400/5' },
};

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<FleetAlert[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    analyticsApi.getAlerts().then(setAlerts).catch(console.error);
  }, []);

  return (
    <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
      <h3 className="text-lg font-medium text-gray-100 mb-4">
        Fleet Alerts <span className="text-sm text-gray-400 font-normal">({alerts.length})</span>
      </h3>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-400">No alerts</p>
        ) : (
          alerts.slice(0, 10).map((alert, i) => {
            const config = alertConfig[alert.type] || alertConfig.INFO;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => alert.vehicleId && navigate(`/vehicles/${alert.vehicleId}`)}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />
                <p className={`text-xs ${config.text}`}>{alert.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
