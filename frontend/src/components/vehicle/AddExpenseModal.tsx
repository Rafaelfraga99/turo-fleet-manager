import React, { useState } from 'react';
import { ExpenseCategory, EXPENSE_LABELS } from '../../types/Vehicle';
import { expenseApi } from '../../api/api';
import Modal from '../common/Modal';

interface Props {
  vehicleId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const categories = Object.entries(EXPENSE_LABELS) as [ExpenseCategory, string][];

export default function AddExpenseModal({ vehicleId, isOpen, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    category: 'MAINTENANCE' as ExpenseCategory,
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    odometerAtExpense: 0,
    vendor: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) { alert('Fill description and amount'); return; }
    setSaving(true);
    try {
      await expenseApi.create(vehicleId, form);
      onSaved();
      onClose();
      setForm({ category: 'MAINTENANCE', description: '', amount: 0, expenseDate: new Date().toISOString().split('T')[0], odometerAtExpense: 0, vendor: '', notes: '' });
    } catch { alert('Failed to add expense'); }
    setSaving(false);
  };

  const inputClass = "w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {categories.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Description *</label>
            <input name="description" value={form.description} onChange={handleChange} required className={inputClass} placeholder="Oil change at Jiffy Lube" />
          </div>
          <div>
            <label className={labelClass}>Amount ($) *</label>
            <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Date *</label>
            <input name="expenseDate" type="date" value={form.expenseDate} onChange={handleChange} required className={inputClass} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className={labelClass}>Vendor</label>
            <input name="vendor" value={form.vendor} onChange={handleChange} className={inputClass} placeholder="Shop name" />
          </div>
          <div>
            <label className={labelClass}>Odometer</label>
            <input name="odometerAtExpense" type="number" value={form.odometerAtExpense} onChange={handleChange} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={inputClass} placeholder="Additional details..." />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? 'Adding...' : 'Add Expense'}
          </button>
          <button type="button" onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-border-subtle rounded-lg px-6 py-2.5 text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
