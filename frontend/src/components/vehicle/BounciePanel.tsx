import React, { useEffect, useState } from 'react';
import { MapPin, Wifi, WifiOff, Navigation, Fuel, Gauge, AlertTriangle, Battery, Car } from 'lucide-react';
import { bouncieApi } from '../../api/api';
import { formatNumber } from '../../utils/formatters';

interface Props {
  vehicleId: number;
  bouncieDeviceId?: string;
}

export default function BounciePanel({ vehicleId, bouncieDeviceId }: Props) {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bouncieApi.getStatus()
      .then(s => {
        setConnected(s.connected);
        if (s.connected && bouncieDeviceId) {
          return bouncieApi.getLocation(vehicleId).then(setData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [vehicleId, bouncieDeviceId]);

  const handleConnect = async () => {
    const { url } = await bouncieApi.getAuthUrl();
    window.open(url, '_blank', 'width=600,height=700');
  };

  if (loading) return null;

  if (!connected) {
    return (
      <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
        <div className="flex items-center gap-3 mb-4">
          <WifiOff size={20} className="text-gray-500" />
          <h3 className="text-lg font-medium text-gray-100">GPS Tracking</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Connect your Bouncie GPS device to track location, trips, and diagnostics.</p>
        <button onClick={handleConnect} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
          <Wifi size={16} /> Connect Bouncie
        </button>
      </div>
    );
  }

  if (!bouncieDeviceId || !data || data.error) {
    return (
      <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
        <div className="flex items-center gap-3 mb-2">
          <Wifi size={20} className="text-emerald-400" />
          <h3 className="text-lg font-medium text-gray-100">GPS Tracking</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-400/10 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
          </span>
        </div>
        <p className="text-sm text-gray-400">No Bouncie device linked to this vehicle.</p>
      </div>
    );
  }

  const stats = data.stats || {};
  const location = stats.location || {};
  const mil = stats.mil || {};
  const battery = stats.battery || {};
  const isRunning = stats.isRunning;
  const lastUpdated = stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : '—';

  return (
    <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Navigation size={20} className="text-emerald-400" />
          <h3 className="text-lg font-medium text-gray-100">GPS Tracking</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isRunning ? 'bg-emerald-400/10 text-emerald-400' : 'bg-gray-400/10 text-gray-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
          {isRunning ? 'Engine On' : 'Engine Off'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Location */}
        <div className="bg-bg-elevated/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-200">{location.address || `${location.lat?.toFixed(4)}, ${location.lon?.toFixed(4)}`}</p>
              <p className="text-xs text-gray-500 mt-1">Updated: {lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-elevated/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gauge size={12} className="text-cyan-400" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Odometer</p>
            </div>
            <p className="text-lg font-bold tabular-nums text-gray-100">
              {stats.odometer ? `${formatNumber(Math.round(stats.odometer))} mi` : '—'}
            </p>
          </div>

          <div className="bg-bg-elevated/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Fuel size={12} className="text-amber-400" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Fuel</p>
            </div>
            <p className="text-lg font-bold tabular-nums text-gray-100">
              {stats.fuelLevel != null ? `${Math.round(stats.fuelLevel)}%` : '—'}
            </p>
          </div>

          <div className="bg-bg-elevated/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Battery size={12} className="text-emerald-400" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Battery</p>
            </div>
            <p className={`text-lg font-bold text-gray-100 ${battery.status === 'normal' ? '' : 'text-red-400'}`}>
              {battery.status === 'normal' ? 'Good' : battery.status || '—'}
            </p>
          </div>

          <div className="bg-bg-elevated/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Car size={12} className="text-indigo-400" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Speed</p>
            </div>
            <p className="text-lg font-bold tabular-nums text-gray-100">
              {stats.speed != null ? `${stats.speed} mph` : '—'}
            </p>
          </div>
        </div>

        {/* Check Engine Warning */}
        {mil.milOn && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-400/10">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Check Engine Light ON</p>
              <p className="text-xs text-red-400/70">Since: {mil.lastUpdated ? new Date(mil.lastUpdated).toLocaleDateString() : '—'}</p>
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-600">
          Device: <span className="font-mono">{bouncieDeviceId}</span> · {data.standardEngine || ''}
        </p>
      </div>
    </div>
  );
}
