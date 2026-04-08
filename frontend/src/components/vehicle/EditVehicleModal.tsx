import React, { useState } from 'react';
import { Vehicle } from '../../types/Vehicle';
import { vehicleApi } from '../../api/api';
import Modal from '../common/Modal';

interface Props {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditVehicleModal({ vehicle, isOpen, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    photoUrl: vehicle.photoUrl || '',
    color: vehicle.color || '',
    notes: vehicle.notes || '',
    purchasePrice: vehicle.purchasePrice || 0,
    purchaseDate: vehicle.purchaseDate || '',
    monthlyPayment: vehicle.monthlyPayment || 0,
    monthlyInsurance: vehicle.monthlyInsurance || 0,
    yearlyRegistration: vehicle.yearlyRegistration || 0,
    monthlyParking: vehicle.monthlyParking || 0,
    currentOdometer: vehicle.currentOdometer || 0,
    registrationExpiry: vehicle.registrationExpiry || '',
    insuranceExpiry: vehicle.insuranceExpiry || '',
    inspectionExpiry: vehicle.inspectionExpiry || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vehicleApi.update(vehicle.id, form);
      onSaved();
      onClose();
    } catch { alert('Failed to save'); }
    setSaving(false);
  };

  const inputClass = "w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Vehicle Info">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Photo URL</label>
            <input name="photoUrl" value={form.photoUrl} onChange={handleChange} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <input name="color" value={form.color} onChange={handleChange} className={inputClass} placeholder="White" />
          </div>
          <div>
            <label className={labelClass}>Current Odometer</label>
            <input name="currentOdometer" type="number" value={form.currentOdometer} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Purchase Price ($)</label>
            <input name="purchasePrice" type="number" step="0.01" value={form.purchasePrice} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Purchase Date</label>
            <input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className={labelClass}>Monthly Payment ($)</label>
            <input name="monthlyPayment" type="number" step="0.01" value={form.monthlyPayment} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Monthly Insurance ($)</label>
            <input name="monthlyInsurance" type="number" step="0.01" value={form.monthlyInsurance} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Yearly Registration ($)</label>
            <input name="yearlyRegistration" type="number" step="0.01" value={form.yearlyRegistration} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Monthly Parking ($)</label>
            <input name="monthlyParking" type="number" step="0.01" value={form.monthlyParking} onChange={handleChange} className={inputClass} />
          </div>
          <div className="col-span-2 border-t border-border-subtle pt-4 mt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Compliance Dates</p>
          </div>
          <div>
            <label className={labelClass}>Registration Expiry</label>
            <input name="registrationExpiry" type="date" value={form.registrationExpiry} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className={labelClass}>Insurance Expiry</label>
            <input name="insuranceExpiry" type="date" value={form.insuranceExpiry} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className={labelClass}>Inspection Expiry</label>
            <input name="inspectionExpiry" type="date" value={form.inspectionExpiry} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
          </div>
          <div />
          <div className="col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={inputClass} placeholder="Any notes..." />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-border-subtle rounded-lg px-6 py-2.5 text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
