import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download } from 'lucide-react';
import { vehicleApi, importApi, reportApi } from '../api/api';
import { Vehicle } from '../types/Vehicle';
import { formatCurrency } from '../utils/formatters';
import Header from '../components/layout/Header';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadVehicles = () => {
    setLoading(true);
    vehicleApi.getAll().then(setVehicles).catch(console.error).finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadVehicles(); }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importApi.importCsv(file);
      alert(`Imported ${result.tripsImported} trips, ${result.vehiclesFound} vehicles found`);
      loadVehicles();
    } catch {
      alert('Failed to import CSV');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <Header title="Fleet Vehicles" />

      <div className="mt-6 flex items-center justify-end">
        <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleImport} />
        <button onClick={() => reportApi.exportProfitability()} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-border-subtle rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          <Download size={16} /> Export CSV
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Upload size={16} /> Import Turo CSV
        </button>
      </div>

      <div className="mt-6 bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4">Vehicle</th>
              <th className="text-left py-3 px-4">Plate</th>
              <th className="text-left py-3 px-4">VIN</th>
              <th className="text-right py-3 px-4">Completed</th>
              <th className="text-right py-3 px-4">Total Trips</th>
              <th className="text-right py-3 px-4">Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No vehicles. Import a Turo CSV to get started.</td></tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-bg-elevated/70 transition-colors cursor-pointer" onClick={() => navigate(`/vehicles/${v.id}`)}>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-100">{v.vehicleName || `${v.make} ${v.model}`}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-gray-300">{v.licensePlate || '—'}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">{v.vin ? v.vin.substring(v.vin.length - 6) : '—'}</td>
                  <td className="py-3 px-4 text-right text-sm text-gray-200">{v.completedTrips}</td>
                  <td className="py-3 px-4 text-right text-sm text-gray-300">{v.totalTrips}</td>
                  <td className="py-3 px-4 text-right text-sm text-emerald-400 font-medium">{formatCurrency(v.totalEarnings || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
