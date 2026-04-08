import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Check, Trash2, AlertTriangle } from 'lucide-react';
import { maintenanceApi } from '../../api/api';
import { MaintenanceSchedule, MaintenanceType, MAINTENANCE_LABELS, DEFAULT_INTERVALS } from '../../types/Maintenance';
import { formatDate } from '../../utils/formatters';
import Modal from '../common/Modal';

interface Props {
  vehicleId: number;
}

export default function MaintenancePanel({ vehicleId }: Props) {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    type: 'OIL_CHANGE' as MaintenanceType,
    description: '',
    lastServiceDate: new Date().toISOString().split('T')[0],
    lastServiceOdometer: 0,
    intervalMiles: 5000,
    intervalMonths: 6,
  });

  const load = () => maintenanceApi.getByVehicle(vehicleId).then(setSchedules).catch(console.error);
  useEffect(() => { load(); }, [vehicleId]);

  const handleTypeChange = (type: MaintenanceType) => {
    const defaults = DEFAULT_INTERVALS[type];
    setForm(prev => ({
      ...prev, type,
      intervalMiles: defaults?.miles || prev.intervalMiles,
      intervalMonths: defaults?.months || prev.intervalMonths,
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await maintenanceApi.create(vehicleId, form);
    setShowAdd(false);
    setForm({ type: 'OIL_CHANGE', description: '', lastServiceDate: new Date().toISOString().split('T')[0], lastServiceOdometer: 0, intervalMiles: 5000, intervalMonths: 6 });
    load();
  };

  const handleComplete = async (id: number) => {
    const date = new Date().toISOString().split('T')[0];
    await maintenanceApi.markCompleted(id, date);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this schedule?')) return;
    await maintenanceApi.delete(id);
    load();
  };

  const inputClass = "w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <div className="bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
      <div className="p-6 border-b border-border-subtle/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench size={20} className="text-amber-400" />
          <h3 className="text-lg font-medium text-gray-100">Maintenance Schedule</h3>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-border-subtle rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
          <Plus size={14} /> Add
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">No maintenance scheduled. Add oil change, tire rotation, etc.</div>
      ) : (
        <div className="divide-y divide-gray-800">
          {schedules.map((s) => {
            const daysLeft = s.nextDueDate ? Math.ceil((new Date(s.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            const isOverdue = daysLeft != null && daysLeft < 0;
            const isUrgent = daysLeft != null && daysLeft >= 0 && daysLeft <= 14;
            return (
              <div key={s.id} className="p-4 flex items-center gap-4 hover:bg-bg-elevated/50 transition-colors">
                <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-400/10' : isUrgent ? 'bg-amber-400/10' : 'bg-gray-800/50'}`}>
                  <Wrench size={16} className={isOverdue ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">{MAINTENANCE_LABELS[s.type] || s.type}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                    {s.nextDueDate && (
                      <span className={isOverdue ? 'text-red-400 font-medium' : isUrgent ? 'text-amber-400' : ''}>
                        {isOverdue ? `OVERDUE ${Math.abs(daysLeft!)}d` : `Due: ${formatDate(s.nextDueDate)}`}
                        {daysLeft != null && !isOverdue && ` (${daysLeft}d)`}
                      </span>
                    )}
                    {s.nextDueOdometer && <span>or at {s.nextDueOdometer.toLocaleString()} mi</span>}
                  </div>
                  {s.lastServiceDate && (
                    <p className="text-[10px] text-gray-600 mt-0.5">Last: {formatDate(s.lastServiceDate)} {s.lastServiceOdometer ? `@ ${s.lastServiceOdometer.toLocaleString()} mi` : ''}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleComplete(s.id)} title="Mark completed" className="p-1.5 text-gray-500 hover:text-emerald-400 transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} title="Delete" className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Maintenance Schedule">
        <form onSubmit={handleAdd}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Type</label>
              <select value={form.type} onChange={e => handleTypeChange(e.target.value as MaintenanceType)} className={inputClass}>
                {Object.entries(MAINTENANCE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Last Service Date</label>
              <input type="date" value={form.lastServiceDate} onChange={e => setForm(p => ({ ...p, lastServiceDate: e.target.value }))} className={inputClass} style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className={labelClass}>Last Service Odometer</label>
              <input type="number" value={form.lastServiceOdometer} onChange={e => setForm(p => ({ ...p, lastServiceOdometer: Number(e.target.value) }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Interval (miles)</label>
              <input type="number" value={form.intervalMiles} onChange={e => setForm(p => ({ ...p, intervalMiles: Number(e.target.value) }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Interval (months)</label>
              <input type="number" value={form.intervalMonths} onChange={e => setForm(p => ({ ...p, intervalMonths: Number(e.target.value) }))} className={inputClass} />
            </div>
          </div>
          <div className="mt-6">
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
              Add Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
